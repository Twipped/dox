
import { parse, debug, JSDocType } from '../_harness.js';

describe('exports/barn', () => {

  test('root', async () => {
    const parsed = await parse('exports/farm.cjs');

    expect(parsed.exports).toMatchObject({
      default: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'default',
          name: 'Farm',
          kind: 'function',
          isDefaultExport: true,
          filename: 'exports/farm.cjs',
          params: [],
          type: expect.any(JSDocType),
        }),
        name: 'default',
        local: 'exports',
        source: './exports/farm.cjs',
      }),
    });
  });

});
