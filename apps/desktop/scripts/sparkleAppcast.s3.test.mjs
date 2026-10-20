import { execFileSync } from 'node:child_process';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createS3 } from './sparkleAppcast.mjs';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));

describe('Sparkle S3 publishing', () => {
  const endpoint = 'https://cos.ap-test.myqcloud.com';
  const bucket = 'updates';
  const uploadArgs = [
    's3',
    'cp',
    'update.delta',
    's3://updates/stable/1.6.2/update.delta',
    '--cache-control',
    'public,max-age=31536000,immutable',
  ];

  beforeEach(() => {
    vi.mocked(execFileSync).mockReset().mockReturnValue('');
    vi.stubEnv('AWS_REQUEST_CHECKSUM_CALCULATION', 'WHEN_SUPPORTED');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-access-key');
    vi.stubEnv('AWS_REGION', 'ap-test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('configures COS-compatible transfers before any object access', () => {
    const s3 = createS3({ bucket, endpoint });
    s3.upload('update.delta', 'stable/1.6.2/update.delta', 'public,max-age=31536000,immutable');

    expect(
      vi
        .mocked(execFileSync)
        .mock.calls.slice(0, 3)
        .map(([, args]) => args),
    ).toEqual([
      ['configure', 'set', 'default.s3.addressing_style', 'virtual'],
      ['configure', 'set', 'default.s3.multipart_threshold', '512MB'],
      ['configure', 'set', 'default.s3.payload_signing_enabled', 'true'],
    ]);
  });

  it('disables optional streaming checksums for custom endpoints without changing the parent env', () => {
    const s3 = createS3({ bucket, endpoint });
    s3.upload('update.delta', 'stable/1.6.2/update.delta', 'public,max-age=31536000,immutable');

    expect(execFileSync).toHaveBeenLastCalledWith(
      'aws',
      [...uploadArgs, '--endpoint-url', endpoint],
      expect.objectContaining({
        env: expect.objectContaining({
          AWS_ACCESS_KEY_ID: 'test-access-key',
          AWS_REGION: 'ap-test',
          AWS_REQUEST_CHECKSUM_CALCULATION: 'WHEN_REQUIRED',
        }),
      }),
    );
    expect(process.env.AWS_REQUEST_CHECKSUM_CALCULATION).toBe('WHEN_SUPPORTED');
  });

  it('preserves AWS checksum settings when no custom endpoint is configured', () => {
    const s3 = createS3({ bucket, endpoint: '' });
    s3.upload('update.delta', 'stable/1.6.2/update.delta', 'public,max-age=31536000,immutable');

    const [, args, options] = vi.mocked(execFileSync).mock.lastCall;
    expect(args).toEqual(uploadArgs);
    expect(
      options.env?.AWS_REQUEST_CHECKSUM_CALCULATION ?? process.env.AWS_REQUEST_CHECKSUM_CALCULATION,
    ).toBe('WHEN_SUPPORTED');
  });

  it('keeps appcast feeds uncached and reports upload failures to the publisher', () => {
    const s3 = createS3({ bucket, endpoint });
    s3.upload('appcast.xml', 'stable/appcast-arm64.xml', 'no-store');
    expect(execFileSync).toHaveBeenLastCalledWith(
      'aws',
      [
        's3',
        'cp',
        'appcast.xml',
        's3://updates/stable/appcast-arm64.xml',
        '--cache-control',
        'no-store',
        '--endpoint-url',
        endpoint,
      ],
      expect.any(Object),
    );

    vi.mocked(execFileSync).mockImplementationOnce(() => {
      throw new Error('UploadPart failed');
    });
    expect(() => s3.upload('update.delta', 'stable/1.6.2/update.delta', 'immutable')).toThrow(
      'UploadPart failed',
    );
  });

  it('downloads existing history and returns false for unavailable archives', () => {
    const s3 = createS3({ bucket, endpoint });
    expect(s3.download('stable/appcast-arm64.xml', 'history.xml')).toBe(true);
    expect(execFileSync).toHaveBeenLastCalledWith(
      'aws',
      [
        's3',
        'cp',
        's3://updates/stable/appcast-arm64.xml',
        'history.xml',
        '--endpoint-url',
        endpoint,
      ],
      expect.any(Object),
    );

    vi.mocked(execFileSync).mockImplementationOnce(() => {
      throw new Error('NoSuchKey');
    });
    expect(s3.download('stable/missing.zip', 'missing.zip')).toBe(false);
  });
});
