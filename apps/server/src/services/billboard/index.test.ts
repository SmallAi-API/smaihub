// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getBillboard, getInitialBillboard, parseBillboard } from './index';

const mocks = vi.hoisted(() => ({
  env: { BILLBOARD_URL: undefined as string | undefined },
  getBillboards: vi.fn(),
  isEnabled: vi.fn(),
}));
vi.mock('@/envs/app', () => ({ appEnv: mocks.env }));
vi.mock('@lobechat/edge-config', () => ({
  EdgeConfig: class {
    static isEnabled = mocks.isEnabled;
    getBillboards = mocks.getBillboards;
  },
}));

const feed = () => ({
  endAt: '2026-10-25T00:00:00Z',
  i18n: { 'en-US': { title: 'News' } },
  id: 1,
  items: [
    {
      action: 'openFeedback',
      cover: 'https://images.example.com/banner.png',
      description: '公告内容',
      i18n: { en: { description: 'Details', linkLabel: 'Read', title: 'Announcement' } },
      id: 2,
      linkLabel: '阅读',
      linkUrl: 'https://example.com/news',
      title: '公告',
    },
  ],
  slug: 'news-2026',
  startAt: '2026-10-20T00:00:00Z',
  title: '更新公告',
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.env.BILLBOARD_URL = 'https://new-api.example.com/api/billboard/active';
  mocks.isEnabled.mockReturnValue(true);
  mocks.getBillboards.mockResolvedValue(feed());
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(feed())));
});
afterEach(() => vi.unstubAllGlobals());

describe('parseBillboard', () => {
  it('accepts the direct new-api JSON contract and translations', () => {
    expect(parseBillboard(feed())).toEqual(feed());
    expect(parseBillboard(null)).toBeNull();
  });

  it.each([
    ['array', []],
    ['envelope', { data: feed(), success: true }],
    ['invalid date', { ...feed(), startAt: 'tomorrow' }],
    ['reversed dates', { ...feed(), startAt: '2027-01-01T00:00:00Z' }],
    ['equal dates', { ...feed(), startAt: feed().endAt }],
    ['missing slug', { ...feed(), slug: '' }],
    ['long title', { ...feed(), title: 'x'.repeat(41) }],
    ['invalid group id', { ...feed(), id: 0 }],
    ['empty items', { ...feed(), items: [] }],
    [
      'too many items',
      {
        ...feed(),
        items: Array.from({ length: 11 }, (_, id) => ({ ...feed().items[0], id: id + 1 })),
      },
    ],
    ['duplicate ids', { ...feed(), items: [feed().items[0], feed().items[0]] }],
    ['bad group translation', { ...feed(), i18n: { en: { title: 123 } } }],
  ])('rejects %s', (_name, payload) => {
    expect(() => parseBillboard(payload)).toThrow();
  });

  it.each([
    { action: 'resetOnboarding' },
    { action: 'openChangelog' },
    { action: 'alert' },
    { id: Number.MAX_SAFE_INTEGER + 1 },
    { id: -1 },
    { id: 1.5 },
    { title: 'x'.repeat(61) },
    { description: 'x'.repeat(301) },
    { cover: 'http://example.com/image.png' },
    { linkUrl: 'javascript:alert(1)' },
    { linkUrl: 'https://user:password@example.com' },
    { linkUrl: 'https://example.com/a b' },
    { i18n: { en: { title: 123 } } },
    { i18n: { en: { description: 'x'.repeat(301) } } },
  ])('rejects malformed item fields: %j', (fields) => {
    expect(() =>
      parseBillboard({ ...feed(), items: [{ ...feed().items[0], ...fields }] }),
    ).toThrow();
  });

  it('accepts omitted or null optional fields and strips unpublished fields', () => {
    const { action, cover, linkLabel, linkUrl, ...item } = feed().items[0];
    void action;
    void cover;
    void linkLabel;
    void linkUrl;
    expect(parseBillboard({ ...feed(), items: [item], secret: 'hidden' })).not.toHaveProperty(
      'secret',
    );
    expect(
      parseBillboard({ ...feed(), items: [{ ...item, action: null, cover: null, linkUrl: null }] }),
    ).not.toBeNull();
  });
});

