
import {
  parse,
} from './_harness.js';

describe('classes', () => {
  test('parses correctly', async () => {
    const parsed = await parse('classes.js');

    expect(parsed.comments).toHaveLength(13);
    expect(parsed.comments).toMatchParserSnapshot();
  });
});
