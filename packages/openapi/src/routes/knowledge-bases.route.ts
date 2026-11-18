import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import { routeDoc } from '../common/openapi';
import { zValidator } from '../common/validator';
import { KnowledgeBaseController } from '../controllers/knowledge-base.controller';
import { requireAnyPermission } from '../middleware';
import { requireAuth } from '../middleware/auth';
import { DeletedResourceSchema } from '../types/common.type';
import { FileListResponseSchema } from '../types/file.type';
import {
  CreateKnowledgeBaseSchema,
  KnowledgeBaseDetailResponseSchema,
  KnowledgeBaseFileBatchSchema,
  KnowledgeBaseFileListQuerySchema,
  KnowledgeBaseFileOperationResultSchema,
  KnowledgeBaseIdParamSchema,
  KnowledgeBaseListQuerySchema,
  KnowledgeBaseListResponseSchema,
  MoveKnowledgeBaseFilesSchema,
  UpdateKnowledgeBaseSchema,
} from '../types/knowledge-base.type';

const app = new Hono();

/**
 * 获取知识库列表
 * GET /knowledge-bases
 *
 * Query parameters:
 * - page: number (optional) - 页码，默认1
 * - pageSize: number (optional) - 每页数量，默认20，最大100
 * - keyword: string (optional) - 搜索关键词（匹配名称或描述）
 */
app.get(
  '/',
  routeDoc({
    data: KnowledgeBaseListResponseSchema,
    summary: 'List knowledge bases',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_READ'),
    'You do not have permission to view knowledge base list',
  ),
  zValidator('query', KnowledgeBaseListQuerySchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.getKnowledgeBases(c);
  },
);

/**
 * 创建知识库
 * POST /knowledge-bases
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "name": "知识库名称",
 *   "description": "知识库描述（可选）",
 *   "avatar": "头像URL（可选）"
 * }
 */
app.post(
  '/',
  routeDoc({
    data: KnowledgeBaseDetailResponseSchema,
    summary: 'Create a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_CREATE'),
    'You do not have permission to create a knowledge base',
  ),
  zValidator('json', CreateKnowledgeBaseSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.createKnowledgeBase(c);
  },
);

/**
 * 获取知识库详情
 * GET /knowledge-bases/:id
 *
 * Path parameters:
 * - id: string (required) - 知识库ID
 */
app.get(
  '/:id',
  routeDoc({
    data: KnowledgeBaseDetailResponseSchema,
    errors: [404],
    summary: 'Get a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_READ'),
    'You do not have permission to view knowledge base details',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.getKnowledgeBase(c);
  },
);

/**
 * 更新知识库
 * PATCH /knowledge-bases/:id
 * Content-Type: application/json
 *
 * Path parameters:
 * - id: string (required) - 知识库ID
 *
 * Request body:
 * {
 *   "name": "新名称（可选）",
 *   "description": "新描述（可选）",
 *   "avatar": "新头像URL（可选）"
 * }
 */
app.patch(
  '/:id',
  routeDoc({
    data: KnowledgeBaseDetailResponseSchema,
    errors: [404],
    summary: 'Update a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_UPDATE'),
    'You do not have permission to update a knowledge base',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  zValidator('json', UpdateKnowledgeBaseSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.updateKnowledgeBase(c);
  },
);

/**
 * 删除知识库
 * DELETE /knowledge-bases/:id
 *
 * Path parameters:
 * - id: string (required) - 知识库ID
 */
app.delete(
  '/:id',
  routeDoc({
    data: DeletedResourceSchema,
    description: 'Also deletes the files that belong to no other knowledge base.',
    errors: [404],
    summary: 'Delete a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_DELETE'),
    'You do not have permission to delete a knowledge base',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.deleteKnowledgeBase(c);
  },
);

/**
 * 获取指定知识库下的文件列表
 * GET /knowledge-bases/:id/files
 *
 * Path parameters:
 * - id: string (required) - 知识库ID
 *
 * Query parameters:
 * - page: number (optional) - 页码；仅传 page 时，默认 pageSize=20
 * - pageSize: number (optional) - 每页数量，默认最大100；仅传 pageSize 时，默认 page=1
 * - fileType: string (optional) - 文件类型过滤
 * - keyword: string (optional) - 搜索关键词（匹配文件名）
 *
 * Notes:
 * - When page/pageSize are omitted, defaults to page 1 with 20 items
 */
app.get(
  '/:id/files',
  routeDoc({
    data: FileListResponseSchema,
    errors: [404],
    summary: 'List the files of a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_READ'),
    'You do not have permission to view knowledge base file list',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  zValidator('query', KnowledgeBaseFileListQuerySchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.getKnowledgeBaseFiles(c);
  },
);

/**
 * 批量为知识库添加文件关联
 * POST /knowledge-bases/:id/files/batch
 */
app.post(
  '/:id/files/batch',
  routeDoc({
    data: KnowledgeBaseFileOperationResultSchema,
    errors: [404],
    summary: 'Add files to a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_UPDATE'),
    'You do not have permission to update knowledge base files',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  zValidator('json', KnowledgeBaseFileBatchSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.addFilesToKnowledgeBase(c);
  },
);

/**
 * 批量移除知识库与文件的关联
 * DELETE /knowledge-bases/:id/files/batch
 */
app.delete(
  '/:id/files/batch',
  routeDoc({
    data: KnowledgeBaseFileOperationResultSchema,
    description:
      'Detaches the files from the knowledge base without deleting them, and reports per file which ones were detached.',
    errors: [404],
    summary: 'Remove files from a knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_UPDATE'),
    'You do not have permission to update knowledge base files',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  zValidator('json', KnowledgeBaseFileBatchSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.removeFilesFromKnowledgeBase(c);
  },
);

/**
 * 批量将文件从当前知识库移动到目标知识库
 * POST /knowledge-bases/:id/files/move
 */
app.post(
  '/:id/files/move',
  routeDoc({
    data: KnowledgeBaseFileOperationResultSchema,
    errors: [404],
    summary: 'Move files to another knowledge base',
    tags: ['knowledge-bases'],
  }),
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('KNOWLEDGE_BASE_UPDATE'),
    'You do not have permission to update knowledge base files',
  ),
  zValidator('param', KnowledgeBaseIdParamSchema),
  zValidator('json', MoveKnowledgeBaseFilesSchema),
  async (c) => {
    const controller = new KnowledgeBaseController();
    return await controller.moveFilesBetweenKnowledgeBases(c);
  },
);

export default app;
