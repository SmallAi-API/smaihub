import { z } from 'zod';

import { files } from '@/database/schemas/file';
import { SESSION_TYPE } from '@/database/schemas/session';

import { pageInfoShape, totalShape } from '../helpers/pagination';
import type {
  PublicFile,
  PublicMessage,
  PublicSession,
  PublicTopic,
} from '../helpers/public-fields';
import type { IPaginationQuery, PaginationQueryResponse } from './common.type';
import { dateTimeSchema, jsonObjectSchema, PaginationQuerySchema } from './common.type';
import { EvalPaginationSchema } from './eval-resource.type';
import { TopicSummarySchema } from './topic.type';

// ==================== Message Query Types ====================

export interface MessagesQueryByTopicRequest {
  topicId: string;
}

export const MessagesQueryByTopicRequestSchema = z.object({
  topicId: z.string().min(1, 'Topic ID cannot be empty'),
});

/**
 * 消息数量统计查询参数
 */
export interface MessagesCountQuery {
  threadId?: string;
  topicId?: string;
  topicIds?: string[];
  userId?: string;
}

export const MessagesCountQuerySchema = z.object({
  topicId: z.string().min(1).optional(),
  threadId: z.string().min(1).optional(),
  // Count by topic ID array (comma-separated string, e.g., "topic1,topic2,topic3")
  topicIds: z.string().nullish(),
  // 按用户ID统计 (仅管理员)
  userId: z.string().nullish(),
});

export interface CountByTopicsRequest {
  topicIds: string[];
}

export const CountByTopicsRequestSchema = z.object({
  topicIds: z.array(z.string()).min(1, 'Topic ID array cannot be empty'),
});

export interface CountByUserRequest {
  userId: string;
}

export const CountByUserRequestSchema = z.object({
  userId: z.string().min(1, 'User ID cannot be empty'),
});

// ==================== Message List Query Types ====================

/**
 * 消息列表查询参数
 */
export interface MessagesListQuery extends IPaginationQuery {
  limit?: number;
  offset?: number;
  role?: 'user' | 'system' | 'assistant' | 'tool';
  threadId?: string;
  topicId?: string;
  userId?: string;
}

export const MessagesListQuerySchema = z
  .object({
    threadId: z.string().min(1).optional(),
    // Filter parameters
    topicId: z.string().nullish(),
    userId: z.string().nullish(),
    role: z.enum(['user', 'system', 'assistant', 'tool']).nullish(),
  })
  .extend(PaginationQuerySchema.shape)
  .extend(EvalPaginationSchema.shape)
  .refine((data) => Boolean(data.topicId || data.userId), {
    message: 'At least one filter parameter must be provided: topicId or userId',
  });

// ==================== Message Search Types ====================

export interface SearchMessagesByKeywordRequest {
  keyword: string;
  limit?: number;
  offset?: number;
}

export const SearchMessagesByKeywordRequestSchema = z.object({
  keyword: z.string().min(1, 'Search keyword cannot be empty'),
  limit: z.number().min(1).max(100).nullish().default(20),
  offset: z.number().min(0).nullish().default(0),
});

// ==================== Message CRUD Types ====================

export interface MessagesCreateRequest {
  agentId?: string | null;
  // 客户端标识
  clientId?: string;

  content: string;
  // 状态
  favorite?: boolean;

  // 文件关联
  files?: string[];
  // 扩展数据
  metadata?: any;
  // AI相关字段
  model?: string;

  observationId?: string | null;
  // 消息关联
  parentId?: string | null;
  provider?: string;

  quotaId?: string | null;

  reasoning?: any;
  role: 'user' | 'system' | 'assistant' | 'tool';
  search?: any;
  threadId?: string | null;
  tools?: any;

  topicId: string | null;

  // 追踪标识
  traceId?: string | null;
}

export const MessagesCreateRequestSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  role: z.enum(['user', 'system', 'assistant', 'tool'], { error: 'Invalid role type' }),

  // AI相关字段
  model: z.string().nullish(), // 使用的模型
  provider: z.string().nullish(), // 提供商

  topicId: z.string().nullable().nullish(),
  threadId: z.string().nullable().nullish(),

  // 消息关联
  parentId: z.string().nullable().nullish(), // 父消息ID
  quotaId: z.string().nullable().nullish(), // 引用消息ID
  agentId: z.string().nullable().nullish(), // 关联的Agent ID

  // 客户端标识
  clientId: z.string().nullish(), // 客户端ID，用于跨设备同步

  // 扩展数据
  metadata: z.any().nullish(), // 元数据
  reasoning: z.any().nullish(), // 推理过程
  search: z.any().nullish(), // 搜索结果
  tools: z.any().nullish(), // 工具调用

  // 追踪标识
  traceId: z.string().nullable().nullish(), // 追踪ID
  observationId: z.string().nullable().nullish(), // 观测ID

  // 文件关联
  files: z.array(z.string()).nullish(), // 文件ID数组

  // 状态
  favorite: z.boolean().nullish().default(false), // 是否收藏
});

