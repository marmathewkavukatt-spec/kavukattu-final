import sharp from "sharp";

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
  format: "webp",
};

/**
 * Compresses an image buffer using sharp
 * @param buffer - The original image buffer
 * @param options - Compression options
 * @returns Compressed image buffer and metadata
 */
export async function compressImage(
  buffer: Buffer,
  options: CompressionOptions = {}
): Promise<{ buffer: Buffer; format: string; size: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    let pipeline = sharp(buffer);

    // Get image metadata
    const metadata = await pipeline.metadata();

    // Resize if image is larger than max dimensions
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight)
    ) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Apply format-specific compression
    let compressedBuffer: Buffer;
    let outputFormat: string;

    switch (opts.format) {
      case "jpeg":
        compressedBuffer = await pipeline
          .jpeg({ quality: opts.quality, mozjpeg: true })
          .toBuffer();
        outputFormat = "jpeg";
        break;

      case "png":
        compressedBuffer = await pipeline
          .png({ quality: opts.quality, compressionLevel: 9 })
          .toBuffer();
        outputFormat = "png";
        break;

      case "webp":
      default:
        compressedBuffer = await pipeline
          .webp({ quality: opts.quality })
          .toBuffer();
        outputFormat = "webp";
        break;
    }

    return {
      buffer: compressedBuffer,
      format: outputFormat,
      size: compressedBuffer.length,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw new Error("Failed to compress image");
  }
}

/**
 * Determines if a file should be compressed based on its type
 */
export function shouldCompressImage(contentType: string, filename: string): boolean {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];

  const lowerFilename = filename.toLowerCase();
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff", ".tif"];

  return (
    imageTypes.includes(contentType.toLowerCase()) ||
    imageExtensions.some((ext) => lowerFilename.endsWith(ext))
  );
}

/**
 * Gets the appropriate file extension for the compressed format
 */
export function getCompressedExtension(format: string): string {
  switch (format) {
    case "jpeg":
      return ".jpg";
    case "png":
      return ".png";
    case "webp":
      return ".webp";
    default:
      return ".webp";
  }
}