describe('getBillboard', () => {
  it('uses the URL with fresh reads, timeout and no redirects, ignoring Edge Config', async () => {
    expect(await getBillboard()).toEqual(feed());
    expect(fetch).toHaveBeenCalledWith(
      mocks.env.BILLBOARD_URL,
      expect.objectContaining({
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        redirect: 'error',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(mocks.isEnabled).not.toHaveBeenCalled();
    expect(mocks.getBillboards).not.toHaveBeenCalled();
  });

  it('returns null on withdrawal without falling back to Edge Config', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(null));
    expect(await getBillboard()).toBeNull();
    expect(mocks.getBillboards).not.toHaveBeenCalled();
  });

  it.each(['http', 'network', 'timeout', 'json', 'schema'])(
    'fails safely on %s without fallback',
    async (failure) => {
      if (failure === 'http')
        vi.mocked(fetch).mockResolvedValue(new Response('upstream secret', { status: 500 }));
      if (failure === 'network') vi.mocked(fetch).mockRejectedValue(new Error('secret URL'));
      if (failure === 'timeout')
        vi.mocked(fetch).mockRejectedValue(new DOMException('Timeout', 'TimeoutError'));
      if (failure === 'json') vi.mocked(fetch).mockResolvedValue(new Response('not JSON'));
      if (failure === 'schema') vi.mocked(fetch).mockResolvedValue(Response.json({ data: feed() }));
      await expect(getBillboard()).rejects.toThrow('Billboard is temporarily unavailable');
      expect(mocks.getBillboards).not.toHaveBeenCalled();
      // Initial config must remain usable even when the independent poll fails.
      expect(await getInitialBillboard()).toBeNull();
    },
  );

  it('bounds a stalled request at three seconds', async () => {
    vi.useFakeTimers();
    const abort = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
      setTimeout(() => abort.abort(new DOMException('Timeout', 'TimeoutError')), ms);
      return abort.signal;
    });
    vi.mocked(fetch).mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );
    try {
      const result = expect(getBillboard()).rejects.toThrow('Billboard is temporarily unavailable');
      await vi.advanceTimersByTimeAsync(3000);
      await result;
      expect(timeout).toHaveBeenCalledWith(3000);
    } finally {
      timeout.mockRestore();
      vi.useRealTimers();
    }
  });

  it('preserves legacy Edge Config fields, actions, dates and partial items when URL is unset', async () => {
    mocks.env.BILLBOARD_URL = undefined;
    const legacy = {
      ...feed(),
      startAt: '2026-10-20',
      items: [
        { title: 'Legacy', description: '', action: 'openChangelog', cover: '' },
        { title: 123 },
        null,
      ],
    };
    mocks.getBillboards.mockResolvedValue(legacy);
    expect(await getBillboard()).toEqual({ ...legacy, items: [legacy.items[0]] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([undefined, null, {}, { ...feed(), items: null }, { ...feed(), slug: '' }])(
    'ignores invalid legacy payload %j',
    async (value) => {
      mocks.env.BILLBOARD_URL = undefined;
      mocks.getBillboards.mockResolvedValue(value);
      expect(await getBillboard()).toBeNull();
    },
  );

  it('returns null when no source is configured', async () => {
    mocks.env.BILLBOARD_URL = undefined;
    mocks.isEnabled.mockReturnValue(false);
    expect(await getInitialBillboard()).toBeNull();
    expect(mocks.getBillboards).not.toHaveBeenCalled();
  });

  it('also isolates Edge Config failures from initial global config', async () => {
    mocks.env.BILLBOARD_URL = undefined;
    mocks.getBillboards.mockRejectedValue(new Error('edge error'));
    expect(await getInitialBillboard()).toBeNull();
  });

  it('returns the active announcement on initial load', async () => {
    expect(await getInitialBillboard()).toEqual(feed());
  });
});
