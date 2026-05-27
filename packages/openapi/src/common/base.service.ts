import { and, eq, inArray } from 'drizzle-orm';

import type { PERMISSION_ACTIONS } from '@/const/rbac';
import { ALL_SCOPE } from '@/const/rbac';
import { RbacModel } from '@/database/models/rbac';
import {
  agents,
  aiModels,
  aiProviders,
  files,
  knowledgeBases,
  messages,
  sessions,
  topics,
} from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { getScopePermissions } from '@/utils/rbac';

import { getActionType, getResourceType } from '../helpers/permission';
import type { IBaseService, TBatchTarget, TTarget } from '../types';

const isNilOrEmptyObject = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value !== 'object') return false;
  return Object.keys(value as object).length === 0;
};

/**
 * Base service class
 * Provides unified service layer base functionality, consistent with the project's existing service layer pattern
 */
export abstract class BaseService implements IBaseService {
  protected userId: string;
  public db: LobeChatDatabase;
  private rbacModel: RbacModel;

  constructor(db: LobeChatDatabase, userId: string | null) {
    this.db = db;
    this.userId = userId || '';
    this.rbacModel = new RbacModel(db, this.userId);
  }

  /**
   * Business error class
   */
  protected createBusinessError(message: string): Error {
    const error = new Error(message);
    error.name = 'BusinessError';
    return error;
  }

  /**
   * Authentication error class
   */
  protected createAuthError(message: string): Error {
    const error = new Error(message);
    error.name = 'AuthenticationError';
    return error;
  }

  /**
   * Authorization error class
   */
  protected createAuthorizationError(message: string): Error {
    const error = new Error(message);
    error.name = 'AuthorizationError';
    return error;
  }

  /**
   * Not found error class
   */
  protected createNotFoundError(message: string): Error {
    const error = new Error(message);
    error.name = 'NotFoundError';
    return error;
  }

  /**
   * Validation error class
   */
  protected createValidationError(message: string): Error {
    const error = new Error(message);
    error.name = 'ValidationError';
    return error;
  }

  /**
   * Common error class (alias for business error)
   */
  protected createCommonError(message: string): Error {
    return this.createBusinessError(message);
  }

  /**
   * 统一错误处理方法
   * @param error 捕获的错误
   * @param operation 操作名称
   * @param fallbackMessage 默认错误消息
   */
  protected handleServiceError(error: unknown, operation: string): never {
    this.log('error', `${operation} failed`, { error });

    // 如果是已知的业务错误，直接抛出
    if (
      error instanceof Error &&
      [
        'BusinessError',
        'AuthenticationError',
        'AuthorizationError',
        'NotFoundError',
        'ValidationError',
      ].includes(error.name)
    ) {
      throw error;
    }

    const errorMessage = `${operation} failed: ${error instanceof Error ? error.message : 'unknown error'}`;

    // 其他错误统一包装为业务错误
    throw this.createBusinessError(errorMessage);
  }

  /**
   * Logging utility
   * @param level Log level
   * @param message Log message
   * @param data Additional data
   */
  protected log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    const logMessage = `[${this.constructor.name}] ${message}`;

