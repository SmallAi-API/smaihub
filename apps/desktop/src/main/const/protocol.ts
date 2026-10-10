export const LOCAL_FILE_PROTOCOL_SCHEME = 'localfile';
export const LOCAL_FILE_PROTOCOL_HOST = 'file';

/**
 * Renderer pathnames that must be proxied to the remote LobeHub backend
 * instead of being served as static assets. Covers tRPC, webapi, NextAuth,
 * the marketplace REST + OIDC token/userinfo/handoff endpoints, and the LLM
 * relay upload channel (`/api/agent/llm-relay/:callId/{payload,chunks}`) the
 * desktop uses to run local-model calls for server-driven runs.
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
  '/api/agent/llm-relay',
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

/** Whether an absolute URL targets the uploaded-file proxy. */
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
