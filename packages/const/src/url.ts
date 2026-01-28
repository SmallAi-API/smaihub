import urlJoin from 'url-join';

const isDev = process.env.NODE_ENV === 'development';

export const OFFICIAL_URL = 'https://www.smallai.asia';
export const OFFICIAL_SITE = 'https://www.smallai.asia';
export const OFFICIAL_DOMAIN = 'https://www.smallai.asia';

export const OG_URL = '/og/og.webp?v=1';

export const GITHUB = 'https://www.smallai.asia';
export const GITHUB_ISSUES = 'https://www.smallai.asia';
export const CHANGELOG = 'https://www.smallai.asia';

export const DOCUMENTS = 'https://docs.smai.ai/zh/docs/apps/smallai';
export const USAGE_DOCUMENTS = 'https://docs.smai.ai';
export const SELF_HOSTING_DOCUMENTS = 'https://docs.smai.ai';
export const DATABASE_SELF_HOSTING_URL = 'https://docs.smai.ai';

// use this for the link
export const DOCUMENTS_REFER_URL = 'https://docs.smai.ai';

export const WIKI_PLUGIN_GUIDE = 'https://docs.smai.ai';
export const MANUAL_UPGRADE_URL = 'https://docs.smai.ai';

export const BLOG = 'https://docs.smai.ai';

export const ABOUT = OFFICIAL_SITE;
export const FEEDBACK = 'https://docs.smai.ai';
export const PRIVACY_URL = 'https://lobehub.com/privacy';
export const TERMS_URL = 'https://lobehub.com/terms';

export const PLUGINS_INDEX_URL = 'https://chat-plugins.lobehub.com';

export const MORE_MODEL_PROVIDER_REQUEST_URL = 'https://www.smallai.asia';

export const MORE_FILE_PREVIEW_REQUEST_URL = 'https://www.smallai.asia';

export const AGENTS_INDEX_GITHUB = 'https://github.com/lobehub/lobe-chat-agents';
export const AGENTS_INDEX_GITHUB_ISSUE = urlJoin(AGENTS_INDEX_GITHUB, 'issues/new');
export const AGENTS_OFFICIAL_URL = 'https://lobehub.com/agent';

export const SESSION_CHAT_URL = (agentId: string, mobile?: boolean) => {
  if (mobile) return `/agent/${agentId}`;
  return `/agent/${agentId}`;
};

export const GROUP_CHAT_URL = (groupId: string) => `/group/${groupId}`;

export const LIBRARY_URL = (id: string) => urlJoin('/resource/library', id);

export const imageUrl = (filename: string) => `/images/${filename}`;

export const LOBE_URL_IMPORT_NAME = 'settings';

export const RELEASES_URL = urlJoin(GITHUB, 'releases');

export const mailTo = (email: string) => `mailto:${email}`;

export const AES_GCM_URL = 'https://datatracker.ietf.org/doc/html/draft-ietf-avt-srtp-aes-gcm-01';
export const BASE_PROVIDER_DOC_URL = 'https://api.smai.ai';
export const SITEMAP_BASE_URL = isDev ? '/sitemap.xml/' : 'sitemap';
export const CHANGELOG_URL = 'https://api.smai.ai';

export const DOWNLOAD_URL = {
  android: 'https://app.smai.ai/',
  default: 'https://app.smai.ai/',
  ios: 'https://app.smai.ai/',
} as const;
