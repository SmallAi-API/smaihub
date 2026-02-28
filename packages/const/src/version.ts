import { BRANDING_NAME, ORG_NAME } from '@lobechat/business-const';

import pkg from '../../../package.json';

export const CURRENT_VERSION = pkg.version;

export const isDesktop = typeof __ELECTRON__ !== 'undefined' && !!__ELECTRON__;

const desktopSelfHostEnv = process.env.NEXT_PUBLIC_DESKTOP_ENABLE_SELFHOST;
export const isDesktopSelfHostEnabled =
  desktopSelfHostEnv === undefined
    ? true
    : !['0', 'false', 'no', 'off'].includes(desktopSelfHostEnv.toLowerCase());

// @ts-ignore
export const isCustomBranding = BRANDING_NAME !== 'LobeHub';
// @ts-ignore
export const isCustomORG = ORG_NAME !== 'LobeHub';
