/* eslint-disable no-shadow */

import path from 'path';
import fs from 'fs';
import enhancedResolve, { CachedInputFileSystem } from 'enhanced-resolve';
import nodeToString from './nodeToString.js';
import parseType from './parse-type.js';
import parseComment from './parse-comment.js';
import TypeInferance from './infer-type.js';
import inferTarget from './infer-target.js';
import { validJSDocNode } from './checks.js';
import Namepath from './namepath.js';

import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:crawl-ast');
makeDebug.formatters.e = (fn) => makeDebug.coerce(fn());

const PRIMATIVES = [
  'StringLiteral',
  'NumericLiteral',
  'BooleanLiteral',
];

export default function crawl (node, options) {
  const context = new SourceContext(options);
  context.iterate(node);
  return {
    comments: context.emitted,
    exports: context.exports,
  };
}

function flattenPrototype (o, extend) {
  const result = {};
  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const k in o) {
    result[k] = o[k];
  }

  Object.assign(result, extend);
  return result;
}

export class SourceContext {

  constructor ({
    filename,
    attachmentThreshold = 1,
    cwd,
    dir = path.dirname(filename),
  } = {}) {
    this.depth = '';
    const resolver = enhancedResolve.create.sync({
      fileSystem: new CachedInputFileSystem(fs, 4000),
      extensions: [ '.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx', '.json', '.node' ],
      roots: [ cwd ],
      conditionNames: [ 'node', 'require' ],
    });
    const resolve = (target) => {
      try {
        return resolver(dir, target);
      } catch (e) {
        Error.captureStackTrace(e, resolve);
        // throw new Error(e.message);
        throw e;
      }
    };

    this.options = {
      attachmentThreshold,
      cwd,
      filename,
      dir,
      resolve,
    };
    this.emitted = [];
    this.exports = [];
    this.seen = new Set();

    this.debug = makeDebug('jsdox/parser:crawl-ast:emits');
  }

  emit (value, type) {
    this.debug(`${this.depth}emitted ${type}`, value);
    this.emitted.push(value);
  }

  emitExport (value) {
    this.debug(`${this.depth}exported`, value);
    this.exports.push(value);
  }

  iterate (node) {
    if (this.seen.has(node)) return this;

    const frame = new ContextLayer(this);
    frame.iterate(node);
    this.emitted.sort((a, b) => a.start - b.start);
  }

}

export class ContextLayer {

  constructor (parent = null, overrides = {}) {
    this.depth = parent ? parent.depth + ' ' : '';
    this.parent = parent;
    this.options = parent?.options || {};
    this.ctx = parent?.ctx ? Object.create(parent.ctx) : {};

    this.path = parent?.path ? parent.path.frame() : new Namepath();
    this.scope = parent?.scope ? new Map(parent.scope.entries()) : new Map();
    this.children = [];
    this.emitted = [];
    this.seen = parent?.seen || new Set();

    Object.assign(this, overrides);
  }

  member (name) {
    this.ctx.member = name;
    this.ctx.name = name;
    debug(`${this.depth}scope set ${name}`, this.ctx);
    this.scope.set(name, this.ctx);
  }

  emit (value, type) {
    this.emitted.push(value);
    return this.parent.emit(value, type);
  }

  emitExport (value) {
    return this.parent.emitExport(value);
  }

  frame (overrides) {
    return new ContextLayer(this, overrides);
  }

  flatten (overrides) {
    return flattenPrototype(this.ctx, overrides);
  }

