import { describe, expect, it } from 'vitest';

import { isOfficialCloudServer } from './url';

describe('isOfficialCloudServer', () => {
  it.each([
    'https://www.smallai.asia',
    'https://www.smallai.asia/workspace',
    'https://staging.www.smallai.asia/',
  ])('treats %s as official', (url) => {
    expect(isOfficialCloudServer(url)).toBe(true);
  });

  it.each([
    'https://www.smallai.asia.evil.example',
    'https://notsmallai.asia',
    'https://my-smallai.internal',
    'http://localhost:3210',
    'not a url',
    '',
    undefined,
  ])('treats %s as self-hosted', (url) => {
    expect(isOfficialCloudServer(url)).toBe(false);
  });
});
