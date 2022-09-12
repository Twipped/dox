
import { parse, debug } from '../_harness.js';

describe('exports/animals', () => {

  test('root', async () => {
    const parsed = await parse('exports/animals.cjs');

    expect(parsed.exports).toMatchObject({
      horse: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'horse',
          name: 'horse',
          fnName: 'Neigh',
          kind: 'function',
          filename: expect.stringContaining('exports/animals.cjs'),
          memberOf: 'exports',
          member: 'horse',
          params: [],
          type: {
            parsed: [
              {
                name: "Function",
                type: "NAME",
              },
            ],
            simple: [
              {
                name: "Function",
              },
            ],
            string: "Function",
          },
        }),
        name: 'horse',
        local: 'horse',
        source: './exports/animals.cjs',
      }),
      cow: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'cow',
          name: 'cow',
          fnName: 'Moo',
          kind: 'function',
          filename: expect.stringContaining('exports/animals.cjs'),
          memberOf: 'exports',
          member: 'cow',
          params: [],
          type: {
            parsed: [
              {
                name: "Function",
                type: "NAME",
              },
            ],
            simple: [
              {
                name: "Function",
              },
            ],
            string: "Function",
          },
        }),
        name: 'cow',
        local: 'cow',
        source: './exports/animals.cjs',
      }),
      sheep: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'sheep',
          name: 'sheep',
          fnName: 'Baa',
          kind: 'function',
          filename: expect.stringContaining('exports/animals.cjs'),
          memberOf: 'exports',
          member: 'sheep',
          params: [],
          type: {
            parsed: [
              {
                name: "Function",
                type: "NAME",
              },
            ],
            simple: [
              {
                name: "Function",
              },
            ],
            string: "Function",
          },
        }),
        name: 'sheep',
        local: 'sheep',
        source: './exports/animals.cjs',

      }),
    });
  });

});
