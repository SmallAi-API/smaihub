import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import {
  CREATE_MESSAGE_EXAMPLE,
  example,
  MESSAGE_EXAMPLE,
  MESSAGE_LIST_EXAMPLE,
} from '../common/examples';
import { routeDoc } from '../common/openapi';
import { zValidator } from '../common/validator';
import { MessageController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission, requireApiKeyScope } from '../middleware/permission-check';
import { DeletedResourceSchema, DeletedResourcesSchema } from '../types/common.type';
import {
  MessageCountSchema,
  MessageIdParamSchema,
  MessageListSchema,
  MessageSchema,
  MessagesCountQuerySchema,
  MessagesCreateRequestSchema,
  MessagesCreateWithReplyRequestSchema,
  MessagesDeleteBatchRequestSchema,
  MessagesListQuerySchema,
} from '../types/message.type';

// Messages 相关路由
const MessageRoutes = new Hono();

// GET /api/v1/messages/count - 统计消息数量 (支持各种过滤条件)
MessageRoutes.get(
  '/count',
  routeDoc({ data: MessageCountSchema, summary: 'Count messages', tags: ['messages'] }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read message statistics',
  ),
  zValidator('query', MessagesCountQuerySchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCountMessages(c);
  },
);

// GET /api/v1/messages - 获取消息列表 (支持各种过滤和搜索)
MessageRoutes.get(
  '/',
  routeDoc({
    data: MessageListSchema,
    responseExample: MESSAGE_LIST_EXAMPLE,
    summary: 'List messages',
    tags: ['messages'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read messages',
  ),
  zValidator('query', MessagesListQuerySchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleGetMessages(c);
  },
);

// GET /api/v1/messages/:id - 根据消息ID获取消息详情 (需要消息读取权限)
MessageRoutes.get(
  '/:id',
  routeDoc({ data: MessageSchema, errors: [404], summary: 'Get a message', tags: ['messages'] }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_READ'),
    'You do not have permission to read message details',
  ),
  zValidator('param', MessageIdParamSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleGetMessageById(c);
  },
);

// POST /api/v1/messages - 创建新消息 (需要消息写入权限)
MessageRoutes.post(
  '/',
  routeDoc({
    data: MessageSchema,
    requestExample: example(MessagesCreateRequestSchema, CREATE_MESSAGE_EXAMPLE),
    responseExample: MESSAGE_EXAMPLE,
    summary: 'Create a message',
    tags: ['messages'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_CREATE'),
    'You do not have permission to create messages',
  ),
  zValidator('json', MessagesCreateRequestSchema),
  (c) => {
    const controller = new MessageController();

    return controller.handleCreateMessage(c);
  },
);

// POST /api/v1/messages/replies - Create a user message and generate an AI reply (requires message write permission)
// Generating the reply invokes a model, so restricted API keys also need `model:invoke`
MessageRoutes.post(
  '/replies',
  routeDoc({
    operationId: 'messages.createReply',
    data: MessageSchema.nullable(),
    description:
      'Stores the user message, then generates and stores the assistant reply. Answers with the reply; `null` only if it could not be read back.',
    summary: 'Create a user message and generate an AI reply',
    tags: ['messages'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_CREATE'),
    'You do not have permission to create messages',
  ),
  requireApiKeyScope('model:invoke'),
  zValidator('json', MessagesCreateWithReplyRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleCreateMessageWithAIReply(c);
  },
);

// DELETE /api/v1/messages/:id - 删除单个消息 (需要消息删除权限)
MessageRoutes.delete(
  '/:id',
  routeDoc({
    data: DeletedResourceSchema,
    errors: [404],
    summary: 'Delete a message',
    tags: ['messages'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_DELETE'),
    'You do not have permission to delete messages',
  ),
  zValidator('param', MessageIdParamSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleDeleteMessage(c);
  },
);

// DELETE /api/v1/messages - 批量删除消息 (需要消息删除权限)
MessageRoutes.delete(
  '/',
  routeDoc({
    operationId: 'messages.deleteMany',
    data: DeletedResourcesSchema,
    description:
      'Best effort: ids the caller may not delete or that no longer exist are skipped. `count` is the number of messages actually removed.',
    summary: 'Delete messages in batch',
    tags: ['messages'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('MESSAGE_DELETE'),
    'You do not have permission to delete messages',
  ),
  zValidator('json', MessagesDeleteBatchRequestSchema),
  (c) => {
    const controller = new MessageController();
    return controller.handleDeleteBatchMessages(c);
  },
);

export default MessageRoutes;
