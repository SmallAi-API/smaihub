/**
 * What the characters are doing, as one value rather than a pile of booleans.
 *
 * Seven independent flags would describe 128 states, nearly all of them
 * nonsense — leaning toward the composer while also cheering while also
 * double-taking. A single mood makes the impossible combinations unspellable,
 * and the priority below is the whole conflict-resolution story.
 */
export type CharacterMood =
  /** Nothing in flight: a slow breath so the group reads as alive, not parked. */
  | 'idle'
  /** A draft is in the composer; the group leans in to listen. */
  | 'listen'
  /** A message is on the wire; the group works. */
  | 'think'
  /** The model just changed under them. */
  | 'delight'
  /** The agent just changed under them. */
  | 'curious';

/** Moods that play once and release, rather than describing a standing state. */
export type TransientMood = Extract<CharacterMood, 'curious' | 'delight'>;

/** How long each transient holds the stage before the standing mood resumes. */
export const TRANSIENT_MOOD_DURATION: Record<TransientMood, number> = {
  curious: 1100,
  delight: 900,
};

export interface MoodSignals {
  /** A draft sits in the composer. */
  isDrafting: boolean;
  /** A send is in flight. */
  isSending: boolean;
  /** Set while a one-shot reaction is still playing. */
  transient?: TransientMood;
}

/**
 * Pick the mood the characters should be in.
 *
 * A transient wins outright: it is a reaction to something that just happened,
 * and swallowing it because a draft happens to be open would make switching
 * models mid-sentence feel unacknowledged. It expires on its own timer, so the
 * standing mood underneath is never lost — only deferred.
 */
export const resolveCharacterMood = ({
  isDrafting,
  isSending,
  transient,
}: MoodSignals): CharacterMood => {
  if (transient) return transient;
  // Sending outranks drafting: the composer keeps its text while the request is
  // in flight, so both are true at once and only the send is worth showing.
  if (isSending) return 'think';
  if (isDrafting) return 'listen';

  return 'idle';
};
