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
     * mapping of special keys
     */
    var _MAP = {
            'shift': 16,
            'ctrl': 17,
            'control': 17,
            'alt': 18,
            'option': 18,
            'cmd': 91,
            'command': 91,
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

    function _keyCodeFromEvent(e) {
        // right command on webkit, command on gecko
        if (e.keyCode == 93 || e.keyCode == 224) {
            return 91;
        }

        return e.keyCode;
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

    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push(_MAP.shift);
        }

        if (e.altKey) {
            modifiers.push(_MAP.alt);
        }

        if (e.ctrlKey) {
            modifiers.push(_MAP.ctrl);
        }

        if (e.metaKey) {
            modifiers.push(_MAP.command);
        }

        return modifiers;
    }

    function _fireCallback(code, action, e) {
        var callback = _getMatch(code, _eventModifiers(e), action);
        if (callback) {
            return callback.callback(e);
        }
    }

    function _handleKeyDown(e) {
        if (_stop(e)) {
            return;
        }

        return _fireCallback(_keyCodeFromEvent(e), '', e);
    }

    function _handleKeyUp(e) {
        if (_stop(e)) {
            return;
        }

        _fireCallback(_keyCodeFromEvent(e), 'up', e);
    }

    /**
     * binds a single event
     */
    function _bindSingle(combination, callback, action) {
        combination = combination.replace(/\s+\+\s+/g, '+');

        var i,
            key,
            keys = combination.split('+'),
            modifiers = [];

        for (i = 0; i < keys.length; ++i) {
            key = _MAP[keys[i]] || keys[i].toUpperCase().charCodeAt(0);
            if ((key > 15 && key < 19) || key == 91) {
                modifiers.push(key);
            }
        }

        if (!_callbacks[key]) {
            _callbacks[key] = [];
        }

        if (action == 'up') {
            modifiers = [];
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
            _bindMultiple(keys instanceof Array ? keys : keys.split(','), callback, action);
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
        }
    };
}) ();

Mousetrap.addEvent(window, 'load', Mousetrap.init);
