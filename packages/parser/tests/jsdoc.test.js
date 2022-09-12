
import {
  parse,
} from './_harness.js';
import glob from 'fast-glob';

const fixtures = glob.sync([ './jsdoc/**/*.js', '!**.test.js' ], { cwd: __dirname });

describe.each(fixtures)('%s', (fixture) => {
  test('snapshots', async () => {
    const parsed = await parse(fixture);

    expect(parsed.comments).toMatchParserSnapshot();
  });
});
