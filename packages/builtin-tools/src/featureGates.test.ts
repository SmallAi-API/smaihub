import { DashboardIdentifier, LegacyDashboardIdentifier } from '@lobechat/builtin-tool-dashboard';
import { VideoGenerationIdentifier } from '@lobechat/builtin-tool-video-generation';
import { describe, expect, it } from 'vitest';

import { getFeatureDisabledToolIds, isToolEnabledByFeatureFlags } from './featureGates';

describe('feature-gated builtin tools', () => {
  it.each([undefined, {}, { enableVideoGenerationSkill: false }])(
    'excludes the video skill when its flag is not true: %j',
    (flags) => {
      expect(getFeatureDisabledToolIds(flags)).toContain(VideoGenerationIdentifier);
      expect(isToolEnabledByFeatureFlags(VideoGenerationIdentifier, flags)).toBe(false);
    },
  );

  it('restores the video skill when explicitly enabled', () => {
    const flags = { enableVideoGenerationSkill: true };
    expect(getFeatureDisabledToolIds(flags)).not.toContain(VideoGenerationIdentifier);
    expect(isToolEnabledByFeatureFlags(VideoGenerationIdentifier, flags)).toBe(true);
    expect(isToolEnabledByFeatureFlags('lobe-image-generation', flags)).toBe(true);
  });

  it('drops the dashboard tool unless the dashboard flag is on', () => {
    expect(getFeatureDisabledToolIds(undefined)).toContain(DashboardIdentifier);
    expect(getFeatureDisabledToolIds(undefined)).toContain(LegacyDashboardIdentifier);
    expect(getFeatureDisabledToolIds({ enableDashboard: false })).toContain(DashboardIdentifier);
    expect(getFeatureDisabledToolIds({ enableDashboard: true })).not.toContain(DashboardIdentifier);
    expect(getFeatureDisabledToolIds({ enableDashboard: true })).not.toContain(
      LegacyDashboardIdentifier,
    );
  });

  it('only gates tools that declare a flag', () => {
    expect(isToolEnabledByFeatureFlags(DashboardIdentifier, {})).toBe(false);
    expect(isToolEnabledByFeatureFlags(DashboardIdentifier, { enableDashboard: true })).toBe(true);
    expect(isToolEnabledByFeatureFlags('lobe-web-browsing', {})).toBe(true);
  });
});
