import type { CryptoKey } from 'jose';
import { importJWK, jwtVerify } from 'jose';

import type { Env } from './types';

let cachedKey: CryptoKey | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CurrentUserResponse {
  data?: {
    id?: string;
    userId?: string;
  };
  error?: string;
  message?: string;
  success?: boolean;
}

export interface ResolveSocketAuthOptions {
  serverUrl?: string;
  serviceToken: string;
  storedUserId?: string;
  token?: string;
  tokenType?: 'apiKey' | 'jwt' | 'serviceToken';
  verifyApiKey: (serverUrl: string, token: string) => Promise<{ userId: string }>;
  verifyJwt: (token: string) => Promise<{ userId: string }>;
}

async function fetchJwksKey(jwksUrl: string): Promise<CryptoKey> {
  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`Failed to fetch JWKS from ${jwksUrl}: ${res.status}`);
  const jwks = (await res.json()) as { keys: any[] };
  const rsaKey = jwks.keys?.find((k: any) => k.alg === 'RS256');
  if (!rsaKey) throw new Error(`No RS256 key found in remote JWKS from ${jwksUrl}`);
  return (await importJWK(rsaKey, 'RS256')) as CryptoKey;
}

function parseStaticJwks(jwksPublicKey: string): CryptoKey | Promise<CryptoKey> {
  const jwks = JSON.parse(jwksPublicKey);
  const rsaKey = jwks.keys?.find((k: any) => k.alg === 'RS256');
  if (!rsaKey) throw new Error('No RS256 key found in JWKS_PUBLIC_KEY');
  return importJWK(rsaKey, 'RS256') as Promise<CryptoKey>;
}

async function getPublicKey(env: Env): Promise<CryptoKey> {
  // Return cached key if still valid
  if (cachedKey && Date.now() < cacheExpiry) return cachedKey;

  // Strategy 1: Dynamic fetch from OIDC issuer
  if (env.OIDC_ISSUER) {
    const jwksUrl = `${env.OIDC_ISSUER.replace(/\/$/, '')}/jwks`;
    try {
      cachedKey = await fetchJwksKey(jwksUrl);
      cacheExpiry = Date.now() + CACHE_TTL;
      return cachedKey;
    } catch (err) {
      console.error('OIDC JWKS fetch failed, trying static fallback:', (err as Error).message);
    }
  }

  // Strategy 2: Static JWKS_PUBLIC_KEY from env vars
  if (env.JWKS_PUBLIC_KEY) {
    cachedKey = await parseStaticJwks(env.JWKS_PUBLIC_KEY);
    cacheExpiry = Date.now() + CACHE_TTL;
    return cachedKey;
  }

  throw new Error('No JWKS source configured (set OIDC_ISSUER or JWKS_PUBLIC_KEY)');
}

export async function verifyDesktopToken(
  env: Env,
  token: string,
): Promise<{ clientId: string; userId: string }> {
  const publicKey = await getPublicKey(env);
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
  });

  if (!payload.sub) throw new Error('Missing sub claim');

  return {
    clientId: payload.client_id as string,
    userId: payload.sub,
  };
}

export async function verifyApiKeyToken(
  serverUrl: string,
  token: string,
): Promise<{ userId: string }> {
  const normalizedServerUrl = new URL(serverUrl).toString().replace(/\/$/, '');

  const response = await fetch(`${normalizedServerUrl}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let body: CurrentUserResponse | undefined;
  try {
    body = (await response.json()) as CurrentUserResponse;
  } catch {
    throw new Error(`Failed to parse response from ${normalizedServerUrl}/api/v1/users/me.`);
  }

  if (!response.ok || body?.success === false) {
    throw new Error(
      body?.error || body?.message || `Request failed with status ${response.status}.`,
    );
  }

  const userId = body?.data?.id || body?.data?.userId;
  if (!userId) {
    throw new Error('Current user response did not include a user id.');
  }

  return { userId };
}

export async function resolveSocketAuth(options: ResolveSocketAuthOptions): Promise<string> {
  const { serverUrl, serviceToken, storedUserId, token, tokenType, verifyApiKey, verifyJwt } =
    options;

  if (!token) throw new Error('Missing token');

  if (tokenType === 'apiKey') {
    if (!serverUrl) throw new Error('Missing serverUrl');
    const result = await verifyApiKey(serverUrl, token);
    return result.userId;
  }

  if (token === serviceToken) {
    if (!storedUserId) throw new Error('Missing userId');
    return storedUserId;
  }

  const result = await verifyJwt(token);
  return result.userId;
}
