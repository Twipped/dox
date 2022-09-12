
import { parse, JSDocType } from '../_harness.js';

describe('exports', () => {

  test('root', async () => {
    const parsed = await parse('exports/index.js', {
      followImports: true,
    });

    expect(parsed.exports).toMatchObject({
      A: expect.objectContaining({
        name: 'default',
        local: 'A',
        source: './exports/ab.js',
        ctx: expect.objectContaining({
          isExport: true,
          isDefaultExport: true,
          export: 'default',
          kind: 'class',
          name: 'A',
          type: expect.any(JSDocType),
          properties: [
            {
              tags: [],
              ignore: false,
              description: 'Class constructor',
              memberOf: 'A.prototype',
              name: 'constructor',
              member: 'constructor',
              kind: 'constructor',
              scope: 'instance',
              isConstructor: true,
              isGenerator: false,
              isAsync: false,
              params: [],
              isExport: true,
              isDefaultExport: true,
              export: 'default',
              type: expect.any(JSDocType),
              filename: 'exports/ab.js'
            },
          ],
          filename: 'exports/ab.js',
        }),
        as: 'A',
      }),
      B: expect.objectContaining({
        name: 'B',
        local: 'B',
        as: 'B',
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
      }),
      E: expect.objectContaining({
        name: 'E',
        local: 'E',
        as: 'E',
        ctx: expect.objectContaining({
          filename: 'exports/ef.js',
          name: 'E',
          type: expect.any(JSDocType),
          isConstant: true,
          value: 42,
        }),
        source: './exports/ef.js',
      }),
      F: expect.objectContaining({
        name: 'F',
        local: 'F',
        as: 'F',
        ctx: expect.objectContaining({
          filename: 'exports/ef.js',
          name: 'F',
          type: expect.any(JSDocType),
          isConstant: true,
          value: true,
        }),
        source: './exports/ef.js',
      }),
      default: expect.objectContaining({
        name: 'default',
        local: 'default',
        as: 'default',
        ctx: expect.objectContaining({
          export: 'default',
          filename: 'exports/d.js',
          type: expect.any(JSDocType),
          properties: [
            expect.objectContaining({
              name: 'd',
              type: expect.any(JSDocType),
            }),
          ],
        }),
        source: './exports/d.js',
      }),
      Farm: expect.objectContaining({
        name: 'default',
        local: 'exports',
        as: 'Farm',
        ctx: expect.objectContaining({
          filename: 'exports/farm.cjs',
          name: 'Farm',
          kind: 'function',
          type: expect.any(JSDocType),
        }),
        source: './exports/farm.cjs',
      }),
      G: expect.objectContaining({
        name: 'G',
        local: 'G',
        as: 'G',
        ctx: expect.objectContaining({
          filename: 'exports/index.js',
          name: 'G',
          fnName: 'G',
          kind: 'function',
          type: expect.any(JSDocType),
        }),
        source: './exports/index.js',
      }),
      H: expect.objectContaining({
        name: 'H',
        local: 'H',
        as: 'H',
        ctx: expect.objectContaining({
          filename: 'exports/index.js',
          name: 'H',
          fnName: 'H',
          kind: 'function',
          type: expect.any(JSDocType),
        }),
        source: './exports/index.js',
      }),
      omit: expect.objectContaining({
        name: 'default',
        local: 'exports',
        as: 'omit',
        ctx: expect.objectContaining({
          name: 'omit',
          filename: '../node_modules/lodash/omit.js',
          export: 'default',
        }),
        source: '../node_modules/lodash/omit.js',
      }),
      J: expect.objectContaining({
        name: 'J',
        local: 'I',
        as: 'J',
        ctx: expect.objectContaining({
          source: '../node_modules/lodash/pick.js',
          filename: 'exports/index.js',
          package: 'lodash/pick',
          name: 'J',
          isExternal: true,
          namespaceImport: true,
          namespace: { name: 'I' },
          properties: [
            expect.objectContaining({
              name: 'default',
              local: 'exports',
              source: '../node_modules/lodash/pick.js',
              as: 'default',
            }),
          ],
        }),
        source: '../node_modules/lodash/pick.js',
      }),
    });

    // debug(parsed.exports);
  });

});
