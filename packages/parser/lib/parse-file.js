/* eslint import/no-commonjs: 0 */
import fs from 'fs/promises';
import path from 'path';
import parseSource from './parse-source.js';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:parse-file');

export default async function parseFile (filename, {
  cwd = process.cwd(),
  followImports,
  importComments,
  cache = new Map(),
  _seen = new Set(),
  ...options
}) {
  filename = path.resolve(cwd, filename);
  const code = await fs.readFile(filename, 'utf-8');
  debug('Loaded ' + filename);
  const parsed = parseSource(code, { filename, cwd, ...options });
  cache.set(filename, parsed);
  const { comments, exports: exported } = parsed;

  const exports = {};

  for (const exp of exported) {
    if ((exp.source === filename || !followImports) && exp.name) {
      if (exp.ctx?.package) {
        exp.package = exp.ctx.package;
        exp.source = exp.ctx.package;
      } else {
        let p = path.relative(cwd, exp.source);
        if (p[0] !== '.') p = `.${path.sep}${p}`;
        exp.source = p;
      }
      exp.as = exp.name;

      exports[exp.name] = exp;
      continue;
    }

    if (exp.ctx?.error) {
      continue;
    }

    if (!cache.has(exp.source)) {
      const subfile = await parseFile(exp.source, {
        cwd,
        followImports,
        cache,
        _seen,
        ...options,
      });
      cache.set(exp.source, subfile);

      if (importComments) {
        comments.push(...subfile.comments);
      }
    }

    const { exports: subfileExports } = cache.get(exp.source);

    if (exp.all) {
      if (!followImports) {
        // nothing we can do here
        continue;
      }

      // throw is the export tries to overwrite a default export
      if (subfileExports.default && exports.default) {
        const src = exports.default.source;
        const line = exports.default?.ctx?.loc?.start?.line || '';
        throw new Error(`Cannot export default from "${exp.source}", already have exported default from "${src}${line && ':' + line}`);
      }

      Object.assign(exports, subfileExports);
      continue;
    }

    if (exp.ctx.namespaceImport) {
      exports[exp.name] = {
        ...exp,
        ctx: {
          ...exp.ctx,
          properties: Object.values(subfileExports),
        },
        as: exp.name,
      };
      continue;
    }

    if (!subfileExports[exp.local]) {
      throw new Error(`Cannot export "${exp.name}" from "${exp.source}", it does not exist.`);
    }
    exports[exp.name] = {
      ...subfileExports[exp.local],
      ctx: {
        ...subfileExports[exp.local].ctx,
      },
      as: exp.name,
    };

  }

  return { comments, exports };
}
