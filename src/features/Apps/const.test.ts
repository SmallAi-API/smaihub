import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { APP_SHOTS } from './const';

describe('APP_SHOTS', () => {
  it.each(Object.entries(APP_SHOTS))(
    'ships the %s screenshot at its requested URL',
    async (_, url) => {
      const bytes = await readFile(
        path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public', url.slice(1)),
      );

      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    },
  );
});
