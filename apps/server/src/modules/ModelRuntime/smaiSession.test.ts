import { createHash } from 'node:crypto';

import { RequestTrigger } from '@lobechat/types';
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildSmaiSessionHeaders, hashSmaiSession, isAuxiliaryRequestTrigger } from './smaiSession';

const llmConfig = vi.hoisted(() => ({ SMAI_SESSION_HASH_SALT: undefined as string | undefined }));

vi.mock('@/envs/llm', () => ({ getLLMConfig: () => llmConfig }));

const base = {
  provider: ModelProvider.SMAI,
  topicId: 'topic-1',
  trigger: RequestTrigger.Chat,
  userId: 'user-1',
};

describe('smaiSession', () => {
  beforeEach(() => {
    llmConfig.SMAI_SESSION_HASH_SALT = 'test-salt';
  });

  it('hashes salt:userId:topicId with sha256 and keeps the first 32 hex chars', () => {
    const expected = createHash('sha256')
      .update('test-salt:user-1:topic-1')
      .digest('hex')
      .slice(0, 32);

    expect(hashSmaiSession('test-salt', 'user-1', 'topic-1')).toBe(expected);
  });

  it('returns a 32-char hex header that never contains the raw ids', () => {
    const value = buildSmaiSessionHeaders(base)?.['X-Smai-Session'];

    expect(value).toMatch(/^[\da-f]{32}$/);
    expect(value).not.toContain('user-1');
    expect(value).not.toContain('topic-1');
  });

  it('is stable for the same user + topic and differs across topics and users', () => {
    const a = buildSmaiSessionHeaders(base);
    const b = buildSmaiSessionHeaders(base);
    const otherTopic = buildSmaiSessionHeaders({ ...base, topicId: 'topic-2' });
    const otherUser = buildSmaiSessionHeaders({ ...base, userId: 'user-2' });

    expect(a).toEqual(b);
    expect(otherTopic?.['X-Smai-Session']).not.toBe(a?.['X-Smai-Session']);
    expect(otherUser?.['X-Smai-Session']).not.toBe(a?.['X-Smai-Session']);
  });

  it('changes with the salt', () => {
    const before = buildSmaiSessionHeaders(base);
    llmConfig.SMAI_SESSION_HASH_SALT = 'rotated';

    expect(buildSmaiSessionHeaders(base)).not.toEqual(before);
  });

  it.each([
    ['salt is unset', { salt: undefined }],
    ['salt is empty', { salt: '' }],
  ])('sends nothing when %s', (_, { salt }) => {
    llmConfig.SMAI_SESSION_HASH_SALT = salt;

    expect(buildSmaiSessionHeaders(base)).toBeUndefined();
  });

  it.each([
    ['topicId', { topicId: undefined }],
    ['userId', { userId: undefined }],
    ['userId (null)', { userId: null }],
  ])('sends nothing without %s', (_, override) => {
    expect(buildSmaiSessionHeaders({ ...base, ...override })).toBeUndefined();
  });

  it.each([ModelProvider.OpenAI, ModelProvider.Anthropic, ModelProvider.Google, 'newapi'])(
    'sends nothing for provider %s',
    (provider) => {
      expect(buildSmaiSessionHeaders({ ...base, provider })).toBeUndefined();
    },
  );

  it.each([
    RequestTrigger.TopicTitle,
    RequestTrigger.ThreadTitle,
    RequestTrigger.ContextCompression,
    RequestTrigger.HistorySummary,
    RequestTrigger.TopicSummary,
    RequestTrigger.SemanticSearch,
    RequestTrigger.FileEmbedding,
    RequestTrigger.Asr,
    RequestTrigger.Eval,
    RequestTrigger.FollowUp,
    RequestTrigger.Translate,
  ])('sends nothing for auxiliary trigger %s', (trigger) => {
    expect(isAuxiliaryRequestTrigger(trigger)).toBe(true);
    expect(buildSmaiSessionHeaders({ ...base, trigger })).toBeUndefined();
  });

  it.each([
    RequestTrigger.Chat,
    RequestTrigger.Bot,
    RequestTrigger.Api,
    RequestTrigger.AgentShare,
    RequestTrigger.Scheduled,
    undefined,
  ])('sends the header for conversation trigger %s', (trigger) => {
    expect(buildSmaiSessionHeaders({ ...base, trigger })).toBeDefined();
  });
});
