import { z } from 'zod';

// ==================== Message Translation Query Types ====================

/**
 * 翻译消息查询请求参数
 */
export interface MessageTranslateQueryRequest {
  messageId: string;
}

export const MessageTranslateQueryRequestSchema = z.object({
  messageId: z.string().min(1, 'message id is required'),
});

/**
 * 翻译消息 params 请求参数
 */
export type MessageTranslateParams = MessageTranslateQueryRequest;

// ==================== Message Translation Trigger Types ====================

/**
 * 翻译消息 body 请求参数
 */
export interface MessageTranslateBody {
  from?: string;
  model?: string;
  provider?: string;
  to: string;
}

export const MessageTranslateTriggerRequestSchema = z.object({
  from: z.string().optional(),
  model: z.string().nullish(),
  provider: z.string().nullish(),
  to: z.string().min(1, 'target language is required, e.g. en-US, zh-CN'),
});

/**
 * 翻译消息完整请求参数
 */
export type MessageTranslateTriggerRequest = MessageTranslateQueryRequest & MessageTranslateBody;

// ==================== Message Translation Update Types ====================

/**
 * 更新翻译信息请求参数
 */
export type MessageTranslateInfoUpdate = MessageTranslateTriggerRequest & {
  content?: string;
};

export const MessageTranslateInfoUpdateSchema = MessageTranslateTriggerRequestSchema.extend({
  content: z.string().optional(),
});

// ==================== Message Translation Response Types ====================

/**
 * 翻译消息响应参数
 */
export interface MessageTranslateResponse {
  clientId: string | null;
  content: string | null;
  from: string | null;
  id: string;
  to: string | null;
  userId: string;
}

/**
 * What a translate (POST) or a manual edit (PATCH) answers with: the values
 * just written. `content` is absent on a PATCH that did not send it, `from`
 * when the caller left the source language to detection.
 */
export interface MessageTranslateWriteResponse {
  content?: string;
  from?: string;
  id: string;
  to: string;
  userId: string;
}

// ==================== Response Schemas ====================

export const MessageTranslationSchema = z
  .object({
    clientId: z.string().nullable(),
    content: z.string().nullable(),
    from: z.string().nullable(),
    /** The id of the translated message. */
    id: z.string(),
    to: z.string().nullable(),
    userId: z.string(),
  } satisfies Record<keyof MessageTranslateResponse, z.ZodType>)
  .strict()
  .meta({ id: 'MessageTranslation' });

export const MessageTranslationWriteSchema = z
  .object({
    content: z.string().optional(),
    from: z.string().optional(),
    /** The id of the translated message. */
    id: z.string(),
    to: z.string(),
    userId: z.string(),
  } satisfies Record<keyof MessageTranslateWriteResponse, z.ZodType>)
  .strict()
  .meta({ id: 'MessageTranslationWrite' });
