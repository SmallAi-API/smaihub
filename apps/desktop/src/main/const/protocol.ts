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
export const BACKEND_PATH_PREFIXES = ['/trpc', '/webapi', '/api/auth', '/market', '/f'];

export const isBackendPath = (pathname: string) =>
  BACKEND_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
