
import { parse } from './_harness.js';

describe('parse errors', () => {
  test('_fixtures/parse-error-badsetter', async () => {
    const p = parse('parse-error-badsetter.js');
    await expect(p).rejects.toThrow();
    await expect(p.catch((e) => e)).resolves.toMatchObject({
      message: "A 'set' accesor must have exactly one formal parameter. (6:2)",
      name: 'SyntaxError',
      code: 'BABEL_PARSER_SYNTAX_ERROR',
      reasonCode: 'BadSetterArity',
    });
  });

  test('_fixtures/parse-error-syntax', async () => {

    const p = parse('parse-error-syntax.js');
    await expect(p).rejects.toThrow();
    await expect(p.catch((e) => e)).resolves.toMatchObject({
      message: "Unexpected token (16:34)",
      name: 'SyntaxError',
      code: 'BABEL_PARSER_SYNTAX_ERROR',
      reasonCode: 'UnexpectedToken',
    });
  });
});
