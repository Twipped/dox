import generate from '@babel/generator';

export default function nodeToString (node, comments = false) {
  return generate(node, { comments }).code;
}
