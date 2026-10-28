import { describe, expect, it } from 'vitest';

import { systemPrompt } from './systemRole';

describe('systemPrompt', () => {
  it('does not send unresolved merge alternatives to the model', () => {
    expect(systemPrompt('2026-10-28')).not.toMatch(/^(?:<{7}|={7}|>{7})/m);
  });
});
