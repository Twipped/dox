
import { InvalidJSDocTypeError } from './exceptions.js';
import parseType from './parse-type.js';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:parse-tags');


function getType (type, [ { number: lineNumber = 0, source = '' } ] = [ {} ]) {
  try {
    return type ? parseType(type) : [];
  } catch (e) {
    const columnNumber = source.indexOf(type);
    throw new InvalidJSDocTypeError(e.message, type, {
      lineNumber,
      columnNumber,
    });
  }
}

function parseName (input) {
  const parts = input.split(/\.|#|~|@/);
  const parsed = { name: parts.pop() };
  const i = parts.indexOf('prototype');
  if (i >= 0) {
    parsed.scope = 'instance';
    parts.splice(i, 1);
  }
  if (parts.length) parsed.memberOf = parts.join('.');
  return parsed;
}


export default function parseTags (tags) {
  const ctx = {};

  for (const tag of tags) {
    t(ctx, tag);
  }

  return ctx;
}

function t (ctx, tag) {
  if (!T[tag.tag]) {
    debug(`Unknown tag: ${tag.tag}`);
    return ctx;
  }
  T[tag.tag](ctx, tag);
  return ctx;
}

var T = {

  description (ctx, { description: descText }) {
    ctx.description = descText;
  },

  desc (ctx, { description: descText }) {
    ctx.description = descText;
  },

  summary (ctx, { description }) {
    ctx.summary = description;
  },

  todo (ctx, { description }) {
    ctx.todo = ctx.todo ? ctx.todo + `\n${description}` : description;
  },

  tutorial (ctx, { description }) {
    ctx.tutorial = ctx.tutorial ? ctx.tutorial + `\n${description}` : description;
  },

  author (ctx, { name }) {
    ctx.author = name;
  },

  alias (ctx, { name }) {
    ctx.alias = name;
  },

  ignore (ctx) {
    ctx.ignore = true;
  },

  module (ctx, { name, type, source }) {
    ctx.module = {};
    if (name) ctx.module.name = name.startsWith('module:') ? name : `module:${name}`;
    if (type) ctx.module.type = getType(type, source);
  },

  param (ctx, { name, type, optional, description, source }) {
    if (!ctx.params) ctx.params = [];

    type = type ? getType(type, source) : [];

    const p = { ...parseName(name), type, optional };
    if (description) p.description = description.trim();

    ctx.params.push(p);
  },
  property (ctx, { name, type, description, source }) {
    if (!ctx.properties) ctx.properties = [];
    type = type ? getType(type, source) : [];

    const p = { ...parseName(name), type };
    if (description) p.description = description;

    ctx.properties.push({
      description,
    });
  },

  returns (ctx, { type, description, source }) {
    ctx.returns = {};
    if (type) ctx.returns.type = getType(type, source);
    if (description) ctx.returns.description = description;
  },
  return (ctx, tag) { this.returns(ctx, tag); },

  throws (ctx, { type, description, source }) {
    ctx.throws = {
      type: type ? getType(type, source) : [],
      description,
    };
  },

  yields (ctx, { type, description, source }) {
    ctx.yields = {
      type: type ? getType(type, source) : [],
      description,
    };
  },

  example (ctx, { description }) {
    if (!ctx.examples) ctx.examples = [];
    ctx.examples.push(description);
  },

  define (ctx, { type, description, source }) {
    ctx.define = {
      type: type ? getType(type, source) : [],
      description,
    };
  },

  template (ctx, { type, description, source }) {
    ctx.template = {
      type: type ? getType(type, source) : [],
      description,
    };
  },

  class (ctx, { name, description }) {
    ctx.kind = 'class';
    if (name) ctx.name = name;
    if (description) ctx.description = description;
  },

  classdesc (ctx, { description }) {
    ctx.kind = 'class';
    if (description) ctx.classDescription = description;
  },

  event (ctx, { name, description }) {
    ctx.kind = 'event';
    if (name) Object.assign(ctx, parseName(name));
    if (description) ctx.description = description;
  },

  function (ctx, { name, description }) {
    ctx.kind = 'function';
    if (name) Object.assign(ctx, parseName(name));
    if (description) ctx.description = description;
  },

  callback (ctx, { name, description }) {
    ctx.kind = 'function';
    ctx.isCallback = true;
    if (name) Object.assign(ctx, parseName(name));
    if (description) ctx.description = description;
  },

  constant (ctx, { type, description, source }) {
    ctx.isConstant = true;
    ctx.isReadOnly = true;
    if (type) ctx.type = type ? getType(type, source) : [];
    if (description) ctx.typeAnnotation = description;
  },
  const (ctx, tag) { this.constant(ctx, tag); },
  readonly (ctx) {
    ctx.isReadOnly = true;
  },

  export (ctx, { name }) {
    ctx.isExport = true;
    if (name) ctx.export = name;
    if (name && !ctx.name) ctx.name = name;
  },

  type (ctx, { name, type, description, source }) {
    ctx.type = type ? getType(type, source) : [];
    if (name) ctx.typedef = name;
    if (description.trim()) ctx.typeAnnotation = description.trim();
  },

  typedef (ctx, { name, type, description, source }) {
    ctx.isTypedef = true;
    ctx.type = type ? getType(type, source) : [];
    if (name) ctx.typedef = name;
    if (description.trim()) ctx.typeAnnotation = description.trim();
  },

  namespace (ctx, { type, name, description, source }) {
    ctx.namespace = {};
    if (type) ctx.namespace.type = getType(type, source);
    if (name) ctx.namespace.name = name;
    else if (ctx.alias) ctx.namespace.name = ctx.alias;
    if (description.trim()) ctx.namespace.description = description.trim();
  },

  see (ctx, tag) {
    // TODO: How does comment-parse output see tags
    // console.log({ tag });
    ctx.see = tag.name;
  },

  since (ctx, { name, description }) {
    ctx.since = name || description;
  },

  version (ctx, { name, description }) {
    ctx.version = name || description;
  },

  implicitCast (ctx) {
    ctx.isImplicitType = true;
  },

  inheritDoc (ctx) {
    ctx.overrides = true;
  },

  override (ctx) {
    ctx.overrides = true;
  },

  this (ctx, { type, description, source }) {
    ctx.this = {
      type: type ? getType(type, source) : [],
      description,
    };
  },

  enum (ctx, { type, description, source }) {
    ctx.isEnum = true;
    if (type) ctx.type = type ? getType(type, source) : [ 'number' ];
    if (description.trim()) ctx.typeAnnotation = description.trim();
  },

  suppress (ctx, { type, source }) {
    ctx.suppress = type ? getType(type, source) : true;
  },

  default (ctx) {
    ctx.default = true;
  },

  async (ctx) {
    ctx.isAsync = true;
  },

  generator (ctx) {
    ctx.isGenerator = true;
  },

  abstract (ctx) {
    ctx.isAbstract = true;
  },

  dict (ctx) {
    ctx.isDict = true;
    ctx.isStruct = false;
  },

  struct (ctx) {
    ctx.isStruct = true;
    ctx.isDict = false;
  },

  unrestricted (ctx) {
    ctx.isUnrestricted = true;
    ctx.isStruct = false;
    ctx.isDict = false;
  },

  interface (ctx) {
    ctx.isInterface = true;
  },

  record (ctx) {
    ctx.isRecord = true;
  },

  polymer (ctx) {
    ctx.isPolymer = true;
  },

  polymerBehavior (ctx) {
    ctx.isPolymerBehavior = true;
  },

  constructor (ctx) {
    ctx.kind = 'constructor';
    ctx.isConstructor = true;
  },

  final (ctx) {
    ctx.isFinal = true;
  },

  implements (ctx, { type, description, source }) {
    ctx.implements = type ? getType(type, source) : [];
    if (description.trim()) ctx.implementsAnnotation = description.trim();
  },

  extends (ctx, { name, type, description, source }) {
    if (!ctx.extends) ctx.extends = [];

    type = type ? getType(type, source) : [];
    const p = parseName(name);

    if (type && type.length) p.type = type;
    if (description.trim()) p.description = description.trim();

    ctx.extends.push(p);
  },
  augments (ctx, tag) { this.extends(ctx, tag); },

  lends (ctx, { type, description, source }) {
    ctx.lends = type ? getType(type, source) : [];
    if (description.trim()) ctx.lendsAnnotation = description.trim();
  },

  deprecated (ctx, { description }) {
    ctx.isDeprecated = description || true;
  },

  memberOf (ctx, { name }) {
    ctx.parent = name;
  },

  inner (ctx) {
    ctx.scope = 'inner';
  },

  instance (ctx) {
    ctx.scope = 'instance';
  },

  static (ctx) {
    ctx.scope = 'static';
  },

  global (ctx) {
    ctx.scope = 'global';
  },

  package (ctx) {
    ctx.visibility = 'package';
  },

  public (ctx) {
    ctx.visibility = 'public';
  },

  private (ctx) {
    ctx.visibility = 'private';
  },

  protected (ctx) {
    ctx.visibility = 'protected';
  },

  access (ctx, { name }) {
    ctx.visibility = name;
  },

  api (ctx, { source }) {
    ctx.visibility = source?.[0]?.tokens?.name;
  },

  file (ctx, { description }) {
    ctx.isFile = true;
    if (description.trim()) ctx.description = description.trim();
  },
  fileoverview (ctx, tag) { this.file(ctx, tag); },

  license (ctx, { description }) {
    ctx.license = description.trim();
  },

  fires (ctx, { name, description }) {
    if (!ctx.fires) ctx.fires = [];

    const p = parseName(name);
    if (description.trim()) p.description = description.trim();
    ctx.fires.push(p);
  },

};
