import type { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { AgentGroupService } from '../services/agent-group.service';
import type {
  CreateAgentGroupRequest,
  DeleteAgentGroupRequest,
  UpdateAgentGroupRequest,
} from '../types/agent-group.type';

/**
 * AgentGroup 控制器类
 * 处理助理分类相关的 HTTP 请求和响应
 */
export class AgentGroupController extends BaseController {
  /**
   * 获取助理分类列表
   * GET /api/v1/agent-groups
   * @param c Hono Context
   * @returns 助理分类列表响应
   */
  async getAgentGroups(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const agentGroupService = new AgentGroupService(db, this.getUserId(c));
      const agentGroups = await agentGroupService.getAgentGroups();

      return this.success(c, agentGroups, 'Agent category list retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据 ID 获取助理分类详情
   * GET /api/v1/agent-groups/:id
   * @param c Hono Context
   * @returns 助理分类详情响应
   */
  async getAgentGroupById(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);

      if (!groupId) {
        return this.error(c, 'Agent category ID is required', 400);
      }

      const db = await this.getDatabase();
      const agentGroupService = new AgentGroupService(db, this.getUserId(c));
      const agentGroup = await agentGroupService.getAgentGroupById(groupId);

      if (!agentGroup) {
        return this.error(c, 'Agent category not found', 404);
      }

      return this.success(c, agentGroup, 'Agent category details retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建助理分类
   * POST /api/v1/agent-groups
   * @param c Hono Context
   * @returns 创建完成的助理分类 ID 响应
   */
  async createAgentGroup(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<CreateAgentGroupRequest>(c);

      const db = await this.getDatabase();
      const agentGroupService = new AgentGroupService(db, this.getUserId(c));
      const groupId = await agentGroupService.createAgentGroup(body);

      return c.json(
        {
          data: { id: groupId },
          message: 'Agent category created successfully',
          success: true,
          timestamp: new Date().toISOString(),
        },
        201,
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新助理分类
   * PATCH /api/v1/agent-groups/:id
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateAgentGroup(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<Omit<UpdateAgentGroupRequest, 'id'>>(c);

      if (!groupId) {
        return this.error(c, 'Agent category ID is required', 400);
      }

      const request: UpdateAgentGroupRequest = {
        id: groupId,
        ...body,
      };

      const db = await this.getDatabase();
      const agentGroupService = new AgentGroupService(db, this.getUserId(c));
      await agentGroupService.updateAgentGroup(request);

      return this.success(c, null, 'Agent category updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除助理分类
   * DELETE /api/v1/agent-groups/:id
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteAgentGroup(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);

      if (!groupId) {
        return this.error(c, 'Agent category ID is required', 400);
      }

      const request: DeleteAgentGroupRequest = {
        id: groupId,
      };

      const db = await this.getDatabase();
      const agentGroupService = new AgentGroupService(db, this.getUserId(c));
      await agentGroupService.deleteAgentGroup(request);

      return this.success(c, null, 'Agent category deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
