import type { ConversationContext } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as usageEvents from '@/features/HomeUsage/events';
import type { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import { buildRunLifecycle } from './buildRunLifecycle';
import type { RunCompleteEvent } from './types';

vi.mock('@/store/chat/slices/agentRun/actions/lifecycle/agentSignalBridge', () => ({
  emitClientAgentSignalSourceEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/store/chat/utils/desktopNotification', () => ({
  notifyDesktopAgentCompleted: vi.fn().mockResolvedValue(undefined),
  notifyDesktopAgentFailed: vi.fn().mockResolvedValue(undefined),
}));
const context = { agentId: 'agent-1', topicId: 'topic-1' } as ConversationContext;
const createLifecycle = (provider = 'smai', queued = false) => {
  const store = {
    activeTopicId: context.topicId,
    completeOperation: vi.fn(),
    dbMessagesMap: {},
    drainQueuedMessages: vi.fn(() => []),
    failOperation: vi.fn(),
    markTopicUnread: vi.fn(),
    messagesMap: {},
    operations: { 'operation-1': { context, id: 'operation-1', metadata: {}, status: 'running' } },
    operationsByContext: { [messageMapKey(context)]: ['operation-1'] },
    queuedMessages: queued
      ? { [messageMapKey(context)]: [{ content: 'Next', id: 'queued-1' }] }
      : {},
    topicDataMap: {},
    updateTopicStatus: vi.fn().mockResolvedValue(undefined),
  };
  const lifecycle = buildRunLifecycle(() => store as unknown as ChatStore, {
    context,
    parentMessageId: 'user-1',
    parentMessageType: 'user',
    provider,
    runId: 'operation-1',
    runScope: 'top_level',
    runtimeType: 'client',
  });
  const event: RunCompleteEvent = {
    context,
    operationId: 'operation-1',
    runId: 'operation-1',
    runScope: 'top_level',
    runtimeStatus: 'done',
    runtimeType: 'client',
  };
  return { event, lifecycle };
};
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('run completion invalidates SMAI usage', () => {
  it.each(['done', 'error', 'interrupted'] as const)(
    'notifies once for terminal status %s',
    async (runtimeStatus) => {
      const notify = vi.spyOn(usageEvents, 'notifySmaiUsageChanged');
      const { event, lifecycle } = createLifecycle();
      await lifecycle.completeRun({ ...event, runtimeStatus });
      await lifecycle.completeRun({ ...event, runtimeStatus });
      expect(notify).toHaveBeenCalledExactlyOnceWith('smai');
    },
  );
  it('notifies before the queued-follow-up early return', async () => {
    const notify = vi.spyOn(usageEvents, 'notifySmaiUsageChanged');
    const { event, lifecycle } = createLifecycle('smai', true);
    expect(await lifecycle.completeRun(event)).toEqual({ requeued: true });
    expect(notify).toHaveBeenCalledExactlyOnceWith('smai');
  });
  it('does not invalidate SMAI for other providers', async () => {
    const before = usageEvents.getSmaiUsageRevision();
    const { event, lifecycle } = createLifecycle('openai');
    await lifecycle.completeRun(event);
    expect(usageEvents.getSmaiUsageRevision()).toBe(before);
  });
  it('does not consider human intervention or asynchronous tools terminal', async () => {
    const notify = vi.spyOn(usageEvents, 'notifySmaiUsageChanged');
    const { event, lifecycle } = createLifecycle();
    await lifecycle.onRunParked({ ...event, reason: 'waiting_for_human' });
    await lifecycle.onRunParked({ ...event, reason: 'waiting_for_async_tool' });
    expect(notify).not.toHaveBeenCalled();
  });
});
