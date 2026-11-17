// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeAnthropicAI } from '../anthropic';
import { LobeGoogleAI } from '../google';
import { LobeOpenAI } from '../openai';
import { LobeSMAIAI } from './index';
import { SMAI_SESSION_HEADER } from './session';

const SESSION = '0123456789abcdef0123456789abcdef';

const fetchMock = vi.fn<typeof fetch>();

/** Read the URL, headers and JSON body of the n-th captured upstream request. */
const captured = async (index = 0) => {
  const [input, init] = fetchMock.mock.calls[index];
  const request = input instanceof Request ? input : undefined;
  const headers = new Headers(request?.headers ?? init?.headers);
  if (request && init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  const rawBody = init?.body ?? (request ? await request.clone().text() : undefined);
  const body = typeof rawBody === 'string' && rawBody ? JSON.parse(rawBody) : undefined;
  return { body, headers, url: String(request?.url ?? input) };
};

const chatOnce = async (
  runtime: { chat?: (...args: any[]) => Promise<Response> },
  model: string,
  requestHeaders?: Record<string, string>,
) => {
  try {
    const response = await runtime.chat!(
      { messages: [{ content: 'hi', role: 'user' }], model, stream: true, temperature: 1 },
      { requestHeaders, user: 'user-1' },
    );
    await response.text();
  } catch {
    // The stubbed upstream answers 400; only the outgoing request matters here.
  }
};

beforeEach(() => {
  fetchMock.mockImplementation(
    async () =>
      new Response(JSON.stringify({ error: { message: 'stubbed', type: 'invalid_request' } }), {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('smai request headers', () => {
  describe.each([
    { kind: 'Claude', model: 'claude-sonnet-4-5-20250929', path: '/v1/messages' },
    { kind: 'Gemini', model: 'gemini-2.5-flash', path: ':streamGenerateContent' },
    { kind: 'DeepSeek', model: 'deepseek-chat', path: '/v1/chat/completions' },
    { kind: 'Grok', model: 'grok-4', path: '/v1/' },
    { kind: 'GPT', model: 'gpt-5', path: '/v1/responses' },
  ])('$kind route', ({ model, path }) => {
    it('forwards X-Smai-Session and sends X-Client: smai.ai to the smai gateway', async () => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
      await chatOnce(runtime, model, { [SMAI_SESSION_HEADER]: SESSION });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const { headers, url } = await captured();
      expect(url.startsWith('https://api.smai.ai')).toBe(true);
      expect(url).toContain(path);
      expect(headers.get('x-smai-session')).toBe(SESSION);
      expect(headers.get('x-client')).toBe('smai.ai');
    });

    it('sends no X-Smai-Session when the caller provides none', async () => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
      await chatOnce(runtime, model);

      const { headers } = await captured();
      expect(headers.has('x-smai-session')).toBe(false);
      expect(headers.get('x-client')).toBe('smai.ai');
    });
  });

  it('keeps the request body free of the session header for Gemini', async () => {
    const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
    await chatOnce(runtime, 'gemini-2.5-flash', { [SMAI_SESSION_HEADER]: SESSION });

    const { body } = await captured();
    expect(JSON.stringify(body)).not.toContain(SESSION);
    expect(JSON.stringify(body)).not.toContain('httpOptions');
  });

  it('sends X-Client: smai.ai on video create and poll', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: 'task-1', status: 'queued' }), {
          headers: { 'content-type': 'application/json' },
        }),
    );
    const runtime = new LobeSMAIAI({ apiKey: 'test-key' });

    await runtime.createVideo!({
      model: 'doubao-seedance-2-0-260128',
      params: { prompt: 'a cat' },
    } as any);
    await runtime.handlePollVideoStatus!('task-1', 'doubao-seedance-2-0-260128');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const index of [0, 1]) {
      const { headers, url } = await captured(index);
      expect(url).toContain('https://api.smai.ai/v1/videos');
      expect(headers.get('x-client')).toBe('smai.ai');
      expect(headers.get('authorization')).toBe('Bearer test-key');
    }
  });
});

describe('smai GPT prompt_cache_key', () => {
  it.each(['gpt-5', 'gpt-4o'])(
    'uses smai:{session} for %s when a session is present',
    async (model) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
      await chatOnce(runtime, model, { [SMAI_SESSION_HEADER]: SESSION });

      const { body } = await captured();
      expect(body.prompt_cache_key).toBe(`smai:${SESSION}`);
    },
  );

  it.each(['gpt-5', 'gpt-4o'])(
    'falls back to lobe:{user}:{model} for %s without a session',
    async (model) => {
      const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
      await chatOnce(runtime, model);

      const { body } = await captured();
      expect(body.prompt_cache_key).toBe(`lobe:user-1:${model}`);
    },
  );

  it('does not add a prompt_cache_key to non-GPT smai models', async () => {
    const runtime = new LobeSMAIAI({ apiKey: 'test-key' });
    await chatOnce(runtime, 'deepseek-chat', { [SMAI_SESSION_HEADER]: SESSION });

    const { body } = await captured();
    expect(body.prompt_cache_key).toBeUndefined();
  });
});

describe('non-smai providers', () => {
  it.each([
    {
      create: () => new LobeOpenAI({ apiKey: 'k', baseURL: 'https://api.openai.com/v1' }),
      model: 'gpt-5',
      name: 'openai',
    },
    {
      create: () => new LobeAnthropicAI({ apiKey: 'k' }),
      model: 'claude-sonnet-4-5-20250929',
      name: 'anthropic',
    },
    {
      create: () =>
        new LobeGoogleAI({ apiKey: 'k', baseURL: 'https://generativelanguage.googleapis.com' }),
      model: 'gemini-2.5-flash',
      name: 'google',
    },
  ])('$name sends neither X-Smai-Session nor X-Client', async ({ create, model }) => {
    await chatOnce(create(), model);

    const { headers } = await captured();
    expect(headers.has('x-smai-session')).toBe(false);
    expect(headers.has('x-client')).toBe(false);
  });

  it('openai keeps its default prompt_cache_key', async () => {
    await chatOnce(new LobeOpenAI({ apiKey: 'k', baseURL: 'https://api.openai.com/v1' }), 'gpt-5');

    const { body } = await captured();
    expect(body.prompt_cache_key).toBe('lobe:user-1:gpt-5');
  });

  it('google forwards per-request headers it is given', async () => {
    await chatOnce(
      new LobeGoogleAI({ apiKey: 'k', baseURL: 'https://generativelanguage.googleapis.com' }),
      'gemini-2.5-flash',
      { 'X-Trace': 'kept' },
    );

    const { headers } = await captured();
    expect(headers.get('x-trace')).toBe('kept');
  });
});
