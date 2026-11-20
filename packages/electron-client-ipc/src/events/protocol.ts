import { type McpInstallSchema } from '../types';

/**
 * 协议安装相关的 Broadcast 事件（主进程 -> 渲染进程）
 */
export interface ProtocolBroadcastEvents {
  /**
   * MCP 插件安装请求事件
   * 主进程解析协议 URL 后发送给前端
   */
  mcpInstallRequest: (data: {
    /** 市场来源ID */
    marketId?: string;
    /** 插件ID */
    pluginId: string;
    /** MCP Schema 对象 */
    schema: McpInstallSchema;
  }) => void;

  /**
   * A shell launch asked the app to open a directory (`lh app .`, `LobeHub
   * ~/Code/app`, Finder's "Open With", `lobehub://open/path?path=…`).
   *
   * Only the canonical path travels: the renderer decides what "open" means
   * (reveal the latest conversation bound to it, or start one), because that
   * decision needs the user's project and topic data, which only it can read.
   */
  openDirectory: (data: {
    /**
     * Focus a new window instead of the conversation already bound to this
     * directory. `lh app --new-window` sets it.
     */
    newWindow: boolean;
    /** Absolute, symlink-resolved directory path. */
    path: string;
  }) => void;
}
