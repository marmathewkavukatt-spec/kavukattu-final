const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value?: string | null) {
  if (!value) {
    return DEFAULT_SITE_URL;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_BASE_URL);
}

export function getSiteMetadataBase() {
  return new URL(getSiteUrl());
}

export function getAbsoluteSiteUrl(pathname = "/") {
  return new URL(pathname, getSiteUrl()).toString();
}
