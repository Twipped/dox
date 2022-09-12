
import { parse, JSDocType } from '../_harness.js';

describe('exports/ab', () => {

  test('root', async () => {
    const parsed = await parse('exports/ab.js');

    expect(parsed.exports).toMatchObject({
      B: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'B',
          isExport: true,
          filename: 'exports/ab.js',
          name: 'B',
          fnName: 'B',
          kind: 'function',
          type: expect.any(JSDocType),
        }),
        source: './exports/ab.js',
        local: 'B',
        name: 'B',
      }),
      default: expect.objectContaining({
        ctx: expect.objectContaining({
          export: 'default',
          isExport: true,
          isDefaultExport: true,
          filename: 'exports/ab.js',
          name: 'A',
          kind: 'class',
          properties: [
            expect.objectContaining({
              "description": "Class constructor",
              "export": "default",
              "filename": "exports/ab.js",
              "ignore": false,
              "isAsync": false,
              "isConstructor": true,
              "isDefaultExport": true,
              "isExport": true,
              "isGenerator": false,
              "kind": "constructor",
              "member": "constructor",
              "memberOf": "A.prototype",
              "name": "constructor",
              "params": [],
              "scope": "instance",
              "tags": [],
              type: expect.any(JSDocType),
            }),
          ],
          type: expect.any(JSDocType),
        }),
        source: './exports/ab.js',
        local: 'A',
        name: 'default',
      }),
    });
  });

});
