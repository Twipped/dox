
import { parse, JSDocType } from '../_harness.js';

describe('exports/barn', () => {

  test('root', async () => {
    const parsed = await parse('exports/barn.cjs');

    expect(parsed.exports).toMatchObject({
      default: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'default',
          name: 'Barn',
          kind: 'class',
          isDefaultExport: true,
          filename: expect.stringContaining('exports/barn.cjs'),
          properties: [],
          type: expect.any(JSDocType),
        }),
        name: 'default',
        local: 'exports',
        source: './exports/barn.cjs',
      }),
    });
  });

});
