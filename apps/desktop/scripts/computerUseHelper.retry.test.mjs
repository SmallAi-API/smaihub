import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  COMPUTER_USE_HELPER_BUNDLE_ID,
  COMPUTER_USE_HELPER_TEAM_ID,
  embedComputerUseHelper,
  verifyComputerUseHelper,
} from './computerUseHelper.mjs';

const appPath = '/out/smai.ai.app/Contents/Library/Helpers/LobeHub Computer Use.app';
const networkFailure = {
  status: 68,
  stderr: '',
  stdout:
    'Error Domain=NSURLErrorDomain Code=-1005 "The network connection was lost."\n' +
    "CloudKit's response is inconsistent with expections: (null)\n" +
    'The validate action failed! Error 68.',
};

const createExecute = (validate) =>
  vi.fn((command, args) => {
    if (command === 'xcrun') return validate();
    if (command === 'codesign' && args[0] === '--display') {
      return {
        status: 0,
        stderr: `Identifier=${COMPUTER_USE_HELPER_BUNDLE_ID}\nTeamIdentifier=${COMPUTER_USE_HELPER_TEAM_ID}`,
        stdout: '',
      };
    }
    return { status: 0, stderr: '', stdout: '0.0.33\n' };
  });

describe('Computer Use helper notarization retries', () => {
  let logger;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = { warn: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(['stdout', 'stderr'])('recovers from the logged CloudKit error on %s', async (stream) => {
    const validate = vi
      .fn()
      .mockReturnValueOnce({ ...networkFailure, stdout: '', [stream]: networkFailure.stdout })
      .mockReturnValue({ status: 0, stderr: '', stdout: '' });
    const execute = createExecute(validate);
    const verification = expect(
      verifyComputerUseHelper(appPath, { execute, logger, version: '0.0.33' }),
    ).resolves.toBeUndefined();

    expect(validate).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4999);
    expect(validate).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await verification;

    expect(validate).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls.some(([command]) => command === 'plutil')).toBe(true);
  });

  it('backs off again when two transient failures precede success', async () => {
    const validate = vi
      .fn()
      .mockReturnValueOnce(networkFailure)
      .mockReturnValueOnce(networkFailure)
      .mockReturnValue({ status: 0, stderr: '', stdout: '' });
    const verification = expect(
      verifyComputerUseHelper(appPath, { execute: createExecute(validate), logger }),
    ).resolves.toBeUndefined();

    await vi.advanceTimersByTimeAsync(5000);
    expect(validate).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(9999);
    expect(validate).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    await verification;
    expect(validate).toHaveBeenCalledTimes(3);
  });

  it.each([1001, 1003, 1004, 1006, 1009])('retries transient URL error -%s', async (code) => {
    const validate = vi
      .fn()
      .mockReturnValueOnce({
        ...networkFailure,
        stdout: `Error Domain=kCFErrorDomainCFNetwork Code=-${code}`,
      })
      .mockReturnValue({ status: 0, stderr: '', stdout: '' });
    const verification = expect(
      verifyComputerUseHelper(appPath, { execute: createExecute(validate), logger }),
    ).resolves.toBeUndefined();

    await vi.runAllTimersAsync();
    await verification;
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('fails after three network errors and preserves the Apple diagnostic', async () => {
    const validate = vi.fn(() => networkFailure);
    const execute = createExecute(validate);
    const verification = expect(
      verifyComputerUseHelper(appPath, { execute, logger, version: '0.0.33' }),
    ).rejects.toThrow(/exited with 68:.*NSURLErrorDomain/s);

    await vi.runAllTimersAsync();
    await verification;
    expect(validate).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(execute.mock.calls.some(([command]) => command === 'plutil')).toBe(false);
  });

  it.each([
    { status: 68, stderr: '', stdout: 'The validate action failed! Error 68.' },
    { status: 65, stderr: 'No stapled ticket found.', stdout: '' },
    { ...networkFailure, status: 65 },
    {
      ...networkFailure,
      stdout: 'Error Domain=NSURLErrorDomain Code=-1202 "Untrusted certificate"',
    },
  ])('does not retry invalid tickets or other non-transient errors: $stdout', async (failure) => {
    const validate = vi.fn(() => failure);
    await expect(
      verifyComputerUseHelper(appPath, { execute: createExecute(validate), logger }),
    ).rejects.toThrow(/exited with/);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('does not retry a failure to start xcrun', async () => {
    const error = Object.assign(new Error('xcrun not found'), { code: 'ENOENT' });
    const validate = vi.fn(() => ({ error, status: null }));
    await expect(
      verifyComputerUseHelper(appPath, { execute: createExecute(validate), logger }),
    ).rejects.toBe(error);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('still fails immediately when the helper signature is invalid', async () => {
    const execute = vi.fn(() => ({ status: 1, stderr: 'invalid signature', stdout: '' }));
    await expect(verifyComputerUseHelper(appPath, { execute, logger })).rejects.toThrow(
      /invalid signature/,
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('waits for successful validation before embedding the helper', async () => {
    const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'computer-use-retry-test-'));
    const archive = Buffer.from('helper zip');
    const checksum = createHash('sha256').update(archive).digest('hex');
    let onValidationStarted;
    const validationStarted = new Promise((resolve) => {
      onValidationStarted = resolve;
    });
    const validate = vi
      .fn()
      .mockImplementationOnce(() => {
        onValidationStarted();
        return networkFailure;
      })
      .mockReturnValue({ status: 0, stderr: '', stdout: '' });
    const execute = createExecute(validate);
    const embedding = embedComputerUseHelper({
      appPath: path.join(cacheDir, 'smai.ai.app'),
      arch: 'x64',
      cacheDir,
      execute,
      fetchImpl: async (url) => ({
        arrayBuffer: async () => (url.endsWith('.sha256') ? Buffer.from(checksum) : archive),
        ok: true,
      }),
      logger: { ...logger, info: vi.fn() },
      version: '0.0.33',
    });

    try {
      await validationStarted;
      expect(execute.mock.calls.filter(([command]) => command === 'ditto')).toHaveLength(1);
      await vi.runAllTimersAsync();
      const destination = await embedding;
      expect(validate).toHaveBeenCalledTimes(2);
      const dittoCalls = execute.mock.calls.filter(([command]) => command === 'ditto');
      expect(dittoCalls).toHaveLength(2);
      expect(dittoCalls[1][1][1]).toBe(destination);
    } finally {
      await fs.rm(cacheDir, { force: true, recursive: true });
    }
  });
});
