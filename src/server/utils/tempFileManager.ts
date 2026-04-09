import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

/**
 * 安全存储临时文件工具类
 */
export class TempFileManager {
  private readonly tempDir: string;
  private filePaths: Set<string> = new Set();

  constructor(dirname: string) {
    // 创建唯一临时目录 (跨平台安全)
    this.tempDir = mkdtempSync(join(tmpdir(), dirname));
    // 注册退出清理钩子
    this.registerCleanupHook();
  }

  /**
   * 将 Uint8Array 写入临时文件

   */
  async writeTempFile(data: Uint8Array, name: string): Promise<string> {
    // Sanitize filename to prevent path traversal (GHSA-2g9j-v25c-4j97)
    const safeName = basename(name);
    const filePath = resolve(this.tempDir, safeName);

    try {
      writeFileSync(filePath, data);
      this.filePaths.add(filePath);
      return filePath;
    } catch (error) {
      this.cleanup(); // Immediately cleanup on write failure
      throw new Error(`Failed to write temp file: ${(error as Error).message}`, { cause: error });
    }
  }

  /**
   * 安全清理临时资源
   */
  cleanup(): void {
    if (existsSync(this.tempDir)) {
      // 递归删除目录及内容
      rmSync(this.tempDir, { force: true, recursive: true });
      this.filePaths.clear();
    }
  }

  /**
   * 注册进程退出/异常时的自动清理
   */
  private registerCleanupHook(): void {
    // 正常退出
    process.on('exit', () => this.cleanup());
    // 异常退出
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception, cleaning temp files:', err);
      this.cleanup();
      process.exit(1);
    });
    // 信号终止
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        this.cleanup();
        process.exit(0);
      });
    });
  }
}
