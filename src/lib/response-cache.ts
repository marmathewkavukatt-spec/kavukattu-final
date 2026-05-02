import { NextRequest, NextResponse } from 'next/server';

/**
 * Backward-compatible pass-through wrapper. Response caching is disabled.
 */
export function withResponseCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: unknown = {}
) {
  void options;
  return handler;
}

export function invalidateResponseCache(pathPattern: string) {
  void pathPattern;
}
