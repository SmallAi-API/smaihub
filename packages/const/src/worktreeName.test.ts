import { describe, expect, it } from 'vitest';

import {
  formatWorktreeTimestamp,
  generateWorktreeBranchName,
  WORKTREE_ADJECTIVES,
  WORKTREE_BRANCH_PREFIX,
  WORKTREE_NOUNS,
} from './worktreeName';

const NOW = new Date(2026, 9, 2, 3, 8);

const sample = (times = 500) =>
  Array.from({ length: times }, () => generateWorktreeBranchName({ now: NOW }));

/** A deterministic stand-in for `Math.random` that walks `values` and loops. */
const sequence = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('formatWorktreeTimestamp', () => {
  it('zero-pads local Y/M/D/H/m', () => {
    expect(formatWorktreeTimestamp(new Date(2026, 0, 5, 4, 3))).toBe('202601050403');
  });

  it('reads the local clock rather than UTC', () => {
    // A local-constructed Date read back with local getters round-trips exactly,
    // whatever the machine's offset is. `toISOString()` would not.
    expect(formatWorktreeTimestamp(new Date(2026, 9, 2, 3, 8))).toBe('202610020308');
  });
});

describe('generateWorktreeBranchName', () => {
  it('namespaces generated branches under smai/ by default', () => {
    expect(WORKTREE_BRANCH_PREFIX).toBe('smai');
    expect(generateWorktreeBranchName({ now: NOW, random: () => 0 })).toBe(
      `smai/202610020308-${WORKTREE_ADJECTIVES[0]}-${WORKTREE_NOUNS[0]}`,
    );
  });

  it('yields <prefix>/<YYYYMMDDHHmm>-<adjective>-<noun>', () => {
    const shape = new RegExp(`^${WORKTREE_BRANCH_PREFIX}/\\d{12}-[a-z]+-[a-z]+$`);

    for (const name of sample()) {
      expect(name).toMatch(shape);
    }
  });

  it('draws the words from the exported pools', () => {
    const adjectives = new Set<string>(WORKTREE_ADJECTIVES);
    const nouns = new Set<string>(WORKTREE_NOUNS);

    for (const name of sample()) {
      // `smai/202610020308-quiet-hill` → ['smai/202610020308', 'quiet', 'hill']
      const [, adjective, noun] = name.split('-');
      expect(adjectives.has(adjective)).toBe(true);
      expect(nouns.has(noun)).toBe(true);
    }
  });

  it('is deterministic for an injected clock and random source', () => {
    expect(generateWorktreeBranchName({ now: NOW, random: () => 0 })).toBe(
      generateWorktreeBranchName({ now: NOW, random: () => 0 }),
    );
  });

  it('redraws when the drawn name is already taken', () => {
    const taken = generateWorktreeBranchName({ now: NOW, random: () => 0 });

    expect(
      generateWorktreeBranchName({
        exclude: [taken],
        now: NOW,
        random: sequence([0, 0, 0.5, 0.5]),
      }),
    ).not.toBe(taken);
  });

  it('keeps the first draw when nothing it drew is taken', () => {
    expect(
      generateWorktreeBranchName({ exclude: ['smai/202001010000-other-name'], now: NOW }),
    ).toMatch(/^smai\/202610020308-/);
  });

  it('spreads across the pool so repeats are rare', () => {
    expect(new Set(sample(200)).size).toBeGreaterThan(150);
  });

  // Git refuses `refs/heads/smai/x` while a ref `refs/heads/smai` exists, and every
  // namespaced draw shares that segment — so the namespace, not the word pair,
  // is what has to give.
  describe('when a ref occupies the namespace path', () => {
    it('falls back to the flat form instead of handing out a ref git will refuse', () => {
      expect(generateWorktreeBranchName({ exclude: ['smai'], now: NOW, random: () => 0 })).toMatch(
        /^smai-\d{12}-[a-z]+-[a-z]+$/,
      );
    });

    it('ignores the case of the occupying ref, like git refs do', () => {
      expect(generateWorktreeBranchName({ exclude: ['SMAI'], now: NOW, random: () => 0 })).toMatch(
        /^smai-\d{12}-/,
      );
    });

    it('keeps the namespace for taken names that are unrelated', () => {
      expect(
        generateWorktreeBranchName({
          exclude: ['main', 'smai/202001010000-other-name'],
          now: NOW,
        }),
      ).toMatch(/^smai\//);
    });

    it('redraws the flat form when the drawn flat name is taken too', () => {
      const taken = generateWorktreeBranchName({ exclude: ['smai'], now: NOW, random: () => 0 });

      expect(
        generateWorktreeBranchName({
          exclude: ['smai', taken],
          now: NOW,
          random: sequence([0, 0, 0.5, 0.5]),
        }),
      ).not.toBe(taken);
    });
  });
});

describe('worktree name pools', () => {
  const pools = { adjectives: WORKTREE_ADJECTIVES, nouns: WORKTREE_NOUNS };

  it.each(Object.entries(pools))('%s stay lowercase ASCII and unique', (_label, pool) => {
    expect(new Set(pool).size).toBe(pool.length);
    for (const word of pool) expect(word).toMatch(/^[a-z]+$/);
  });
});