export const MessagesCreateWithReplyRequestSchema = MessagesCreateRequestSchema.extend({
  role: z.literal('user', { error: 'Role must be user when creating an AI reply' }),
});

export type MessagesCreateWithReplyRequest = z.infer<typeof MessagesCreateWithReplyRequestSchema>;

export interface MessagesUpdateRequest {
  content?: string;
  error?: any;
  favorite?: boolean;
  metadata?: any;
  reasoning?: any;
  search?: any;
  tools?: any;
}

export const MessagesUpdateRequestSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').nullish(),
  favorite: z.boolean().nullish(),
  metadata: z.any().nullish(),
  reasoning: z.any().nullish(),
  search: z.any().nullish(),
  tools: z.any().nullish(),
  error: z.any().nullish(),
});

// ==================== Message Batch Operations ====================

export interface MessagesDeleteBatchRequest {
  messageIds: string[];
}

export const MessagesDeleteBatchRequestSchema = z.object({
  messageIds: z
    .array(z.string().min(1, 'Message ID cannot be empty'))
    .min(1, 'Message ID array cannot be empty'),
});

// ==================== Message Response Types ====================

export interface MessageIdParam {
  id: string;
}

// Message type queried from database join, includes associated session and topic info
export interface MessageResponseFromDatabase extends PublicMessage {
  filesToMessages: { file: PublicFile; messageId: string }[] | null;
  session: PublicSession | null;
  topic: PublicTopic | null;
}

// 消息查询时的返回类型，包含关联的 session 和 topic 信息
export interface MessageResponse extends Omit<MessageResponseFromDatabase, 'filesToMessages'> {
  files: PublicFile[] | null;
}

export type MessageListResponse = PaginationQueryResponse<{
  messages: MessageResponse[];
}>;

// ==================== Common Schemas ====================

export const MessageIdParamSchema = z.object({
  id: z.string().min(1, 'Message ID cannot be empty'),
});

// ==================== Response Schemas ====================

type ShapeOf<T> = Record<keyof T, z.ZodType>;

/** A file attached to a message, projected through `PUBLIC_FILE_FIELDS`; `url` is absolute. */
const MessageFileSchema = z
  .object({
    createdAt: dateTimeSchema,
    fileType: z.string(),
    id: z.string(),
    metadata: jsonObjectSchema.nullable(),
    name: z.string(),
    parentId: z.string().nullable(),
    size: z.number().int(),
    source: z.string().nullable(),
    updatedAt: dateTimeSchema,
    url: z.string(),
    visibility: z.enum(files.visibility.enumValues),
  } satisfies ShapeOf<PublicFile>)
  .strict();

/** The legacy session a message belongs to, projected through `PUBLIC_SESSION_FIELDS`. */
const MessageSessionSchema = z
  .object({
    avatar: z.string().nullable(),
    backgroundColor: z.string().nullable(),
    createdAt: dateTimeSchema,
    description: z.string().nullable(),
    groupId: z.string().nullable(),
    id: z.string(),
    pinned: z.boolean().nullable(),
    slug: z.string(),
    title: z.string().nullable(),
    type: z.enum(SESSION_TYPE).nullable(),
    updatedAt: dateTimeSchema,
  } satisfies ShapeOf<PublicSession>)
  .strict();

export const MessageSchema = z
  .object({
    agentId: z.string().nullable(),
    content: z.string().nullable(),
    createdAt: dateTimeSchema,
    error: jsonObjectSchema.nullable(),
    favorite: z.boolean().nullable(),
    /** Attached files; empty when the message has none. */
    files: z.array(MessageFileSchema),
    groupId: z.string().nullable(),
    id: z.string(),
    messageGroupId: z.string().nullable(),
    metadata: jsonObjectSchema.nullable(),
    model: z.string().nullable(),
    observationId: z.string().nullable(),
    parentId: z.string().nullable(),
    provider: z.string().nullable(),
    quotaId: z.string().nullable(),
    reasoning: jsonObjectSchema.nullable(),
    role: z.string(),
    search: jsonObjectSchema.nullable(),
    session: MessageSessionSchema.nullable(),
    sessionId: z.string().nullable(),
    summary: z.string().nullable(),
    targetId: z.string().nullable(),
    threadId: z.string().nullable(),
    /** Tool calls the message made. */
    tools: z.array(jsonObjectSchema).nullable(),
    topic: TopicSummarySchema.nullable(),
    topicId: z.string().nullable(),
    traceId: z.string().nullable(),
    updatedAt: dateTimeSchema,
    usage: jsonObjectSchema.nullable(),
  } satisfies ShapeOf<MessageResponse>)
  .strict()
  .meta({ id: 'Message' });

export const MessageListSchema = z
  .object({ ...pageInfoShape, messages: z.array(MessageSchema), ...totalShape })
  .strict();

export const MessageCountSchema = z.object({ count: z.number().int().min(0) }).strict();
