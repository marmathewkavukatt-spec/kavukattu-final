"use client";

import { getMaxUploadBytes, isAllowedUpload } from "@/lib/upload-policy";

function getHttpStatusFallbackMessage(status: number) {
  if (status === 401) return "Unauthorized. Please log in again.";
  if (status === 403) return "Forbidden request.";
  if (status === 413) return "Upload rejected by server (payload too large).";
  if (status === 415) return "Unsupported file type.";
  if (status === 429) return "Too many requests. Please try again later.";
  if (status >= 500) return "Server error. Please try again.";
  return null;
}

async function getResponseErrorMessage(response: Response) {
  // Try to parse as JSON first
  const clonedResponse = response.clone();
  const data = await clonedResponse.json().catch(() => null);

  if (data && typeof data === "object") {
    const candidate = "error" in data ? (data as { error?: unknown }).error : undefined;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      "message" in candidate &&
      typeof (candidate as { message?: unknown }).message === "string"
    ) {
      return (candidate as { message: string }).message;
    }
  }

  // If JSON parsing failed or didn't contain error info, try reading as text
  // Use the cloned response to avoid "body already used" error
  const text = await response.clone().text().catch(() => "");
  return text.trim() || getHttpStatusFallbackMessage(response.status) || "An error occurred. Please try again.";
}

