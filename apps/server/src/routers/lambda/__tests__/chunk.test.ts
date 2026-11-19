// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AsyncTaskModel } from '@/database/models/asyncTask';
import { ChunkModel } from '@/database/models/chunk';
import { DocumentModel } from '@/database/models/document';
import { EmbeddingModel } from '@/database/models/embedding';
import { FileModel } from '@/database/models/file';
import { MessageModel } from '@/database/models/message';
import { getServerDB } from '@/database/server';
import { initModelRuntimeFromDB } from '@/server/modules/ModelRuntime';
import { ChunkService } from '@/server/services/chunk';
import { DocumentService } from '@/server/services/document';
import { resolveFileEmbeddingModel } from '@/server/services/knowledgeBase/fileEmbeddingModel';

import { chunkRouter } from '../chunk';

vi.mock('@/database/models/asyncTask', () => ({ AsyncTaskModel: vi.fn() }));
// readKnowledge checks whether a docs_* document was deleted from every agent; these
// documents never were.
vi.mock('@/database/models/agentDocuments', () => ({
  AgentDocumentModel: vi.fn(function () {
    return { listRevokedFromAllAgents: async () => [] };
  }),
}));
vi.mock('@/database/models/chunk', () => ({ ChunkModel: vi.fn() }));
vi.mock('@/database/models/document', () => ({ DocumentModel: vi.fn() }));
vi.mock('@/database/models/embedding', () => ({ EmbeddingModel: vi.fn() }));
vi.mock('@/database/models/file', () => ({ FileModel: vi.fn() }));
vi.mock('@/database/models/message', () => ({ MessageModel: vi.fn() }));
vi.mock('@/server/services/chunk', () => ({ ChunkService: vi.fn() }));
vi.mock('@/server/services/document', () => ({ DocumentService: vi.fn() }));
vi.mock('@/database/server', () => ({ getServerDB: vi.fn() }));
vi.mock('@/server/modules/ModelRuntime', () => ({ initModelRuntimeFromDB: vi.fn() }));
vi.mock('@/server/services/knowledgeBase/fileEmbeddingModel', () => ({
  resolveFileEmbeddingModel: vi.fn(),
}));

describe('chunkRouter.semanticSearch', () => {
  it('embeds the query with both the resolved channel and model', async () => {
    const serverDB = {} as Awaited<ReturnType<typeof getServerDB>>;
    const embedding = [0.1, 0.2, 0.3];
    const embeddings = vi.fn().mockResolvedValue([embedding]);
    const semanticSearch = vi.fn().mockResolvedValue([]);
    vi.mocked(getServerDB).mockResolvedValue(serverDB);
    vi.mocked(ChunkModel).mockImplementation(function () {
      return { semanticSearch } as unknown as ChunkModel;
    });
    vi.mocked(resolveFileEmbeddingModel).mockResolvedValue({
      model: 'text-embedding-3-large',
      provider: 'custom-embedding',
    });
    vi.mocked(initModelRuntimeFromDB).mockResolvedValue({
      embeddings,
    } as Awaited<ReturnType<typeof initModelRuntimeFromDB>>);

    const caller = chunkRouter.createCaller({ userId: 'user_test' } as Parameters<
      typeof chunkRouter.createCaller
    >[0]);
    await expect(caller.semanticSearch({ fileIds: ['file_1'], query: 'hello' })).resolves.toEqual(
      [],
    );

    expect(resolveFileEmbeddingModel).toHaveBeenCalledWith(serverDB, 'user_test', undefined);
    expect(initModelRuntimeFromDB).toHaveBeenCalledWith(
      serverDB,
      'user_test',
      'custom-embedding',
      undefined,
    );
    expect(embeddings).toHaveBeenCalledWith(
      { dimensions: 1024, input: 'hello', model: 'text-embedding-3-large' },
      expect.anything(),
    );
    expect(semanticSearch).toHaveBeenCalledWith({ embedding, fileIds: ['file_1'], query: 'hello' });
  });
});

