type DateRangeResult = {
  start?: Date;
  endExclusive?: Date;
  tzOffsetMinutes: number;
  error?: string;
};

function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseIsoDateOnly(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utcMillis = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const date = new Date(utcMillis);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return { year, month, day };
}

function clampTzOffsetMinutes(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-840, Math.min(840, Math.trunc(value)));
}

function utcStartForLocalDate(dateOnly: { year: number; month: number; day: number }, tzOffsetMinutes: number) {
  const utcMillis = Date.UTC(dateOnly.year, dateOnly.month - 1, dateOnly.day, 0, 0, 0, 0);
  return new Date(utcMillis + tzOffsetMinutes * 60_000);
}

function nextDateOnly(dateOnly: { year: number; month: number; day: number }) {
  const utcMillis = Date.UTC(dateOnly.year, dateOnly.month - 1, dateOnly.day + 1, 0, 0, 0, 0);
  const next = new Date(utcMillis);
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function parseDateRangeFromSearchParams(
  searchParams: URLSearchParams,
  options: { fromKey?: string; toKey?: string; tzOffsetKey?: string } = {},
): DateRangeResult {
  const fromKey = options.fromKey ?? "from";
  const toKey = options.toKey ?? "to";
  const tzOffsetKey = options.tzOffsetKey ?? "tzOffset";

  const fromRaw = searchParams.get(fromKey);
  const toRaw = searchParams.get(toKey);
  const tzOffsetRaw = searchParams.get(tzOffsetKey);

  const tzOffsetMinutes = clampTzOffsetMinutes(Number(tzOffsetRaw));

  if (fromRaw && !isIsoDateOnly(fromRaw)) {
    return { tzOffsetMinutes, error: `Invalid '${fromKey}' date format. Use YYYY-MM-DD.` };
  }
  if (toRaw && !isIsoDateOnly(toRaw)) {
    return { tzOffsetMinutes, error: `Invalid '${toKey}' date format. Use YYYY-MM-DD.` };
  }

  const fromParsed = fromRaw ? parseIsoDateOnly(fromRaw) : null;
  const toParsed = toRaw ? parseIsoDateOnly(toRaw) : null;

  if (fromRaw && !fromParsed) {
    return { tzOffsetMinutes, error: `Invalid '${fromKey}' date.` };
  }
  if (toRaw && !toParsed) {
    return { tzOffsetMinutes, error: `Invalid '${toKey}' date.` };
  }

  const start = fromParsed ? utcStartForLocalDate(fromParsed, tzOffsetMinutes) : undefined;
  const endExclusive = toParsed
    ? utcStartForLocalDate(nextDateOnly(toParsed), tzOffsetMinutes)
    : undefined;

  if (start && endExclusive && start.getTime() >= endExclusive.getTime()) {
    return { tzOffsetMinutes, error: `'${fromKey}' must be on or before '${toKey}'.` };
  }

  return { start, endExclusive, tzOffsetMinutes };
}
