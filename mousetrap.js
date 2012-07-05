/**
 * Copyright 2012 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @preserve @version 1.0
 * @url craig.is/killing/mice
 */
window.Mousetrap = (function() {

    /**
     * mapping of special keys to their corresponding keycodes
     *
     * @type {Object}
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

        /**
         * mapping of keys that require shift to their non shift equivalents
         *
         * @type {Object}
         */
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
         *
         * @type {Object}
         */
        _callbacks = {},

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        _direct_map = {},

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        _sequence_levels = {},

        /**
         * variable to store the setTimeout call
         *
         * @type {null}
         */
        _reset_timer,

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean}
         */
        _ignore_next_keyup = false,

        /**
         * are we currently inside of a sequence?
         *
         * @type {boolean}
         */
        _inside_sequence = false;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP['f' + i] = 111 + i;
    }

    /**
     * cross browser add event method
     *
     * @param {Element} element
     * @param {string} name
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            return object.addEventListener(type, callback, false);
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the keycode
     *
     * @param {Event} e
     * @return {number}
     */
    function _keyCodeFromEvent(e) {
        // right command on webkit, command on gecko
        if (e.keyCode == 93 || e.keyCode == 224) {
            return 91;
        }

        return e.keyCode;
    }

    /**
     * should we stop this event before firing off callbacks
     *
     * @param {Event} e
     * @return {boolean}
     */
    function _stop(e) {
        var element = e.target || e.srcElement,
            tag_name = element.tagName;

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        // stop for input, select, and textarea
        return tag_name == 'INPUT' || tag_name == 'SELECT' || tag_name == 'TEXTAREA';
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * resets all sequence counters
     *
     * @param {Object} do_not_reset
     * @returns void
     */
    function _resetSequences(do_not_reset) {
        do_not_reset = do_not_reset || {};

        var active_sequences = false;

        for (var key in _sequence_levels) {
            if (!do_not_reset[key]) {
                _sequence_levels[key] = 0;
                continue;
            }
            active_sequences = true;
        }

        if (!active_sequences) {
            _inside_sequence = false;
        }
    }

    /**
     * finds all callbacks that match based on the keycode, modifiers,
     * and action
     *
     * @param {number} code
     * @param {Array} modifiers
     * @param {string} action
     * @param {boolean} remove - should we remove any matches
     * @returns {Array}
     */
    function _getMatches(code, modifiers, action, remove) {
        var i,
            callback,
            matches = [];

        // if there are no events related to this keycode
        if (!_callbacks[code]) {
            return [];
        }

        // if a modifier key is coming up on its own we should allow it
        if (action == 'keyup' && _isModifier(code)) {
            modifiers = [code];
        }

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[code].length; ++i) {
            callback = _callbacks[code][i];

            // if this is a sequence but it is not at the right level
            // then move onto the next match
            if (callback['seq'] && _sequence_levels[callback['seq']] != callback['level']) {
                continue;
            }

            // if this is the same action and uses the same modifiers then it
            // is a match
            if (action == callback.action && _modifiersMatch(modifiers, callback.modifiers)) {

                // remove is used so if you change your mind and call bind a
                // second time with a new function the first one is overwritten
                if (remove) {
                    _callbacks[code].splice(i, 1);
                }

                matches.push(callback);
            }
        }

        return matches;
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
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

    /**
     * fires a callback for a matching keycode
     *
     * @param {number} code
     * @param {string} action
     * @param {Event} e
     * @returns void
     */
    function _fireCallback(code, action, e) {

        // if this event should not happen stop here
        if (_stop(e)) {
            return;
        }

        var callbacks = _getMatches(code, _eventModifiers(e), action),
            i,
            do_not_reset = {},
            processed_sequence_callback = false;

        // loop through matching callbacks for this key event
        for (i = 0; i < callbacks.length; ++i) {

            // fire for all sequence callbacks
            // this is because if for example you have multiple sequences
            // bound such as "g i" and "g t" they both need to fire the
            // callback for matching g cause otherwise you can only ever
            // match the first one
            if (callbacks[i]['seq']) {
                processed_sequence_callback = true;

                // keep a list of which sequences were matches for later
                do_not_reset[callbacks[i]['seq']] = 1;
                callbacks[i].callback(e);
                continue;
            }

            // if there were no sequence matches but we are still here
            // that means this is a regular match so we should fire then break
            if (!processed_sequence_callback && !_inside_sequence) {
                callbacks[i].callback(e);
                break;
            }

        }

        // if you are inside of a sequence and the key you are pressing
        // is not a modifier key then we should reset all sequences
        // there were not matched by this key event
        if (action == _inside_sequence && !_isModifier(code)) {
            _resetSequences(do_not_reset);
        }
    }

    /**
     * handles a keydown event
     *
     * @param {Event} e
     * @returns void
     */
    function _handleKeyDown(e) {
        _fireCallback(_keyCodeFromEvent(e), 'keydown', e);
    }

    /**
     * handles a keyup event
     *
     * @param {Event} e
     * @returns void
     */
    function _handleKeyUp(e) {
        if (_ignore_next_keyup === e.keyCode) {
            _ignore_next_keyup = false;
            return;
        }
        _fireCallback(_keyCodeFromEvent(e), 'keyup', e);
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {number} code
     * @returns {boolean}
     */
    function _isModifier(code) {

        // 16, 17, 18, and 91 are modifier keys
        return (code > 15 && code < 19) || code == 91;
    }

    /**
     * called to set a 1 second timeout on the specified sequence
     *
     * this is so after each key press in the sequence you have 1 second
     * to press the next key before you have to start over
     *
     * @param {string} sequence
     * @returns void
     */
    function _resetSequence() {
        clearTimeout(_reset_timer);
        _reset_timer = setTimeout(_resetSequences, 1000);
    }

    /**
     * binds a key sequence to an event
     *
     * @param {string} combo - combo specified in bind call
     * @param {Array} keys
     * @param {Function} callback
     * @param {string} action
     * @returns void
     */
    function _bindSequence(combo, keys, callback, action) {

        // start off by adding a sequence level record for this combination
        // and setting the level to 0
        _sequence_levels[combo] = 0;

        /**
         * callback to increase the sequence level for this sequence and reset
         * all other sequences that were active
         *
         * @returns void
         */
        var _increaseSequence = function(e) {
                _inside_sequence = action;
                ++_sequence_levels[combo];
                _resetSequence(combo);
            },

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @returns void
             */
            _callbackAndReset = function(e) {
                callback(e);

                // we should ignore the next key up if the action is key down
                // this is so if you finish a sequence and release the key
                // the final key will not trigger a keyup
                if (action === 'keydown') {
                    _ignore_next_keyup = e.keyCode;
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            },
            i;

        // loop through keys one at a time and bind the appropriate callback
        // function.  for any key leading up to the final one it should
        // increase the sequence. after the final, it should reset all sequences
        for (i = 0; i < keys.length; ++i) {
            _bindSingle(keys[i], i < keys.length - 1 ? _increaseSequence : _callbackAndReset, action, combo, i);
        }
    }

    /**
     * binds a single keyboard combination
     *
     * @param {string} combination
     * @param {Function} callback
     * @param {string} action
     * @param {string|null} sequence_name - name of sequence if part of sequence
     * @param {number|null} level - what part of the sequence the command is
     * @returns void
     */
    function _bindSingle(combination, callback, action, sequence_name, level) {

        // make sure multiple spaces in a row become a single space
        combination = combination.replace(/\s+/g, ' ');

        var sequence = combination.split(' '),
            i,
            key,
            keys,
            modifiers = [];

        // if this pattern is a sequence of keys then run through this method
        // to reprocess each pattern one key at a time
        if (sequence.length > 1) {
            return _bindSequence(combination, sequence, callback, action);
        }

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = combination === '+' ? ['+'] : combination.split('+');

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // if this is a key that requires shift to be pressed such as ?
            // or $ or * then we should set shift as the modifier and map the
            // key to the non shift version of the key
            if (_SHIFT_MAP[key]) {
                modifiers.push(_MAP.shift);
                key = _SHIFT_MAP[key];
            }

            // determine the keycode for the key
            // first check in the key map then fallback to character code
            key = _MAP[key] || key.toUpperCase().charCodeAt(0);

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // make sure to initialize array if this is the first time
        // a callback is added for this key
        if (!_callbacks[key]) {
            _callbacks[key] = [];
        }

        // remove an existing match if there is one
        _getMatches(key, modifiers, action, !!!sequence_name);

        // add this call back to the array
        // if it is a sequence put it at the beginning
        // if not put it at the end
        //
        // this is important because the way these are processed expects
        // the sequence ones to come first
        _callbacks[key][sequence_name ? 'unshift' : 'push']({
            callback: callback,
            modifiers: modifiers,
            action: action,
            seq: sequence_name,
            level: level
        });
    }

    /**
     * binds multiple combinations to the same callback
     *
     * @param {Array} combinations
     * @param {Function} callback
     * @param {string} action
     * @returns void
     */
    function _bindMultiple(combinations, callback, action) {
        for (var i = 0; i < combinations.length; ++i) {
            _bindSingle(combinations[i], callback, action);
        }
    }

    return {

        /**
         * binds an event to mousetrap
         *
         * can be a single key, a combination of keys separated with +,
         * a comma separated list of keys, an array of keys, or
         * a sequence of keys separated by spaces
         *
         * be sure to list the modifier keys first to make sure that the
         * correct key ends up getting bound (the last key in the pattern)
         *
         * @param {string} keys
         * @param {Function} callback
         * @param {string} action - 'up' for keyup anything else assumes keydown
         * @returns void
         */
        bind: function(keys, callback, action) {
            action = action || 'keydown';
            _bindMultiple(keys instanceof Array ? keys : keys.split(','), callback, action);
            _direct_map[keys + ':' + action] = callback;
        },

        /**
         * triggers an event that has already been bound
         *
         * @param {string} keys
         * @param {string} action
         * @returns void
         */
        trigger: function(keys, action) {
            _direct_map[keys + ':' + (action || 'keydown')]();
        },

        /**
         * cross browser add event method
         *
         * @param {Element} element
         * @param {string} name
         * @param {Function} callback
         * @returns void
         */
        addEvent: function(element, name, callback) {
            _addEvent(element, name, callback);
        },

        /**
         * resets the library back to its initial state.  this is useful
         * if you want to clear out the current keyboard shortcuts and bind
         * new ones - for example if you switch to another page
         *
         * @returns void
         */
        reset: function() {
            _callbacks = {};
            _direct_map = {};
        },

        /**
         * starts the event listeners
         *
         * @returns void
         */
        init: function() {
            _addEvent(document, 'keydown', _handleKeyDown);
            _addEvent(document, 'keyup', _handleKeyUp);
        }
    };
}) ();

Mousetrap.addEvent(window, 'load', Mousetrap.init);
