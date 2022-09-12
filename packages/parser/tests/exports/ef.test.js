
import { parse, debug } from '../_harness.js';

describe('exports/ef', () => {

  test('root', async () => {
    const parsed = await parse('exports/ef.js');

    expect(parsed.exports).toMatchObject({
      E: expect.objectContaining({
        ctx: expect.objectContaining({
          filename: expect.stringContaining('exports/ef.js'),
          name: 'E',
          type: expect.any(Object),
          isConstant: true,
          value: 42,
        }),
        source: './exports/ef.js',
      }),
      F: expect.objectContaining({
        ctx: expect.objectContaining({
          filename: expect.stringContaining('exports/ef.js'),
          name: 'F',
          type: expect.any(Object),
          isConstant: true,
          value: true,
        }),
        source: './exports/ef.js',
      }),
    });
  });

});
