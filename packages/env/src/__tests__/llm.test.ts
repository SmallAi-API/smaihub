// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('getLLMConfig', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('SMAI', () => {
    it('should read SMAI_PROXY_URL, matching the {PROVIDER}_PROXY_URL convention used by the runtime', async () => {
      vi.stubEnv('SMAI_PROXY_URL', 'https://smai-proxy.example.com/v1');

      const { getLLMConfig } = await import('../llm');
      const config = getLLMConfig();

      expect(config.SMAI_PROXY_URL).toBe('https://smai-proxy.example.com/v1');
    });

    it('should leave SMAI_PROXY_URL undefined when it is not set', async () => {
      vi.stubEnv('SMAI_PROXY_URL', undefined);

      const { getLLMConfig } = await import('../llm');
      const config = getLLMConfig();

      expect(config.SMAI_PROXY_URL).toBeUndefined();
    });
  });
});
