// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import * as modelParseModule from '../../utils/modelParse';
import { LobeSMAIAI, params, type SMAIModelCard, type SMAIPricing } from './index';

// Mock external dependencies
vi.mock('../../utils/modelParse');

vi.spyOn(console, 'error').mockImplementation(() => {});

describe('SMAI Runtime', () => {
  let mockFetch: Mock;
  let mockProcessMultiProviderModelList: Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockProcessMultiProviderModelList = vi.mocked(modelParseModule.processMultiProviderModelList);
    mockProcessMultiProviderModelList.mockImplementation((models) => models);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Params Object - Runtime Configuration', () => {
    it('should export params with correct provider ID', () => {
      expect(params.id).toBe(ModelProvider.SMAI);
    });

    it('should export params with correct defaultHeaders', () => {
      expect(params.defaultHeaders).toEqual({ 'X-Client': 'smai.ai' });
    });

    it('should export params with models and routers functions', () => {
      expect(typeof params.models).toBe('function');
      expect(typeof params.routers).toBe('function');
    });
  });

  describe('Models Function - pricing enrichment', () => {
    const buildClient = () => ({
      apiKey: 'test-key',
      baseURL: 'https://api.smai.ai/v1',
      models: {
        list: vi.fn().mockResolvedValue({
          data: [{ created: 123, id: 'test-model', object: 'model', owned_by: 'openai' }],
        }),
      },
    });

    it('should fetch upstream pricing directly on the server with auth header', async () => {
      const mockClient = buildClient();

      mockFetch.mockResolvedValue({
        json: async () => ({
          data: [
            {
              completion_ratio: 1.5,
              enable_groups: ['default'],
              model_name: 'test-model',
              model_price: 10,
              quota_type: 0,
            },
          ],
          success: true,
        }),
        ok: true,
      });

      const result = await params.models({ client: mockClient as any });

      expect(mockFetch).toHaveBeenCalledWith('https://api.smai.ai/api/pricing', {
        headers: {
          Accept: 'application/json; charset=utf-8',
          Authorization: 'Bearer test-key',
        },
      });
      expect(result[0].pricing).toEqual({
        units: [
          { name: 'textInput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
          { name: 'textOutput', rate: 30, strategy: 'fixed', unit: 'millionTokens' },
        ],
      });
    });

    it('should fallback to no-auth fetch when the auth request is not ok', async () => {
      const mockClient = buildClient();

      mockFetch
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ json: async () => ({ data: [], success: true }), ok: true });

      await params.models({ client: mockClient as any });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(2, 'https://api.smai.ai/api/pricing', {
        headers: { Accept: 'application/json; charset=utf-8' },
      });
    });

    it('should use the dedicated proxy route when running in browser', async () => {
      const originalWindow = global.window;
      const originalDocument = global.document;
      global.window = {} as any;
      global.document = {} as any;

      try {
        const mockClient = buildClient();

        mockFetch.mockResolvedValue({
          json: async () => ({
            data: [
              {
                enable_groups: ['default'],
                model_name: 'test-model',
                model_price: 10,
                quota_type: 0,
              },
            ],
            success: true,
          }),
          ok: true,
        });

        const result = await params.models({ client: mockClient as any });

        expect(mockFetch).toHaveBeenCalledWith('/webapi/models/smai/pricing');
        expect(result[0].pricing).toBeDefined();
      } finally {
        global.window = originalWindow;
        global.document = originalDocument;
      }
    });

    it('should route the proxy by the resolved providerId from options in browser', async () => {
      const originalWindow = global.window;
      const originalDocument = global.document;
      global.window = {} as any;
      global.document = {} as any;

      try {
        const mockClient = buildClient();

        mockFetch.mockResolvedValue({
          json: async () => ({ data: [], success: true }),
          ok: true,
        });

        await params.models({
          client: mockClient as any,
          options: { providerId: 'custom-router' },
        });

        expect(mockFetch).toHaveBeenCalledWith('/webapi/models/custom-router/pricing');
      } finally {
        global.window = originalWindow;
        global.document = originalDocument;
      }
    });

    it('should leave pricing undefined when the fetch fails', async () => {
      const mockClient = buildClient();
      mockFetch.mockResolvedValue({ ok: false });

      const result = await params.models({ client: mockClient as any });

      expect(result[0].pricing).toBeUndefined();
    });

    it('should add models that only appear in the pricing list', async () => {
      const mockClient = {
        apiKey: 'test-key',
        baseURL: 'https://api.smai.ai/v1',
        models: { list: vi.fn().mockResolvedValue({ data: [] }) },
      };

      mockFetch.mockResolvedValue({
        json: async () => ({
          data: [
            {
              enable_groups: ['default'],
              model_name: 'pricing-only-model',
              model_price: 15,
              quota_type: 0,
            },
          ],
          success: true,
        }),
        ok: true,
      });

      const result = await params.models({ client: mockClient as any });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('pricing-only-model');
      expect(mockProcessMultiProviderModelList).toHaveBeenCalledWith(expect.any(Array), 'smai');
    });
  });

  describe('Type definitions', () => {
    it('should satisfy SMAIModelCard and SMAIPricing shapes', () => {
      const model: SMAIModelCard = {
        created: 1,
        id: 'm',
        object: 'model',
        owned_by: 'openai',
      };
      const pricing: SMAIPricing = {
        enable_groups: ['default'],
        model_name: 'm',
        quota_type: 0,
      };

      expect(model.id).toBe('m');
      expect(pricing.quota_type).toBe(0);
    });
  });

  describe('Runtime instance', () => {
    it('should create an instance with minimal options', () => {
      const instance = new LobeSMAIAI({ apiKey: 'test-key' });
      expect(instance).toBeInstanceOf(LobeSMAIAI);
    });
  });
});
