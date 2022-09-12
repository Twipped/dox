
import {
  parse,
} from './_harness.js';

describe('b', () => {
  test('parses correctly', async () => {
    const parsed = await parse('b.js');

    expect(parsed.comments).toHaveLength(3);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
