import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSmaiUsageRevision, notifySmaiUsageChanged, subscribeSmaiUsageChanged } from './events';

afterEach(() => vi.restoreAllMocks());

describe('SMAI usage change events', () => {
  it('only advances the revision and notifies subscribers for SMAI consumption', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSmaiUsageChanged(listener);
    const before = getSmaiUsageRevision();

    notifySmaiUsageChanged();
    notifySmaiUsageChanged('openai');
    expect(getSmaiUsageRevision()).toBe(before);
    expect(listener).not.toHaveBeenCalled();

    notifySmaiUsageChanged('smai');
    notifySmaiUsageChanged('smai');
    expect(getSmaiUsageRevision()).toBe(before + 2);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('retains revisions while no card is mounted and stops notifying an unsubscribed card', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSmaiUsageChanged(listener);
    unsubscribe();
    unsubscribe();
    const before = getSmaiUsageRevision();

    notifySmaiUsageChanged('smai');
    expect(getSmaiUsageRevision()).toBe(before + 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('isolates a failing subscriber from generation completion and other subscribers', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const unsubscribeBroken = subscribeSmaiUsageChanged(() => {
      throw new Error('listener failure');
    });
    const listener = vi.fn();
    const unsubscribe = subscribeSmaiUsageChanged(listener);

    expect(() => notifySmaiUsageChanged('smai')).not.toThrow();
    expect(listener).toHaveBeenCalledOnce();
    unsubscribeBroken();
    unsubscribe();
  });
});
