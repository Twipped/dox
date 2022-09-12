
/**
 * A Foo.
 * @class FooBar
 * @extends Foo.Baz
 */
export default class FooBar extends Foo.Baz {

    /**
     * construct a Foo
     * @constructor
     * @param {Object} options constructor options
     */
    constructor(options) {
        this.options = options
    }

    /**
     * Method of the Foo class.
     * @return {Overflow}
     */
    bar() {
        return 99999999999999999999999999999999999999999999999999999999999999999
    }

    /**
     * Static method of the Foo class.
     * @return {String}
     */
    static staticMethod() {
      return 'static method'
    }

    /**
     * Static generator method of the Foo class.
     * @return {String}
     */
    static *staticGeneratorMethod() {
      return 'static method'
    }

    /**
     * Generator method with computed name.
     * @yields {String}
     */
    * [Symbol.iterator]() {
      for (let arg of this.args) yield arg
    }

    /**
     * Setter for the blah property.
     */
    set blah (v) {
        this.blah = v
    }

    /**
     * Getter for the blah property.
     * @return {String}
     */
    get blah() {
        return this.blah
    }

}

/**
 * @class Bazr
 */
export class Baz extends FooBar {

    /**
     * @param {Object} options constructor options
     */
    constructor(options) {
        this.options = options
    }
}

/**
 * @class Lorem
 */
class Lorem {
    constructor(options) {
        this.options = options
    }
}

/**
 * Class extended from function result
 */
class Ipsum extends mixin(Foo.Bar, Baz) {
    constructor(options) {
        this.options = options
    }
}

/**
 * Class extended from inline class
 */
class Dorem extends class Trisec {} {}
