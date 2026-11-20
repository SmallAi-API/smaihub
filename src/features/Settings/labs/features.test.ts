import { describe, expect, it } from 'vitest';

import { filterAvailableLabFeatures, LAB_FEATURES, type LabFeatureItem } from './features';

const features: LabFeatureItem[] = [
  { flag: 'enableEvalCapture', i18nKey: 'evalCapture', searchKeywords: [], stage: 'beta' },
  {
    businessOnly: true,
    flag: 'enableTopicBugReport',
    i18nKey: 'topicBugReport',
    searchKeywords: [],
    stage: 'alpha',
  },
];

describe('filterAvailableLabFeatures', () => {
  it('omits persistent sandboxes from the visible and searchable experiments', () => {
    expect(LAB_FEATURES.map(({ flag }) => flag)).not.toContain('enablePersistentSandbox');
  });

  it('hides business-only experiments when business features are off', () => {
    expect(filterAvailableLabFeatures(features, false).map(({ flag }) => flag)).toEqual([
      'enableEvalCapture',
    ]);
  });

  it('offers business-only experiments when business features are on', () => {
    expect(filterAvailableLabFeatures(features, true).map(({ flag }) => flag)).toEqual([
      'enableEvalCapture',
      'enableTopicBugReport',
    ]);
  });
});
