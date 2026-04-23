import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export type CloudinaryAssetKind = "image" | "raw";

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

export async function uploadBufferToCloudinary({
  buffer,
  filename,
  folder,
  resourceType,
  publicId,
}: {
  buffer: Buffer;
  filename: string;
  folder: string;
  resourceType: CloudinaryAssetKind;
  publicId: string;
}) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  return new Promise<{ publicId: string; resourceType: CloudinaryAssetKind; url: string }>((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      overwrite: false,
      invalidate: true,
      use_filename: false,
      unique_filename: false,
      filename_override: filename,
    };

    // Apply compression settings for images
    if (resourceType === "image") {
      uploadOptions.quality = "auto:good"; // Automatic quality optimization
      uploadOptions.fetch_format = "auto"; // Automatic format selection (WebP when supported)
      uploadOptions.flags = "lossy"; // Enable lossy compression for better file size
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary upload did not return an asset URL."));
          return;
        }

        resolve({
          publicId: result.public_id,
          resourceType: result.resource_type === "raw" ? "raw" : "image",
          url: result.secure_url,
        });
      },
    );

    uploadStream.on("error", reject);
    uploadStream.end(buffer);
  });
}

function parseCloudinaryAssetUrl(assetUrl: string) {
  if (!cloudName) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(assetUrl);
  } catch {
    return null;
  }

  if (parsed.hostname !== "res.cloudinary.com") {
    return null;
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments[0] !== cloudName || !segments[1]) {
    return null;
  }

  const resourceType: CloudinaryAssetKind = segments[1] === "raw" ? "raw" : "image";
  const uploadIndex = segments.indexOf("upload");

  if (uploadIndex === -1) {
    return null;
  }

  const afterUpload = segments.slice(uploadIndex + 1);
  const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
  const publicIdSegments = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

  if (!publicIdSegments.length) {
    return null;
  }

  if (resourceType === "image") {
    publicIdSegments[publicIdSegments.length - 1] = publicIdSegments[publicIdSegments.length - 1].replace(/\.[^.]+$/, "");
  }

  return {
    publicId: publicIdSegments.join("/"),
    resourceType,
  };
}

export async function deleteCloudinaryAssetByUrl(assetUrl: string) {
  const asset = parseCloudinaryAssetUrl(assetUrl);
  if (!asset) {
    return false;
  }

  const result = await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: asset.resourceType,
    invalidate: true,
  });

  return result.result === "ok" || result.result === "not found";
}

export default cloudinary;