  iterate (node) {
    if (!node) return this;
    if (typeof node !== 'object') return this;

    if (this.seen.has(node)) return this;
    this.seen.add(node);

    const handled = !this[node.type] ? '(Unhandled)' : '';
    debug(
      `Line %e ${this.depth}%e: %e`,
      () => String(node.loc?.start?.line || '-').padStart(4, ' '),
      () => (node.type ? (node.type + handled) : ((Array.isArray(node) && 'Array') || '')),
      () => node.type && nodeToString(node).split(/\n|\r/)[0].slice(0, 50) || ''
    );

    if (Array.isArray(node)) {
      for (const n of node) {
        const child = this.frame();
        child.iterate(n);
        this.children.push(child);
      }
      return this;
    }

    if (!node.type || !node.loc) {
      for (const n of Object.values(node)) {
        const child = this.frame();
        this.children.push(child);
        child.iterate(n);
      }
      return this;
    }

    let attachedComment = false;

    // process all comments, emitting the ones not relevant to this code
    // and saving the one that is.
    if (node.leadingComments) {
      const ctx = flattenPrototype(this.ctx);
      for (const comment of node.leadingComments) {
        if (!validJSDocNode(comment)) continue;

        const attached = node.loc.start.line - comment.loc.end.line <= this.options.attachmentThreshold;

        if (!attached) {
          const raw = `/*${comment.value}*/`;
          const cmt = parseComment(raw);
          if (cmt.alias) {
            const { alias } = cmt;
            if (ctx.name || cmt.name) {
              ctx.aliasOriginal = ctx.name || cmt.name;
            }
            this.path.alias = alias;
            cmt.name = this.path.name;

            const membr = this.path.memberOf;
            if (membr) {
              cmt.memberOf = this.path.memberOf;
            } else {
              delete cmt.memberOf;
              delete ctx.memberOf;
            }
          }
          this.emit({
            ...ctx,
            ...cmt,
            path: this.path.values(),
            raw,
            ctx,
            cmt,
            ast: comment,
            code: '',
            loc: {
              start: comment.loc.start,
              end: comment.loc.end,
            },
            start: comment.start,
            end: comment.end,
          }, 'detached comment');
          continue;
        }

        attachedComment = comment;
      }
    }

    // Run inference for this node
    if (this[node.type]) {
      this[node.type](node);
    }

    // if there was an attached comment, parse it
    if (!attachedComment) {
      return this;
    }

    const ctx = flattenPrototype(this.ctx);
    const raw = `/*${attachedComment.value}*/`;
    const cmt = parseComment(raw);
    if (cmt.alias) {
      const { alias } = cmt;
      if (ctx.name || cmt.name) {
        ctx.aliasOriginal = ctx.name || cmt.name;
      }
      this.path.alias = alias;
      cmt.name = this.path.name;

      const membr = this.path.memberOf;
      if (membr) {
        cmt.memberOf = this.path.memberOf;
      } else {
        delete cmt.memberOf;
        delete ctx.memberOf;
      }
    }
    this.cmt = cmt;
    this.ctx = Object.assign(Object.create(this.ctx), cmt);

    this.emit({
      ...ctx,
      ...cmt,
      path: this.path.values(),
      raw,
      ctx,
      cmt,
      ast: node,
      code: nodeToString(node),
      loc: {
        start: attachedComment.loc.start,
        end: node.loc.end,
      },
      start: attachedComment.start,
      end: node.end,
    }, 'attached comment');

    return this;
  }

  File (node) {
    if (this.options.filename) this.ctx.filename = path.relative(this.options.cwd, this.options.filename);

    this.iterate(node.program);
    const seen = new Set();
    for (const r of this.emitted) {
      seen.add(r.start);
    }

    const ctx = flattenPrototype(this.ctx);
    for (const n of node.comments) {
      if (seen.has(n.start)) continue;
      if (!validJSDocNode(n)) continue;
      const raw = `/*${n.value}*/`;
      const cmt = parseComment(raw);

      this.emit({
        ...ctx,
        ...cmt,
        raw,
        ctx,
        cmt,
        ast: n,
        code: '',
        loc: {
          start: n.loc.start,
          end: n.loc.end,
        },
        start: n.start || 0,
        end: n.end,
      }, 'unseen comment');
    }
  }

  Program (node) {
    for (const n of node.body) {
      const child = this.frame();
      child.scope = this.scope;
      this.children.push(child);
      child.iterate(n);
    }
  }

  ImportDeclaration (node) {
    let source = node?.source?.value;
    try {
      source = source && this.options.resolve(node.source.value);
      source = source && path.relative(this.options.cwd, source);
    } catch (e) {
      this.ctx.error = e;
    }
    const fromPackage = source && !!node.source.value.match(/^\w/) && node.source.value;

    debug(`${this.depth}imported ${fromPackage || source}`);
    for (const n of node.specifiers) {
      const child = this.frame();
      child.ctx.source = source;
      if (fromPackage) child.ctx.package = fromPackage;
      child.scope = this.scope;
      this.children.push(child);
      child.iterate(n);
    }
  }

  ImportSpecifier (node) {
    const imported = nodeToString(node.imported);
    const local = nodeToString(node.local);

    this.path.name = local;
    this.ctx.name = local;
    if (imported !== local) {
      this.ctx.local = imported;
    }
    this.ctx.isExternal = true;

    debug(`${this.depth}scope set ${this.path}`, this.ctx);
    this.scope.set(this.path.toString(), this.ctx);
  }

  ImportDefaultSpecifier (node) {
    const local = nodeToString(node.local);

    this.path.name = local;
    this.ctx.name = local;
    this.ctx.local = 'default';
    this.ctx.isExternal = true;

    debug(`${this.depth}scope set ${this.path}`, this.ctx);
    this.scope.set(this.path.toString(), this.ctx);
  }

