
export default function is (node, type, fn, truthyValue = true) {
  if (node?.type !== type) return false;
  const res = fn ? fn(node) : true;
  return (res === undefined || !!res) ? truthyValue || true : false;
}

export function test (bool, fn) {
  if (!bool) return false;
  const res = fn ? fn() : true;
  return res === undefined || res;
}

export const hasExport = (node) =>
  is(node, 'ExportDefaultDeclaration')
  ||
  is(node, 'ExportNamedDeclaration')
  ||
  is(node, 'ExpressionStatement', (statement) =>
    is(statement.expression, 'AssignmentExpression', (assignment) =>
      is(assignment.left, 'MemberExpression', (member) =>
        is(member.object, 'Identifier', (object) =>
          test(object.name === 'exports', () =>
            is(member.property, 'Identifier')
          )
          ||
          test(object.name === 'module', () =>
            is(member.property, 'Identifier', (identifier) =>
              test(identifier.name === 'exports')
            )
          )
        )
      )
    )
  );

export function validJSDocNode (node) {
  if (node.type !== 'CommentBlock') return false;

  const firstChar = node.value[0];
  if (firstChar !== '*' && firstChar !== '!') return false;

  return true;
}
