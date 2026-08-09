/**
 * HTTP headers utilities for Electron webRequest
 *
 * Electron's webRequest responseHeaders is a plain JS object where keys are case-sensitive,
 * but HTTP headers are case-insensitive per spec. These utilities handle this mismatch.
 */
import { getDesktopEnv } from '@/env';

type ElectronResponseHeaders = Record<string, string[]>;
type ElectronRequestHeaders = Record<string, string>;

/**
 * Check if a request header exists (case-insensitive).
 *
 * `webRequest` request headers arrive with whatever casing was put on the wire —
 * main-process `net.fetch` goes through `Headers`, which lower-cases — so an
 * exact-key lookup misses.
 */
export function hasRequestHeader(headers: ElectronRequestHeaders, name: string): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

/** Set a request header, replacing any existing one with the same name (case-insensitive). */
export function setRequestHeader(
  headers: ElectronRequestHeaders,
  name: string,
  value: string,
): void {
  deleteRequestHeader(headers, name);
  headers[name] = value;
}

/** Delete a request header (case-insensitive). Returns whether anything was removed. */
export function deleteRequestHeader(headers: ElectronRequestHeaders, name: string): boolean {
  let deleted = false;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) {
      delete headers[key];
      deleted = true;
    }
  }
  return deleted;
}

/**
 * Append Vercel JWT cookie to headers if VERCEL_JWT env is set.
 * Works with Headers object, plain object, or OutgoingHttpHeaders.
 */
export function appendVercelCookie(
  headers: Headers | Record<string, string | number | string[] | undefined>,
): void {
  const vercelJwt = getDesktopEnv().VERCEL_JWT;
  if (!vercelJwt) return;

  if (headers instanceof Headers) {
    const existing = headers.get('Cookie') || '';
    headers.set(
      'Cookie',
      existing ? `${existing}; _vercel_jwt=${vercelJwt}` : `_vercel_jwt=${vercelJwt}`,
    );
  } else {
    const existing = (headers['Cookie'] as string) || '';
    headers['Cookie'] = existing
      ? `${existing}; _vercel_jwt=${vercelJwt}`
      : `_vercel_jwt=${vercelJwt}`;
  }
}

/**
 * Set a header value, replacing any existing header with the same name (case-insensitive)
 */
export function setResponseHeader(
  headers: ElectronResponseHeaders,
  name: string,
  value: string | string[],
): void {
  // Delete any existing header with same name (case-insensitive)
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) {
      delete headers[key];
    }
  }
  headers[name] = Array.isArray(value) ? value : [value];
}

/**
 * Check if a header exists (case-insensitive)
 */
export function hasResponseHeader(headers: ElectronResponseHeaders, name: string): boolean {
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

/**
 * Get a header value (case-insensitive)
 */
export function getResponseHeader(
  headers: ElectronResponseHeaders,
  name: string,
): string[] | undefined {
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) {
      return headers[key];
    }
  }
  return undefined;
}

/**
 * Delete a header (case-insensitive)
 */
export function deleteResponseHeader(headers: ElectronResponseHeaders, name: string): boolean {
  let deleted = false;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === name.toLowerCase()) {
      delete headers[key];
      deleted = true;
    }
  }
  return deleted;
}
