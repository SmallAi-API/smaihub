import { KLAVIS_SERVER_TYPES } from '@lobechat/const';
import type { LobeToolManifest } from '@lobechat/context-engine';
import type { LobeChatDatabase } from '@lobechat/database';
import debug from 'debug';

import { PluginModel } from '@/database/models/plugin';
import { getKlavisClientForUser, tryGetKlavisClientForUser } from '@/libs/klavis';
import { type ToolExecutionResult } from '@/server/services/toolExecution/types';

const log = debug('lobe-server:klavis-service');

const VALID_KLAVIS_IDENTIFIERS = new Set(KLAVIS_SERVER_TYPES.map((type) => type.identifier));

export interface KlavisToolExecuteParams {
  args: Record<string, any>;
  /** Tool identifier (same as Klavis server identifier, e.g., 'google-calendar') */
  identifier: string;
  toolName: string;
}

export interface KlavisServiceOptions {
  db?: LobeChatDatabase;
  userId?: string;
}

/**
 * Klavis Service (BYOK aware)
 *
 * Resolves the Klavis API key per request:
 *   user keyVaults.klavis.apiKey → env KLAVIS_API_KEY → KLAVIS_KEY_REQUIRED.
 */
export class KlavisService {
  private db?: LobeChatDatabase;
  private userId?: string;
  private pluginModel?: PluginModel;

  constructor(options: KlavisServiceOptions = {}) {
    const { db, userId } = options;

    this.db = db;
    this.userId = userId;

    if (db && userId) {
      this.pluginModel = new PluginModel(db, userId);
    }

    log('KlavisService initialized: hasDB=%s, hasUserId=%s', !!db, !!userId);
  }

  async executeKlavisTool(params: KlavisToolExecuteParams): Promise<ToolExecutionResult> {
    const { identifier, toolName, args } = params;

    log('executeKlavisTool: %s/%s with args: %O', identifier, toolName, args);

    if (!this.pluginModel) {
      return {
        content: 'Klavis service is not properly initialized',
        error: {
          code: 'KLAVIS_NOT_INITIALIZED',
          message: 'Database and userId are required for Klavis tool execution',
        },
        success: false,
      };
    }

    let klavisClient;
    try {
      klavisClient = await getKlavisClientForUser(this.userId, this.db);
    } catch (error) {
      const err = error as Error & { message?: string };
      const isKeyRequired = err?.message === 'KLAVIS_KEY_REQUIRED';
      return {
        content: isKeyRequired
          ? 'Klavis API key is not configured. Please set your key in Settings → Klavis.'
          : err.message,
        error: {
          code: isKeyRequired ? 'KLAVIS_KEY_REQUIRED' : 'KLAVIS_NOT_CONFIGURED',
          message: err.message || 'Klavis client unavailable',
        },
        success: false,
      };
    }

    try {
      const plugin = await this.pluginModel.findById(identifier);
      if (!plugin) {
        return {
          content: `Klavis server "${identifier}" not found in database`,
          error: { code: 'KLAVIS_SERVER_NOT_FOUND', message: `Server ${identifier} not found` },
          success: false,
        };
      }

      const klavisParams = plugin.customParams?.klavis;
      if (!klavisParams || !klavisParams.serverUrl) {
        return {
          content: `Klavis configuration not found for server "${identifier}"`,
          error: {
            code: 'KLAVIS_CONFIG_NOT_FOUND',
            message: `Klavis configuration missing for ${identifier}`,
          },
          success: false,
        };
      }

      const { serverUrl } = klavisParams;

      log('executeKlavisTool: calling Klavis API with serverUrl=%s', serverUrl);

      const response = await klavisClient.mcpServer.callTools({
        serverUrl,
        toolArgs: args,
        toolName,
      });

      log('executeKlavisTool: response: %O', response);

      if (!response.success || !response.result) {
        return {
          content: response.error || 'Unknown error',
          error: { code: 'KLAVIS_EXECUTION_ERROR', message: response.error || 'Unknown error' },
          success: false,
        };
      }

      const content = response.result.content || [];
      const isError = response.result.isError || false;

      let resultContent = '';
      if (Array.isArray(content)) {
        resultContent = content
          .map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.type === 'text' && item.text) return item.text;
            return JSON.stringify(item);
          })
          .join('\n');
      } else if (typeof content === 'string') {
        resultContent = content;
      } else {
        resultContent = JSON.stringify(content);
      }

      return {
        content: resultContent,
        success: !isError,
      };
    } catch (error) {
      const err = error as Error;
      console.error('KlavisService.executeKlavisTool error %s/%s: %O', identifier, toolName, err);

      return {
        content: err.message,
        error: { code: 'KLAVIS_ERROR', message: err.message },
        success: false,
      };
    }
  }

  /**
   * Fetch Klavis tool manifests from database.
   * Returns [] when no key is configured (legacy "not enabled" path).
   */
  async getKlavisManifests(): Promise<LobeToolManifest[]> {
    if (!this.pluginModel) {
      log('getKlavisManifests: pluginModel not available, returning empty array');
      return [];
    }

    const klavisClient = await tryGetKlavisClientForUser(this.userId, this.db);
    if (!klavisClient) {
      log('getKlavisManifests: no Klavis key configured, returning empty array');
      return [];
    }

    try {
      const allPlugins = await this.pluginModel.query();

      const klavisPlugins = allPlugins.filter(
        (plugin) =>
          VALID_KLAVIS_IDENTIFIERS.has(plugin.identifier) &&
          plugin.customParams?.klavis?.isAuthenticated === true,
      );

      log('getKlavisManifests: found %d authenticated Klavis plugins', klavisPlugins.length);

      const manifests: LobeToolManifest[] = klavisPlugins
        .map((plugin) => {
          if (!plugin.manifest) return null;

          return {
            api: plugin.manifest.api || [],
            author: 'Klavis',
            homepage: 'https://klavis.ai',
            identifier: plugin.identifier,
            meta: plugin.manifest.meta || {
              avatar: '☁️',
              description: `Klavis MCP Server: ${plugin.customParams?.klavis?.serverName}`,
              tags: ['klavis', 'mcp'],
              title: plugin.customParams?.klavis?.serverName || plugin.identifier,
            },
            type: 'builtin',
            version: '1.0.0',
          };
        })
        .filter(Boolean) as LobeToolManifest[];

      log('getKlavisManifests: returning %d manifests', manifests.length);

      return manifests;
    } catch (error) {
      console.error('KlavisService.getKlavisManifests error: %O', error);
      return [];
    }
  }
}
