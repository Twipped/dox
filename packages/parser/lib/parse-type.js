
import { parse, publish, NodeType } from 'jsdoctypeparser';
import { InvalidJSDocTypeError } from './exceptions.js';
import { inspect } from 'util';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:parse-type');

export class JSDocType {

  constructor (typeString) {
    this.string = typeString;
    try {
      var parsed = parse(typeString);
      this.string = publish(parsed);
      this.parsed = flatten(parsed);
      this.simple = transform(parsed);
    } catch (e) {
      if (e.name === 'SyntaxError') {
        debug(`Error while parsing ${typeString}: ${e.message}`);
        this.error = new InvalidJSDocTypeError(e.message, typeString);
      } else {
        this.error = e;
      }
    }
  }

  toString () {
    return this.string;
  }

  [inspect.custom] () {
    return `\u001b[36mJSDocType <\u001b[32m${this.string}\u001b[36m>\u001b[0m`;
  }
}


export default function parseType (typeString) {
  return new JSDocType(typeString);
}

function flatten (type) {
  if (!type) return [];
  switch (type.type) {
  case NodeType.UNION:
    return [ flatten(type.left), flatten(type.right) ].flat(Infinity);
  default:
    return [ type ];
  }
}

function transform (type) {
  if (!type) return [];

  if (type.type === NodeType.UNION) {
    return [ transform(type.left), transform(type.right) ].flat();
  }

  if (type.type === NodeType.NAME) {
    return [ { name: type.name } ];
  }

  if (type.type === NodeType.ANY || type.type === NodeType.UNKNOWN) {
    return [ { name: '*' } ];
  }

  if (type.type === NodeType.FUNCTION || type.type === NodeType.ARROW) {
    const f = { name: 'Function', kind: 'function' };
    const params = type.params.map(transform).map((t) => ({ type: t }));
    if (params && params.length) f.params = params;
    if (type.this) f.this = transform(type.this);
    if (type.new) f.new = transform(type.new);
    if (type.returns) f.returns = transform(type.returns);
    return [ f ];
  }

  if (type.type === NodeType.GENERIC) {
    return transform(type.subject).map((generic) =>
      type.objects.map(transform).flat().map((t) => ({ ...t, generic }))
    ).flat();
  }

  if (type.type === NodeType.IMPORT) {
    const imp = { importFrom: true };
    switch (type.path.type) {
    case NodeType.NUMBER_VALUE:
      imp.importFrom = type.path.number;
      break;
    case NodeType.STRING_VALUE:
      imp.importFrom = type.path.string;
      break;
      // no default
    }
    return [ imp ];
  }

  if (type.type === NodeType.MEMBER) {
    return transform(type.owner).map((t) => ({
      ...t,
      name: [ t.name, type.name ].filter(Boolean).join('.'),
    }));
  }

  if (type.type === NodeType.OPTIONAL) {
    return transform(type.value).map((t) => ({ ...t, optional: true }));
  }

  if (type.type === NodeType.NULLABLE) {
    return transform(type.value).map((t) => ({ ...t, nullable: true }));
  }

  if (type.type === NodeType.NOT_NULLABLE) {
    return transform(type.value).map((t) => ({ ...t, nullable: false }));
  }

  if (type.type === NodeType.VARIADIC) {
    return transform(type.value).map((t) => ({ ...t, variadic: true }));
  }

  if (type.type === NodeType.RECORD) {
    const record = type.entries.reduce((obj, entry) => {
      obj[entry.key] = transform(entry.value);
      return obj;
    }, {});
    return [ { record } ];
  }

  if (type.value) return transform(type.value);

  if (type.type) return [ publish(type) ];

  return [ type.toString() ];
}
