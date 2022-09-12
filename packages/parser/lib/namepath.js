
import parsePath from './parse-path.js';
import clone from 'lodash/clone';
import { inspect } from 'util';

const IDENT_MATCH = /^[a-zA-Z$_][a-zA-Z0-9$_#]*$/;

/**
 * Tests if a given value is a number or is safely coerced to a number.
 *
 * @param {any} input Value to test
 *
 * @returns {boolean}
 * @category Types
 */
function isNumeric (input) {
  if (typeof input === 'number') return true;
  input = String(input);
  if (input.includes('.') || input[0] === '0') {
    // we have to do this the hard way
    return !!input.match(/^-?\d+(?:\.\d+)$/);
  }

  // the easy way
  return String(Number(input)) === input;
}

/**
 * @typedef NamepathSegment
 * @property {string} name
 * @property {string} [alias]
 * @property {string} [namespace]
 */

/**
 * Merge segments into a namepath string
 *
 * @param   {NamepathSegment} segments
 *
 * @returns {string}
 */
function join (...segments) {
  return segments.flat(Infinity).filter(Boolean).map(({ name }) => {
    if (!name) return null;
    if (isNumeric(name)) return `[${name}]`;
    if (typeof name !== 'string') throw new Error('Received non-string segment name.');
    if (name.startsWith('module:') || IDENT_MATCH.exec(name)) return `.${name}`;
    return `["${name}"]`;
  }).filter(Boolean).join('').slice(1);
}

const nameMap = (name) => (
  typeof name === 'object' ? name : { name }
);

export default class Namepath {

  #original = null;
  #stack = [];
  #current = {};
  #module = false;
  #isAliased = false;
  #isNamespaced = false;

  constructor (pathstring) {
    if (pathstring) this.name = pathstring;
  }

  get length () {
    return this.#stack.length + (this.#current.name ? 1 : 0);
  }

  get memberOf () {
    const segments = this.#stack.map(({ name }) => name);

    if (this.#module) segments.unshift(this.#module);

    return segments.filter(Boolean).join('.') || undefined;
  }

  get memberName () {
    if (!this.#original) return this.longName;

    return this.#module
      ? join({ name: this.#module }, this.#original)
      : join(this.#original);
  }

  get longName () {
    return this.#module
      ? join({ name: this.#module }, this.#original, this.#current)
      : join(this.#original, this.#current);
  }

  set name (pathstring) {
    if (typeof pathstring === 'string') {
      const p = parsePath(pathstring).map(nameMap);
      Object.assign(this.#current, p.pop());
      this.#stack = p;
    } else if (Array.isArray(pathstring)) {
      const p = pathstring.map(nameMap);
      Object.assign(this.#current, p.pop());
      this.#stack = p;
    } else if (typeof pathstring === 'object' && pathstring.stack) {
      this.#stack = pathstring.stack;
      this.#current = this.#stack.pop() || {};
      this.#module = pathstring.module;
    }
  }

  get name () {
    return this.#current?.name;
  }

  set module (name) {
    name = name.startsWith('module:') ? name : `module:${name}`;
    this.#module = name;
  }

  get module () {
    return this.#module;
  }

  set namespace (pathstring) {
    this.#original = this.#stack.concat([ { ...this.#current } ]);

    const p = parsePath(pathstring).map(nameMap);
    Object.assign(this.#current, p.pop());
    this.#stack = p;

    this.#current.namespace = pathstring || true;
    this.#isNamespaced = true;
  }

  get namespace () {
    return this.#current.namespace;
  }

  set alias (pathstring) {
    this.#original = this.#stack.concat([ { ...this.#current } ]);

    const p = parsePath(pathstring).map(nameMap);
    Object.assign(this.#current, p.pop());
    this.#stack = p;

    this.#current.original = join(this.#original);
    this.#current.alias = pathstring;
    this.#isAliased = true;
  }

  get alias () {
    return this.#current.alias;
  }

  get isPrototype () {
    return (
      this.#current?.name === 'prototype'
    );
  }

  get isPrototypeMember () {
    return this.#stack.length && this.#stack[this.#stack.length - 1].name === 'prototype';
  }

  get isExports () {
    if (!this.memberOf && this.name === 'exports') return true;
    if (this.memberOf === 'module' && this.name === 'exports') return true;
    return false;
  }

  get isWithinExports () {
    if (this.memberOf === 'exports' && this.length >= 2) return true;
    if (this.memberOf === 'module.exports' && this.length >= 3) return true;
    return false;
  }

  frame () {
    return new Namepath({
      stack: this.#current.name
        ? this.#stack.concat([ this.#current ]).map(clone)
        : this.#stack.map(clone),
      module: this.#module,
    });
  }

  push (...segments) {
    const p = segments.flat(Infinity).map(nameMap);
    if (this.#current.name) {
      this.#stack.push({ name: this.#current.name });
    }
    const current = p.pop();
    Object.assign(this.#current, current);
    this.#stack.push(...p);
  }

  includes (value) {
    return this.#current.name === value || !!this.#stack.find(({ name }) => name === value);
  }

  values () {
    if (this.#current.name) {
      return this.#stack.concat([ this.#current ]);
    }
    return this.#stack;
  }

  toJSON () {
    return this.values();
  }

  toString () {
    return join(this.values());
  }

  [inspect.custom] () {
    const values = this.values().map(({ name }) => name);
    return `\u001b[36mNamepath <\u001b[32m${values.join('.')}\u001b[36m>\u001b[0m`;
  }

}
