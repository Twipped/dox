import { parse as commentParser } from 'comment-parser';

import parseTags from './parse-tags.js';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:parse-comment');

const STARBANG = /^\/\*!\**/;

export default function parseComment (raw) {
  const starbang = raw.match(STARBANG);
  const firstChar = raw[2];
  if (firstChar !== '*' && !starbang) return false;

  debug(`---\n${raw}`);

  // We support the "/*!" comment block syntax, but comment-parser does not
  // so we have to swap that out and take note of it.
  const ignore = !!starbang;
  if (starbang) {
    raw = raw.replace(STARBANG, '/**');
  }

  let parsed;
  try {
    parsed = commentParser(raw, { spacing: 'preserve' });
    debug('comment-parser output', parsed);
  } catch (e) {
    debug('comment-parser error', e);
    return {
      error: e,
      ignore,
    };
  }

  if (!parsed.length) console.error('Comment borked', raw); // eslint-disable-line no-console
  let [ { description, tags, problems } ] = parsed;
  description = description.trim();

  if (problems?.length) debug('Problems found: %o', problems);

  try {
    const doc = parseTags(tags);
    doc.tags = tags;
    doc.ignore = ignore;
    doc.description = (doc.description || description || '').trim();
    return doc;
  } catch (e) {
    return {
      error: e,
      ignore,
      description,
      tags,
    };
  }
}
