import type { ImageLoaderProps } from "next/image";

type CloudinaryQuality = number | `auto:${string}` | "auto";

interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: CloudinaryQuality;
  crop?: "limit" | "fill" | "fit";
}

const CLOUDINARY_HOST = "res.cloudinary.com";
const NEXT_IMAGE_ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export function isCloudinaryUrl(src: string) {
  try {
    return new URL(src).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

export function getCloudinaryImageUrl(
  src: string,
  {
    width,
    height,
    quality = "auto:good",
    crop = "limit",
  }: CloudinaryImageOptions = {},
) {
  if (!isCloudinaryUrl(src)) {
    return src;
  }

  const transformations = [
    "f_auto",
    "dpr_auto",
    typeof quality === "number" ? `q_${quality}` : `q_${quality}`,
    crop ? `c_${crop}` : "",
    width ? `w_${Math.round(width)}` : "",
    height ? `h_${Math.round(height)}` : "",
    "fl_progressive",
  ]
    .filter(Boolean)
    .join(",");

  if (src.includes("/image/upload/")) {
    return src.replace("/image/upload/", `/image/upload/${transformations}/`);
  }

  if (src.includes("/image/fetch/")) {
    return src.replace("/image/fetch/", `/image/fetch/${transformations}/`);
  }

  return src;
}

function getNextImageWidth(width: number) {
  return NEXT_IMAGE_ALLOWED_WIDTHS.find((allowedWidth) => allowedWidth >= width)
    ?? NEXT_IMAGE_ALLOWED_WIDTHS[NEXT_IMAGE_ALLOWED_WIDTHS.length - 1];
}

export function getBrowserSafeImageUrl(
  src: string,
  {
    width = 1200,
    height,
    quality = 75,
    crop,
  }: CloudinaryImageOptions = {},
) {
  if (src.startsWith("data:")) {
    return src;
  }

  const transformedSrc = getCloudinaryImageUrl(src, {
    width,
    height,
    quality,
    crop,
  });
  const normalizedWidth = getNextImageWidth(Math.max(16, Math.round(width)));
  const normalizedQuality = typeof quality === "number" ? quality : 75;

  return `/_next/image?url=${encodeURIComponent(transformedSrc)}&w=${normalizedWidth}&q=${normalizedQuality}`;
}

export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  return getCloudinaryImageUrl(src, {
    width,
    quality: quality ?? "auto:good",
  });
}
