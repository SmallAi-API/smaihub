import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import { t } from 'i18next';
import { produce } from 'immer';
import { type SWRResponse } from 'swr';
import useSWR from 'swr';

import { message } from '@/components/AntdStaticMethods';
import { lambdaClient, toolsClient } from '@/libs/trpc/client';
import { type StoreSetter } from '@/store/types';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';
import { setNamespace } from '@/utils/storeDebug';

import { type ToolStore } from '../../store';
import { type KlavisStoreState } from './initialState';
import {
  type CallKlavisToolParams,
  type CallKlavisToolResult,
  type CreateKlavisServerParams,
  type KlavisServer,
  type KlavisTool,
} from './types';
import { KlavisServerStatus } from './types';

const n = setNamespace('klavisStore');

// Set of valid Klavis server identifiers (for cleanup of deprecated servers)
const VALID_KLAVIS_IDENTIFIERS = new Set(KLAVIS_SERVER_TYPES.map((t) => t.identifier));

const surfaceKlavisError = (error: unknown): void => {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes('KLAVIS_KEY_REQUIRED')) {
    message.error(t('klavis.errors.apiKeyRequired', { ns: 'tool' }));
    return;
  }
  if (/account creation limit reached|Limit:\s*\d+/i.test(msg)) {
    message.error(t('klavis.errors.quotaReached', { ns: 'tool' }));
    return;
  }
  message.error(msg);
};

// Klavis returns 401 / "Invalid API key" when the stored key is rejected.
// Surfacing this distinctly lets us re-open the BYOK modal so the user can
// retry instead of being stuck after a single failed save.
const isInvalidApiKeyError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  return /invalid api key|invalid_api_key|unauthorized|\b401\b/i.test(msg);
};

/**
 * Klavis Store Actions
 */

type Setter = StoreSetter<ToolStore>;
export const createKlavisStoreSlice = (set: Setter, get: () => ToolStore, _api?: unknown) =>
  new KlavisStoreActionImpl(set, get, _api);

export class KlavisStoreActionImpl {
  readonly #get: () => ToolStore;
  readonly #set: Setter;

  constructor(set: Setter, get: () => ToolStore, _api?: unknown) {
    void _api;
    this.#set = set;
    this.#get = get;
  }

  callKlavisTool = async (params: CallKlavisToolParams): Promise<CallKlavisToolResult> => {
    const { serverUrl, toolName, toolArgs } = params;

    const toolId = `${serverUrl}:${toolName}`;

    this.#set(
      produce((draft: KlavisStoreState) => {
        draft.executingToolIds.add(toolId);
      }),
      false,
      n('callKlavisTool/start'),
    );

    try {
      // Call tRPC server interface to execute tool (use toolsClient for longer timeout)
      const response = await toolsClient.klavis.callTool.mutate({
        serverUrl,
        toolArgs,
        toolName,
      });

      console.info('toolsClient.klavis.callTool-response', response);

      this.#set(
        produce((draft: KlavisStoreState) => {
          draft.executingToolIds.delete(toolId);
        }),
        false,
        n('callKlavisTool/success'),
      );

