
/** @constructor
*/
function Data() {

    /**
        The current position.
        @type {object}
        @property {boolean} needsRevalidate Does this point need to be revalidated?
     */
    this.point = {
        /**
            The x coordinate of the point.
            @type {number}
            @name point.x
            @memberOf! Data#
         */
        x: 0,

        /**
            The y coordinate of the point.
            @type {number}
            @name point.y
            @memberOf! Data#
            @see {@link Data#point.x}
         */
        y: 0,

        needsRevalidate: false
    };
}

var map = {
    /**
        @type {Array}
        @name map.routes
        @memberOf! <global>
        @property {Data#point} point
     */
    routes: []
}

/** The current cursor. */
var cursor = {};