  ImportNamespaceSpecifier (node) {
    const local = nodeToString(node.local);

    this.path.name = local;
    this.ctx.name = local;
    this.ctx.isExternal = true;
    this.ctx.namespaceImport = true;
    this.ctx.namespace = {
      name: local,
    };
    // this.ctx.local = 'default';

    debug(`${this.depth}scope set ${this.path}`, this.ctx);
    this.scope.set(this.path.toString(), this.ctx);
  }

  ExportAllDeclaration (node) {
    let source = node?.source?.value;
    try {
      source = source && this.options.resolve(node.source.value);
      source = source && path.relative(this.options.cwd, source);
    } catch (e) {
      this.ctx.error = e;
    }

    const ctx = flattenPrototype(this.ctx);
    this.emitExport({
      all: true,
      source,
      ctx: { ...ctx, ...this.cmt },
    });
  }

  ExportDefaultDeclaration (node) {
    this.ctx.isExport = true;
    this.ctx.isDefaultExport = true;
    this.ctx.export = 'default';

    this.iterate(node.declaration);

    const ctx = flattenPrototype(this.ctx);

    this.emitExport({
      name: 'default',
      local: this.path.name || 'default',
      source: this.options.filename,
      ctx: { ...ctx, ...this.cmt },
    });
  }

  ExportNamedDeclaration (node) {
    this.ctx.isExport = true;
    this.iterate(node.declaration);

    if (node.declaration) {
      this.ctx.export = this.ctx.name;
      const ctx = flattenPrototype(this.ctx);
      this.emitExport({
        name: this.path.longName,
        local: this.path.name,
        source: this.options.filename,
        ctx: { ...ctx, ...this.cmt },
      });
    }

    if (node.specifiers.length) {
      let source = node?.source?.value;
      try {
        source = source && this.options.resolve(node.source.value);
        source = source && path.relative(this.options.cwd, source);
      } catch (e) {
        this.ctx.error = e;
      }
      if (!source) source = this.options.filename;

      for (const n of node.specifiers) {
        const child = this.frame();
        child.ctx.source = source;
        child.scope = this.scope;
        this.children.push(child);
        child.iterate(n);
      }
    }
  }

  ExportSpecifier (node) {
    this.ctx.isExport = true;
    this.ctx.export = node.local.name;
    const local = node.local.name;
    const exported = node.exported.name;

    const ctx = (this.ctx.source === this.options.filename || !this.ctx.source)
      ? flattenPrototype(this.scope.get(local))
      : flattenPrototype(this.ctx);

    const source = ctx.source || this.options.filename;
    ctx.name = exported;

    this.emitExport({
      name: node.exported.name,
      local: ctx.local || local,
      source,
      ctx: { ...ctx, ...this.cmt },
    });
  }

  ExpressionStatement (statement) {
    this.iterate(statement.expression);

    if (this.path.memberOf === 'exports' && this.path.length === 2) {
      this.ctx.export = this.path.name;
      this.ctx.isExport = true;
    } else if (this.path.memberOf === 'module.exports' && this.path.length === 3) {
      this.ctx.export = 'default';
      this.ctx.isExport = true;
      this.ctx.isDefaultExport = true;
    }
  }

  AssignmentExpression (node) {
    // TODO: This could be a LOT smarter in handling scope
    const target = inferTarget(node.left);
    this.path = target;
    this.ctx.name = target.name;

    const rightTarget = inferTarget(node.right);
    if (!rightTarget.length) {
      this.ctx.name = this.path.name;
      if (this.path.memberOf) {
        this.ctx.memberOf = this.path.memberOf;
        this.ctx.member = this.path.name;
      }
    }

    if (this.path.isPrototype) {
      this.ctx.kind = 'prototype';
    } else if (target.length > 1 && !this.path.isExports) {
      this.ctx.memberOf = this.path.memberOf;
      this.ctx.member = this.path.name;
      this.ctx.kind = 'property';
    }

    if (target.isPrototypeMember) {
      this.ctx.scope = 'instance';
    }

    if (node.right.type === 'AssignmentExpression') {
      const f = this.frame();
      f.iterate(node.right);
      Object.assign(this.ctx, f.ctx);
    } else if (node.right.type === 'Identifier' && this.scope.has(node.right.name)) {
      const assignedValue = this.scope.get(node.right.name);
      debug(`${this.depth}scope get ${node.right.name}`, assignedValue);
      Object.assign(this.ctx, assignedValue);
    } else {
      this.iterate(node.right);
    }

    debug(`${this.depth}scope set ${this.path}`, this.ctx);
    this.scope.set(this.path.toString(), this.ctx);

    if (this.path.isExports) {
      this.ctx.export = 'default';
      this.ctx.isDefaultExport = true;
      const ctx = flattenPrototype(this.ctx);
      this.emitExport({
        name: 'default',
        local: this.path.name || null,
        source: this.options.filename,
        ctx: { ...ctx, ...this.cmt },
      });
    } else if (this.path.isWithinExports) {
      const exp = this.cmt?.name || this.ctx?.name;
      if (exp) this.ctx.export = exp;
      this.ctx.isExport = true;
      const ctx = flattenPrototype(this.ctx);
      this.emitExport({
        name: this.ctx.name,
        local: this.path.name || null,
        source: this.options.filename,
        ctx: { ...ctx, ...this.cmt },
      });
    }
  }

