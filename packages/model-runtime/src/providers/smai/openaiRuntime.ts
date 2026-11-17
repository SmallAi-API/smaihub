import { isOpenAIPromptCacheKeyModel } from '../../core/openaiCompatible/apiMode';
import type { OpenAIExtraParams } from '../../core/openaiCompatible/factoryOptions';
import type { ChatMethodOptions, ChatStreamPayload } from '../../types';
import { LobeOpenAI } from '../openai';
import { getSmaiSessionId } from './session';

/**
 * smai.ai OpenAI route. Identical to {@link LobeOpenAI} except that a GPT request
 * carrying a conversation session (`X-Smai-Session`) uses that session as its
 * `prompt_cache_key`, so each topic gets its own upstream cache bucket instead
 * of sharing `lobe:{userId}:{model}`.
 *
 * The key is injected as an explicit payload value, which both the Chat
 * Completions and Responses protocols honor ahead of their default key. Without
 * a session the request is untouched and the default key applies.
 */
export class LobeSMAIOpenAI extends LobeOpenAI {
  override async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    const sessionId = getSmaiSessionId(options?.requestHeaders);

    if (
      !sessionId ||
      !isOpenAIPromptCacheKeyModel(payload.model) ||
      (payload as OpenAIExtraParams).prompt_cache_key !== undefined
    ) {
      return super.chat(payload, options);
    }

    const keyedPayload: ChatStreamPayload & OpenAIExtraParams = {
      ...payload,
      prompt_cache_key: `smai:${sessionId}`,
    };
    return super.chat(keyedPayload, options);
  }
}
