/**
 * Mousetrap is a simple keyboard command library for Javascript that does
 * not depend on using any existing framework
 *
 * TODO: handle function keys
 *
 * @author Craig Campbell <iamcraigcampbell@gmail.com>
 */
window['Mousetrap'] = (function() {

    /**
     * list of modifier keys
     */
    var _MODIFIERS = {
            'shift': 16,
            'ctrl': 17,
            'control': 17,
            'alt': 18,
            'option': 18,
            'cmd': 91,
            'command': 91
        },

        /**
         * reverse lookup of modifier keys by code
         */
        _MODS = {
            16: 1,
            17: 1,
            18: 1,
            91: 1
        },

        /**
         * mapping of special keys
         */
        _MAP = {
            'backspace': 8,
            'tab': 9,
            'clear': 12,
            'enter': 13,
            'return': 13,
            'esc': 27,
            'escape': 27,
            'space': 32,
            'pageup': 33,
            'pagedown': 34,
            'end': 35,
            'home': 36,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
            'del': 46,
            'delete': 46,
            ';': 186,
            '=': 187,
            ',': 188,
            '-': 189,
            '.': 190,
            '/': 191,
            '`': 192,
            '[': 219,
            '\\': 220,
            ']': 221,
            '\'': 222
        },

        /**
         * an array of all current modifiers that are down
         */
        _active_modifiers = [],

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         */
        _callbacks = {},

        /**
         * direct map used for trigger()
         */
        _direct_map = {};

        for (var i = 1; i < 13; ++i) {
            _MAP['f' + i] = 111 + i;
        }

    /**
     * cross browser add event
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            return object.addEventListener(type, callback, false);
        }

        object.attachEvent('on' + type, callback);
    }

    function _indexOf(array, value) {
        var index = -1,
            i;

        for (i = 0; i < array.length; ++i) {
            if (array[i] == value) {
                index = i;
                break;
            }
        }
        return index;
    }

    function _resetModifiers() {
        _active_modifiers = [];
    }

    function _keyCodeFromEvent(e) {
        var code = e.keyCode;

        // right command on webkit, command on gecko
        if (code == 93 || code == 224) {
            return 91;
        }

        return code;
    }

    function _stop(e) {
        var tag_name = (e.target || e.srcElement).tagName;

        // stop for input, select, and textarea
        return tag_name == 'INPUT' || tag_name == 'SELECT' || tag_name == 'TEXTAREA';
    }

    function _modifiersMatch(group1, group2) {
        return group1.sort().join(',') === group2.sort().join(',');
    }

    function _getMatch(code, modifiers, action, remove) {
        if (!_callbacks[code]) {
            return;
        }

        var i,
            callback;

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[code].length; ++i) {
            callback = _callbacks[code][i];

            if (action == callback.action && _modifiersMatch(modifiers, callback.modifiers)) {
                if (remove) {
                    _callbacks[code].splice(i, 1);
                }
                return callback;
            }
        }
    }

    function _fireCallback(code, modifiers, action, e) {
        var callback = _getMatch(code, modifiers, action);
        if (callback) {
            return callback.callback(e);
        }
    }

    function _handleKeyDown(e) {
        if (_stop(e)) {
            return;
        }

        var code = _keyCodeFromEvent(e);

        if (_MODS[code]) {
            _active_modifiers.push(code);
        }

        return _fireCallback(code, _active_modifiers, '', e);
    }

    function _handleKeyUp(e) {
        if (_stop(e)) {
            return;
        }

        var code = _keyCodeFromEvent(e),
            index = -1;

        // fire the callback before the modifiers are removed
        // this is so this library works if the key
        // IS a modifier key
        _fireCallback(code, _active_modifiers, 'up', e);

        if (_MODS[code]) {
            index = _indexOf(_active_modifiers, code);
        }

        if (index !== -1) {
            _active_modifiers.splice(index, 1);
        }
    }

    /**
     * binds a single event
     */
    function _bindSingle(combination, callback, action) {
        var i,
            key,
            keys = combination.split('+'),
            modifiers = [];

        for (i = 0; i < keys.length; ++i) {
            if (keys[i] in _MODIFIERS) {
                modifiers.push(_MODIFIERS[keys[i]]);
            }

            key = _MODIFIERS[keys[i]] || _MAP[keys[i]] || keys[i].toUpperCase().charCodeAt(0);
        }

        if (!_callbacks[key]) {
            _callbacks[key] = [];
        }

        // remove an existing match if there is one
        _getMatch(key, modifiers, action, true);

        // add this call back to the array
        _callbacks[key].push({callback: callback, modifiers: modifiers, action: action});
    }

    /**
     * binds multiple combinations to the same callback
     */
    function _bindMultiple(combinations, callback, action) {
        for (var i = 0; i < combinations.length; ++i) {
            _bindSingle(combinations[i], callback, action);
        }
    }

    return {
        bind: function(keys, callback, action) {
            action = action || '';
            _bindMultiple(keys.split(','), callback, action);
            _direct_map[keys + ':' + action] = callback;
        },

        trigger: function(keys, action) {
            _direct_map[keys + ':' + (action || '')]();
        },

        addEvent: function(object, type, callback) {
            _addEvent(object, type, callback);
        },

        init: function() {
            _addEvent(document, 'keydown', _handleKeyDown);
            _addEvent(document, 'keyup', _handleKeyUp);
            _addEvent(window, 'focus', _resetModifiers);
        }
    };
}) ();

Mousetrap.addEvent(window, 'load', Mousetrap.init);
