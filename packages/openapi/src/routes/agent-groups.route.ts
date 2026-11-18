import { Hono } from 'hono';
import { z } from 'zod';

import { getAllScopePermissions } from '@/utils/rbac';

import { routeDoc } from '../common/openapi';
import { zValidator } from '../common/validator';
import { AgentGroupController } from '../controllers/agent-group.controller';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  AgentGroupIdParamSchema,
  AgentGroupSchema,
  CreateAgentGroupRequestSchema,
  CreatedAgentGroupSchema,
  UpdateAgentGroupRequestSchema,
} from '../types/agent-group.type';
import { DeletedResourceSchema } from '../types/common.type';

// AgentGroup 相关路由（助理分类）
const AgentGroupRoutes = new Hono();

/**
 * 获取助理分类列表
 * GET /api/v1/agent-groups
 * 需要助理读取权限
 */
AgentGroupRoutes.get(
  '/',
  routeDoc({
    data: z.array(AgentGroupSchema),
    summary: 'List agent groups',
    tags: ['agent-groups'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('AGENT_READ'),
    'You do not have permission to view agent group list',
  ),
  async (c) => {
    const controller = new AgentGroupController();
    return await controller.getAgentGroups(c);
  },
);

/**
 * 创建助理分类
 * POST /api/v1/agent-groups
 * 需要助理创建权限
 */
AgentGroupRoutes.post(
  '/',
  routeDoc({
    data: CreatedAgentGroupSchema,
    status: 201,
    summary: 'Create an agent group',
    tags: ['agent-groups'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('AGENT_CREATE'),
    'You do not have permission to create an agent group',
  ),
  zValidator('json', CreateAgentGroupRequestSchema),
  async (c) => {
    const controller = new AgentGroupController();
    return await controller.createAgentGroup(c);
  },
);

/**
 * 根据 ID 获取助理分类详情
 * GET /api/v1/agent-groups/:id
 * 需要助理读取权限
 */
AgentGroupRoutes.get(
  '/:id',
  routeDoc({
    data: AgentGroupSchema,
    errors: [404],
    summary: 'Get an agent group',
    tags: ['agent-groups'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('AGENT_READ'),
    'You do not have permission to view agent group details',
  ),
  zValidator('param', AgentGroupIdParamSchema),
  async (c) => {
    const controller = new AgentGroupController();
    return await controller.getAgentGroupById(c);
  },
);

/**
 * 更新助理分类
 * PATCH /api/v1/agent-groups/:id
 * 需要助理更新权限
 */
AgentGroupRoutes.patch(
  '/:id',
  routeDoc({
    data: AgentGroupSchema,
    summary: 'Update an agent group',
    tags: ['agent-groups'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('AGENT_UPDATE'),
    'You do not have permission to update an agent group',
  ),
  zValidator('param', AgentGroupIdParamSchema),
  zValidator('json', UpdateAgentGroupRequestSchema),
  async (c) => {
    const controller = new AgentGroupController();
    return await controller.updateAgentGroup(c);
  },
);

/**
 * 删除助理分类
 * DELETE /api/v1/agent-groups/:id
 * 需要助理删除权限
 *
 * 行为说明:
 * - 删除指定的助理分类
 * - 分类内助理不会被删除，会自动变为未分类状态（sessionGroupId 设为 null）
 */
AgentGroupRoutes.delete(
  '/:id',
  routeDoc({
    data: DeletedResourceSchema,
    summary: 'Delete an agent group',
    tags: ['agent-groups'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('AGENT_DELETE'),
    'You do not have permission to delete an agent group',
  ),
  zValidator('param', AgentGroupIdParamSchema),
  async (c) => {
    const controller = new AgentGroupController();
    return await controller.deleteAgentGroup(c);
  },
);

export default AgentGroupRoutes;
