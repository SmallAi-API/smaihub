import { z } from 'zod';

import type { RoleItem, UserItem, UserRoleItem } from '@/database/schemas';

import type { IPaginationQuery, PaginationQueryResponse } from './common.type';

// ==================== User Base Types ====================

/**
 * 获取用户列表请求参数（可选分页）
 */
export interface GetUsersRequest {
  page?: number;
  pageSize?: number;
}

/**
 * 扩展的用户信息类型，包含角色信息
 */
export type UserWithRoles = UserItem & {
  messageCount?: number;
  roles?: RoleItem[];
};

// ==================== User CRUD Types ====================

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  avatar?: string;
  email: string;
  firstName?: string;
  fullName?: string;
  id?: string;
  lastName?: string;
  phone?: string;
  roleIds?: string[];
  username?: string;
}

export const CreateUserRequestSchema = z.object({
  avatar: z.string().nullish(),
  email: z.string().email('Invalid email format').nullish(),
  firstName: z.string().nullish(),
  fullName: z.string().nullish(),
  id: z.string().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  roleIds: z.array(z.string().min(1, 'Role ID cannot be empty')).nullish(),
  username: z.string().min(1, 'Username cannot be empty').nullish(),
});

/**
 * 更新用户请求参数
 */
export interface UpdateUserRequest {
  avatar?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  isOnboarded?: boolean;
  lastName?: string;
  phone?: string;
  preference?: any;
  roleIds?: string[];
  username?: string;
}

/**
 * 更新用户请求验证Schema
 */
export const UpdateUserRequestSchema = z.object({
  avatar: z.string().nullish(),
  email: z.string().email('Invalid email format').nullish(),
  firstName: z.string().nullish(),
  fullName: z.string().nullish(),
  isOnboarded: z.boolean().nullish(),
  lastName: z.string().nullish(),
  phone: z.string().nullish(),
  preference: z.any().nullish(),
  roleIds: z.array(z.string().min(1, 'Role ID cannot be empty')).nullish(),
  username: z.string().min(1, 'Username cannot be empty').nullish(),
});

// ==================== User Search Types ====================

export { PaginationQuerySchema as UserSearchRequestSchema } from '.';

export type UserListRequest = IPaginationQuery;

export type UserListResponse = PaginationQueryResponse<{
  users: UserWithRoles[];
}>;

// ==================== User Role Management Types ====================

/**
 * 单个添加角色的请求
 */
export interface AddRoleRequest {
  expiresAt?: string; // ISO 8601 格式的过期时间
  roleId: string;
}

export const AddRoleRequestSchema = z.object({
  expiresAt: z.string().datetime('Expiry time must be a valid ISO 8601 format').nullish(),
  roleId: z.string().min(1, 'Role ID cannot be empty'),
});

/**
 * 更新用户角色的请求参数
 */
export interface UpdateUserRolesRequest {
  addRoles?: AddRoleRequest[]; // 要添加的角色
  removeRoles?: string[]; // 要移除的角色ID
}

export const UpdateUserRolesRequestSchema = z
  .object({
    addRoles: z.array(AddRoleRequestSchema).nullish(),
    removeRoles: z.array(z.string().min(1, 'Role ID cannot be empty')).nullish(),
  })
  .refine(
    (data) => {
      // 至少要有一个操作（添加或移除）
      return (
        (data.addRoles && data.addRoles.length > 0) ||
        (data.removeRoles && data.removeRoles.length > 0)
      );
    },
    {
      message: 'At least one role to add or remove must be specified',
    },
  )
  .refine(
    (data) => {
      // 检查添加和移除的角色之间不能有重复
      if (!data.addRoles || !data.removeRoles) return true;

      const addRoleIds = data.addRoles.map((r) => r.roleId);
      const removeRoleIds = data.removeRoles;

      const overlap = addRoleIds.filter((id) => removeRoleIds.includes(id));
      return overlap.length === 0;
    },
    {
      message: 'Cannot add and remove the same role simultaneously',
    },
  );

/**
 * 用户角色详情，包含角色信息和关联信息
 */
export interface UserRoleDetail extends UserRoleItem {
  role: RoleItem;
}

/**
 * 用户角色操作响应
 */
export type UserRolesResponse = {
  expiresAt?: Date | null;
  roleDisplayName: string;
  roleId: string;
  roleName: string;
}[];

/**
 * 用户角色操作结果
 */
export interface UserRoleOperationResult {
  added: number;
  errors?: string[];
  removed: number;
}

// ==================== Common Schemas ====================

export const UserIdParamSchema = z.object({
  id: z.string().min(1, 'User ID cannot be empty'),
});
