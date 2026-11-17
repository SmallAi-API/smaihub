/**
 * Session affinity key sent to the smai.ai gateway (new-api).
 *
 * The gateway pins every request carrying the same key to one upstream channel,
 * so the upstream prompt cache keeps hitting across turns of a conversation.
 * The value is an opaque hash computed on the server; it never contains the raw
 * user or topic id.
 */
export const SMAI_SESSION_HEADER = 'X-Smai-Session';

const SMAI_SESSION_HEADER_LOWER = SMAI_SESSION_HEADER.toLowerCase();

/** Read the session hash from per-request headers, matching the header name case-insensitively. */
export const getSmaiSessionId = (headers?: Record<string, any>): string | undefined => {
  if (!headers) return;

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== SMAI_SESSION_HEADER_LOWER) continue;
    if (typeof value === 'string' && value) return value;
  }
};
