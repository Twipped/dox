
import {
  parse,
} from './_harness.js';

describe('a', () => {
  test('parses correctly', async () => {
    const parsed = await parse('a.js');

    expect(parsed.comments).toHaveLength(2);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
