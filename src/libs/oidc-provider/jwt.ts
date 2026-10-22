import { acceptanceIdFromReviewResource } from '@lobechat/const';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import type { JSONWebKeySet, JWK, JWK_RSA_Public } from 'jose';
import { calculateJwkThumbprint } from 'jose';

import { authEnv } from '@/envs/auth';

import { isAcceptanceReviewClient, isAcceptanceReviewIssued } from './acceptanceReview';

const log = debug('oidc-jwt');

/**
 * Get JWKS key string from environment
 * Uses JWKS_KEY which already has fallback to OIDC_JWKS_KEY in authEnv
 */
const getJwksKeyString = () => {
  return authEnv.JWKS_KEY;
};

/**
 * 从环境变量中获取 JWKS
 * 该 JWKS 是一个包含 RS256 私钥的 JSON 对象
 */
export const getJWKS = (): object => {
  try {
    const jwksString = getJwksKeyString();

    if (!jwksString) {
      throw new Error(
        'JWKS_KEY 环境变量是必需的。请使用 scripts/generate-oidc-jwk.mjs 生成 JWKS。',
      );
    }

    // 尝试解析 JWKS JSON 字符串
    const jwks = JSON.parse(jwksString);

    // 检查 JWKS 格式是否正确
    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('JWKS 格式无效: 缺少或为空的 keys 数组');
    }

    // 检查是否有 RS256 算法的密钥
    const hasRS256Key = jwks.keys.some((key: any) => key.alg === 'RS256' && key.kty === 'RSA');
    if (!hasRS256Key) {
      throw new Error('JWKS 中没有找到 RS256 算法的 RSA 密钥');
    }

    return jwks;
  } catch (error) {
    console.error('解析 JWKS 失败:', error);
    throw new Error(`JWKS_KEY 解析错误: ${(error as Error).message}`, { cause: error });
  }
};

const isRsaSigningKey = (key: JWK): key is JWK_RSA_Public =>
  key.alg === 'RS256' &&
  key.kty === 'RSA' &&
  typeof key.e === 'string' &&
  typeof key.n === 'string';

const toPublicRsaKey = async (key: JWK_RSA_Public): Promise<JWK_RSA_Public> => ({
  alg: 'RS256',
  e: key.e,
  kid: key.kid ?? (await calculateJwkThumbprint(key)),
  kty: 'RSA',
  n: key.n,
  ...(key.use ? { use: key.use } : {}),
});

const getVerificationKeys = async () => {
  try {
    const jwksString = getJwksKeyString();

    if (!jwksString) {
      throw new Error('JWKS_KEY 环境变量未设置');
    }

    const jwks = JSON.parse(jwksString) as JSONWebKeySet;

    if (!jwks.keys || !Array.isArray(jwks.keys) || jwks.keys.length === 0) {
      throw new Error('JWKS 格式无效: 缺少或为空的 keys 数组');
    }

    const publicKeys = await Promise.all(jwks.keys.filter(isRsaSigningKey).map(toPublicRsaKey));
    if (publicKeys.length === 0) {
      throw new Error('No RSA key with RS256 algorithm found in JWKS');
    }

    const { importJWK } = await import('jose');

    // Validate configuration before token verification so a malformed JWK remains an
    // infrastructure error (500) instead of being misreported as invalid user auth (401).
    await Promise.all(publicKeys.map((key) => importJWK(key, 'RS256')));

    return publicKeys;
  } catch (error) {
    log('Failed to get JWKS public key: %O', error);
    throw new Error(`JWKS_KEY public key retrieval failed: ${(error as Error).message}`, {
      cause: error,
    });
  }
};

const isSignatureVerificationError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';

const verifyJwt = async (token: string, publicKeys: JWK_RSA_Public[]) => {
  const { createLocalJWKSet, decodeProtectedHeader, importJWK, jwtVerify } = await import('jose');
  const options = { algorithms: ['RS256'] };

  if (decodeProtectedHeader(token).kid) {
    return jwtVerify(token, createLocalJWKSet({ keys: publicKeys }), options);
  }

  // Tokens issued before this rotation support landed did not include `kid`.
  // Try each retained key only for those in-flight tokens; newly issued tokens
  // keep the exact-key lookup above and avoid ambiguous JWKS selection.
  let signatureError: unknown;
  for (const publicKey of publicKeys) {
    try {
      return await jwtVerify(token, await importJWK(publicKey, 'RS256'), options);
    } catch (error) {
      if (!isSignatureVerificationError(error)) throw error;
      signatureError = error;
    }
  }

  throw signatureError ?? new Error('No RSA key available for JWT verification');
};

/**
 * Validate OIDC JWT Access Token
 * @param token - JWT access token
 * @returns 解析后的 token payload 和用户信息
 */
export const validateOIDCJWT = async (token: string) => {
  log('Starting OIDC JWT token validation');

  // JWKS / signing key retrieval is an infrastructure concern (misconfigured
  // env, malformed JWKS, key import failure). Let these errors propagate as
  // plain Error so upstream middleware maps them to 500 and triggers ops
  // alerts — treating them as 401 would incorrectly ask clients to re-auth
  // while the real problem is server-side.
  const publicKeys = await getVerificationKeys();

  try {
    const { payload } = await verifyJwt(token, publicKeys);

    log('JWT 验证成功，payload: %O', payload);

    const userId = payload.sub;
    const clientId = payload.client_id;
    const aud = payload.aud;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'JWT token 中缺少用户 ID (sub)',
      });
    }

    // Review tokens live on third-party preview pages; they only open the review API.
    if (isAcceptanceReviewIssued(payload)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Acceptance review tokens are not accepted here',
      });
    }

    return {
      clientId,
      payload,
      tokenData: {
        aud,
        client_id: clientId,
        exp: payload.exp,
        iat: payload.iat,
        jti: payload.jti,
        purpose: payload.purpose as string | undefined,
        scope: payload.scope,
        sub: userId,
      },
      userId,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    log('JWT 验证失败: %O', error);

    // Preserve the original jose error via `cause` so upstream middleware
    // can still inspect specific codes like `ERR_JWT_EXPIRED`.
    throw new TRPCError({
      cause: error,
      code: 'UNAUTHORIZED',
      message: `JWT token 验证失败: ${(error as Error).message}`,
    });
  }
};

export const verifyAcceptanceReviewJWT = async (token: string) => {
  const publicKeys = await getVerificationKeys();
  const { payload } = await verifyJwt(token, publicKeys);
  const acceptanceId = acceptanceIdFromReviewResource(payload.aud);
  if (!isAcceptanceReviewClient(payload.client_id as string) || !acceptanceId || !payload.sub)
    throw new Error('Not an acceptance review token');
  return { acceptanceId, expiresAt: payload.exp, userId: payload.sub };
};
