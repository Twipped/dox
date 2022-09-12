
import { parse } from './_harness.js';

describe('alias', () => {
  test('../alias', async () => {
    const parsed = await parse('alias.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias1', async () => {
    const parsed = await parse('jsdoc/alias1.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias2', async () => {
    const parsed = await parse('jsdoc/alias2.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias3', async () => {
    const parsed = await parse('jsdoc/alias3.js');
    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias4', async () => {
    const parsed = await parse('jsdoc/alias4.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias5', async () => {
    const parsed = await parse('jsdoc/alias5.js');

    expect(parsed.comments).toHaveLength(4);
    expect(parsed.comments).toMatchParserSnapshot();
  });

  test('alias6', async () => {
    const parsed = await parse('jsdoc/alias6.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
