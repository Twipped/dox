
import {
  parse,
} from './_harness.js';

describe('_fixtures/functions', () => {
  test('parses correctly', async () => {
    const parsed = await parse('functions.js');

    expect(parsed.comments).toHaveLength(5);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
