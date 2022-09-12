
import {
  parse,
} from './_harness.js';

describe('_fixtures/objects', () => {
  test('parses correctly', async () => {
    const parsed = await parse('objects.js');

    expect(parsed.comments).toHaveLength(1);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
