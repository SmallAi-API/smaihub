import type OpenAI from 'openai';

import { isOpenAIPromptCacheKeyModel } from '../../core/openaiCompatible/apiMode';
import type {
  OpenAIExtraParams,
  ResponseCreateParamsWithPromptCacheKey,
} from '../../core/openaiCompatible/factoryOptions';
import type { ChatMethodOptions, ChatStreamPayload } from '../../types';
import { LobeOpenAI } from '../openai';
import { getSmaiSessionId } from './session';

// SMAI's GPT-6.2 route attempts strict compilation even for ordinary JSON Schema.
const setDefaultStrict = <T extends { type: string; strict?: boolean | null }>(tool: T) =>
  tool.type === 'function' && tool.strict == null ? { ...tool, strict: false } : tool;

const prepareTool = (tool: OpenAI.Responses.Tool): OpenAI.Responses.Tool => {
  if (tool.type === 'namespace') return { ...tool, tools: tool.tools.map(setDefaultStrict) };
  return setDefaultStrict(tool);
};

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

    // Keep each conversation in its own upstream prompt cache bucket.
    const keyedPayload: ChatStreamPayload & OpenAIExtraParams = {
      ...payload,
      prompt_cache_key: `smai:${sessionId}`,
    };
    return super.chat(keyedPayload, options);
  }

  protected override prepareResponsesRequest(
    requestPayload: ResponseCreateParamsWithPromptCacheKey,
    logicalModel: string,
  ) {
    const prepared = super.prepareResponsesRequest(requestPayload, logicalModel);
    const { input, model, tools } = prepared.payload;
    if (model !== 'gpt-6.2-sol' && model !== 'gpt-6.2-astra') return prepared;

    return {
      ...prepared,
      payload: {
        ...prepared.payload,
        ...(tools && { tools: tools.map(prepareTool) }),
        ...(Array.isArray(input) && {
          input: input.map((item) =>
            item.type === 'additional_tools'
              ? { ...item, tools: item.tools.map(prepareTool) }
              : item,
          ),
        }),
      },
    };
  }
}
