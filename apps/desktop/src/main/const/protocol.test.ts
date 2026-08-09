import { describe, expect, it } from 'vitest';

import { isBackendPath, isFileProxyUrl, isSameOrigin } from './protocol';

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

describe('isFileProxyUrl', () => {
  it.each([
    // Absolute message-image URLs minted by `getFileAccessUrl`.
    'https://www.smallai.asia/f/file_abc123',
    'https://app.lobehub.com/f/file_abc123?download=1',
    'http://localhost:3010/f/file_abc123',
    'app://renderer/f/file_abc123',
  ])('should match file proxy URL %s', (url) => {
    expect(isFileProxyUrl(url)).toBe(true);
  });

  it.each([
    'https://www.smallai.asia/trpc/lambda/user.getUserState',
    'https://www.smallai.asia/',
    // Presigned-storage redirect target: must not be treated as the proxy, or
    // the token would follow the 302 to a third party.
    'https://smaihub-1301925107.cos.ap-hongkong.myqcloud.com/files/abc.png',
    // Lookalikes.
    'https://www.smallai.asia/files/abc',
    'https://www.smallai.asia/fabricated',
    // Malformed input is never a match.
    'not-a-url',
    '',
  ])('should not match non-proxy URL %s', (url) => {
    expect(isFileProxyUrl(url)).toBe(false);
  });
});

describe('isSameOrigin', () => {
  it('should match identical origins regardless of path', () => {
    expect(isSameOrigin('https://www.smallai.asia/f/file_abc', 'https://www.smallai.asia')).toBe(
      true,
    );
  });

  it('should match when the base URL carries a trailing path', () => {
    expect(isSameOrigin('https://www.smallai.asia/f/file_abc', 'https://www.smallai.asia/')).toBe(
      true,
    );
  });

  it.each([
    // Different host — the presigned-storage hop.
    ['https://smaihub-1301925107.cos.ap-hongkong.myqcloud.com/x.png', 'https://www.smallai.asia'],
    // Different scheme.
    ['http://www.smallai.asia/f/a', 'https://www.smallai.asia'],
    // Different port.
    ['http://localhost:9876/f/a', 'http://localhost:3010'],
    // Subdomain is a distinct origin.
    ['https://cdn.smallai.asia/f/a', 'https://www.smallai.asia'],
    // Malformed input on either side.
    ['not-a-url', 'https://www.smallai.asia'],
    ['https://www.smallai.asia/f/a', ''],
  ])('should not match %s against %s', (url, base) => {
    expect(isSameOrigin(url, base)).toBe(false);
  });
});
