import { createHash } from 'node:crypto';

import { SMAI_SESSION_HEADER } from '@lobechat/model-runtime';
import { RequestTrigger } from '@lobechat/types';
import { ModelProvider } from 'model-bank';

import { getLLMConfig } from '@/envs/llm';

/**
 * Auxiliary calls that must not join a conversation's channel affinity: titles,
 * summaries, retrieval, speech, evaluation and other background helpers.
 * Anything else reaching the agent loop is a conversation turn.
 */
const AUXILIARY_TRIGGERS = new Set<string>([
  RequestTrigger.AgentMeta,
  RequestTrigger.AgentSignal,
  RequestTrigger.Asr,
  RequestTrigger.BuilderSuggestion,
  RequestTrigger.ContextCompression,
  RequestTrigger.Eval,
  RequestTrigger.Expertise,
  RequestTrigger.FileEmbedding,
  RequestTrigger.FollowUp,
  RequestTrigger.GenerationTopicTitle,
  RequestTrigger.Goal,
  RequestTrigger.HistorySummary,
  RequestTrigger.Image,
  RequestTrigger.InputCompletion,
  RequestTrigger.Memory,
  RequestTrigger.MultimodalAnalysis,
  RequestTrigger.Music,
  RequestTrigger.PromptRewrite,
  RequestTrigger.ProviderCheck,
  RequestTrigger.SemanticSearch,
  RequestTrigger.SignupEmailLLMReview,
  RequestTrigger.ThreadTitle,
  RequestTrigger.Topic,
  RequestTrigger.TopicAnalysis,
  RequestTrigger.TopicSummary,
  RequestTrigger.TopicTitle,
  RequestTrigger.Translate,
  RequestTrigger.Tts,
  RequestTrigger.Verify,
  RequestTrigger.Video,
]);

export const isAuxiliaryRequestTrigger = (trigger: unknown) =>
  typeof trigger === 'string' && AUXILIARY_TRIGGERS.has(trigger);

/** `sha256(salt:userId:topicId)` as hex, first 32 chars. Opaque: neither id can be read back. */
export const hashSmaiSession = (salt: string, userId: string, topicId: string) =>
  createHash('sha256').update(`${salt}:${userId}:${topicId}`).digest('hex').slice(0, 32);

interface SmaiSessionHeaderInput {
  provider: string;
  topicId?: string;
  trigger?: unknown;
  userId?: string | null;
}

/**
 * Per-request headers carrying the smai.ai gateway affinity key. Returns
 * `undefined` (send nothing) unless the call is a smai conversation turn with a
 * user, a topic and a configured `SMAI_SESSION_HASH_SALT`.
 */
export const buildSmaiSessionHeaders = ({
  provider,
  topicId,
  trigger,
  userId,
}: SmaiSessionHeaderInput): Record<string, string> | undefined => {
  if (provider !== ModelProvider.SMAI) return;
  if (!userId || !topicId) return;
  if (isAuxiliaryRequestTrigger(trigger)) return;

  const salt = getLLMConfig().SMAI_SESSION_HASH_SALT;
  if (!salt) return;

  return { [SMAI_SESSION_HEADER]: hashSmaiSession(salt, userId, topicId) };
};
