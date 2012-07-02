/**
 * Mousetrap is a simple keyboard command library for Javascript that does
 * not depend on using any existing framework
 *
 * @author Craig Campbell <iamcraigcampbell@gmail.com>
 */
window['Mousetrap'] = (function() {

    /**
     * mapping of special keys
     */
    var _MAP = {
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'return': 13,
            'shift': 16,
            'ctrl': 17,
            'alt': 18,
            'option': 18,
            'capslock': 20,
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
            'meta': 91,
            'command': 91,
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

        _SHIFT_MAP = {
            '~': '`',
            '!': '1',
            '@': '2',
            '#': '3',
            '$': '4',
            '%': '5',
            '^': '6',
            '&': '7',
            '*': '8',
            '(': '9',
            ')': '0',
            '_': '-',
            '+': '=',
            ':': ';',
            '\"': '\'',
            '<': ',',
            '>': '.',
            '?': '/',
            '|': '\\'
        },

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         */
        _callbacks = {},

        /**
         * direct map used for trigger()
         */
        _direct_map = {},

        _chain_levels = {},

        _reset_timer;

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

        // if a modifier key is coming up we should allow it
        if (action == 'up' && _isModifier(code)) {
            modifiers = [code];
        }

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[code].length; ++i) {
            callback = _callbacks[code][i];

            // if this is a chain but it is not at the right level
            // then move onto the next match
            if (callback['chain'] && _chain_levels[callback['chain']] != callback['level']) {
                continue;
            }

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
            callback.callback(e);
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

    function _isModifier(code) {
        return (code > 15 && code < 19) || code == 91;
    }

    function _resetChain(chain) {
        clearTimeout(_reset_timer);
        _reset_timer = setTimeout(function() {
            _chain_levels[chain] = 0;
        }, 1000);
    }

    function _bindChain(combo, keys, callback, action) {
        _chain_levels[combo] = 0;

        var _increaseChain = function() {
            ++_chain_levels[combo];
            _resetChain(combo);
        };

        for (var i = 0; i < keys.length; ++i) {
            _bindSingle(keys[i], i < keys.length - 1 ? _increaseChain : callback, action, combo, i);
        }
    }

    /**
     * binds a single event
     */
    function _bindSingle(combination, callback, action, chain_name, level) {

        // strip out any spaces around a plus sign
        combination = combination.replace(/\s+\+\s+/g, '+').replace(/\s+/, ' ');

        var chain = combination.split(' '),
            i,
            key,
            keys,
            modifiers = [];

        if (chain.length > 1) {
            return _bindChain(combination, chain, callback, action);
        }

        keys = combination.split('+');

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            if (_SHIFT_MAP[key]) {
                modifiers.push(_MAP.shift);
                key = _SHIFT_MAP[key];
            }

            key = _MAP[key] || key.toUpperCase().charCodeAt(0);

            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        if (!_callbacks[key]) {
            _callbacks[key] = [];
        }

        // remove an existing match if there is one
        _getMatch(key, modifiers, action, !!!chain_name);

        // add this call back to the array
        _callbacks[key][chain_name ? 'unshift' : 'push']({
            callback: callback,
            modifiers: modifiers,
            action: action,
            chain: chain_name,
            level: level
        });
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
            action = action == 'up' ? 'up' : '';
            _bindMultiple(keys instanceof Array ? keys : keys.split(','), callback, action);
            _direct_map[keys + ':' + action] = callback;
        },

        trigger: function(keys, action) {
            _direct_map[keys + ':' + (action == 'up' ? 'up' : '')]();
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
