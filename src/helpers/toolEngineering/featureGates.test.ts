import { ImageGenerationManifest } from '@lobechat/builtin-tool-image-generation';
import { VideoGenerationManifest } from '@lobechat/builtin-tool-video-generation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAgentToolsEngine, createToolsEngine } from './index';

const mocks = vi.hoisted(() => ({
  enabled: false,
  mode: 'agent' as 'agent' | 'chat' | 'custom',
}));
vi.mock('@/store/serverConfig', () => ({
  getServerConfigStoreState: () => ({
    featureFlags: { enableVideoGenerationSkill: mocks.enabled },
    serverConfig: {},
  }),
}));
vi.mock('@/store/tool', () => ({
  getToolStoreState: () => ({
    builtinTools: [VideoGenerationManifest, ImageGenerationManifest].map((manifest) => ({
      identifier: manifest.identifier,
      manifest,
      type: 'builtin',
    })),
    installedPlugins: [],
    connectors: [],
  }),
}));
vi.mock('@/store/tool/selectors', () => ({
  pluginSelectors: {
    installedPluginManifestList: () => [],
    getInstalledPluginById: () => () => undefined,
  },
  composioStoreSelectors: { composioAsLobeTools: () => [] },
  lobehubSkillStoreSelectors: { lobehubSkillAsLobeTools: () => [] },
}));
vi.mock('@/store/tool/slices/connector', () => ({
  connectorSelectors: { connectorList: () => [], customConnectors: () => [] },
}));
vi.mock('@/store/agent', () => ({ getAgentStoreState: () => ({ activeAgentId: 'agent-1' }) }));
vi.mock('@/store/agent/selectors', () => ({
  agentSelectors: {
    currentAgentPlugins: () => [
      VideoGenerationManifest.identifier,
      ImageGenerationManifest.identifier,
    ],
    currentAgentDisabledPlugins: () => [],
    hasEnabledKnowledgeBases: () => false,
  },
  agentChatConfigSelectors: { currentChatConfig: () => ({ toolMode: mocks.mode }) },
  chatConfigByIdSelectors: { getExecutionTargetById: () => () => 'none' },
}));
vi.mock('@/store/aiInfra', () => ({
  getAiInfraStoreState: () => ({}),
  aiModelSelectors: { isModelSupportImageOutput: () => () => false },
}));
vi.mock('@/store/user', () => ({ useUserStore: { getState: () => ({}) } }));
vi.mock('@/store/user/selectors', () => ({ settingsSelectors: { memoryEnabled: () => false } }));
vi.mock('../isCanUseFC', () => ({ isCanUseFC: () => true }));
vi.mock('../getSearchConfig', () => ({
  getSearchConfig: () => ({ useApplicationBuiltinSearchTool: false }),
}));

const model = { model: 'gpt-4', provider: 'openai' };
const toolIds = [VideoGenerationManifest.identifier, ImageGenerationManifest.identifier];

describe('video skill model tool pool', () => {
  beforeEach(() => {
    mocks.enabled = false;
    mocks.mode = 'agent';
  });

  it.each(['agent', 'chat', 'custom'] as const)(
    'excludes old pins and explicit activation in %s mode',
    (mode) => {
      mocks.mode = mode;
      const disabled = createAgentToolsEngine(model).generateToolsDetailed({ ...model, toolIds });
      expect(disabled.enabledToolIds).not.toContain(VideoGenerationManifest.identifier);
      expect(disabled.enabledToolIds).toContain(ImageGenerationManifest.identifier);
      mocks.enabled = true;
      const enabled = createAgentToolsEngine(model).generateToolsDetailed({ ...model, toolIds });
      expect(enabled.enabledToolIds).toContain(VideoGenerationManifest.identifier);
    },
  );

  it('excludes video even from a direct tools engine and supplied manifests', () => {
    const engine = createToolsEngine({ additionalManifests: [VideoGenerationManifest] });
    expect(engine.generateToolsDetailed({ ...model, toolIds }).enabledToolIds).not.toContain(
      VideoGenerationManifest.identifier,
    );
    mocks.enabled = true;
    expect(
      createToolsEngine().generateToolsDetailed({ ...model, toolIds }).enabledToolIds,
    ).toContain(VideoGenerationManifest.identifier);
  });
});