  processFunction (node) {
    this.ctx.kind = 'function';
    this.ctx.type = parseType('Function');
    this.ctx.params = [];
    this.ctx.isGenerator = node.generator;
    this.ctx.isAsync = node.async;

    const paramsFrame = this.frame();
    paramsFrame.iterate(node.params);
    this.ctx.params = paramsFrame.children.map(({ ctx }) => (ctx));

    const rtp = this.ctx.returnPotentials = new TypeInferance();

    const bodyFrame = this.frame();
    if (node.id) {
      const name = nodeToString(node.id);
      bodyFrame.scope.set(name, this.ctx);
    }
    bodyFrame.iterate(node.body);

    if (rtp.length) {
      const odds = rtp.odds();
      const [ [ likely ] = [] ] = odds;

      if (likely) {
        if (!this.ctx.returns) this.ctx.returns = {};
        this.ctx.returns.type = parseType(likely);
      }
    }
    delete this.ctx.returnPotentials;
  }

  ArrowFunctionExpression (node) {
    this.processFunction(node);
  }

  FunctionExpression (node) {
    this.processFunction(node);
    if (node.id) {
      const name = nodeToString(node.id);
      if (!this.ctx.name) this.member(name);
      this.ctx.fnName = name;
    }

    if (this.ctx.memberOf === 'exports' || this.ctx.isExport) {
      this.ctx.kind = 'function';
    } else {
      this.ctx.kind = 'method';
    }
  }

  FunctionDeclaration (node) {
    this.processFunction(node);
    if (node.id) {
      const name = nodeToString(node.id);
      if (!this.ctx.name) {
        this.ctx.name = name;
      }
      this.ctx.fnName = name;
      this.path.push(name);
    }
    debug(`${this.depth}scope set ${this.path}`, this.ctx);
    this.scope.set(this.path.toString(), this.ctx);
  }

  BlockStatement (node) {
    this.frame({ path: new Namepath(), parentPath: this.path }).iterate(node.body);
  }

  ClassExpression (node) {
    this.ClassDeclaration(node);
  }

  ClassDeclaration (node) {
    this.ctx.kind = 'class';
    if (node.id) {
      const name = nodeToString(node.id);
      if (!this.path.length) this.path.name = name;
      this.ctx.name = name;
      debug(`${this.depth}scope set ${name}`, this.ctx);
      this.scope.set(name, this.ctx);
      this.ctx.type = parseType(name);
    }

    const f = this.frame();
    debug(`${this.depth} scope set ${this.path}`, this.ctx);
    f.scope.set(this.path.toString(), this.ctx);
    if (this.ctx.name) f.path.name = this.ctx.name;
    f.iterate(node.body);
    this.ctx.properties = f.ctx.properties;

    if (node.superClass) {
      if (node.superClass.type === 'CallExpression') {
        this.ctx.extends = [ { expression: nodeToString(node.superClass) } ];
      } else if (node.superClass.type === 'Identifier') {
        this.ctx.extends = [ { name: nodeToString(node.superClass) } ];
      } else {
        const frame = new ContextLayer();
        frame.iterate(node.superClass);
        this.ctx.extends = [ frame.flatten() ];
      }
    }
  }

  ClassBody (node) {
    for (const n of node.body) {
      const child = this.frame();
      this.children.push(child);
      child.iterate(n);
    }

    this.ctx.properties = this.children.map(({ ctx }) => ({ ...flattenPrototype(ctx) }));
  }

