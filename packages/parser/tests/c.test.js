
import {
  parse,
} from './_harness.js';

describe('c', () => {
  test('parses correctly', async () => {
    const parsed = await parse('c.js');

    expect(parsed.comments).toHaveLength(9);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
