import { describe, expect, it } from 'vitest';

import { isDirectorySettling } from './loading';

describe('isDirectorySettling', () => {
  it.each([
    { lookup: { isInitialLoading: true }, settling: true },
    { lookup: { isInitialLoading: false }, settling: false },
    { lookup: { isInitialLoading: true, error: new Error('boom') }, settling: false },
  ])('supports a directory with only one connection lookup: %j', ({ lookup, settling }) => {
    expect(isDirectorySettling([lookup])).toBe(settling);
  });

  it('waits while any lookup is still loading', () => {
    expect(isDirectorySettling([{ isInitialLoading: false }, { isInitialLoading: true }])).toBe(
      true,
    );
  });

  it('settles once every lookup has data', () => {
    expect(isDirectorySettling([{ isInitialLoading: false }, { isInitialLoading: false }])).toBe(
      false,
    );
  });

  it('treats a failed lookup as settled so the directory still renders', () => {
    expect(
      isDirectorySettling([
        { error: new Error('boom'), isInitialLoading: true },
        { isInitialLoading: false },
      ]),
    ).toBe(false);
  });
});