  ClassMethod (node) {
    const { ctx } = this;
    // ctx.memberOf = ctx.name;

    const name = node.key.type === 'MemberExpression'
      ? '[' + nodeToString(node.key) + ']'
      : nodeToString(node.key);

    this.path.push('prototype', name);
    ctx.memberOf = this.path.memberOf;
    ctx.member = ctx.name = this.path.name;
    ctx.name = name;

    ctx.kind = node.kind;
    ctx.scope = node.static ? 'static' : 'instance';
    if (node.kind === 'constructor') ctx.isConstructor = true;
    ctx.isGenerator = node.generator;
    ctx.isAsync = node.async;

    const f = this.frame();
    f.iterate(node.params);
    this.ctx.params = f.children.map(({ ctx }) => (ctx));
  }

  Identifier (node) {
    this.member(node.name);
  }

  ReturnStatement (node) {
    if (this.ctx.returnPotentials) this.ctx.returnPotentials.iterate(node.argument);
  }

  MemberExpression (node) {
    this.path.push(inferTarget(node));

    this.frame().iterate(node.object);
    this.frame().iterate(node.property);
  }

  CallExpression (node) {
    this.frame().iterate(node.callee);
    this.frame().iterate(node.arguments);
  }

  AssignmentPattern (node) {
    this.AssignmentExpression(node);

    this.ctx.optional = true;
    this.ctx.default = this.ctx.value;
    delete this.ctx.value;
    delete this.ctx.kind;
  }

  VariableDeclaration (node) {
    if (node.kind !== 'const') {
      this.ctx.mutable = true;
    }

    const snapshot = flattenPrototype(this.ctx);

    // only the first declaration is applied to the parent context.
    // later declarations are provided a copy of it.
    this.iterate(node.declarations[0]);
    this.frame({ ctx: snapshot }).iterate(node.declarations.slice(1));
  }

  VariableDeclarator (node) {
    const name = nodeToString(node.id);
    this.member(name);
    this.path = new Namepath(name);

    if (this.ctx.isExport) {
      this.ctx.export = name;
    }

    this.iterate(node.init);
    if (!this.ctx.kind && !this.ctx.mutable && PRIMATIVES.includes(node.init.type)) {
      this.ctx.kind = 'constant';
      this.ctx.isConstant = true;
      this.ctx.isReadOnly = true;
    }
  }

  ObjectExpression (node) {
    if (this.path.isWithinExports || this.path.isExports) {
      this.ctx.kind = 'object';
    } else if (this.ctx.memberOf) {
      this.ctx.kind = 'property';
    } else if (!this.ctx.kind) {
      this.ctx.kind = 'object';
    }

    this.ctx.type = parseType('Object');
    this.ctx.properties = node.properties
      .map((n) => crawl(n, this.options).comments)
      .flat()
      .map(({ ast, ...rest }) => rest); // eslint-disable-line no-unused-vars

    const f = this.frame();
    f.iterate(node.properties);
    this.ctx.properties = f.children.map(({ ctx, path }) => ({ ...ctx, path }));
  }

  ObjectProperty (node) {

    this.ctx.memberOf = this.ctx.name;

    const name = node.key.type === 'MemberExpression'
      ? '[' + nodeToString(node.key) + ']'
      : nodeToString(node.key);

    this.member(name);

    if (!this.ctx.kind || this.ctx.kind === 'constant') {
      this.ctx.kind = 'property';
    }

    // apply the property's value types
    this.iterate(node.value);
  }

  ObjectMethod (node) {
    this.ctx.memberOf = this.ctx.name;

    const name = node.key.type === 'MemberExpression'
      ? '[' + nodeToString(node.key) + ']'
      : nodeToString(node.key);
    this.member(name);

    this.ctx.kind = node.kind || 'method';
    if (this.ctx.kind === 'get') this.ctx.isGetter = true;
    if (this.ctx.kind === 'set') this.ctx.isSetter = true;

    // apply the property's value types
    this.iterate(node.body);
  }

  StringLiteral (node) {
    if (this.path.isWithinExports) {
      this.ctx.kind = 'constant';
    } else if (this.ctx.memberOf) {
      this.ctx.kind = 'property';
    }

    this.ctx.type = parseType('string');
    this.ctx.value = node.value;
  }

  NumericLiteral (node) {
    if (this.path.isWithinExports) {
      this.ctx.kind = 'constant';
    } else if (this.ctx.memberOf) {
      this.ctx.kind = 'property';
    }

    this.ctx.type = parseType('number');
    this.ctx.value = node.value;
  }

  BooleanLiteral (node) {
    if (this.path.isWithinExports) {
      this.ctx.kind = 'constant';
    } else if (this.path.memberOf) {
      this.ctx.kind = 'property';
    }

    this.ctx.type = parseType('boolean');
    this.ctx.value = node.value;
  }


}

