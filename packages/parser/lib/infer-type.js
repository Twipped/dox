import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:infer-type');

export default class TypeInferance {

  constructor (target) {
    this.potentials = [];

    this.iterate(target);
  }

  get length () {
    return this.potentials.filter(([ k ]) => k !== 'unknown').length;
  }

  odds () {
    const types = {};
    for (const t of this.potentials) {
      if (types[t]) types[t]++;
      else types[t] = 1;
    }

    const result = Object.entries(types)
      .sort(([ , a ], [ , b ]) => a - b)
      .filter(([ k ]) => k !== 'unknown')
      .map(([ k, v ]) => [ k, Math.round(v / this.potentials.length * 100) ]);

    debug(Object.fromEntries(result));

    return result;
  }

  iterate (node) {
    if (!node) return;
    if (typeof node !== 'object') return;

    if (node.type && node.loc) {
      if (this[node.type]) {
        this[node.type](node);
      } else {
        debug('Unhandled node type: ' + node.type);
      }
    }

    if (Array.isArray(node)) {
      for (const n of node) {
        this.iterate(n);
      }
      return;
    }

    for (const n of Object.values(node)) {
      this.iterate(n);
    }
  }

  BinaryExpression (node) {
    if ([ '*', '%', '/', '^' ].includes(node.operator)) {
      this.potentials.push('Number');
    } else if ([ '+', '-' ].includes(node.operator)) {
      this.potentials.push('Number', 'String');
    }

    this.iterate(node.left);
    this.iterate(node.right);
  }

  StringLiteral () {
    this.potentials.push('String');
  }

  NumericLiteral () {
    this.potentials.push('Number');
  }

  BooleanLiteral () {
    this.potentials.push('Boolean');
  }

  ObjectExpression () {
    this.potentials.push('Object');
  }

  CallExpression () { this.Unknown(); }
  MemberExpression () { this.Unknown(); }
  ThisExpression () { }
  Identifier () { }

  Unknown () {
    this.potentials.push('unknown');
  }
}
