
export class JSSyntaxError extends SyntaxError {
  constructor (message, extras) {
    super(`Could not parse Javascript code: ${message}`);
    this.name = 'JSSyntaxError';
    this.code = 'ERR_INVALID_JS';
    if (extras) Object.assign(this, extras);
  }
}

export class InvalidJSDocCommentError extends SyntaxError {
  constructor (message, body, extras) {
    super(`Could not parse JSDoc block: ${message}`);
    this.name = 'InvalidJSDocCommentError';
    this.code = 'ERR_INVALID_JSDOC_COMMENT';
    this.body = body;
    if (extras) Object.assign(this, extras);
  }
}

export class InvalidJSDocTypeError extends SyntaxError {
  constructor (message, type, extras) {
    super(`"{${type}}" is not a valid JSDoc Type: ${message}`);
    this.name = 'InvalidJSDocTypeError';
    this.code = 'ERR_INVALID_JSDOC_TYPE';
    this.invalidType = type;
    if (extras) Object.assign(this, extras);
  }
}

