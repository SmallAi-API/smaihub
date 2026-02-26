import { type InvokeModelWithResponseStreamResponse } from '@aws-sdk/client-bedrock-runtime';
import { describe, expect, it, vi } from 'vitest';

import * as uuidModule from '../../../utils/uuid';
import { AWSBedrockLlamaStream } from './llama';

const readDecodedChunks = async (stream: ReadableStream<Uint8Array>) => {
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    if (value) chunks.push(decoder.decode(value, { stream: true }));
  }

  return chunks;
};

describe('AWSBedrockLlamaStream', () => {
  it('should transform Bedrock Llama stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');
    const mockBedrockStream = new ReadableStream({
      start(controller) {
        controller.enqueue({ generation: 'Hello', generation_token_count: 1 });
        controller.enqueue({ generation: ' world!', generation_token_count: 2 });
        controller.enqueue({ stop_reason: 'stop' });
        controller.close();
      },
    });

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = AWSBedrockLlamaStream(mockBedrockStream, {
      onStart: onStartMock,
      onText: onTextMock,
      onCompletion: onCompletionMock,
    });

    const chunks = await readDecodedChunks(protocolStream);

    expect(chunks).toEqual([
      'id: chat_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: chat_1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: chat_1\n',
      'event: stop\n',
      `data: "finished"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should transform Bedrock Llama AsyncIterator to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const mockBedrockStream: InvokeModelWithResponseStreamResponse = {
      body: {
        // @ts-ignore
        async *[Symbol.asyncIterator]() {
          yield { generation: 'Hello', generation_token_count: 1 };
          yield { generation: ' world!', generation_token_count: 2 };
          yield { stop_reason: 'stop' };
        },
      },
    };

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = AWSBedrockLlamaStream(mockBedrockStream, {
      onStart: onStartMock,
      onText: onTextMock,
      onCompletion: onCompletionMock,
    });

    const chunks = await readDecodedChunks(protocolStream);

    expect(chunks).toEqual([
      'id: chat_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: chat_1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: chat_1\n',
      'event: stop\n',
      `data: "finished"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle Bedrock response with chunk property', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('2');

    const mockBedrockStream: InvokeModelWithResponseStreamResponse = {
      contentType: 'any',
      body: {
        // @ts-ignore
        async *[Symbol.asyncIterator]() {
          yield {
            chunk: {
              bytes: new TextEncoder().encode('{"generation":"Hello","generation_token_count":1}'),
            },
          };
          yield {
            chunk: {
              bytes: new TextEncoder().encode(
                '{"generation":" world!","generation_token_count":2}',
              ),
            },
          };
          yield { chunk: { bytes: new TextEncoder().encode('{"stop_reason":"stop"}') } };
        },
      },
    };

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onTokenMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = AWSBedrockLlamaStream(mockBedrockStream, {
      onStart: onStartMock,
      onText: onTextMock,
      onCompletion: onCompletionMock,
    });

    const chunks = await readDecodedChunks(protocolStream);

    expect(chunks).toEqual([
      'id: chat_2\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: chat_2\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: chat_2\n',
      'event: stop\n',
      `data: "finished"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty stream', async () => {
    const mockBedrockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const protocolStream = AWSBedrockLlamaStream(mockBedrockStream);

    const chunks = await readDecodedChunks(protocolStream);

    expect(chunks).toEqual([]);
  });
});
