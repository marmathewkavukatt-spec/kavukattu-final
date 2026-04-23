const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_URL_LENGTH = 2048;
const RECORD_ID_REGEX = /^[a-z0-9][a-z0-9_-]{7,63}$/i;

export class RequestValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function assertSafeValue(value: unknown, path = "body") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertSafeValue(item, `${path}[${index}]`);
    });
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      throw new RequestValidationError(`Invalid field name: ${path}.${key}`);
    }

    assertSafeValue(nestedValue, `${path}.${key}`);
  }
}

function parseHttpsUrl(url: string, fieldName: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  if (parsed.protocol !== "https:") {
    throw new RequestValidationError(`${fieldName} must use HTTPS.`);
  }

  return parsed;
}

export async function getSafeJsonBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new RequestValidationError("Request body must be JSON.");
  }

  const body: unknown = await req.json();
  if (!isPlainObject(body)) {
    throw new RequestValidationError("Request body must be a JSON object.");
  }

  assertSafeValue(body);
  return body;
}

export function ensureRecordId(id: string, fieldName = "id") {
  const normalized = String(id ?? "").trim();

  if (!normalized || normalized.length > 64 || !RECORD_ID_REGEX.test(normalized)) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return normalized;
}

export function toRequiredString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {},
) {
  const minLength = options.minLength ?? 1;
  const maxLength = options.maxLength ?? 300;

  if (typeof value !== "string") {
    throw new RequestValidationError(`${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (normalized.length < minLength) {
    throw new RequestValidationError(`${fieldName} is required.`);
  }

  if (normalized.length > maxLength) {
    throw new RequestValidationError(`${fieldName} is too long.`);
  }

  return normalized;
}

export function toOptionalString(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; allowEmpty?: boolean } = {},
) {
  const maxLength = options.maxLength ?? 300;
  const allowEmpty = options.allowEmpty ?? false;

  if (value === undefined || value === null) {
    return allowEmpty ? "" : undefined;
  }

  if (typeof value !== "string") {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    return allowEmpty ? "" : undefined;
  }

  if (normalized.length > maxLength) {
    throw new RequestValidationError(`${fieldName} is too long.`);
  }

  return normalized;
}

export function toNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; defaultValue?: number } = {},
) {
  const min = options.min ?? 0;
  const max = options.max ?? 9999;
  const defaultValue = options.defaultValue ?? 0;

  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return Math.trunc(parsed);
}

export function toBoolean(value: unknown, defaultValue = false) {
  return typeof value === "boolean" ? value : defaultValue;
}

export function toDate(value: unknown, fieldName: string, fallback = new Date()) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(parsed.getTime())) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return parsed;
}

export function toEmail(value: unknown) {
  const email = toRequiredString(value, "email", { maxLength: 254 }).toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    throw new RequestValidationError("Please enter a valid email address.");
  }

  return email;
}

export function toPassword(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; required?: boolean } = {},
) {
  const minLength = options.minLength ?? 12;
  const required = options.required ?? false;

  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new RequestValidationError(`${fieldName} is required.`);
    }

    return undefined;
  }

  if (typeof value !== "string") {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  if (value.length < minLength) {
    throw new RequestValidationError(`${fieldName} must be at least ${minLength} characters.`);
  }

  if (value.length > 128) {
    throw new RequestValidationError(`${fieldName} is too long.`);
  }

  return value;
}

export function toAssetUrl(value: unknown, fieldName: string) {
  const candidate = toRequiredString(value, fieldName, { maxLength: MAX_URL_LENGTH });

  if (candidate.startsWith("/uploads/")) {
    return candidate;
  }

  const parsed = parseHttpsUrl(candidate, fieldName);

  if (parsed.hostname !== "res.cloudinary.com") {
    throw new RequestValidationError(`Invalid ${fieldName}. Only approved asset hosts are allowed.`);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
    throw new RequestValidationError(`Invalid ${fieldName}.`);
  }

  return parsed.toString();
}

export function toOptionalAssetUrl(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return toAssetUrl(value, fieldName);
}

export function toOptionalUrl(
  value: unknown,
  fieldName: string,
  options: { allowLocalPath?: boolean } = {},
) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const candidate = toRequiredString(value, fieldName, { maxLength: MAX_URL_LENGTH });

  if (options.allowLocalPath && candidate.startsWith("/")) {
    return candidate;
  }

  return parseHttpsUrl(candidate, fieldName).toString();
}

export function sanitizeFilename(value: string, fallback = "download") {
  const normalized = value
    .normalize("NFKC")
    .replace(/[\r\n"]/g, "")
    .replace(/[^\w.\-() ]+/g, "_")
    .trim()
    .slice(0, 120);

  return normalized || fallback;
}
