import { z } from 'zod';

import type { PUBLIC_KNOWLEDGE_BASE_FIELDS, PublicKnowledgeBase } from '../helpers/public-fields';
import type { IPaginationQuery, PaginationQueryResponse } from './common.type';
import { dateTimeSchema, jsonObjectSchema, PaginationQuerySchema } from './common.type';

// ==================== Knowledge Base Query Types ====================

/**
 * 知识库列表查询参数
 */
export interface KnowledgeBaseListQuery extends IPaginationQuery {
  // 继承自 IPaginationQuery: keyword, page, pageSize
}

export const KnowledgeBaseListQuerySchema = PaginationQuerySchema;

/**
 * 知识库文件列表查询参数
 */
export interface KnowledgeBaseFileListQuery extends IPaginationQuery {
  /** 文件类型过滤 */
  fileType?: string;
}

export const KnowledgeBaseFileListQuerySchema = PaginationQuerySchema.extend({
  fileType: z.string().nullish(),
});

/**
 * 知识库文件批量操作请求
 */
export interface KnowledgeBaseFileBatchRequest {
  /** 文件 ID 列表 */
  fileIds: string[];
}

export const KnowledgeBaseFileBatchSchema = z.object({
  fileIds: z
    .array(z.string().min(1, 'File ID cannot be empty'))
    .min(1, 'File ID list cannot be empty'),
});

/**
 * 知识库文件移动请求
 */
export interface MoveKnowledgeBaseFilesRequest extends KnowledgeBaseFileBatchRequest {
  /** 目标知识库 ID */
  targetKnowledgeBaseId: string;
}

export const MoveKnowledgeBaseFilesSchema = KnowledgeBaseFileBatchSchema.extend({
  targetKnowledgeBaseId: z.string().min(1, 'Target knowledge base ID cannot be empty'),
});

/**
 * 知识库文件批量操作结果
 */
export interface KnowledgeBaseFileOperationResult {
  /** 失败的文件及原因 */
  failed: Array<{
    fileId: string;
    reason: string;
  }>;
  /** 操作成功的文件 ID 列表 */
  successed: string[];
}

/**
 * 知识库文件移动结果
 */
export interface MoveKnowledgeBaseFilesResponse {
  /** 失败的文件及原因 */
  failed: Array<{
    fileId: string;
    reason: string;
  }>;
  /** 成功移动的文件 ID 列表 */
  successed: string[];
}

/**
 * 知识库列表响应类型
 */
export type KnowledgeBaseAccessType = 'owner' | 'userGrant' | 'roleGrant' | 'public';

export interface KnowledgeBaseListItem extends PublicKnowledgeBase {
  /** The access source type for the current user on this knowledge base */
  accessType?: KnowledgeBaseAccessType;
}

export type KnowledgeBaseListResponse = PaginationQueryResponse<{
  /** 知识库列表 */
  knowledgeBases: KnowledgeBaseListItem[];
}>;

// ==================== Knowledge Base Management Types ====================

/**
 * 知识库ID参数
 */
export const KnowledgeBaseIdParamSchema = z.object({
  id: z.string().min(1, 'Knowledge base ID cannot be empty'),
});

/**
 * 创建知识库请求类型
 */
export interface CreateKnowledgeBaseRequest {
  /** 知识库头像 */
  avatar?: string;
  /** 知识库描述 */
  description?: string;
  /** 知识库名称 */
  name: string;
}

export const CreateKnowledgeBaseSchema = z.object({
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  description: z.string().max(1000, 'Knowledge base description is too long').optional(),
  name: z
    .string()
    .min(1, 'Knowledge base name cannot be empty')
    .max(255, 'Knowledge base name is too long'),
});

/**
 * 创建知识库响应类型
 */
export interface CreateKnowledgeBaseResponse {
  /** Knowledge base info */
  knowledgeBase: PublicKnowledgeBase;
}

/**
 * 更新知识库请求类型
 */
export interface UpdateKnowledgeBaseRequest {
  /** 知识库头像 */
  avatar?: string;
  /** 知识库描述 */
  description?: string;
  /** 知识库名称 */
  name?: string;
}

export const UpdateKnowledgeBaseSchema = z.object({
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  description: z.string().max(1000, 'Knowledge base description is too long').optional(),
  name: z
    .string()
    .min(1, 'Knowledge base name cannot be empty')
    .max(255, 'Knowledge base name is too long')
    .optional(),
});

/**
 * 知识库详情响应类型
 */
export interface KnowledgeBaseDetailResponse {
  /** Knowledge base info */
  knowledgeBase: PublicKnowledgeBase;
}

// ==================== Response Schemas ====================

/** Every column `projectPublicKnowledgeBase` copies, so a new public field fails to compile here. */
const knowledgeBaseShape = {
  avatar: z.string().nullable(),
  createdAt: dateTimeSchema,
  description: z.string().nullable(),
  id: z.string(),
  isPublic: z.boolean().nullable(),
  name: z.string(),
  settings: jsonObjectSchema.nullable(),
  /** `agent` / `project` for a dedicated library; null for an ordinary one. */
  type: z.string().nullable(),
  updatedAt: dateTimeSchema,
  visibility: z.enum(['private', 'public']),
} satisfies Record<(typeof PUBLIC_KNOWLEDGE_BASE_FIELDS)[number], z.ZodType>;

export const KnowledgeBaseSchema = z
  .object(knowledgeBaseShape)
  .strict()
  .meta({ id: 'KnowledgeBase' });

export const KnowledgeBaseListItemSchema = KnowledgeBaseSchema.extend({
  /** How the caller reaches this knowledge base. */
  accessType: z.enum(['owner', 'userGrant', 'roleGrant', 'public']),
})
  .strict()
  .meta({ id: 'KnowledgeBaseListItem' });

export const KnowledgeBaseListResponseSchema = z
  .object({
    knowledgeBases: z.array(KnowledgeBaseListItemSchema),
    total: z.number().int().min(0),
  })
  .strict()
  .meta({ id: 'KnowledgeBaseList' });

/** Detail, create and update all wrap the knowledge base under `knowledgeBase`. */
export const KnowledgeBaseDetailResponseSchema = z
  .object({ knowledgeBase: KnowledgeBaseSchema })
  .strict()
  .meta({ id: 'KnowledgeBaseDetail' });

/**
 * Outcome of adding, removing or moving file associations. Files the caller
 * cannot reach are reported in `failed` instead of failing the whole call.
 */
export const KnowledgeBaseFileOperationResultSchema = z
  .object({
    failed: z.array(z.object({ fileId: z.string(), reason: z.string() }).strict()),
    /** Ids of the files the operation applied to (spelling kept for compatibility). */
    successed: z.array(z.string()),
  })
  .strict()
  .meta({ id: 'KnowledgeBaseFileOperationResult' });
