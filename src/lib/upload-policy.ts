export const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_FILE_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/rtf",
  "text/rtf",
  "text/plain",
]);

export const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".rtf",
  ".txt",
]);

export const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
]);

export function getNormalizedExtension(filename: string) {
  const trimmed = filename.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return trimmed.slice(dotIndex).toLowerCase();
}

export function isAllowedUpload({
  contentType,
  filename,
}: {
  contentType?: string;
  filename: string;
}) {
  const normalizedType = (contentType ?? "").trim().toLowerCase();
  const extension = getNormalizedExtension(filename);

  return ALLOWED_FILE_TYPES.has(normalizedType) || ALLOWED_EXTENSIONS.has(extension);
}

export function isImageUpload({
  contentType,
  filename,
}: {
  contentType?: string;
  filename: string;
}) {
  const normalizedType = (contentType ?? "").trim().toLowerCase();
  const extension = getNormalizedExtension(filename);

  return normalizedType.startsWith("image/") || IMAGE_EXTENSIONS.has(extension);
}

export function getMaxUploadBytes({
  contentType,
  filename,
}: {
  contentType?: string;
  filename: string;
}) {
  return isImageUpload({ contentType, filename })
    ? MAX_IMAGE_UPLOAD_BYTES
    : MAX_FILE_UPLOAD_BYTES;
}
