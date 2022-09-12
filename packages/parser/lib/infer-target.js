import Namepath from './namepath.js';
import nodeToString from './nodeToString.js';
import makeDebug from 'debug';
const debug = makeDebug('jsdox/parser:infer-target');

export default function inferTarget (node) {
  const inf = new TargetInferance(node);
  return inf.path;
}

export class TargetInferance {

  constructor (node) {
    this.path = new Namepath();

    if (node) this.traverse(node);
  }

  get length () {
    return this.path.length;
  }

  traverse (node) {
    if (!node) return;
    if (typeof node !== 'object') return;

    if (node.type && node.loc) {
      if (this[node.type]) {
        this[node.type](node);
      } else {
        debug('Unhandled node type: ' + node.type);
        this.path.push(nodeToString(node));
      }
    }

    if (Array.isArray(node)) {
      this.traverse(node[node.length - 1]);
    }

    this.path = this.path.frame();
  }

  AssignmentExpression (node) {
    this.traverse(node.left);
  }

  ExpressionStatement (node) {
    this.traverse(node.expression);
  }

  MemberExpression (node) {
    this.traverse(node.object);
    this.traverse(node.property);
  }

  VariableDeclarator (node) {
    this.traverse(node.id);
  }

  FunctionDeclaration (node) {
    this.traverse(node.id);
  }

  FunctionExpression (node) {
    this.traverse(node.id);
  }

  ArrowFunctionExpression () {
    // do nothing
  }

  ObjectProperty (node) {
    this.traverse(node.key);
  }

  ObjectMethod (node) {
    this.traverse(node.key);
  }

  StringLiteral (node) {
    this.path.push(node.value);
  }

  NumericLiteral (node) {
    this.path.push(node.value);
  }

  BooleanLiteral (node) {
    this.path.push(node.value);
  }

  ThisExpression () {
    this.path.push('this');
  }

  Identifier (node) {
    this.path.push(node.name);
  }
}
