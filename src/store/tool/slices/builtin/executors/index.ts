/**
 * Builtin Tool Executor Registry
 *
 * Central registry for all builtin tool executors.
 * Executors are registered as class instances by identifier.
 */
import { AgentBuilderIdentifier, AgentBuilderManifest } from '@lobechat/builtin-tool-agent-builder';
import { cloudSandboxExecutor } from '@lobechat/builtin-tool-cloud-sandbox/executor';
import {
  GroupAgentBuilderIdentifier,
  GroupAgentBuilderManifest,
} from '@lobechat/builtin-tool-group-agent-builder';
import { groupManagementExecutor } from '@lobechat/builtin-tool-group-management/executor';
import { gtdExecutor } from '@lobechat/builtin-tool-gtd/executor';
import { knowledgeBaseExecutor } from '@lobechat/builtin-tool-knowledge-base/executor';
import { localSystemExecutor } from '@lobechat/builtin-tool-local-system/executor';
import { memoryExecutor } from '@lobechat/builtin-tool-memory/executor';

import {
  type BuiltinToolContext,
  type BuiltinToolResult,
  type IBuiltinToolExecutor,
} from '../types';
import { notebookExecutor } from './lobe-notebook';
import { pageAgentExecutor } from './lobe-page-agent';
import { skillStoreExecutor } from './lobe-skill-store';
import { skillsExecutor } from './lobe-skills';
import { toolsActivatorExecutor } from './lobe-tools';
import { webBrowsing } from './lobe-web-browsing';

// ==================== Import and register all executors ====================

/**
 * Registry structure: Map<identifier, executor instance>
 */
const executorRegistry = new Map<string, IBuiltinToolExecutor>();

type LazyExecutorLoader = () => Promise<IBuiltinToolExecutor>;

const lazyExecutorLoaders = new Map<string, LazyExecutorLoader>([
  [
    AgentBuilderIdentifier,
    async () =>
      (await import('@lobechat/builtin-tool-agent-builder/executor')).agentBuilderExecutor,
  ],
  [
    GroupAgentBuilderIdentifier,
    async () =>
      (await import('@lobechat/builtin-tool-group-agent-builder/executor'))
        .groupAgentBuilderExecutor,
  ],
]);

const lazyExecutorApiNames = new Map<string, string[]>([
  [AgentBuilderIdentifier, AgentBuilderManifest.api.map((item) => item.name)],
  [GroupAgentBuilderIdentifier, GroupAgentBuilderManifest.api.map((item) => item.name)],
]);

const ensureExecutor = async (identifier: string): Promise<IBuiltinToolExecutor | undefined> => {
  const registered = executorRegistry.get(identifier);
  if (registered) return registered;

  const loader = lazyExecutorLoaders.get(identifier);
  if (!loader) return;

  const executor = await loader();
  executorRegistry.set(executor.identifier, executor);
  return executor;
};

/**
 * Get a builtin tool executor by identifier
 *
 * @param identifier - The tool identifier
 * @returns The executor instance or undefined if not found
 */
export const getExecutor = (identifier: string): IBuiltinToolExecutor | undefined => {
  return executorRegistry.get(identifier);
};

/**
 * Check if an executor exists for the given identifier and apiName
 *
 * @param identifier - The tool identifier
 * @param apiName - The API name
 * @returns Whether the executor exists and supports the API
 */
export const hasExecutor = (identifier: string, apiName: string): boolean => {
  const executor = executorRegistry.get(identifier);
  if (executor) return executor.hasApi(apiName);

  const apiNames = lazyExecutorApiNames.get(identifier);
  if (!apiNames) return false;

  return apiNames.includes(apiName);
};

/**
 * Get all registered identifiers
 *
 * @returns Array of registered identifiers
 */
export const getRegisteredIdentifiers = (): string[] => {
  return Array.from(new Set([...executorRegistry.keys(), ...lazyExecutorLoaders.keys()]));
};

/**
 * Get all API names for a given identifier
 *
 * @param identifier - The tool identifier
 * @returns Array of API names or empty array if identifier not found
 */
export const getApiNamesForIdentifier = (identifier: string): string[] => {
  const executor = executorRegistry.get(identifier);
  if (executor) return executor.getApiNames();

  return lazyExecutorApiNames.get(identifier) ?? [];
};

/**
 * Invoke a builtin tool executor
 *
 * @param identifier - The tool identifier
 * @param apiName - The API name
 * @param params - The parameters
 * @param ctx - The execution context
 * @returns The execution result
 */
export const invokeExecutor = async (
  identifier: string,
  apiName: string,
  params: any,
  ctx: BuiltinToolContext,
): Promise<BuiltinToolResult> => {
  const executor = await ensureExecutor(identifier);

  if (!executor) {
    return {
      error: {
        message: `Executor not found: ${identifier}`,
        type: 'ExecutorNotFound',
      },
      success: false,
    };
  }

  if (!executor.hasApi(apiName)) {
    return {
      error: {
        message: `API not found: ${identifier}/${apiName}`,
        type: 'ApiNotFound',
      },
      success: false,
    };
  }

  return executor.invoke(apiName, params, ctx);
};

/**
 * Register builtin tool executor instances
 *
 * @param executors - Array of executor instances to register
 */
const registerExecutors = (executors: IBuiltinToolExecutor[]): void => {
  for (const executor of executors) {
    executorRegistry.set(executor.identifier, executor);
  }
};

// Register all executor instances
registerExecutors([
  cloudSandboxExecutor,
  groupManagementExecutor,
  gtdExecutor,
  knowledgeBaseExecutor,
  localSystemExecutor,
  memoryExecutor,
  notebookExecutor,
  pageAgentExecutor,
  skillStoreExecutor,
  skillsExecutor,
  toolsActivatorExecutor,
  webBrowsing,
]);
