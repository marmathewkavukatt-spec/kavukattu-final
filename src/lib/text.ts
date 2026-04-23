export function getExcerpt(text: string, maxLength: number) {
  // Normalize multiple spaces/tabs but preserve line breaks
  const normalized = text
    .replace(/[ \t]+/g, " ")  // Replace multiple spaces/tabs with single space
    .replace(/\n{3,}/g, "\n\n")  // Limit consecutive newlines to 2
    .trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const slice = normalized.slice(0, Math.max(0, maxLength));
  const lastSpaceIndex = slice.lastIndexOf(" ");
  const shouldTrimToWord = lastSpaceIndex > Math.floor(maxLength * 0.6);
  const clipped = shouldTrimToWord ? slice.slice(0, lastSpaceIndex) : slice;

  return `${clipped.trimEnd()}...`;
}
