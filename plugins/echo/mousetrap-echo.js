/**
* This extension allows you to echo a blindly typed keys using Mousetrap.
*
* @author Zach Pomerantz <zmp@umich.edu>
*/
(function (Mousetrap) {
    /**
     * lookup table for modifier keys
     *
     * @type {Object}
     */
    var _modifiers = {
        'option': true,
        'command': true,
        'return': true,
        'escape': true,
        'mod': true
    };

    /**
     * temporary state if we've already recognized a key
     *
     * @type {boolean}
     */
    var _ignoreNextKeypress = false;
  
    /**
     * callback to invoke after breaker
     *
     * @type {Function|null}
     */
    var _callback = null;

    /**
     * combinations to trigger callback
     *
     * maps combinations to triggering event
     *
     * @type {Object}
     */
    var _breakers = {};
  
    /**
     * array to record keys
     *
     * stores keys under character, modifiers properties
     *
     * @type {Array}
     */
    var _record = [];

    /**
     * array to record keys as plaintext
     *
     * @type {Array}
     */
    var _recordString = [];

    /**
     * characters that should not propogate
     *
     * @type {Object}
     */
    var _nonpropogatedKeys = {};

    /**
     * original handleKey method, overriden by Mousetrap.echo
     *
     * @type {Function}
     */
    var _superHandleKey = Mousetrap.handleKey;

  // convert character and modifiers to a sorted array for parsing

    /**
     * convert character and modifiers to a parseable array
     *
     * @param {string} character
     * @param {Array} modifiers
     * @returns {Array}
     */
    var _modifyCharacter = function (character, modifiers) {
        var trigger = _modifiers[character] ? [] : character;
        var combination = modifiers.sort(function (x, y) {
            return x > y ? 1 : -1;
        }).concat(trigger);

        return combination.length ? combination : undefined;
    };

    /**
     * convert string to array to parse breaker
     *
     * @param {string} combination
     * @returns {Array}
     */
    var _extractBreaker = function (combination) {
        combination = combination.split('+');
        var character;

        combination.forEach(function (key, index) {
            if (!_modifiers[key]) {
                // only allow one character per breaker (excluding modifiers)
                character = character ? -1 : index;
            }
        });
        if (character === -1) return;

        character = character === undefined ?
        [] : combination.splice(character, 1);

        return _modifyCharacter(character, combination);
    };

    /**
     * parse breakers out of user-supplied strings
     *
     * @param {string} combinations
     * @param {string} action
     * @returns {Array}
     */
    var _parseBreakers = function (combinations, action) {
        var breakers = {};
        combinations = Array.isArray(combinations) ? combinations : [combinations];
  
        combinations.forEach(function (combination) {
            var breaker = _extractBreaker(combination);
            if (breaker) {
                if (action) {
	                breakers[breaker] = action;
	            } else {
	                breakers[breaker] =
	                    _modifiers[breaker[breaker.length - 1]] ?
	                    breakers[breaker] = 'keypress' :
	                    breakers[breaker] = 'keydown';
	            }
            }
        });

        if (!breakers) {
            Mousetrap.handleKey = _superHandleKey;
            return;
        }

        return breakers;
    };

    /**
     * prevent default event behavior
     *
     * @type {Event} e
     * @returns void
     */
    var _preventDefault = function (e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    };

    /**
     * stop event propogation
     *
     * @type {Event} e
     * @returns void
     */
    var _stopPropogation = function (e) {
        if (e.stopPropogation) {
            e.stopPropogation();
            return;
        }

        e.cancelBubble = true;
    };

    /**
     * fire callback
     *
     * prevents default/stops propogation if callback returns false
     *
     * @type {Function} callback
     * @returns void
     */
    var _fireCallback = function (callback) {
        Mousetrap.handleKey = _superHandleKey;
        if ( callback(_recordString.join(''), _record) === false ) {
            _preventDefault(e);
            _stopPropogation(e);
        }
    };

    /**
     * append character and modifiers to record
     *
     * @type{string} character
     * @type{Array} modifiers
     * @returns void
     */
    var _appendToRecord = function (character, modifiers) {
        _record.push({
            character: character,
            modifiers: modifiers
        });
    };
    
    /**
     * add character to recorded (plaintext) string
     *
     * @type {string} character
     * @returns void
     */
    var _appendToRecordString = function (character) {
        if (character.length === 1) {
            _recordString.push(character);
        } else {
        
            var specialCharacter;
            switch (character) {
                case 'enter':
	                specialCharacter = '\n';
	                break;
	            case 'tab':
	                specialCharacter = '\t';
	                break;
	            case 'space':
	                specialCharacter = ' ';
                    break;
	            case 'backspace':
	                _recordString.pop();
            }
            specialCharacter && _recordString.push(specialCharacter);
        }
    };

    /**
     * record character and modifiers
     *
     * @type {string} character
     * @type {Array} modifiers
     * @returns void
     */
    var _recordKey = function (character, modifiers) {
        // general record
        _appendToRecord(character, modifiers);

        // blind type record
        _appendToRecordString(character);
    };

    /**
     * handles a character key event
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event} e
     * @returns void
     */
    var _handleKey = function (character, modifiers, e) {
        if (_breakers[character] === e.type || 
            _breakers[_modifyCharacter(character, modifiers)] === e.type ) {
            _fireCallback(_callback);
            return;
        }

        // avoid duplicate entries
        if (e.type === 'keydown') {
            if (modifiers.length) {
                _ignoreNextKeypress = false;
                return;
            } else {
                _ignoreNextKeypress = true;
            }
        }
        if (e.type === 'keypress' && _ignoreNextKeypress || e.type === 'keyup') {
            _ignoreNextKeypress = false;
            return;
        }

        _recordKey(character, modifiers);
    
        // prevent default events/propogation of event
        if (_nonpropogatedKeys[character]) {
        	_preventDefault(e);
        	_stopPropogation(e);
        }
    };

    /**
     * records keys and passes it to a callback once breaker is keyed
     *
     * callback takes two arguments:
     * a plaintext record of keys, and an object of keys
     *
     * nonpropogatedKeys denotes keys which should not trigger their default action or bubble up an event
     *
     * @param {Function} callback
     * @param {string} breaker
     * @param {string} action
     * @param {Object} nonpropogatedKeys
     * @returns void
     */
    Mousetrap.echo = function (callback, breaker, action, nonpropogatedKeys) {
        _ignoreNextKeypress = false;
        _record = [];
        _recordString = [];
        _callback = callback;
        _breakers = _parseBreakers(breaker, action);
	_nonpropogatedKeys = nonpropogatedKeys || {
	    'backspace': true,
	    'tab': true,
	    'space': true,
	    'enter': true
	};
        Mousetrap.handleKey = _handleKey;
    };

})(Mousetrap);
