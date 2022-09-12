
import fs from 'fs/promises';
import path from 'path';
import { inspect } from 'util';

export { JSDocType } from '../lib/parse-type.js';


import { parseFile } from '../index.js';

export async function parse (fixtureName, options) {
  const filename = path.resolve(__dirname, fixtureName);
  const result = parseFile(filename, { cwd: __dirname, ...options });
  return result;
}

export function debug (input, { depth = 4 } = {}) {
  // eslint-disable-next-line no-console
  console.log(inspect(input, { depth, colors: true }));
}

export { inspect };

/* eslint-disable eqeqeq */
/* globals expect */
expect.extend({
  nullOrAny (received, expected) {
    if (expected === undefined) {
      return {
        pass: true,
        message: () => `received ${ this.utils.printReceived(received) }`,
      };
    }

    if (received === null) {
      return {
        pass: true,
        message: () => `expected null or instance of ${this.utils.printExpected(expected) }, but received ${ this.utils.printReceived(received) }`,
      };
    }

    if (expected == Array) {
      return {
        pass: Array.isArray(received),
        message: () => `expected an array, but received ${ this.utils.printReceived(received) }`,
      };
    }

    if (expected == String) {
      return {
        pass: typeof received == 'string' || received instanceof String,
        message: () => `expected null or instance of ${this.utils.printExpected(expected) }, but received ${ this.utils.printReceived(received) }`,
      };
    }

    if (expected == Number) {
      return {
        pass: typeof received == 'number' || received instanceof Number,
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Function) {
      return {
        pass: typeof received == 'function' || received instanceof Function,
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Object) {
      return {
        pass: received !== null && typeof received == 'object',
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (expected == Boolean) {
      return {
        pass: typeof received == 'boolean',
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
      };
    }

    if (typeof Symbol != 'undefined' && this.expectedObject == Symbol) {
      return {
        pass: typeof received == 'symbol',
        message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
      };
    }

    return {
      pass: received instanceof expected,
      message: () => `expected null or instance of ${this.utils.printExpected(expected)}, but received ${this.utils.printReceived(received)}`,
    };
  },

  toMatchParserSnapshot (received) {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () => `expected an array, but received ${ this.utils.printReceived(received) }`,
      };
    }
    for (const [ i, item ] of received.entries()) {
      expect(item).toMatchSnapshot({
        ast: expect.any(Object),
        ctx: expect.any(Object),
        cmt: expect.any(Object),
        code: expect.any(String),
        tags: expect.arrayContaining([]),
      }, `Item ${i + 1}`);
    }
    return {
      pass: true,
      message: () => `expected an array, but received ${ this.utils.printReceived(received) }`,
    };
  },
});
