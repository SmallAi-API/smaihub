/**
 * 集成测试通用设置
 */
import { type LobeChatDatabase } from '@/database/type';
import { uuid } from '@/utils/uuid';

/**
 * 创建测试上下文
 */
export const createTestContext = (userId?: string) => ({
  jwtPayload: { userId: userId || uuid() },
  userId: userId || uuid(),
});

/**
 * 创建测试用户
 */
export const createTestUser = async (serverDB: LobeChatDatabase, userId?: string) => {
  const id = userId || uuid();
  const { users } = await import('@/database/schemas');

  await serverDB.insert(users).values({ id });

  return id;
};

/**
 * 创建测试 Agent
 */
export const createTestAgent = async (
  serverDB: LobeChatDatabase,
  userId: string,
  agentId?: string,
) => {
  const id = agentId || `agt_${uuid()}`;
  const { agents } = await import('@/database/schemas');

  await serverDB.insert(agents).values({ id, slug: id, userId }).onConflictDoNothing();

  return id;
};

/**
 * 创建测试 Topic
 */
export const createTestTopic = async (
  serverDB: LobeChatDatabase,
  userId: string,
  topicId?: string,
) => {
  const id = topicId || `tpc_${uuid()}`;
  const { topics } = await import('@/database/schemas');

  await serverDB.insert(topics).values({ id, userId }).onConflictDoNothing();

  return id;
};

/**
 * 清理测试用户及其所有关联数据
 */
export const cleanupTestUser = async (serverDB: LobeChatDatabase, userId: string) => {
  const { users } = await import('@/database/schemas');
  const { eq } = await import('drizzle-orm');

  const { releaseProjectEnvironments } =
    await import('@/database/models/utils/projectEnvironmentCleanup');

  // Everything else cascades from the user; each project's environment is
  // released the way account deletion releases it.
  await releaseProjectEnvironments(serverDB, { userId });
  await serverDB.delete(users).where(eq(users.id, userId));
};
