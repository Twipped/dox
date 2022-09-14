import path from 'path';

import { parse as babelParse } from '@babel/parser';
import crawl from './crawl-ast.js';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:parse-source');

export default function parseSource (code, {
  filename,
  type = 'unambiguous',
  babelOptions,
  cwd = process.cwd(),
  ...options
} = {}) {
  const sourceFilename = filename ? path.relative(cwd, filename) : undefined;
  let ast;

  try {
    ast = babelParse(code, {
      plugins: [
        "jsx",
        "typescript",
      ],
      ...babelOptions,
      sourceType: type,
      sourceFilename,
      tokens: false,
    });
  } catch (e) {
    Error.captureStackTrace(e, parseSource);
    throw e;
  }

  const found = crawl(ast, { cwd, filename, type, ...options });

  debug(`Found ${found.comments.length} comments and ${found.exports.length} exports.`);

  return found;
}
