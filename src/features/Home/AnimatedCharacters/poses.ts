import type { CharacterMood } from './mood';

/** Declaration order is paint order; `order` is left-to-right on screen. */
export type CharacterName = 'purple' | 'black' | 'orange' | 'yellow';

/**
 * Left-to-right, so a staggered animation reads as one wave crossing the group
 * rather than four characters moving in paint order.
 */
const WAVE_ORDER: Record<CharacterName, number> = { black: 2, orange: 0, purple: 1, yellow: 3 };

/**
 * Per-mood animation timing. Durations are the loop or the one-shot's length;
 * `stagger` is how far apart neighbours start.
 */
const MOOD_TIMING: Record<CharacterMood, { duration: number; stagger: number }> = {
  curious: { duration: 1100, stagger: 90 },
  delight: { duration: 900, stagger: 80 },
  // A loop this long never lines up with the others, so no two characters
  // breathe in sync for long enough to look mechanical.
  idle: { duration: 3400, stagger: 400 },
  listen: { duration: 1600, stagger: 120 },
  think: { duration: 1200, stagger: 150 },
};

/**
 * Idle staggers by lengthening the loop rather than delaying it: a delay on a
 * breath just holds the group still, whereas four different periods drift apart
 * and never resynchronise.
 */
export const getMoodTiming = (mood: CharacterMood, name: CharacterName) => {
  const { duration, stagger } = MOOD_TIMING[mood];
  const step = WAVE_ORDER[name];

  return mood === 'idle'
    ? { animationDuration: `${duration + step * stagger}ms` }
    : { animationDelay: `${step * stagger}ms`, animationDuration: `${duration}ms` };
};

/**
 * Where a character stands, in the artwork's coordinates.
 *
 * Only `listen` restages the group — the other moods express themselves through
 * keyframes on the inner layer, so their poses stay neutral and the two systems
 * never describe the same thing twice.
 */
export interface CharacterPose {
  /** Added to the pointer-driven lean. */
  skew: number;
  translateX: number;
}

const NEUTRAL: CharacterPose = { skew: 0, translateX: 0 };

/**
 * Turning away from the draft.
 *
 * The composer is inline-start of the artwork, so leaning into it would read as
 * reading over the user's shoulder. Negative skew tips each body's top away
 * from it instead, and the shift goes the same way, so the whole group edges
 * aside while the draft is being written. Nobody grows: a character rising up
 * over the text is exactly the read this pose exists to avoid.
 *
 * The amounts follow how close each character stands to the composer — the two
 * on the left have the most to turn away from.
 */
const LISTEN_POSE: Record<CharacterName, CharacterPose> = {
  black: { skew: -4, translateX: 8 },
  /** The dome cannot lean far before it reads as toppling. */
  orange: { skew: -3, translateX: 10 },
  purple: { skew: -7, translateX: 14 },
  yellow: { skew: -5, translateX: 6 },
};

export const getCharacterPose = (mood: CharacterMood, name: CharacterName): CharacterPose =>
  mood === 'listen' ? LISTEN_POSE[name] : NEUTRAL;

/**
 * Where the eyes point, when the mood overrides the pointer.
 *
 * `undefined` hands the eye back to pointer tracking. Negative x is toward the
 * composer, which sits inline-start of the artwork.
 */
export interface EyeDirection {
  dilate?: number;
  x?: number;
  y?: number;
}

/** Inward, so the group appears to check with each other. */
const CURIOUS_GAZE: Record<CharacterName, EyeDirection> = {
  black: { x: -4, y: 0 },
  orange: { x: 4, y: 0 },
  purple: { x: 4, y: 0 },
  yellow: { x: -4, y: 0 },
};

/**
 * Every pupil off the composer, at four slightly different angles.
 *
 * Positive x is away from the draft. Giving all four the same vector would land
 * as one puppet with four heads, so they look away at their own heights: the
 * back pair up and aside, the front pair aside and down, like waiting rather
 * than staring at the same spot on the wall.
 */
const LISTEN_GAZE: Record<CharacterName, EyeDirection> = {
  black: { x: 5, y: -3 },
  orange: { x: 4, y: 3 },
  purple: { x: 4, y: -4 },
  yellow: { x: 5, y: 2 },
};

export const getEyeDirection = (mood: CharacterMood, name: CharacterName): EyeDirection => {
  switch (mood) {
    case 'listen': {
      return LISTEN_GAZE[name];
    }
    // Up and away: the direction of someone working something out.
    case 'think': {
      return { x: -3, y: -5 };
    }
    // Wide, but still following the pointer — delight is not distraction.
    case 'delight': {
      return { dilate: 3 };
    }
    case 'curious': {
      return CURIOUS_GAZE[name];
    }
    default: {
      return {};
    }
  }
};

/** The group's only mouth, so it carries most of the read on its own. */
export const getMouthShape = (mood: CharacterMood) => {
  switch (mood) {
    // Pressed flat in concentration.
    case 'think': {
      return { height: 4, width: 40 };
    }
    case 'delight': {
      return { height: 10, width: 96 };
    }
    default: {
      return { height: 4, width: 80 };
    }
  }
};