export async function uploadAdminFile(file: File, options: { storage?: "auto" | "local" } = {}) {
  const storageMode = options.storage ?? "auto";
  const forceLocalStorage = storageMode === "local";
  const filename = file.name || "upload";

  if (file.size <= 0) {
    throw new Error("File is empty.");
  }

  if (!isAllowedUpload({ contentType: file.type, filename })) {
    throw new Error(
      "Invalid file type. Upload an image, PDF, Word, Excel, PowerPoint, RTF, or text file.",
    );
  }

  const maxSize = getMaxUploadBytes({ contentType: file.type, filename });
  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const maxMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File too large (${sizeMb}MB). Max ${maxMb}MB.`);
  }

  let directUploadError: string | null = null;

  if (!forceLocalStorage) {
    try {
      const signatureResponse = await fetch("/api/cloudinary/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!signatureResponse.ok) {
        const message = await getResponseErrorMessage(signatureResponse);

        if (signatureResponse.status === 503) {
          // Cloudinary isn't configured; fall back to server upload.
        } else if (signatureResponse.status >= 400 && signatureResponse.status < 500) {
          throw new Error(message || `Upload setup failed (HTTP ${signatureResponse.status}).`);
        } else {
          directUploadError = message || `Upload setup failed (HTTP ${signatureResponse.status}).`;
        }
      } else {
        const signature = (await signatureResponse.json()) as {
          url?: string;
          fields?: Record<string, string | number>;
        };

        if (!signature.url || !signature.fields) {
          throw new Error("Upload signature response is missing required fields.");
        }

        const uploadForm = new FormData();
        uploadForm.append("file", file);

        for (const [key, value] of Object.entries(signature.fields)) {
          uploadForm.append(key, String(value));
        }

        const cloudResponse = await fetch(signature.url, {
          method: "POST",
          body: uploadForm,
        });

        const cloudData = (await cloudResponse.json().catch(() => ({}))) as {
          secure_url?: unknown;
          url?: unknown;
          error?: unknown;
        };

        if (!cloudResponse.ok) {
          let message: string | null = null;

          if (
            cloudData.error &&
            typeof cloudData.error === "object" &&
            "message" in cloudData.error &&
            typeof (cloudData.error as { message?: unknown }).message === "string"
          ) {
            const candidate = (cloudData.error as { message: string }).message.trim();
            if (candidate) {
              message = candidate;
            }
          }

          message = message ?? (await getResponseErrorMessage(cloudResponse)) ?? "Upload failed.";
          throw new Error(message);
        }

        const cloudUrl =
          typeof cloudData.secure_url === "string"
            ? cloudData.secure_url
            : typeof cloudData.url === "string"
              ? cloudData.url
              : null;

        if (!cloudUrl) {
          throw new Error("Upload succeeded but did not return an asset URL.");
        }

        return { url: cloudUrl, storage: "cloudinary" as const };
      }
    } catch (error) {
      directUploadError = error instanceof Error ? error.message : "Direct Cloudinary upload failed.";
    }
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(forceLocalStorage ? "/api/upload?storage=local" : "/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    url?: unknown;
    error?: unknown;
    storage?: unknown;
  };

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : (await getResponseErrorMessage(response)) || "Upload failed.";

    const shouldAppendDirectReason =
      Boolean(directUploadError) &&
      !/^File too large/i.test(message) &&
      !/^Invalid file type/i.test(message) &&
      !/^File is empty/i.test(message) &&
      !/^Unauthorized/i.test(message) &&
      !/^Forbidden/i.test(message) &&
      !/^Too many requests/i.test(message);

    throw new Error(
      shouldAppendDirectReason
        ? `${message} (Cloudinary upload also failed: ${directUploadError})`
        : message,
    );
  }

  if (typeof data.url !== "string" || !data.url) {
    throw new Error("Upload succeeded but did not return a URL.");
  }

  return {
    url: data.url,
    storage: typeof data.storage === "string" ? data.storage : "local",
  };
}

type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

function xhrPostFormDataJson(
  url: string,
  formData: FormData,
  onProgress?: (progress: UploadProgress) => void,
) {
  return new Promise<{ status: number; data: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.withCredentials = true;
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (!event.lengthComputable) return;
      const percent = event.total > 0 ? Math.round((event.loaded / event.total) * 100) : 0;
      onProgress({ loaded: event.loaded, total: event.total, percent });
    };

    xhr.onerror = () => reject(new Error("Upload failed. Please try again."));
    xhr.onabort = () => reject(new Error("Upload canceled."));
    xhr.onload = () => {
      const raw = xhr.response ?? xhr.responseText;
      resolve({ status: xhr.status, data: raw });
    };

    xhr.send(formData);
  });
}

function getJsonLikeErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  if ("error" in data && typeof (data as { error?: unknown }).error === "string") {
    const message = (data as { error: string }).error.trim();
    if (message) return message;
  }

  if (
    "error" in data &&
    (data as { error?: unknown }).error &&
    typeof (data as { error?: unknown }).error === "object" &&
    "message" in ((data as { error?: unknown }).error as { message?: unknown }) &&
    typeof ((data as { error?: unknown }).error as { message?: unknown }).message === "string"
  ) {
    const message = ((data as { error: { message: string } }).error.message || "").trim();
    if (message) return message;
  }

  return null;
}

function parseJsonLoose(value: unknown) {
  if (value && typeof value === "object") return value;
  const text = typeof value === "string" ? value : value == null ? "" : String(value);
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function uploadAdminFileWithProgress(
  file: File,
  options: { storage?: "auto" | "local" } = {},
  onProgress?: (progress: UploadProgress) => void,
) {
  const storageMode = options.storage ?? "auto";
  const forceLocalStorage = storageMode === "local";
  const filename = file.name || "upload";

  if (file.size <= 0) {
    throw new Error("File is empty.");
  }

  if (!isAllowedUpload({ contentType: file.type, filename })) {
    throw new Error(
      "Invalid file type. Upload an image, PDF, Word, Excel, PowerPoint, RTF, or text file.",
    );
  }

  const maxSize = getMaxUploadBytes({ contentType: file.type, filename });
  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const maxMb = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File too large (${sizeMb}MB). Max ${maxMb}MB.`);
  }

  let directUploadError: string | null = null;

  if (!forceLocalStorage) {
    try {
      const signatureResponse = await fetch("/api/cloudinary/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!signatureResponse.ok) {
        const message = await getResponseErrorMessage(signatureResponse);

        if (signatureResponse.status === 503) {
          // Cloudinary isn't configured; fall back to server upload.
        } else if (signatureResponse.status >= 400 && signatureResponse.status < 500) {
          throw new Error(message || `Upload setup failed (HTTP ${signatureResponse.status}).`);
        } else {
          directUploadError = message || `Upload setup failed (HTTP ${signatureResponse.status}).`;
        }
      } else {
        const signature = (await signatureResponse.json()) as {
          url?: string;
          fields?: Record<string, string | number>;
        };

        if (!signature.url || !signature.fields) {
          throw new Error("Upload signature response is missing required fields.");
        }

        const uploadForm = new FormData();
        uploadForm.append("file", file);

        for (const [key, value] of Object.entries(signature.fields)) {
          uploadForm.append(key, String(value));
        }

        const { status, data } = await xhrPostFormDataJson(signature.url, uploadForm, onProgress);
        const parsed = parseJsonLoose(data) ?? {};
        const cloudData = parsed as { secure_url?: unknown; url?: unknown; error?: unknown };

        if (status < 200 || status >= 300) {
          const cloudMessage = getJsonLikeErrorMessage(cloudData);
          throw new Error(cloudMessage || `Upload failed (HTTP ${status}).`);
        }

        const cloudUrl =
          typeof cloudData.secure_url === "string"
            ? cloudData.secure_url
            : typeof cloudData.url === "string"
              ? cloudData.url
              : null;

        if (!cloudUrl) {
          throw new Error("Upload succeeded but did not return an asset URL.");
        }

        return { url: cloudUrl, storage: "cloudinary" as const };
      }
    } catch (error) {
      directUploadError = error instanceof Error ? error.message : "Direct Cloudinary upload failed.";
    }
  }

  const formData = new FormData();
  formData.append("file", file);

  const uploadUrl = forceLocalStorage ? "/api/upload?storage=local" : "/api/upload";
  const { status, data } = await xhrPostFormDataJson(uploadUrl, formData, onProgress);

  const parsedPayload = parseJsonLoose(data) ?? {};
  const payload = parsedPayload as { url?: unknown; error?: unknown; storage?: unknown };

  if (status < 200 || status >= 300) {
    const serverMessage =
      typeof payload.error === "string"
        ? payload.error
        : getJsonLikeErrorMessage(payload) || `Upload failed (HTTP ${status}).`;

    const shouldAppendDirectReason =
      Boolean(directUploadError) &&
      !/^File too large/i.test(serverMessage) &&
      !/^Invalid file type/i.test(serverMessage) &&
      !/^File is empty/i.test(serverMessage) &&
      !/^Unauthorized/i.test(serverMessage) &&
      !/^Forbidden/i.test(serverMessage) &&
      !/^Too many requests/i.test(serverMessage);

    throw new Error(
      shouldAppendDirectReason
        ? `${serverMessage} (Cloudinary upload also failed: ${directUploadError})`
        : serverMessage,
    );
  }

  if (typeof payload.url !== "string" || !payload.url) {
    throw new Error("Upload succeeded but did not return a URL.");
  }

  return {
    url: payload.url,
    storage: typeof payload.storage === "string" ? payload.storage : "local",
  };
}
