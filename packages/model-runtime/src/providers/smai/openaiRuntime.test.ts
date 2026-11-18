// @vitest-environment node
import type OpenAI from 'openai';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChatStreamPayload } from '../../types';
import { LobeOpenAI } from '../openai';
import { LobeSMAIAI } from './index';
import { SMAI_SESSION_HEADER } from './session';

const union = [{ type: 'string' }, { type: 'number' }];
const parameters = {
  additionalProperties: false,
  properties: { lowerBound: { oneOf: union } },
  required: ['lowerBound'],
  type: 'object',
};
const calculator = { name: 'defintegrate', parameters };
const requestCredsInput = {
  name: 'requestCredsInput',
  parameters: {
    properties: { fieldNames: { items: { type: 'string' }, type: 'array', uniqueItems: true } },
    required: ['fieldNames'],
    type: 'object',
  },
};
const functionTool = (
  name: string,
  schema: Record<string, unknown>,
  strict: boolean | null = null,
) => ({ name, parameters: schema, strict, type: 'function' }) as const;

const captureChat = async (
  model: string,
  tools: Partial<Pick<ChatStreamPayload, 'messages' | 'responsesTools' | 'tools'>>,
  createRuntime: () => Pick<LobeOpenAI, 'chat'> = () => new LobeSMAIAI({ apiKey: 'test-key' }),
) => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockImplementation(async () =>
      Response.json({ id: 'resp-test', status: 'completed', output: [] }),
    );
  vi.stubGlobal('fetch', fetchMock);
  const runtime = createRuntime();
  const response = await runtime.chat(
    { messages: [{ content: 'hi', role: 'user' }], model, stream: false, ...tools },
    { requestHeaders: { [SMAI_SESSION_HEADER]: '0123456789abcdef0123456789abcdef' } },
  );
  await response.text();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [input, init] = fetchMock.mock.calls[0];
  const url = input instanceof Request ? input.url : String(input);
  const rawBody = typeof init?.body === 'string' ? init.body : await (input as Request).text();
  expect(new URL(url).pathname).toBe('/v1/responses');
  return JSON.parse(rawBody);
};

afterEach(() => vi.unstubAllGlobals());

describe('SMAI Responses tool schemas', () => {
  it.each(['gpt-6.2-sol', 'gpt-6.2-astra'])(
    'sends the activated tools with their original parameter schemas for %s',
    async (model) => {
      const activated = [requestCredsInput, calculator];
      const tools: ChatStreamPayload['tools'] = activated.map((fn) => ({
        function: fn,
        type: 'function',
      }));
      const body = await captureChat(model, {
        messages: [
          { content: 'Test the available tools', role: 'user' },
          {
            content: '',
            role: 'assistant',
            tool_calls: [
              {
                function: {
                  arguments: '{"identifiers":["lobe-creds","lobe-calculator"]}',
                  name: 'activateTools',
                },
                id: 'call_activate',
                type: 'function',
              },
            ],
          },
          {
            content:
              'Successfully activated tools: lobe-creds.requestCredsInput, lobe-calculator.defintegrate',
            role: 'tool',
            tool_call_id: 'call_activate',
          },
        ],
        tools,
      });

      expect(body.input).toContainEqual(
        expect.objectContaining({ call_id: 'call_activate', type: 'function_call_output' }),
      );
      expect(body.tools).toEqual(
        activated.map((fn) => ({ ...fn, strict: false, type: 'function' })),
      );
      expect(body.prompt_cache_key).toBe('smai:0123456789abcdef0123456789abcdef');
      expect(tools[0].function).not.toHaveProperty('strict');
    },
  );

  it('handles nested native Responses schemas and preserves other tool definitions', async () => {
    const nested = {
      $defs: { value: { anyOf: [{ items: { oneOf: union }, type: 'array' }] } },
      properties: { values: { $ref: '#/$defs/value' } },
      type: 'object',
    };
    const nestedTool = functionTool('nested', nested);
    const unchanged: OpenAI.Responses.Tool[] = [
      { type: 'web_search' },
      functionTool('strict_tool', parameters, true),
      functionTool('non_strict_tool', parameters, false),
    ];
    const body = await captureChat('gpt-6.2-sol', { responsesTools: [nestedTool, ...unchanged] });

    expect(body.tools).toEqual([{ ...nestedTool, strict: false }, ...unchanged]);
    expect(nestedTool.strict).toBeNull();
  });

  it('handles function declarations introduced in the conversation and in namespaces', async () => {
    const implicit = functionTool('plain_tool', { properties: {}, type: 'object' });
    const custom = { name: 'custom', type: 'custom' } as const;
    const namespace = {
      description: '',
      name: 'functions',
      tools: [implicit, custom],
      type: 'namespace',
    } as const;
    const body = await captureChat('gpt-6.2-sol', {
      messages: [
        {
          content: '',
          responsesTools: [implicit, { ...namespace, tools: [...namespace.tools] }],
          role: 'system',
        },
        { content: 'hi', role: 'user' },
      ],
    });
    const explicit = { ...implicit, strict: false };
    expect(body.input[0].tools).toEqual([explicit, { ...namespace, tools: [explicit, custom] }]);
    expect(implicit.strict).toBeNull();
  });

  it('preserves the default strict behavior for GPT-6.1 on SMAI', async () => {
    const body = await captureChat('gpt-6.1-sol', {
      tools: [{ function: calculator, type: 'function' }],
    });

    expect(body.tools).toEqual([{ ...calculator, type: 'function' }]);
  });

  it('preserves the default strict behavior for direct OpenAI', async () => {
    const body = await captureChat(
      'gpt-6.2-sol',
      {
        tools: [{ function: calculator, type: 'function' }],
      },
      () => new LobeOpenAI({ apiKey: 'test-key', baseURL: 'https://api.openai.com/v1' }),
    );

    expect(body.tools).toEqual([{ ...calculator, type: 'function' }]);
  });
});
