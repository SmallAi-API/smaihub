export const LOCAL_FILE_PROTOCOL_SCHEME = 'localfile';
export const LOCAL_FILE_PROTOCOL_HOST = 'file';

/**
 * Renderer pathnames that must be proxied to the remote LobeHub backend
 * instead of being served as static assets. Covers tRPC, webapi, NextAuth,
 * and the marketplace REST + OIDC token/userinfo/handoff endpoints.
 *
 * `/f/:id` is the uploaded-file proxy. It is auth-guarded and 302s to a
 * short-lived presigned URL, so it has to go through the proxy to get
 * `Oidc-Auth` injected — a bare cross-origin `<img src>` from `app://renderer`
 * carries no credentials and 404s. `net.fetch` follows the redirect in the main
 * process, so the renderer receives the image bytes directly.
 *
 * `/lobehub-oidc/*` is intentionally NOT here — those URLs are handed to
 * `shell.openExternal` as fully-qualified web URLs and never reach renderer
 * `fetch`.
 */
export const FILE_PROXY_PATH_PREFIX = '/f';

export const BACKEND_PATH_PREFIXES = [
  '/trpc',
  '/webapi',
  '/api/auth',
  '/market',
  FILE_PROXY_PATH_PREFIX,
];

/** Segment-aware so `/files` / `/fabricated` are not mistaken for `/f`. */
const matchesPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isBackendPath = (pathname: string) =>
  BACKEND_PATH_PREFIXES.some((prefix) => matchesPathPrefix(pathname, prefix));

/** Header carrying the desktop OIDC access token to the remote backend. */
export const OIDC_AUTH_HEADER = 'Oidc-Auth';

/**
 * Whether an absolute URL targets the uploaded-file proxy.
 *
 * The `app://` interceptor above only sees renderer-origin requests. Message
 * image/file URLs are minted server-side as absolute `${APP_URL}/f/:id`
 * (`getFileAccessUrl`), so they bypass it entirely — those hits are matched here
 * instead, from the session's `onBeforeSendHeaders`.
 */
export const isFileProxyUrl = (rawUrl: string) => {
  try {
    return matchesPathPrefix(new URL(rawUrl).pathname, FILE_PROXY_PATH_PREFIX);
  } catch {
    return false;
  }
};

/** Origin equality for two absolute URLs. Malformed input is never a match. */
export const isSameOrigin = (rawUrl: string, otherUrl: string) => {
  try {
    return new URL(rawUrl).origin === new URL(otherUrl).origin;
  } catch {
    return false;
  }
};
