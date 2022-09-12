
import {
  parse,
} from './_harness.js';

describe('enums', () => {
  test('parses correctly', async () => {
    const parsed = await parse('enums.js');

    expect(parsed.comments).toHaveLength(3);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
