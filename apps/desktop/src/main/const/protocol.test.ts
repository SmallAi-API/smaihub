import { describe, expect, it } from 'vitest';

import { isBackendPath } from './protocol';

describe('isBackendPath', () => {
  it.each(['/trpc', '/webapi', '/api/auth', '/market', '/f'])(
    'should match the bare backend prefix %s',
    (pathname) => {
      expect(isBackendPath(pathname)).toBe(true);
    },
  );

  it.each([
    '/trpc/lambda/user.getUserState',
    '/webapi/user/avatar/1/image',
    '/api/auth/session',
    '/market/agents',
    // Uploaded avatars / files are served through this auth-guarded proxy.
    '/f/file_abc123',
  ])('should match nested backend path %s', (pathname) => {
    expect(isBackendPath(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/logo.png',
    '/avatars/agent-default.png',
    '/icons/icon-192x192.png',
    '/assets/main-abc.js',
    '/agent/agt_123/tpc_456',
    '/popup/agent/a/t',
  ])('should not match renderer path %s', (pathname) => {
    expect(isBackendPath(pathname)).toBe(false);
  });

  // Prefix matching is segment-aware: a renderer route that merely starts with
  // the same letters must not be hijacked into the backend proxy.
  it.each(['/fabricated', '/files', '/marketplace', '/webapifoo'])(
    'should not match lookalike path %s',
    (pathname) => {
      expect(isBackendPath(pathname)).toBe(false);
    },
  );
});
