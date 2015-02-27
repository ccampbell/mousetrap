Mousetrap = (function(Mousetrap) {

    var self = Mousetrap;

    /**
     * @method bindTo
     * @param {HTMLElement} element
     * @param {String|Array} keys
     * @param {Function} callback
     * @param {String} action
     * @return {void}
     */
    self.bindTo = function(element, keys, callback, action) {

        if (!element.hasAttribute('tabindex')) {

            // For elements to allow focus they require a `tabindex` attribute.
            element.setAttribute('tabindex', 0);

        }

        /**
         * @method target
         * @param {Object} event
         * @return {void}
         */
        function target(event) {

            if (element === event.target || element === event.relatedTarget) {
                callback(event);
            }

        }

        if (typeof keys == 'string' || keys instanceof Array) {
            return self.bind(keys, target, action);
        }

        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                self.bind(key, keys[key], target);
            }
        }

    };

    return self;

})(Mousetrap);