describe('chunkRouter.getFileContents — ID branching', () => {
  const userId = 'user_test';
  let mockCtx: any;
  let documentModelMock: any;
  let fileModelMock: any;
  let documentServiceMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    documentModelMock = { findById: vi.fn(), findByFileId: vi.fn() };
    fileModelMock = { findById: vi.fn() };
    documentServiceMock = { parseFile: vi.fn() };

    vi.mocked(DocumentModel).mockImplementation(function () {
      return documentModelMock;
    });
    vi.mocked(FileModel).mockImplementation(function () {
      return fileModelMock;
    });
    vi.mocked(DocumentService).mockImplementation(function () {
      return documentServiceMock;
    });
    vi.mocked(AsyncTaskModel).mockImplementation(function () {
      return {} as any;
    });
    vi.mocked(ChunkModel).mockImplementation(function () {
      return {} as any;
    });
    vi.mocked(EmbeddingModel).mockImplementation(function () {
      return {} as any;
    });
    vi.mocked(MessageModel).mockImplementation(function () {
      return {} as any;
    });
    vi.mocked(ChunkService).mockImplementation(function () {
      return {} as any;
    });

    mockCtx = {
      userId,
      asyncTaskModel: {},
      chunkModel: {},
      chunkService: {},
      documentModel: documentModelMock,
      documentService: documentServiceMock,
      embeddingModel: {},
      fileModel: fileModelMock,
      messageModel: {},
      searchRepo: {},
    };
  });

  it('reads docs_* directly from documents table without touching files', async () => {
    documentModelMock.findById.mockResolvedValue({
      content: '# 推荐信\n\nMain body text here.',
      filename: '推荐信.md',
      id: 'docs_pPAXDRIqlgxrG0HV',
      metadata: { tag: 'letter' },
      title: '推荐信',
    });

    const caller = chunkRouter.createCaller(mockCtx);
    const result = await caller.getFileContents({ fileIds: ['docs_pPAXDRIqlgxrG0HV'] });

    expect(documentModelMock.findById).toHaveBeenCalledWith('docs_pPAXDRIqlgxrG0HV');
    expect(fileModelMock.findById).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      content: '# 推荐信\n\nMain body text here.',
      fileId: 'docs_pPAXDRIqlgxrG0HV',
      filename: '推荐信',
      metadata: { tag: 'letter' },
    });
    expect(result[0].error).toBeUndefined();
  });

  it('returns "Document not found" for missing docs_* id', async () => {
    documentModelMock.findById.mockResolvedValue(undefined);

    const caller = chunkRouter.createCaller(mockCtx);
    const result = await caller.getFileContents({ fileIds: ['docs_missing'] });

    expect(result[0]).toMatchObject({
      content: '',
      error: 'Document not found',
      fileId: 'docs_missing',
    });
    expect(fileModelMock.findById).not.toHaveBeenCalled();
  });

  it('falls through to file lookup for file_* id', async () => {
    fileModelMock.findById.mockResolvedValue({ id: 'file_xyz', name: 'doc.pdf' });
    documentModelMock.findByFileId.mockResolvedValue({
      content: 'parsed pdf content',
      metadata: null,
    });

    const caller = chunkRouter.createCaller(mockCtx);
    const result = await caller.getFileContents({ fileIds: ['file_xyz'] });

    expect(fileModelMock.findById).toHaveBeenCalledWith('file_xyz');
    expect(documentModelMock.findByFileId).toHaveBeenCalledWith('file_xyz');
    expect(documentModelMock.findById).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({
      content: 'parsed pdf content',
      fileId: 'file_xyz',
      filename: 'doc.pdf',
    });
  });

  it('returns "File not found" for missing file_* id', async () => {
    fileModelMock.findById.mockResolvedValue(undefined);

    const caller = chunkRouter.createCaller(mockCtx);
    const result = await caller.getFileContents({ fileIds: ['file_missing'] });

    expect(result[0]).toMatchObject({
      content: '',
      error: 'File not found',
      fileId: 'file_missing',
    });
  });

  it('handles mixed batch of docs_* and file_*', async () => {
    documentModelMock.findById.mockResolvedValue({
      content: 'doc content',
      filename: 'note.md',
      id: 'docs_a',
      title: 'Note',
    });
    fileModelMock.findById.mockResolvedValue({ id: 'file_b', name: 'paper.pdf' });
    documentModelMock.findByFileId.mockResolvedValue({
      content: 'pdf content',
      metadata: null,
    });

    const caller = chunkRouter.createCaller(mockCtx);
    const result = await caller.getFileContents({ fileIds: ['docs_a', 'file_b'] });

    expect(result).toHaveLength(2);
    const docsResult = result.find((r) => r.fileId === 'docs_a');
    const fileResult = result.find((r) => r.fileId === 'file_b');
    expect(docsResult?.content).toBe('doc content');
    expect(fileResult?.content).toBe('pdf content');
  });
});
