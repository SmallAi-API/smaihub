import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';

import { getAllScopePermissions, getScopePermissions } from '@/utils/rbac';

import { zValidator } from '../common/validator';
import { UserController } from '../controllers';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UpdateUserRolesRequestSchema,
  UserIdParamSchema,
  UserSearchRequestSchema,
} from '../types/user.type';

const UserRoutes = new Hono();

/**
 * 获取当前登录用户信息
 * GET /api/v1/users/me
 * 需要认证，但不需要特殊权限
 */
UserRoutes.get(
  '/me',
  describeRoute({ summary: 'Get current authenticated user', tags: ['users'] }),
  requireAuth,
  // Deliberately reachable by every authenticated caller, including restricted
  // API keys holding no `user:read` — please do not add a scope gate here.
  // This is how `lh login` resolves a userId from a freshly minted key
  // (`apps/cli/src/auth/apiKey.ts`); gating the route strands the holder of a
  // valid key outside the product with a scope error, same reason GitHub keeps
  // `/user` open to any token.
  //
  // Reachability is not disclosure: the payload is scoped inside
  // `UserController.getCurrentUser` — a key without `user:read` receives only
  // `{ id }`, and `messageCount` additionally needs `chat:read`. Widen there,
  // under a scope check, rather than by gating the route.
  async (c) => {
    const userController = new UserController();
    return await userController.getCurrentUser(c);
  },
);

/**
 * 获取系统中的用户列表 (支持搜索)
 * GET /api/v1/users?keyword=xxx&page=1&pageSize=10
 * 需要用户管理权限
 */
UserRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_READ', ['ALL']),
    'You do not have permission to view user list',
  ),
  zValidator('query', UserSearchRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.queryUsers(c);
  },
);

/**
 * 创建新用户
 * POST /api/v1/users
 * 需要用户创建权限
 */
UserRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_CREATE', ['ALL']),
    'You do not have permission to create a user',
  ),
  zValidator('json', CreateUserRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.createUser(c);
  },
);

/**
 * 根据ID获取用户详情
 * GET /api/v1/users/:id
 * 需要用户读取权限
 */
UserRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('USER_READ'),
    'You do not have permission to view user details',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.getUserById(c);
  },
);

/**
 * 更新用户信息 (RESTful 部分更新)
 * PATCH /api/v1/users/:id
 * 需要用户更新权限
 */
UserRoutes.patch(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('USER_UPDATE'),
    'You do not have permission to update user information',
  ),
  zValidator('param', UserIdParamSchema),
  zValidator('json', UpdateUserRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.updateUser(c);
  },
);

/**
 * 删除用户
 * DELETE /api/v1/users/:id
 * 需要用户删除权限
 */
UserRoutes.delete(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('USER_DELETE'),
    'You do not have permission to delete a user',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.deleteUser(c);
  },
);

/**
 * 获取用户角色信息
 * GET /api/v1/users/:id/roles
 * 需要用户角色查看权限
 */
UserRoutes.get(
  '/:id/roles',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('RBAC_USER_ROLE_READ'),
    'You do not have permission to view user roles',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.getUserRoles(c);
  },
);

/**
 * 更新用户关联的角色
 * PATCH /api/v1/users/:id/roles
 * 需要用户角色分配权限
 */
UserRoutes.patch(
  '/:id/roles',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('RBAC_USER_ROLE_UPDATE'),
    'You do not have permission to assign user roles',
  ),
  zValidator('param', UserIdParamSchema),
  zValidator('json', UpdateUserRolesRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.updateUserRoles(c);
  },
);

/**
 * 清空用户的角色列表
 * DELETE /api/v1/users/:id/roles
 * 需要用户角色更新权限
 */
UserRoutes.delete(
  '/:id/roles',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('RBAC_USER_ROLE_UPDATE'),
    'You do not have permission to clear user roles',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.clearUserRoles(c);
  },
);

export default UserRoutes;
