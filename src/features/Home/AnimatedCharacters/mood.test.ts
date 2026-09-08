import { describe, expect, it } from 'vitest';

import { resolveCharacterMood, TRANSIENT_MOOD_DURATION } from './mood';

describe('resolveCharacterMood', () => {
  it('breathes when nothing is happening', () => {
    expect(resolveCharacterMood({ isDrafting: false, isSending: false })).toBe('idle');
  });

  it('listens while a draft sits in the composer', () => {
    expect(resolveCharacterMood({ isDrafting: true, isSending: false })).toBe('listen');
  });

  it('works once the draft is on the wire, even though the text is still there', () => {
    expect(resolveCharacterMood({ isDrafting: true, isSending: true })).toBe('think');
  });

  it('lets a model switch interrupt a draft rather than going unacknowledged', () => {
    expect(resolveCharacterMood({ isDrafting: true, isSending: false, transient: 'delight' })).toBe(
      'delight',
    );
  });

  it('lets an agent switch interrupt a send in flight', () => {
    expect(resolveCharacterMood({ isDrafting: true, isSending: true, transient: 'curious' })).toBe(
      'curious',
    );
  });

  it('gives every transient a finite run so the standing mood always resumes', () => {
    for (const duration of Object.values(TRANSIENT_MOOD_DURATION)) {
      expect(duration).toBeGreaterThan(0);
      expect(Number.isFinite(duration)).toBe(true);
    }
  });
});
