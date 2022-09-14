
export function validJSDocNode (node) {
  if (node.type !== 'CommentBlock') return false;

  const firstChar = node.value[0];
  if (firstChar !== '*' && firstChar !== '!') return false;

  return true;
}
