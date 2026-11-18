import { z } from 'zod';

import type { PublicAgentGroup } from '../helpers/public-fields';
import { dateTimeSchema } from './common.type';

// ==================== Agent Group CRUD Types ====================
// 助理分类（使用 sessionGroups 表存储）相关类型定义

/**
 * 创建助理分类请求参数
 */
export interface CreateAgentGroupRequest {
  name: string;
  sort?: number;
}

export const CreateAgentGroupRequestSchema = z.object({
  name: z.string().min(1, 'Agent category name cannot be empty'),
  sort: z.number().nullish(),
});

/**
 * 更新助理分类请求参数
 */
export interface UpdateAgentGroupRequest {
  id: string;
  name?: string;
  sort?: number;
}

export const UpdateAgentGroupRequestSchema = z.object({
  name: z.string().min(1, 'Agent category name cannot be empty').nullish(),
  sort: z.number().nullish(),
});

/**
 * 删除助理分类请求参数
 */
export interface DeleteAgentGroupRequest {
  id: string;
}

// ==================== Agent Group Response Types ====================

/**
 * 助理分类列表响应类型
 */
export type AgentGroupListResponse = PublicAgentGroup[];

// ==================== Common Schemas ====================

export const AgentGroupIdParamSchema = z.object({
  id: z.string().min(1, 'Agent category ID cannot be empty'),
});

// ==================== Response Schemas ====================

/** `projectPublicAgentGroup` output — a sidebar folder (`session_groups` row). */
export const AgentGroupSchema = z
  .object({
    createdAt: dateTimeSchema,
    id: z.string(),
    name: z.string(),
    sort: z.number().int().nullable(),
    updatedAt: dateTimeSchema,
  } satisfies Record<keyof PublicAgentGroup, z.ZodType>)
  .strict()
  .meta({ id: 'AgentGroup' });

/** `POST /agent-groups` answers with the new folder's id only. */
export const CreatedAgentGroupSchema = z
  .object({ id: z.string() })
  .strict()
  .meta({ id: 'CreatedAgentGroup' });
