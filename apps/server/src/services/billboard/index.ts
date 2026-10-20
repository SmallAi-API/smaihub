import { EdgeConfig } from '@lobechat/edge-config';
import debug from 'debug';
import { z } from 'zod';

import { appEnv } from '@/envs/app';
import type { GlobalBillboard, GlobalBillboardItem } from '@/types/serverConfig';

const log = debug('lobe-server:billboard');
const httpsURL = z
  .string()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && !/\s/u.test(value);
    } catch {
      return false;
    }
  });
const text = (length: number) => z.string().max(length);
const locale = z.object({
  description: text(300).optional(),
  linkLabel: text(20).optional(),
  title: text(60).optional(),
});
const item = z.object({
  action: z.literal('openFeedback').nullish(),
  cover: httpsURL.nullish(),
  description: text(300),
  i18n: z.record(z.string(), locale).optional(),
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  linkLabel: text(20).nullish(),
  linkUrl: httpsURL.nullish(),
  title: text(60),
});
const schema = z
  .object({
    endAt: z.string().datetime({ offset: true }),
    i18n: z.record(z.string(), z.object({ title: text(40).optional() })).optional(),
    id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    items: z.array(item).min(1).max(10),
    slug: z.string().min(1).max(64),
    startAt: z.string().datetime({ offset: true }),
    title: text(40),
  })
  .refine((value) => Date.parse(value.startAt) < Date.parse(value.endAt))
  .refine((value) => new Set(value.items.map((entry) => entry.id)).size === value.items.length);

export function parseBillboard(raw: unknown): GlobalBillboard | null {
  if (raw == null) return null;
  return schema.parse(raw);
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Preserve the existing Edge Config contract, including its optional fields and actions.
const normalizeLegacyBillboard = (raw: unknown): GlobalBillboard | null => {
  if (!isObject(raw)) return null;
  if (typeof raw.slug !== 'string' || raw.slug.length === 0) return null;
  if (typeof raw.title !== 'string') return null;
  if (typeof raw.startAt !== 'string' || typeof raw.endAt !== 'string') return null;
  if (!Array.isArray(raw.items)) return null;
  const items = raw.items.filter(
    (entry) =>
      isObject(entry) && typeof entry.title === 'string' && typeof entry.description === 'string',
  ) as GlobalBillboardItem[];
  return { ...(raw as unknown as GlobalBillboard), items };
};

// URL is authoritative: null and errors must never resurrect an Edge Config ad.
// This method throws on failure so polling can preserve the last successful value.
export async function getBillboard(): Promise<GlobalBillboard | null> {
  try {
    if (appEnv.BILLBOARD_URL) {
      const response = await fetch(appEnv.BILLBOARD_URL, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return parseBillboard(await response.json());
    }
    if (!EdgeConfig.isEnabled()) return null;
    return normalizeLegacyBillboard(await new EdgeConfig().getBillboards());
  } catch {
    // Avoid logging payloads or URLs which may carry deployment credentials.
    log('Announcement retrieval failed (%s)', appEnv.BILLBOARD_URL ? 'URL' : 'Edge Config');
    throw new Error('Billboard is temporarily unavailable');
  }
}

export async function getInitialBillboard(): Promise<GlobalBillboard | null> {
  try {
    return await getBillboard();
  } catch {
    return null;
  }
}
