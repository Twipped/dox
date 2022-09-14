@jsdox/parser
===

Static analysis and JSDoc parsing library.

## Usage

```sh
npm install @jsdox/parser
```


```js
import { parseFile } from '@jsdox/parser';

const { comments, exports } = parseFile('path/to/something.js');
```

## API

#### `parseFile(filepath: string, [options: Object]): {{ comments: ContextBlock[], exports: ContextBlock[] }}`

Parses the given JS or TS file. The `comments` array contains all JSDoc block comments that were found in the file, with additional context for attached code. The `exports` array provides blocks for every recognized export from the file, regardless of if it has a JSDoc comment.

**Options**:

- `followImports: boolean`: If true, the parser will automatically attempt to follow `import`, `export` and `require` statements to parse the entire dependency tree. Defaults to `false`.

- `importComments: boolean`: If true, comments found in dependencies will be included in the `comments` array. Otherwise only comments from the targeted file will be returned. Defaults to `false`.

Also accepts all of the options for `parseSource` except for `filename`.

#### `parseSource(code: string, [options: Object]): {{ comments: ContextBlock[], exports: ContextBlock[] }}`

Parses the provided JavaScript or Typescript source code. The `comments` array contains all JSDoc block comments that were found in the file, with additional context for attached code. The `exports` array provides blocks for every recognized export from the file, regardless of if it has a JSDoc comment.

**Options**:

- `filename: string`: The path of the file being parsed. Will be used for attributing context blocks.

- `cwd: string`: Directory to use for relative paths. Defaults to the current working directory.

- `type: string`: Babel source type. Can be one of `"script"`, `"module"`, or `"unambiguous"`. Defaults to "unambiguous"

- `babelOptions`: Additional configuration values for [`@babel/parser`](https://babeljs.io/docs/en/babel-parser).

- `attachmentThreshold: number`: How close a doc block must be to a block of code to be considered related. Default is a line number difference of 1. Increase to allow more space.

- `conditionNames: string[]`: An array of export field conditions for module resolution, eg `"node"`, `"require"`, `"import"`, etc.

- `resolve: Function(string)`: A custom path resolution function. If omitted, the parser uses [`enhanced-resolve`](https://www.npmjs.com/package/enhanced-resolve).


## ContextBlock Format

To be documented later.