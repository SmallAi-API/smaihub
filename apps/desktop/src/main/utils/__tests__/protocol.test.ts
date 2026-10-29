import { app } from 'electron';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { McpSchema } from '../../types/protocol';
import {
  generateRFCProtocolUrl,
  getProtocolScheme,
  getVersionInfo,
  parseProtocolUrl,
} from '../protocol';

const desktopEnv = vi.hoisted(() => ({
  DESKTOP_PROTOCOL_SCHEME: undefined as string | undefined,
  UPDATE_CHANNEL: undefined as string | undefined,
}));

vi.mock('@/env', () => ({ getDesktopEnv: () => desktopEnv }));
vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/mock/smai.ai'), name: 'smai.ai' },
}));

beforeEach(() => {
  app.name = 'smai.ai';
});

afterEach(() => {
  desktopEnv.DESKTOP_PROTOCOL_SCHEME = undefined;
  desktopEnv.UPDATE_CHANNEL = undefined;
});

describe('Protocol', () => {
  describe('smai channel identity', () => {
    it.each([
      [undefined, 'smai'],
      ['stable', 'smai'],
      ['beta', 'smai-beta'],
      ['nightly', 'smai-nightly'],
      ['canary', 'smai-canary'],
    ])('uses %s build channel to select %s', (channel, scheme) => {
      desktopEnv.UPDATE_CHANNEL = channel;
      expect(getProtocolScheme()).toBe(scheme);
    });

    it.each([
      ['smai.ai-Beta', 'smai-beta'],
      ['smai.ai-Nightly', 'smai-nightly'],
      ['smai-desktop-dev', 'smai-dev'],
    ])('recognizes the channel from %s when no build channel is set', (name, scheme) => {
      app.name = name;
      expect(getProtocolScheme()).toBe(scheme);
    });

    it('reports the canary channel even though it shares the stable product name', () => {
      desktopEnv.UPDATE_CHANNEL = 'canary';
      expect(getVersionInfo()).toEqual({ channel: 'canary', protocolScheme: 'smai-canary' });
    });

    it.each(['smai', 'smai-dev', 'smai-beta', 'smai-nightly', 'smai-canary'])(
      'accepts %s deep links without an override',
      (scheme) => {
        expect(parseProtocolUrl(`${scheme}://plugin/install?id=figma`)).toMatchObject({
          action: 'install',
          params: { id: 'figma' },
          urlType: 'plugin',
        });
      },
    );
  });

  describe('generateRFCProtocolUrl', () => {
    it.each([
      ['beta', undefined, 'smai-beta'],
      ['canary', undefined, 'smai-canary'],
      ['nightly', 'acme', 'acme'],
    ])('generates a link for channel %s and override %s', (channel, override, scheme) => {
      desktopEnv.UPDATE_CHANNEL = channel;
      desktopEnv.DESKTOP_PROTOCOL_SCHEME = override;
      const url = generateRFCProtocolUrl({
        id: 'test',
        schema: {
          author: 'Test',
          config: { command: 'test', type: 'stdio' },
          description: 'Test',
          identifier: 'test',
          name: 'Test',
          version: '1.0.0',
        },
      });

      expect(new URL(url).protocol).toBe(`${scheme}:`);
      expect(parseProtocolUrl(url)?.params.id).toBe('test');
    });

    it('should generate valid RFC protocol URL for stdio type', () => {
      const schema: McpSchema = {
        identifier: 'edgeone-mcp',
        name: 'EdgeOne MCP',
        author: 'Higress Team',
        description: 'EdgeOne API integration for LobeChat',
        version: '1.0.0',
        homepage: 'https://github.com/higress/edgeone-mcp',
        config: {
          type: 'stdio',
          command: 'npx',
          args: ['-y', '@higress/edgeone-mcp'],
          env: { NODE_ENV: 'production' },
        },
      };

      const url = generateRFCProtocolUrl({
        id: 'edgeone-mcp',
        schema,
        marketId: 'higress',
      });

      expect(url).toMatch(/^smai:\/\/plugin\/install\?/);
      expect(url).toContain('id=edgeone-mcp');
      expect(url).toContain('marketId=higress');

      // Verify schema is URL encoded
      const urlObj = new URL(url);
      const schemaParam = urlObj.searchParams.get('schema');
      expect(schemaParam).toBeTruthy();
      // URLSearchParams.get() 自动解码，所以这里得到的是解码后的JSON
      expect(schemaParam).toContain('"'); // 解码后的引号
    });

    it('should generate valid RFC protocol URL for http type', () => {
      const schema: McpSchema = {
        identifier: 'awesome-api',
        name: 'Awesome API',
        author: 'Smithery',
        description: 'Awesome API integration',
        version: '2.0.0',
        config: {
          type: 'http',
          url: 'https://api.smithery.ai/v1/mcp',
          headers: {
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'value',
          },
        },
      };

      const url = generateRFCProtocolUrl({
        id: 'awesome-api',
        schema,
        marketId: 'smithery',
      });

      expect(url).toMatch(/^smai:\/\/plugin\/install\?/);
      expect(url).toContain('id=awesome-api');
      expect(url).toContain('marketId=smithery');
    });

    it('should throw error if schema identifier does not match id', () => {
      const schema: McpSchema = {
        identifier: 'wrong-id',
        name: 'Test',
        author: 'Test',
        description: 'Test',
        version: '1.0.0',
        config: { type: 'stdio', command: 'test' },
      };

      expect(() => generateRFCProtocolUrl({ id: 'different-id', schema })).toThrowError(
        'Schema identifier must match the id parameter',
      );
    });
  });

  describe('parseProtocolUrl', () => {
    it('should parse RFC protocol URL correctly', () => {
      const schema: McpSchema = {
        identifier: 'test-mcp',
        name: 'Test MCP',
        author: 'Test Author',
        description: 'Test Description',
        version: '1.0.0',
        config: {
          type: 'stdio',
          command: 'test',
          args: ['arg1', 'arg2'],
        },
      };

      const url = generateRFCProtocolUrl({
        id: 'test-mcp',
        schema,
        marketId: 'lobehub',
      });

      const parsed = parseProtocolUrl(url);

      expect(parsed).toBeTruthy();
      expect(parsed?.urlType).toBe('plugin');
      expect(parsed?.action).toBe('install');
      expect(parsed?.params.type).toBe('mcp');
      expect(parsed?.params.id).toBe('test-mcp');
      expect(parsed?.params.marketId).toBe('lobehub');
      expect(parsed?.originalUrl).toBe(url);

      // 验证 schema 可以被解析
      const parsedSchema = JSON.parse(parsed?.params.schema || '{}');
      expect(parsedSchema).toEqual(schema);
    });

    it('should return null for invalid protocol', () => {
      const result = parseProtocolUrl('http://example.com');
      expect(result).toBeNull();
    });

    it('should parse URLs with any action', () => {
      const result = parseProtocolUrl('smai://plugin/configure?id=test');
      expect(result).toBeTruthy();
      expect(result?.urlType).toBe('plugin');
      expect(result?.action).toBe('configure');
      expect(result?.params.id).toBe('test');
    });

    it('should parse URLs with any query parameters', () => {
      const result = parseProtocolUrl('smai://plugin/install?custom=value&another=param');
      expect(result).toBeTruthy();
      expect(result?.urlType).toBe('plugin');
      expect(result?.action).toBe('install');
      expect(result?.params.custom).toBe('value');
      expect(result?.params.another).toBe('param');
    });

    it('should handle URLs without query parameters', () => {
      const result = parseProtocolUrl('smai://plugin/install');
      expect(result).toBeTruthy();
      expect(result?.urlType).toBe('plugin');
      expect(result?.action).toBe('install');
      expect(Object.keys(result?.params || {})).toHaveLength(0);
    });

    it('should return null for URLs without action', () => {
      const result = parseProtocolUrl('smai://plugin/');
      expect(result).toBeNull();
    });
  });

  describe('URL encoding/decoding', () => {
    it('should handle special characters correctly', () => {
      const schema: McpSchema = {
        identifier: 'special-chars',
        name: '特殊字符 ñ 🚀',
        author: 'Test <test@example.com>',
        description: 'Description with "quotes" and \'apostrophes\'',
        version: '1.0.0',
        config: {
          type: 'stdio',
          command: 'cmd',
          args: ['arg with spaces', 'arg/with/slashes'],
        },
      };

      const url = generateRFCProtocolUrl({ id: 'special-chars', schema });
      const parsed = parseProtocolUrl(url);

      expect(parsed).toBeTruthy();
      expect(parsed?.params.id).toBe('special-chars');
      expect(parsed?.params.type).toBe('mcp');

      // 验证 schema 可以正确解析
      const parsedSchema = JSON.parse(parsed?.params.schema || '{}');
      expect(parsedSchema).toEqual(schema);
    });

    it('should handle different protocol schemes', () => {
      const testCases = [
        'smai://plugin/install?test=value',
        'smai-dev://plugin/install?test=value',
        'smai-beta://plugin/install?test=value',
        'smai-nightly://plugin/install?test=value',
        'smai-canary://plugin/install?test=value',
      ];

      testCases.forEach((url) => {
        const parsed = parseProtocolUrl(url);
        expect(parsed).toBeTruthy();
        expect(parsed?.urlType).toBe('plugin');
        expect(parsed?.action).toBe('install');
        expect(parsed?.params.test).toBe('value');
        expect(parsed?.originalUrl).toBe(url);
      });
    });
  });

  describe('distribution scheme override', () => {
    it('uses the configured scheme instead of the channel heuristics', () => {
      desktopEnv.DESKTOP_PROTOCOL_SCHEME = 'acme';

      expect(getProtocolScheme()).toBe('acme');
    });

    it('accepts deep links on the configured scheme', () => {
      desktopEnv.DESKTOP_PROTOCOL_SCHEME = 'acme';

      expect(parseProtocolUrl('acme://plugin/install?id=figma')).toMatchObject({
        action: 'install',
        urlType: 'plugin',
      });
    });

    it('matches a mixed-case override against the lowercased scheme URL parsing yields', () => {
      desktopEnv.DESKTOP_PROTOCOL_SCHEME = 'Acme';

      expect(getProtocolScheme()).toBe('acme');
      expect(parseProtocolUrl('Acme://plugin/install?id=figma')).toMatchObject({
        action: 'install',
        urlType: 'plugin',
      });
    });

    it('still rejects schemes that are neither smai nor configured', () => {
      expect(parseProtocolUrl('acme://plugin/install?id=figma')).toBeNull();
      expect(parseProtocolUrl('lobehub://plugin/install?id=figma')).toBeNull();
    });
  });
});
