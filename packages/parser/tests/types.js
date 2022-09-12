/**
 * basic type
 * @param {number} a
 */

/**
 * type union
 * @param {number|string} a
 */
 
/**
 * complex type
 * @param {number|string|{name:string,age:number}} a
 */

/**
 *  nested complex type param
 * @param {number | string | {length: number, type: {name: {first: string, last: string}, id: number | string}}} a Description of param
 */

/**
 * generic param
 * @param {(T|Array)<string|number>} a
 */

/**
 * generic param
 * @param {Array<string|number>} a
 */

/**
 * array param
 * @param {string[]} a
 */

/**
 * optional param
 * @param {number=} a
 */


/**
 * nullable param
 * @param {?number} a
 */


/**
 * non-nullable param
 * @param {!number} a
 */

/**
 * variable param
 * @param {...number} a
 */

/**
 * optional variable nullable param
 * @param {...?number=} a
 */

/**
 * function arguments
 * @param {function(string)} a
 */
 
/**
 * function with variable any params
 * @param {function(...)} a
 */

/**
 * function with variable unknown params
 * @param {function(...?)} a
 */

/**
 * function with variable optional any
 * @param {function(...?*)} a
 */

/**
 * function with a context and return
 * @param {function(this: Foo, *): Bar} a
 */

/**
 * import type
 * @typedef {import('example').a} AType
 */

