
import parseType from '../lib/parse-type.js';

describe('parse-type', () => {

  const types = [
    'Function',
    'number',
    'Number',
    'number|string',
    'number | string',
    'number|string|{name:string,age:number}',
    '{length: number, type: {name: {first: string, last: string}, id: number | string}}',
    'Array<string|number>',
    '(T|Array)<string|number>',
    'string[]',
    'number=',
    '?number',
    '!number',
    '...number',
    '...?number',
    'function(string)',
    'function(...)',
    'function(...?)',
    'function(...?*)',
    'function(this: Foo, *): Bar',
    'import(\'example\').a',
  ];

  test.each(types)('%s', async (t) => {
    expect(parseType(t)).toMatchSnapshot();
  });

});
