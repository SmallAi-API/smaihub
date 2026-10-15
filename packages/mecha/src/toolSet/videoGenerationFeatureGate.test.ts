import { VideoGenerationManifest } from '@lobechat/builtin-tool-video-generation';
import { getFeatureDisabledToolIds } from '@lobechat/builtin-tools/featureGates';
import type { LobeToolManifest } from '@lobechat/context-engine';
import { describe, expect, it } from 'vitest';

import { resolveDiscoveryPool } from './discoveryPool';
import { assembleManifestPool } from './manifestPool';
import { resolveToolRules } from './resolveToolRules';

const identifier = VideoGenerationManifest.identifier;
const tool = { identifier, manifest: VideoGenerationManifest, type: 'builtin' as const };

describe('server-shared video skill pool gate', () => {
  it.each(['agent', 'chat', 'custom'] as const)(
    'removes video from every ingest source in %s mode',
    (toolMode) => {
      const disabledPluginIds = getFeatureDisabledToolIds({ enableVideoGenerationSkill: false });
      const rules = resolveToolRules({
        agent: { chatConfig: { toolMode }, plugins: [identifier] },
        disabledPluginIds,
        executionTarget: 'none',
        localExecutionReady: false,
        model: { canUseFC: true },
        runtimePluginIds: [identifier],
      });
      const pool = assembleManifestPool(
        { builtinTools: [tool], additional: [VideoGenerationManifest] },
        { excludedIdentifiers: rules.excludedIdentifiers },
      );
      expect(pool.manifests).toEqual([]);
      const discovery = resolveDiscoveryPool({
        builtinTools: [tool],
        disabledPluginIds,
        executionTarget: 'none',
        enabledManifests: new Map([[identifier, VideoGenerationManifest as LobeToolManifest]]),
        installedManifests: [VideoGenerationManifest as LobeToolManifest],
      });
      expect(discovery.manifestMap[identifier]).toBeUndefined();
      // An already-assembled run's manifest is filtered too, preserving resume safety.
      expect(rules.excludedIdentifiers.has(identifier)).toBe(true);
    },
  );

  it('retains the implementation and restores both pools when enabled', () => {
    const disabledPluginIds = getFeatureDisabledToolIds({ enableVideoGenerationSkill: true });
    const pool = assembleManifestPool(
      { builtinTools: [tool] },
      { excludedIdentifiers: disabledPluginIds },
    );
    expect(pool.manifests.map((m) => m.identifier)).toContain(identifier);
    const discovery = resolveDiscoveryPool({
      builtinTools: [tool],
      disabledPluginIds,
      executionTarget: 'none',
      enabledManifests: new Map(),
    });
    expect(discovery.manifestMap[identifier]).toBeDefined();
  });
});
