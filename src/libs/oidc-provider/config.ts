import { BRANDING_NAME, BUSINESS_OIDC_CLIENTS } from '@lobechat/business-const';
import {
  ACCEPTANCE_CLIENT_ID,
  ACCEPTANCE_EXTENSION_CLIENT_ID,
  ACCEPTANCE_EXTENSION_IDS,
  ACCEPTANCE_EXTENSION_SCOPE,
  ACCEPTANCE_REVIEW_SCOPE,
} from '@lobechat/const';
import { type ClientMetadata } from 'oidc-provider';
import urlJoin from 'url-join';

import { appEnv } from '@/envs/app';

const cloudAppOrigins = ['https://www.smallai.asia'];
const appUrl = appEnv.APP_URL!;
const desktopAppOrigins = cloudAppOrigins.includes(new URL(appUrl).origin)
  ? cloudAppOrigins
  : [appUrl];
const marketBaseUrl = new URL(appEnv.MARKET_BASE_URL ?? 'https://market.lobehub.com').origin;

/**
 * Clients the open-source distribution registers itself.
 */
const builtinClients: ClientMetadata[] = [
  {
    application_type: 'web',
    client_id: 'lobehub-desktop',
    client_name: `${BRANDING_NAME} Desktop`,
    // Only supports authorization code flow
    grant_types: ['authorization_code', 'refresh_token'],

    logo_uri: 'https://smaihub-1301925107.cos.ap-guangzhou.myqcloud.com/logo/smai.ai.png',

    post_logout_redirect_uris: [
      // Keep the legacy subdomain working while Cloud moves to the apex domain.
      ...desktopAppOrigins.map((origin) => urlJoin(origin, '/oauth/logout')),
      'http://localhost:3210/oauth/logout',
    ],

    // 桌面端授权回调 - 改为 Web 页面路径
    redirect_uris: [
      ...desktopAppOrigins.map((origin) => urlJoin(origin, '/oidc/callback/desktop')),
      'http://localhost:3210/oidc/callback/desktop',
    ],

    // 支持授权码获取令牌和刷新令牌
    response_types: ['code'],

    // 标记为公共客户端客户端，无密钥
    token_endpoint_auth_method: 'none',
  },

  {
    application_type: 'native', // 移动端使用 native 类型
    client_id: 'lobehub-mobile',
    client_name: `${BRANDING_NAME} Mobile`,
    // Supports authorization code flow and refresh token
    grant_types: ['authorization_code', 'refresh_token'],
    logo_uri: '/logo.png',
    // 移动端不需要 post_logout_redirect_uris，因为注销通常在应用内处理
    post_logout_redirect_uris: [],
    // 移动端使用自定义 URL Scheme
    redirect_uris: ['com.lobehub.app://auth/callback'],
    response_types: ['code'],
    // 公共客户端，无密钥
    token_endpoint_auth_method: 'none',
  },
  {
    application_type: 'native',
    client_id: 'toby',
    client_name: 'toby',
    grant_types: ['authorization_code', 'refresh_token'],
    post_logout_redirect_uris: [],
    // Universal-link callback: iOS only hands it to the app listed in the AASA webcredentials,
    // so another app cannot impersonate toby the way it could with a custom scheme.
    redirect_uris: desktopAppOrigins.map((origin) => urlJoin(origin, '/oidc/callback/toby')),
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  },
  {
    application_type: 'native',
    client_id: 'lobehub-cli',
    client_name: 'LobeHub CLI',
    grant_types: ['urn:ietf:params:oauth:grant-type:device_code', 'refresh_token'],
    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',
    response_types: [],
    token_endpoint_auth_method: 'none',
  },
  {
    application_type: 'web',
    client_id: ACCEPTANCE_CLIENT_ID,
    client_name: 'LobeHub Acceptance',
    grant_types: ['urn:ietf:params:oauth:grant-type:device_code', 'authorization_code'],
    scope: ACCEPTANCE_REVIEW_SCOPE,
    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',
    redirect_uris: [urlJoin(appUrl, '/oidc/acceptance/callback')],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  },
  {
    application_type: 'web',
    client_id: ACCEPTANCE_EXTENSION_CLIENT_ID,
    client_name: 'LobeHub Acceptance Extension',
    grant_types: ['authorization_code', 'refresh_token'],
    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',
    post_logout_redirect_uris: [],
    redirect_uris: ACCEPTANCE_EXTENSION_IDS.map((id) => `https://${id}.chromiumapp.org/oidc`),
    response_types: ['code'],
    scope: `openid profile offline_access ${ACCEPTANCE_EXTENSION_SCOPE}`,
    token_endpoint_auth_method: 'none',
  },
  {
    application_type: 'web',
    client_id: 'lobehub-market',
    client_name: 'LobeHub Marketplace',
    grant_types: ['authorization_code', 'refresh_token'],
    logo_uri: 'https://hub-apac-1.lobeobjects.space/lobehub-desktop-icon.png',
    post_logout_redirect_uris: [
      urlJoin(marketBaseUrl!, '/lobehub-oidc/logout'),
      'http://localhost:8787/lobehub-oidc/logout',
    ],
    redirect_uris: [
      urlJoin(marketBaseUrl!, '/lobehub-oidc/consent/callback'),
      'http://localhost:8787/lobehub-oidc/consent/callback',
    ],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  },
];

/**
 * Appends a distribution's statically registered clients to the built-in ones.
 *
 * A distribution client may not reuse a built-in `client_id`: oidc-provider
 * would silently keep one of the two, and a slot that replaced the desktop
 * client's redirect URIs or grant types would change who can sign in as it.
 */
export const mergeBusinessClients = (
  builtin: ClientMetadata[],
  business: readonly ClientMetadata[],
): ClientMetadata[] => {
  const seen = new Set(builtin.map((client) => client.client_id));

  for (const client of business) {
    if (seen.has(client.client_id)) {
      throw new Error(`OIDC client "${client.client_id}" is registered more than once`);
    }
    seen.add(client.client_id);
  }

  return [...builtin, ...business];
};

/**
 * Default OIDC client configuration
 */
export const defaultClients: ClientMetadata[] = mergeBusinessClients(
  builtinClients,
  BUSINESS_OIDC_CLIENTS as ClientMetadata[],
);

/**
 * OIDC Scopes definition
 */
export const defaultScopes = [
  'openid',
  'profile',
  'email',
  'offline_access', // Allows obtaining refresh_token
  ACCEPTANCE_REVIEW_SCOPE,
  ACCEPTANCE_EXTENSION_SCOPE,
];

/**
 * OIDC Claims 定义
 */
export const defaultClaims = {
  email: ['email', 'email_verified'],
  openid: ['sub'],
  // subject (用户唯一标识)
  profile: ['name', 'picture'],
};
