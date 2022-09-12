
import { parse, debug, JSDocType } from '../_harness.js';

describe('exports/c', () => {

  test('root', async () => {
    const parsed = await parse('exports/c.js');

    expect(parsed.exports).toMatchObject({
      default: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'default',
          name: 'C',
          kind: 'function',
          isDefaultExport: true,
          filename: expect.stringContaining('exports/c.js'),
          type: expect.any(JSDocType),
        }),
        name: 'default',
        local: 'C',
        source: './exports/c.js',
      }),
    });
  });

});