    switch (level) {
      case 'info': {
        console.info(logMessage, data || '');
        break;
      }
      case 'warn': {
        console.warn(logMessage, data || '');
        break;
      }
      case 'error': {
        console.error(logMessage, data || '');
        break;
      }
      case 'debug': {
        console.info(logMessage, data || ''); // debug → info
        break;
      }
    }
  }

  /**
   * 检查用户是否有全局权限 ALL
   * @param permissionKey 权限键名
   * @returns 是否有权限
   */
  protected async hasGlobalPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
  ): Promise<boolean> {
    return await this.rbacModel.hasAnyPermission(
      getScopePermissions(permissionKey, ['ALL']),
      this.userId,
    );
  }

  /**
   * 检查用户是否有 owner 权限
   * @param permissionKey 权限键名
   * @returns 是否有权限
   */
  protected async hasOwnerPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
  ): Promise<boolean> {
    return await this.rbacModel.hasAnyPermission(
      getScopePermissions(permissionKey, ['OWNER']),
      this.userId,
    );
  }

  /**
   * 获取资源所属用户 ID
   * @param target 目标资源的条件信息，如果没有传入，则默认查询范围为当前用户，如果传入 ALL，则返回默认全量查询
   * @returns 资源所属用户 ID
   */
  protected async getResourceBelongTo(
    target?: TTarget | typeof ALL_SCOPE,
  ): Promise<string | undefined | null> {
    // 查询全量数据，则直接返回undefined
    if (target === ALL_SCOPE) {
      return;
    }

    // 如果目标条件为空，默认查询范围为当前用户
    if (!target || isNilOrEmptyObject(target)) {
      return this.userId;
    }

    try {
      switch (true) {
        // 查询 sessions 表
        case !!target?.targetSessionId: {
          const targetSession = await this.db.query.sessions.findFirst({
            columns: { userId: true },
            where: eq(sessions.id, target.targetSessionId),
          });
          return targetSession?.userId;
        }

        // 查询 agents 表
        case !!target?.targetAgentId: {
          const targetAgent = await this.db.query.agents.findFirst({
            columns: { userId: true },
            where: eq(agents.id, target.targetAgentId),
          });

          return targetAgent?.userId;
        }

        // 查询 topics 表
        case !!target?.targetTopicId: {
          const targetTopic = await this.db.query.topics.findFirst({
            columns: { userId: true },
            where: eq(topics.id, target.targetTopicId),
          });
          return targetTopic?.userId;
        }

        // 查询 providers 表
        case !!target?.targetProviderId: {
          const currentUserProvider = await this.db.query.aiProviders.findFirst({
            columns: { userId: true },
            where: and(
              eq(aiProviders.id, target.targetProviderId),
              eq(aiProviders.userId, this.userId),
            ),
          });

          if (currentUserProvider) {
            return currentUserProvider.userId;
          }

          const targetProvider = await this.db.query.aiProviders.findFirst({
            columns: { userId: true },
            where: eq(aiProviders.id, target.targetProviderId),
          });
          return targetProvider?.userId;
        }

        // 直接传递 targetUserId 的情况
        case !!target?.targetUserId: {
          return target.targetUserId;
        }

        // 查询 knowledgeBases 表
        case !!target?.targetKnowledgeBaseId: {
          const targetKnowledgeBase = await this.db.query.knowledgeBases.findFirst({
            columns: { userId: true },
            where: eq(knowledgeBases.id, target.targetKnowledgeBaseId),
          });
          return targetKnowledgeBase?.userId;
        }

        // 查询 files 表
        case !!target?.targetFileId: {
          const targetFile = await this.db.query.files.findFirst({
            columns: { userId: true },
            where: eq(files.id, target.targetFileId),
          });
          return targetFile?.userId;
        }

        // 查询 messages 表
        case !!target?.targetMessageId: {
          const targetMessage = await this.db.query.messages.findFirst({
            columns: { userId: true },
            where: eq(messages.id, target.targetMessageId),
          });
          return targetMessage?.userId;
        }

        // 查询 aiModels 表
        case !!target?.targetModelId: {
          const targetModel = await this.db.query.aiModels.findFirst({
            columns: { userId: true },
            where: eq(aiModels.id, target.targetModelId),
          });
          return targetModel?.userId;
        }

        default: {
          return;
        }
      }
    } catch (error) {
      this.log('error', 'Failed to get target user ID', { error, target });
      return;
    }
  }

  /**
   * 解析权限并返回目标信息
   * 用于处理数据访问权限的通用逻辑，支持以下场景：
   * 1. 查询/操作当前用户的数据：需要 ALL/owner 权限
   * 2. 查询/操作指定用户的数据：需要 ALL 权限
   * 3. 查询/操作所有数据：需要 ALL 权限
   *
   * @param permissionKey - 权限键名
   * @param targetInfoId - 目标ID，可选。传入字符串表示查询/操作特定用户的数据，传入对象键值表示查询/操作特定对象的数据
   * @param queryAll - 是否查询所有数据，可选。如果提供，表示要查询所有数据，否则只查询当前用户的数据
   * @returns 返回权限检查结果和查询/操作条件
   *          - isPermitted: 是否允许查询/操作
   *          - condition: 目标信息，包含 userId 过滤条件
   *          - message: 权限被拒绝时的错误信息
   */
  protected async resolveOperationPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
    resourceInfo?: TTarget | typeof ALL_SCOPE,
  ): Promise<{
    condition?: { userId?: string };
    isPermitted: boolean;
    message?: string;
  }> {
    // 检查是否有对应动作的 ALL 权限
    const hasGlobalAccess = await this.hasGlobalPermission(permissionKey);

    // 获取目标资源所属用户 ID
    const resourceBelongTo = await this.getResourceBelongTo(resourceInfo);

    // 记录用户希望访问的资源与当前用户信息
    const logContext = {
      resourceInfo,
      userId: this.userId,
    };

    this.log('info', 'Permission check', logContext);

    /**
     * 当用户拥有 ALL 权限时，直接通过校验
     */
    if (hasGlobalAccess) {
      this.log(
        'info',
        `Permission granted: current user has highest ${permissionKey} permission`,
        logContext,
      );
      return {
        condition: resourceBelongTo ? { userId: resourceBelongTo } : undefined,
        isPermitted: true,
      };
    }

    /**
     * 当用户没有 ALL 权限时，以下场景不允许操作：
     * 1. 查询的是全量数据
     * 2. 查询的是指定用户的数据，但目标资源不属于当前用户
     */
    if (!resourceBelongTo || resourceBelongTo !== this.userId) {
      this.log(
        'warn',
        'Permission denied: current user has no ALL permission, or target resource does not belong to current user',
        logContext,
      );
      return {
        isPermitted: false,
        message: `no permission,current user has no ALL permission,and resource not belong to current user`,
      };
    }

    /**
     * 当查询的目标资源属于当前用户时，只要有任意权限就允许操作
     * 由于 ALL 权限已经在前面校验过，所以这里只需要检查 owner 权限
     */
    if (resourceBelongTo === this.userId) {
      // 检查是否有对应动作的 owner 权限
      const hasOwnerAccess = await this.hasOwnerPermission(permissionKey);

      if (hasOwnerAccess) {
        this.log('info', 'Permission granted: current user has owner permission', logContext);
        return {
          condition: { userId: resourceBelongTo },
          isPermitted: true,
        };
      }

      this.log(
        'warn',
        'Permission denied: target resource belongs to current user, but user has no owner permission for this operation',
        logContext,
      );
      return {
        isPermitted: false,
        message: `no permission,resource belong to current user,but current user has no any ${permissionKey} permission`,
      };
    }

    // If we reach here, apply fallback logic
    this.log('info', `Fallback: no permission`, logContext);
    return {
      isPermitted: false,
      message: `permission validation error for: ${permissionKey}`,
    };
  }

  /**
   * 解析批量操作的权限
   * 用于处理批量数据访问权限的通用逻辑
   * 1. 批量操作必须要有 ALL 权限
   * 2. 如果所有资源都属于当前用户，且有 owner 权限，也允许操作
   * 3. 如果有 ALL 权限，允许操作所有指定的资源
   *
   * @param permissionKey - 权限键名
   * @param targetInfoIds - 目标资源 ID 数组
   * @returns 返回权限检查结果
   */
  protected async resolveBatchQueryPermission(
    permissionKey: keyof typeof PERMISSION_ACTIONS,
    targetInfoIds: TBatchTarget,
  ): Promise<{
    condition?: { userIds?: string[] };
    isPermitted: boolean;
    message?: string;
  }> {
    // 先检查是否有全局权限，如果有则直接通过
    const hasGlobalAccess = await this.hasGlobalPermission(permissionKey);

    // 如果有全局权限，直接允许批量操作
    if (hasGlobalAccess) {
      this.log(
        'info',
        `Permission granted: batch operation, current user has ${permissionKey} ALL permission`,
      );
      return { isPermitted: true };
    }

    // 获取所有资源的用户 ID
    let userIds: string[];
    try {
      // 根据 targetInfoIds 中的属性自动判断资源类型
      switch (true) {
        case !!targetInfoIds.targetSessionIds?.length: {
          const sessionList = await this.db.query.sessions.findMany({
            where: inArray(sessions.id, targetInfoIds.targetSessionIds),
          });
          userIds = sessionList.map((s) => s.userId);
          break;
        }
        case !!targetInfoIds.targetAgentIds?.length: {
          const agentList = await this.db.query.agents.findMany({
            where: inArray(agents.id, targetInfoIds.targetAgentIds),
          });
          userIds = agentList.filter((a) => !!a.userId).map((a) => a.userId as string);
          break;
        }
        case !!targetInfoIds.targetTopicIds?.length: {
          const topicList = await this.db.query.topics.findMany({
            where: inArray(topics.id, targetInfoIds.targetTopicIds),
          });
          userIds = topicList.map((t) => t.userId);
          break;
        }
        case !!targetInfoIds.targetProviderIds?.length: {
          const providerIds = targetInfoIds.targetProviderIds;
          const ownedProviders = await this.db.query.aiProviders.findMany({
            where: and(inArray(aiProviders.id, providerIds), eq(aiProviders.userId, this.userId)),
          });

          // 先尝试按复合主键 (id, userId) 命中当前用户，避免同 provider id 多用户时误判
          if (ownedProviders.length === providerIds.length) {
            userIds = ownedProviders.map(() => this.userId);
            break;
          }

          const providerList = await this.db.query.aiProviders.findMany({
            where: inArray(aiProviders.id, providerIds),
          });
          userIds = providerList.map((p) => p.userId);
          break;
        }
        case !!targetInfoIds.targetUserIds?.length: {
          userIds = targetInfoIds.targetUserIds;
          break;
        }
        case !!targetInfoIds.targetKnowledgeBaseIds?.length: {
          const knowledgeBaseList = await this.db.query.knowledgeBases.findMany({
            where: inArray(knowledgeBases.id, targetInfoIds.targetKnowledgeBaseIds),
          });
          userIds = knowledgeBaseList.map((kb) => kb.userId);
          break;
        }
        case !!targetInfoIds.targetFileIds?.length: {
          const fileList = await this.db.query.files.findMany({
            where: inArray(files.id, targetInfoIds.targetFileIds),
          });
          userIds = fileList.map((f) => f.userId);
          break;
        }
        case !!targetInfoIds.targetMessageIds?.length: {
          const messageList = await this.db.query.messages.findMany({
            where: inArray(messages.id, targetInfoIds.targetMessageIds),
          });
          userIds = messageList.map((m) => m.userId);
          break;
        }
        case !!targetInfoIds.targetModelIds?.length: {
          const modelList = await this.db.query.aiModels.findMany({
            where: inArray(aiModels.id, targetInfoIds.targetModelIds),
          });
          userIds = modelList.map((m) => m.userId);
          break;
        }
        default: {
          return {
            isPermitted: false,
            message: 'No valid resource ID provided',
          };
        }
      }
    } catch (error) {
      this.log('error', 'Failed to get target user IDs', { error, targetInfoIds });
      return {
        isPermitted: false,
        message: 'Failed to get resource info',
      };
    }

    // 如果找不到任何资源
    if (userIds.length === 0) {
      this.log('warn', 'No target resources found', { permissionKey, targetInfoIds });
      return {
        condition: { userIds },
        isPermitted: false,
        message: 'No target resources found',
      };
    }

    // 检查是否所有资源都属于当前用户
    const allBelongToCurrentUser = userIds.every((id) => id === this.userId);
    if (allBelongToCurrentUser) {
      // 检查用户是否有 owner 权限
      const hasOwnerAccess = await this.hasOwnerPermission(permissionKey);

      if (hasOwnerAccess) {
        this.log(
          'info',
          `Permission granted: batch operation, all resources belong to current user and user has ${permissionKey} owner permission`,
        );
        return { condition: { userIds }, isPermitted: true };
      }

      // If all resources belong to the current user but the user has no owner permission, deny the operation
      this.log(
        'warn',
        'Permission denied: batch operation requires ${permissionKey} ALL/owner permission',
        {
          permissionKey,
          targetInfoIds,
          userIds,
        },
      );
      return {
        isPermitted: false,
        message: `no permission for batch operation, current user has no ${permissionKey} ALL/owner permission`,
      };
    }

    // Some resources in the operation do not belong to the current user; deny directly
    this.log(
      'warn',
      `Permission denied: batch operation requires ${permissionKey} ALL/owner permission`,
      {
        permissionKey,
        targetInfoIds,
        userIds,
      },
    );

    return {
      isPermitted: false,
      message: `no permission for batch operation, current user has no ${permissionKey} ALL/owner permission`,
    };
  }

  /**
   * 检查用户是否拥有聊天相关的所有必要权限
   * 包括：
   * - 消息读写权限 (MESSAGE_READ, MESSAGE_WRITE)
   * - 话题读写权限 (TOPIC_READ, TOPIC_WRITE)
   * - 会话读写权限 (SESSION_READ, SESSION_WRITE)
   * - AI 模型读权限 (AI_MODEL_READ)
   * - 助手读权限 (AGENT_READ)
   * - 文件读权限 (FILE_READ)
   *
   * @returns 返回权限检查结果和缺失的权限列表
   */
  protected async resolveChatPermissions(): Promise<{
    isPermitted: boolean;
    message?: string;
    missingPermissions: string[];
  }> {
    const requiredPermissions = [
      'MESSAGE_READ',
      'MESSAGE_CREATE',
      'TOPIC_READ',
      'TOPIC_CREATE',
      'SESSION_READ',
      'SESSION_CREATE',
      'AI_MODEL_READ',
      'AGENT_READ',
      'FILE_READ',
    ] as const;

    const permissionResults = await Promise.all(
      requiredPermissions.map(async (permission) => {
        const result = await this.resolveOperationPermission(permission);
        return {
          isPermitted: result.isPermitted,
          permission,
        };
      }),
    );

    const missingPermissions = permissionResults
      .filter((result) => !result.isPermitted)
      .map((result) => {
        const resourceType = getResourceType(result.permission);
        const actionType = getActionType(result.permission);
        return `${resourceType} ${actionType}`;
      });

    const isPermitted = missingPermissions.length === 0;

    this.log('info', 'Chat permission check', {
      isPermitted,
      missingPermissions,
      userId: this.userId,
    });

    if (!isPermitted) {
      return {
        isPermitted: false,
        message: `Missing required permissions: ${missingPermissions.join(', ')}`,
        missingPermissions,
      };
    }

    return {
      isPermitted: true,
      missingPermissions: [],
    };
  }
}
