import { createLogger } from '@/utils/logger';

import { type McpSchema } from '../types/protocol';
import { ControllerModule, createProtocolHandler } from '.';

const logger = createLogger('controllers:McpInstallCtr');

const protocolHandler = createProtocolHandler('plugin');

/**
 * Validate MCP Schema object structure
 */
function validateMcpSchema(schema: any): schema is McpSchema {
  if (!schema || typeof schema !== 'object') return false;

  // Required field validation
  if (typeof schema.identifier !== 'string' || !schema.identifier) return false;
  if (typeof schema.name !== 'string' || !schema.name) return false;
  if (typeof schema.author !== 'string' || !schema.author) return false;
  if (typeof schema.description !== 'string' || !schema.description) return false;
  if (typeof schema.version !== 'string' || !schema.version) return false;

  // Optional field validation
  if (schema.homepage !== undefined && typeof schema.homepage !== 'string') return false;
  if (schema.icon !== undefined && typeof schema.icon !== 'string') return false;

  // config field validation
  if (!schema.config || typeof schema.config !== 'object') return false;
  const config = schema.config;

  if (config.type === 'stdio') {
    if (typeof config.command !== 'string' || !config.command) return false;
    if (config.args !== undefined && !Array.isArray(config.args)) return false;
    if (config.env !== undefined && typeof config.env !== 'object') return false;
  } else if (config.type === 'http') {
    if (typeof config.url !== 'string' || !config.url) return false;
    try {
      new URL(config.url); // Validate URL format
    } catch {
      return false;
    }
    if (config.headers !== undefined && typeof config.headers !== 'object') return false;
  } else {
    return false; // Unknown config type
  }

  return true;
}

interface McpInstallParams {
  id: string;
  marketId?: string;
  schema?: any;
}

/**
 * MCP plugin installation controller
 * Responsible for handling MCP plugin installation process
 */
export default class McpInstallController extends ControllerModule {
  /**
   * 处理 MCP 插件安装请求
   * @param parsedData 解析后的协议数据
   * @returns 是否处理成功
   */
  @protocolHandler('install')
  public async handleInstallRequest(parsedData: McpInstallParams): Promise<boolean> {
    try {
      // 从参数中提取必需字段
      const { id, schema: schemaParam, marketId } = parsedData;

      if (!id) {
        logger.warn(`🔧 [McpInstall] Missing required MCP parameters:`, {
          id: !!id,
        });
        return false;
      }

      // 映射协议来源

      const isOfficialMarket = marketId === 'lobehub';

      // 对于官方市场，schema 是可选的；对于第三方市场，schema 是必需的
      if (!isOfficialMarket && !schemaParam) {
        logger.warn(`🔧 [McpInstall] Schema is required for third-party marketplace:`, {
          marketId,
        });
        return false;
      }

      let mcpSchema: McpSchema | undefined;

      // 如果提供了 schema 参数，则解析和验证
      if (schemaParam) {
        try {
          mcpSchema = JSON.parse(schemaParam);
        } catch (error) {
          logger.error(`🔧 [McpInstall] Failed to parse MCP schema:`, error);
          return false;
        }

        if (!validateMcpSchema(mcpSchema)) {
          logger.error(`🔧 [McpInstall] Invalid MCP Schema structure`);
          return false;
        }

        // 验证 identifier 与 id 参数匹配
        if (mcpSchema.identifier !== id) {
          logger.error(`🔧 [McpInstall] Schema identifier does not match URL id parameter:`, {
            schemaId: mcpSchema.identifier,
            urlId: id,
          });
          return false;
        }
      }

      logger.debug(`🔧 [McpInstall] MCP install request validated:`, {
        hasSchema: !!mcpSchema,
        marketId,
        pluginId: id,
        pluginName: mcpSchema?.name || 'Unknown',
        pluginVersion: mcpSchema?.version || 'Unknown',
      });

      // 广播安装请求到前端
      const installRequest = {
        marketId,
        pluginId: id,
        schema: mcpSchema,
      };

      logger.debug(`🔧 [McpInstall] Broadcasting install request:`, {
        hasSchema: !!installRequest.schema,
        marketId: installRequest.marketId,
        pluginId: installRequest.pluginId,
        pluginName: installRequest.schema?.name || 'Unknown',
      });

      // 通过应用实例广播到前端
      if (this.app?.browserManager) {
        this.app.browserManager.broadcastToWindow('app', 'mcpInstallRequest', installRequest);
        logger.debug(`🔧 [McpInstall] Install request broadcasted successfully`);
        return true;
      } else {
        logger.error(`🔧 [McpInstall] App or browserManager not available`);
        return false;
      }
    } catch (error) {
      logger.error(`🔧 [McpInstall] Error processing install request:`, error);
      return false;
    }
  }
}
