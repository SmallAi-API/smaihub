import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { BaseController } from '../common/base.controller';
import { FileUploadService } from '../services/file.service';
import type {
  BatchFileUploadFormFields,
  BatchFileUploadRequest,
  BatchGetFilesRequest,
  FileChunkRequest,
  FileListQuery,
  FileParseRequest,
  FileUploadFormFields,
  FileUrlRequest,
  PublicFileUploadRequest,
  UpdateFileRequest,
} from '../types/file.type';
import { BatchFileUploadFormFieldsSchema, FileUploadFormFieldsSchema } from '../types/file.type';

const getMultipartTextFields = (formData: FormData, fields: readonly string[]) =>
  Object.fromEntries(
    fields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === 'string' ? value : undefined];
    }),
  );

const parseMultipartFields = <T>(result: {
  error?: { issues: Array<{ message: string }> };
  success: boolean;
  data?: T;
}): T => {
  if (!result.success) {
    throw new HTTPException(400, {
      message: result.error?.issues[0]?.message ?? 'Invalid multipart form fields',
    });
  }

  return result.data!;
};

/**
 * File upload controller
 * Handles file upload-related HTTP requests
 */
export class FileController extends BaseController {
  /**
   * 批量文件上传
   * POST /files/batches
   */
  async batchUploadFiles(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      // 处理 multipart/form-data（返回对象：{ fields, files }）
      const formData = await this.getFormData(c);
      const files: File[] = [];

      // 兼容写法：从 'files' 或 'files[]' 字段获取文件
      // 因为Stainless SDK 会将数组字段自动添加 [] 后缀
      let fileEntries = formData.getAll('files');
      if (fileEntries.length === 0) {
        fileEntries = formData.getAll('files[]');
      }

      for (const file of fileEntries) {
        if (!(file instanceof File)) {
          throw new HTTPException(400, { message: 'Every files entry must be a binary file' });
        }
        files.push(file);
      }

      if (!files.length) {
        return this.error(c, 'No files provided', 400);
      }

      if (files.length > 20) {
        return this.error(c, 'A batch can contain at most 20 files', 400);
      }

      const fields = parseMultipartFields<BatchFileUploadFormFields>(
        BatchFileUploadFormFieldsSchema.safeParse(
          getMultipartTextFields(formData, [
            'agentId',
            'directory',
            'knowledgeBaseId',
            'sessionId',
            'skipCheckFileType',
          ]),
        ),
      );

      const request: BatchFileUploadRequest = {
        agentId: fields.agentId,
        directory: fields.directory,
        files,
        knowledgeBaseId: fields.knowledgeBaseId,
        sessionId: fields.sessionId,
        skipCheckFileType: fields.skipCheckFileType,
      };

      const result = await fileService.uploadFiles(request);

      return this.success(
        c,
        result,
        `Batch upload completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取文件列表
   * GET /files
   */
  async getFiles(c: Context) {
    try {
      const userId = this.getUserId(c)!;

      const query = this.getQuery(c) as FileListQuery;

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.getFileList(query);

      return this.success(c, result, 'Files retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取单个文件详情
   * GET /files/:id
   */
  async getFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.getFileDetail(id);

      return this.success(c, result, 'File details retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取文件访问URL
   * GET /files/:id/url
   */
  async getFileUrl(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const query = this.getQuery(c);

      // 解析查询参数
      const options: FileUrlRequest = {
        expiresIn: query.expiresIn ? parseInt(query.expiresIn as string, 10) : undefined,
      };

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.getFileUrl(id, options);

      return this.success(c, result, 'File URL generated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 文件上传
   * POST /files
   */
  async uploadFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const formData = await this.getFormData(c);
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return this.error(c, 'No file provided', 400);
      }

      const fields = parseMultipartFields<FileUploadFormFields>(
        FileUploadFormFieldsSchema.safeParse(
          getMultipartTextFields(formData, [
            'agentId',
            'directory',
            'knowledgeBaseId',
            'sessionId',
            'skipCheckFileType',
            'skipDeduplication',
          ]),
        ),
      );

      const options: PublicFileUploadRequest = {
        ...fields,
      };

      const result = await fileService.uploadFile(file, options);

      return this.success(c, result, 'Public file uploaded successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 解析文件内容
   * POST /files/:id/parses
   */
  async parseFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const query = this.getQuery<{ skipExist?: boolean }>(c);

      // 解析查询参数
      const options: Partial<FileParseRequest> = {
        skipExist: query.skipExist,
      };

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.parseFile(id, options);

      return this.success(c, result, 'File parsed successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建分块任务（可选自动触发嵌入）
   * POST /files/:id/chunks
   */
  async createChunkTask(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 已确保 userId 存在
      const { id } = this.getParams(c);
      const body = await this.getBody<Partial<FileChunkRequest>>(c);

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.createChunkTask(id, {
        autoEmbedding: body?.autoEmbedding,
        skipExist: body?.skipExist,
      });

      return this.success(c, result, 'Chunking task created');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 查询文件分块结果和状态
   * GET /files/:id/chunks
   */
  async getFileChunkStatus(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 已确保 userId 存在
      const { id } = this.getParams(c);

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.getFileChunkStatus(id);

      return this.success(c, result, 'File chunk status retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除文件
   * DELETE /files/:id
   */
  async deleteFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.deleteFile(id);

      return this.success(c, result, 'File deleted successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量获取文件详情和内容
   * POST /files/queries
   */
  async queries(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const body = await this.getBody<BatchGetFilesRequest>(c);

      if (!body || !body.fileIds || body.fileIds.length === 0) {
        return this.error(c, 'File IDs are required', 400);
      }

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.handleQueries(body);

      return this.success(c, result, 'Files retrieved successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新文件
   * PATCH /files/:id
   */
  async updateFile(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在
      const { id } = this.getParams(c);
      const body = await this.getBody<UpdateFileRequest>(c);

      const db = await this.getDatabase();
      const fileService = new FileUploadService(db, userId, this.getWorkspaceId(c));

      const result = await fileService.updateFile(id, body);

      return this.success(c, result, 'File updated successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