      return { data: response, success: true };
    } catch (error) {
      console.error('[Klavis] Failed to call tool:', error);

      this.#set(
        produce((draft: KlavisStoreState) => {
          draft.executingToolIds.delete(toolId);
        }),
        false,
        n('callKlavisTool/error'),
      );

      return {
        error: error instanceof Error ? error.message : String(error),
        success: false,
      };
    }
  };

  closeKlavisKeyModal = (): void => {
    this.#set(
      produce((draft: KlavisStoreState) => {
        draft.keyModalOpen = false;
        draft.pendingKlavisConnect = undefined;
      }),
      false,
      n('closeKlavisKeyModal'),
    );
  };

  confirmKlavisKey = async (): Promise<KlavisServer | undefined> => {
    const pending = this.#get().pendingKlavisConnect;
    this.#set(
      produce((draft: KlavisStoreState) => {
        draft.keyModalOpen = false;
        draft.pendingKlavisConnect = undefined;
      }),
      false,
      n('confirmKlavisKey'),
    );
    if (!pending) return undefined;
    return this.createKlavisServer(pending);
  };

  // Poll Klavis server auth status until CONNECTED or timeout. Used after the
  // BYOK modal kicks off OAuth so the row refreshes once the user finishes
  // authorization in the popup, without requiring them to click again.
  pollKlavisAuthStatus = async (identifier: string, timeoutMs: number = 60_000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const server = this.#get().servers.find((s) => s.identifier === identifier);
      if (!server) return;
      if (server.status === KlavisServerStatus.CONNECTED) return;
      try {
        await this.refreshKlavisServerTools(identifier);
      } catch {
        // Polling errors are expected while user is still authorizing.
      }
      const after = this.#get().servers.find((s) => s.identifier === identifier);
      if (!after || after.status === KlavisServerStatus.CONNECTED) return;
    }
  };

  completeKlavisServerAuth = async (identifier: string): Promise<void> => {
    // After OAuth completes, refresh tool list
    await this.#get().refreshKlavisServerTools(identifier);
  };

  createKlavisServer = async (
    params: CreateKlavisServerParams,
  ): Promise<KlavisServer | undefined> => {
    const { userId, serverName, identifier } = params;

    // BYOK pre-check: when the deployment requires a per-user Klavis key and the user
    // hasn't set one yet, park the request and surface the modal instead of failing
    // server-side with KLAVIS_KEY_REQUIRED.
    const requiresUserKey =
      typeof window !== 'undefined'
        ? Boolean(window.__SERVER_CONFIG__?.config?.klavisRequiresUserKey)
        : false;
    const userKlavisKey = keyVaultsConfigSelectors.getVaultByProvider('klavis')(
      useUserStore.getState(),
    )?.apiKey;
    if (requiresUserKey && !userKlavisKey) {
      this.#set(
        produce((draft: KlavisStoreState) => {
          draft.keyModalOpen = true;
          draft.pendingKlavisConnect = params;
        }),
        false,
        n('createKlavisServer/requireKey'),
      );
      return undefined;
    }

    this.#set(
      produce((draft: KlavisStoreState) => {
        draft.loadingServerIds.add(identifier);
      }),
      false,
      n('createKlavisServer/start'),
    );

    try {
      // Call tRPC server interface to create single server instance
      const response = await lambdaClient.klavis.createServerInstance.mutate({
        identifier,
        serverName,
        userId,
      });

      // Build server object
      const server: KlavisServer = {
        createdAt: Date.now(),
        identifier: response.identifier,
        instanceId: response.instanceId,
        isAuthenticated: response.isAuthenticated,
        oauthUrl: response.oauthUrl,
        serverName: response.serverName,
        serverUrl: response.serverUrl,
        status: response.isAuthenticated
          ? KlavisServerStatus.CONNECTED
          : KlavisServerStatus.PENDING_AUTH,
      };

      // Add to servers list
      this.#set(
        produce((draft: KlavisStoreState) => {
          // Check if already exists (using identifier), update if exists
          const existingIndex = draft.servers.findIndex((s) => s.identifier === identifier);
          if (existingIndex >= 0) {
            draft.servers[existingIndex] = server;
          } else {
            draft.servers.push(server);
          }
          draft.loadingServerIds.delete(identifier);
        }),
        false,
        n('createKlavisServer/success'),
      );

      return server;
    } catch (error) {
      console.error('[Klavis] Failed to create server:', error);

      // If Klavis rejected the key (likely the user just typed it wrong in the
      // BYOK modal), restore the modal + pending request so the user can fix
      // the key without restarting from scratch. Only do this when the user
      // actually has a saved per-user key; otherwise the env key is in play
      // and re-opening the modal would be confusing.
      const userKlavisKeyAtFailure = keyVaultsConfigSelectors.getVaultByProvider('klavis')(
        useUserStore.getState(),
      )?.apiKey;
      if (isInvalidApiKeyError(error) && userKlavisKeyAtFailure) {
        message.error(t('klavis.errors.invalidApiKey', { ns: 'tool' }));
        this.#set(
          produce((draft: KlavisStoreState) => {
            draft.keyModalOpen = true;
            draft.pendingKlavisConnect = params;
            draft.loadingServerIds.delete(identifier);
          }),
          false,
          n('createKlavisServer/invalidKey'),
        );
        return undefined;
      }

      surfaceKlavisError(error);

      this.#set(
        produce((draft: KlavisStoreState) => {
          draft.loadingServerIds.delete(identifier);
        }),
        false,
        n('createKlavisServer/error'),
      );

      return undefined;
    }
  };

  refreshKlavisServerTools = async (identifier: string): Promise<void> => {
    const { servers } = this.#get();

    // Find server using identifier
    const server = servers.find((s) => s.identifier === identifier);
    if (!server) {
      console.error('[Klavis] Server not found:', identifier);
      return;
    }

    this.#set(
      produce((draft: KlavisStoreState) => {
        draft.loadingServerIds.add(identifier);
      }),
      false,
      n('refreshKlavisServerTools/start'),
    );

    try {
      // First check server authentication status
      const instanceStatus = await lambdaClient.klavis.getServerInstance.query({
        instanceId: server.instanceId,
      });

      // If server returned an auth error (during polling), silently return
      // This happens when user is still in the process of authorizing
      if (instanceStatus.error === 'AUTH_ERROR') {
        this.#set(
          produce((draft: KlavisStoreState) => {
            draft.loadingServerIds.delete(identifier);
          }),
          false,
          n('refreshKlavisServerTools/pendingAuth'),
        );
        return;
      }

      // If authentication failed, remove server and reset status
      if (!instanceStatus.isAuthenticated) {
        if (!instanceStatus.authNeeded) {
          // If no authentication needed, all is well
          this.#set(
            produce((draft: KlavisStoreState) => {
              draft.loadingServerIds.delete(identifier);
            }),
            false,
            n('refreshKlavisServerTools/noAuthNeeded'),
          );
          return;
        }

        // Remove from local state (using identifier)
        this.#set(
          produce((draft: KlavisStoreState) => {
            draft.servers = draft.servers.filter((s) => s.identifier !== identifier);
            draft.loadingServerIds.delete(identifier);
          }),
          false,
          n('refreshKlavisServerTools/authFailed'),
        );

        // Delete from database
        await lambdaClient.klavis.deleteServerInstance.mutate({
          identifier,
          instanceId: server.instanceId,
        });

        return;
      }

      // Authentication successful, get tool list (use toolsClient for longer timeout)
      const response = await toolsClient.klavis.listTools.query({
        serverUrl: server.serverUrl,
      });

      const tools = response.tools as KlavisTool[];

      this.#set(
        produce((draft: KlavisStoreState) => {
          // Find server using identifier
          const serverIndex = draft.servers.findIndex((s) => s.identifier === identifier);
          if (serverIndex >= 0) {
            draft.servers[serverIndex].tools = tools;
            draft.servers[serverIndex].status = KlavisServerStatus.CONNECTED;
            draft.servers[serverIndex].isAuthenticated = true;
            draft.servers[serverIndex].errorMessage = undefined;
          }
          draft.loadingServerIds.delete(identifier);
        }),
        false,
        n('refreshKlavisServerTools/success'),
      );

      // Update tool list and authentication status in database
      await lambdaClient.klavis.updateKlavisPlugin.mutate({
        identifier,
        instanceId: server.instanceId,
        isAuthenticated: true,
        serverName: server.serverName,
        serverUrl: server.serverUrl,
        tools: tools.map((t) => ({
          description: t.description,
          inputSchema: t.inputSchema,
          name: t.name,
        })),
      });
    } catch (error) {
      console.error('[Klavis] Failed to refresh tools:', error);

      surfaceKlavisError(error);

      this.#set(
        produce((draft: KlavisStoreState) => {
          // Find server using identifier
          const serverIndex = draft.servers.findIndex((s) => s.identifier === identifier);
          if (serverIndex >= 0) {
            draft.servers[serverIndex].status = KlavisServerStatus.ERROR;
            draft.servers[serverIndex].errorMessage =
              error instanceof Error ? error.message : String(error);
          }
          draft.loadingServerIds.delete(identifier);
        }),
        false,
        n('refreshKlavisServerTools/error'),
      );
    }
  };

  removeKlavisServer = async (identifier: string): Promise<void> => {
    const { servers } = this.#get();
    // Find server using identifier
    const server = servers.find((s) => s.identifier === identifier);

    this.#set(
      produce((draft: KlavisStoreState) => {
        // Filter using identifier
        draft.servers = draft.servers.filter((s) => s.identifier !== identifier);
      }),
      false,
      n('removeKlavisServer'),
    );

    // Delete from Klavis API and database
    if (server) {
      try {
        await lambdaClient.klavis.deleteServerInstance.mutate({
          identifier,
          instanceId: server.instanceId,
        });
      } catch (error) {
        console.error('[Klavis] Failed to delete server instance:', error);
      }
    }
  };

  useFetchServerTools = (serverName: string | undefined): SWRResponse<KlavisTool[]> => {
    return useSWR<KlavisTool[]>(
      serverName ? `klavis-server-tools-${serverName}` : null,
      async () => {
        const response = await toolsClient.klavis.getTools.query({ serverName: serverName! });
        return (response.tools || []).map((tool: any) => ({
          description: tool.description,
          inputSchema: tool.inputSchema,
          name: tool.name,
        }));
      },
      {
        fallbackData: [],
        revalidateOnFocus: false,
      },
    );
  };

  useFetchUserKlavisServers = (enabled: boolean): SWRResponse<KlavisServer[]> => {
    return useSWR<KlavisServer[]>(
      enabled ? 'fetchUserKlavisServers' : null,
      async () => {
        const klavisPlugins = await lambdaClient.klavis.getKlavisPlugins.query();

        if (klavisPlugins.length === 0) return [];

        // Filter plugins with klavis params
        const validPlugins = klavisPlugins.filter((plugin) => plugin.customParams?.klavis);

        // Clean up deprecated Klavis servers (e.g., 'github' moved to LobeHub Skill)
        const deprecatedPlugins = validPlugins.filter(
          (plugin) => !VALID_KLAVIS_IDENTIFIERS.has(plugin.identifier),
        );

        // Silently remove deprecated plugins: revoke remote instance first, then delete local record
        for (const plugin of deprecatedPlugins) {
          const instanceId = plugin.customParams?.klavis?.instanceId;

          // Try to delete remote instance first (if exists)
          if (instanceId) {
            try {
              await lambdaClient.klavis.deleteServerInstance.mutate({
                identifier: plugin.identifier,
                instanceId,
              });
              console.info(`[Klavis] Cleaned up deprecated server: ${plugin.identifier}`);
              continue; // deleteServerInstance already removes local record
            } catch (error) {
              // Remote deletion failed, fall through to remove local record
              console.warn(
                `[Klavis] Failed to delete remote instance for ${plugin.identifier}:`,
                error,
              );
            }
          }

          // Remove local DB record (either no instanceId, or remote deletion failed)
          try {
            await lambdaClient.klavis.removeKlavisPlugin.mutate({
              identifier: plugin.identifier,
            });
            console.info(
              `[Klavis] Removed local record for deprecated server: ${plugin.identifier}`,
            );
          } catch (error) {
            console.error(
              `[Klavis] Failed to remove local record for ${plugin.identifier}:`,
              error,
            );
          }
        }

        // Only return valid plugins
        return validPlugins
          .filter((plugin) => VALID_KLAVIS_IDENTIFIERS.has(plugin.identifier))
          .map((plugin) => {
            const klavisParams = plugin.customParams!.klavis!;
            const tools: KlavisTool[] = (plugin.manifest?.api || []).map((api) => ({
              description: api.description,
              inputSchema: api.parameters as KlavisTool['inputSchema'],
              name: api.name,
            }));

            return {
              createdAt: Date.now(),
              identifier: plugin.identifier,
              instanceId: klavisParams.instanceId,
              isAuthenticated: klavisParams.isAuthenticated,
              oauthUrl: klavisParams.oauthUrl,
              serverName: klavisParams.serverName,
              serverUrl: klavisParams.serverUrl,
              status: klavisParams.isAuthenticated
                ? KlavisServerStatus.CONNECTED
                : KlavisServerStatus.PENDING_AUTH,
              tools,
            };
          });
      },
      {
        fallbackData: [],
        onSuccess: (data) => {
          this.#set(
            produce((draft: KlavisStoreState) => {
              if (data.length > 0) {
                // Check if already exists using identifier
                const existingIdentifiers = new Set(draft.servers.map((s) => s.identifier));
                const newServers = data.filter((s) => !existingIdentifiers.has(s.identifier));
                draft.servers = [...draft.servers, ...newServers];
              }
              draft.isServersInit = true;
            }),
            false,
            n('useFetchUserKlavisServers'),
          );
        },
        revalidateOnFocus: false,
      },
    );
  };
}

export type KlavisStoreAction = Pick<KlavisStoreActionImpl, keyof KlavisStoreActionImpl>;
