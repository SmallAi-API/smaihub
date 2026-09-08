import { useEffect, useRef, useState } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useHomeStore } from '@/store/home';

import { useResolvedHomeAgentId } from '../AgentSelect/useResolvedHomeAgentId';
import type { CharacterMood, TransientMood } from './mood';
import { resolveCharacterMood, TRANSIENT_MOOD_DURATION } from './mood';

interface CharacterMoodOptions {
  /** A draft sits in the composer. */
  isDrafting?: boolean;
}

/**
 * Watch a value and report the moment it changes to a different real value.
 *
 * Hydration is not a change: the first non-empty value is what the page loaded
 * with, not something the viewer did, and cheering at it would fire a reaction
 * on every mount. Only a transition between two known values counts.
 */
const useChanged = (value: string | undefined) => {
  const previous = useRef(value);
  const [changedAt, setChangedAt] = useState(0);

  useEffect(() => {
    const before = previous.current;
    previous.current = value;
    if (!before || !value || before === value) return;

    setChangedAt(Date.now());
  }, [value]);

  return changedAt;
};

/**
 * Drive the characters from what the home surface is actually doing.
 *
 * Reads its own signals rather than taking seven props: every one of them is
 * already in a store, and threading them through the hero layout would make
 * Home's page component the owner of an animation detail.
 */
export const useCharacterMood = ({ isDrafting = false }: CharacterMoodOptions = {}): {
  mood: CharacterMood;
} => {
  const isSending = useHomeStore((s) => s.homeInputLoading);
  const { agentId } = useResolvedHomeAgentId();
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId ?? '')(s));

  const modelChangedAt = useChanged(model);
  const agentChangedAt = useChanged(agentId);
  const [transient, setTransient] = useState<TransientMood>();

  useEffect(() => {
    if (!modelChangedAt && !agentChangedAt) return;

    // Switching agent usually switches model too, and the agent is the larger
    // change — let the double-take speak for both rather than stacking them.
    const next: TransientMood = agentChangedAt >= modelChangedAt ? 'curious' : 'delight';
    setTransient(next);
    const timer = setTimeout(() => setTransient(undefined), TRANSIENT_MOOD_DURATION[next]);

    return () => clearTimeout(timer);
  }, [modelChangedAt, agentChangedAt]);

  return { mood: resolveCharacterMood({ isDrafting, isSending, transient }) };
};
