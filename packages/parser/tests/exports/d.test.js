
import { parse, debug } from '../_harness.js';

describe('exports/d', () => {

  test('root', async () => {
    const parsed = await parse('exports/d.js');

    expect(parsed.exports).toMatchObject({
      default: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'default',
          isDefaultExport: true,
          filename: expect.stringContaining('exports/d.js'),
          type: expect.any(Object),
        }),
        name: 'default',
        local: 'default',
        source: './exports/d.js',
      }),
    });
  });

});
