/*global define:false */
/**
 * Copyright 2015 Craig Campbell
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
 * @version 1.6.5
 * @url craig.is/killing/mice
 */
(function(window, document, undefined) {

	// Check if mousetrap is used inside browser, if not, return
    if (!window) {
        return;
    }
	
    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };

    /**
     * mapping for special characters so they can support
     *
     * this dictionary is only used incase you want to bind a
     * keyup or keydown event to one of these keys
     *
     * @type {Object}
     */
    var _KEYCODE_MAP = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111 : '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };

    /**
     * this is a mapping of keys that require shift on a US keypad
     * back to the non shift equivelents
     *
     * this is so you can use keyup events with these keys
     *
     * note that this will only work reliably on US keyboards
     *
     * @type {Object}
     */
    var _SHIFT_MAP = {
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
        '|': '\\',
		'}':']',
		'{':'['
    };

    /**
     * this is a list of special strings you can use to map
     * to modifier keys when you specify your keyboard shortcuts
     *
     * @type {Object}
     */
    var _SPECIAL_ALIASES = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'plus': '+',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };

    /**
     * variable to store the flipped version of _MAP from above
     * needed to check if we should use keypress or not when no action
     * is specified
     *
     * @type {Object|undefined}
     */
    var _REVERSE_MAP;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = (i+96).toString();
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

		//if keypress and numpad number, convert to correct value	
        if (e.type == 'keypress' && e.location == 3 && Number(e.key) >=0 && Number(e.key) <= 9) {
			//console.log("test",Number(e.key)+96);
			//console.log(_MAP[Number(e.key)+96]);
			return _MAP[Number(e.key)+96];
		}
		
        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }
			
			if(character==" ")return "space";
            return character;
        }

        //if (e.type == 'keyup') {
			if( Object.values(_MAP).indexOf(e.key) > -1 || 
				Object.values(_KEYCODE_MAP).indexOf(e.key) > -1 || 
				Object.values(_SHIFT_MAP).indexOf(e.key) > -1 ){
					//console.log(e.key);
					return e.key;
				}
		//}
		
        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
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
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        combination = combination.replace(/\+{2}/g, '+plus');
        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys;
        var key;
        var i;
        var modifiers = [];
		var namespace = [];//combination.split('.');
		
		var lastIndex = combination.lastIndexOf('.');
		namespace.push( combination.substr(0, lastIndex) );
		namespace.push( combination.substr(lastIndex) );
		
		//get the namespace if it has one (eg: ctrl+a.name combination would give namespace of name after the period)
		if(namespace.length>1){
			combination = namespace[0];
			namespace = namespace[1];
		}
		
        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action,
			namespace: namespace
        };
    }

    function _belongsTo(element, ancestor) {
        if (element === null || element === document) {
            return false;
        }

        if (element === ancestor) {
            return true;
        }

        return _belongsTo(element.parentNode, ancestor);
    }

    function Mousetrap(targetElement) {
        var self = this;

        targetElement = targetElement || document;

        if (!(self instanceof Mousetrap)) {
            return new Mousetrap(targetElement);
        }

        /**
         * element to attach key events to
         *
         * @type {Element}
         */
        self.target = targetElement;

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        self._callbacks = {};

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        self._directMap = {};
		
        /**
         * When keys are released in a keyup action- they get stored until another key is pressed. These are used when combination ends with a modifier key
         *
         * @type {Object}
         */
        self._releasedKeys = [];
        /**
         * Held keys.. these get used when combination ends with a modifier key- and needs to check if an action with different character should trigger
         *
         * @type {Object}
         */
        self._heldKeys = [];

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        var _sequenceLevels = {};

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        var _resetTimer;

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        var _ignoreNextKeyup = false;

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        var _ignoreNextKeypress = false;

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        var _nextExpectedAction = false;

        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset) {
            doNotReset = doNotReset || {};

            var activeSequences = false,
                key;

            for (key in _sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }

            if (!activeSequences) {
                _nextExpectedAction = false;
            }
        }

        /**
         * finds all callbacks that match based on the keycode, modifiers,
         * and action
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {string=} sequenceName - name of the sequence we are looking for
         * @param {string=} combination
         * @param {number=} level
         * @param {string=} namespace (eg: if original combination is ctrl+a.name, namespace would be after the period)
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, sequenceName, combination, level, namespace) {
            var i;
            var callback;
            var matches = [];
            var action = e.type;
			
			var originalChar = character;
			var originalMods = modifiers;
			
            // if there are no events related to this keycode
            if (!self._callbacks[character] && !_isModifier(character) ) {
                return [];
            }

			var allCharacters = [character];
			
			if(_isModifier(character)){
				for (i = 0; i < modifiers.length; ++i) {
					if(allCharacters.indexOf(modifiers[i])===-1 )allCharacters.push(modifiers[i]);
				}
			}
			
            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character) ) {
				modifiers = [character];
				for (property in self._callbacks) {
				//console.log(self._callbacks);
					if(_isModifier(property) && allCharacters.indexOf(property) === -1)allCharacters.push(property);
				}
            }
			/*else if(_isModifier(character)){
				//else if key pressed is modifier add callbacks that may be using a different modifier as the character (like shift+alt and alt+shift)
				modifiers = [character];
				for (property in self._callbacks) {
				console.log(self._callbacks);
					if(_isModifier(property) && allCharacters.indexOf(property) === -1)allCharacters.push(property);
				}
			}
			if (_isModifier(character) ) {
				modifiers = [character];
				for (i = 0; i < self._heldKeys.length; ++i) {
					if(_isModifier(self._heldKeys[i]) && modifiers.indexOf(self._heldKeys[i])===-1 )modifiers.push(self._heldKeys[i]);
				}
				for (property in self._callbacks) {
					if(_isModifier(property) && allCharacters.indexOf(property) === -1)allCharacters.push(property);
				}
            }*/
				//console.log(modifiers+",test");
				//console.log(allCharacters+",test2");
			
            // loop through all callbacks for the key that was pressed
            // and see if any of them match
			for (k = 0; k < allCharacters.length; ++k) {
				if(typeof self._callbacks[allCharacters[k]] !== 'undefined'){
					character = allCharacters[k];
					for (i = 0; i < self._callbacks[character].length; ++i) {
						callback = self._callbacks[character][i];
						modifiers = originalMods;
						
						if (action == 'keyup' && _isModifier(originalChar) && callback.modifiers.indexOf(originalChar)==-1){
							continue;
						}
						//if key is modifier and is last in combo, meaning combination is only modifiers, add all modifiers to modifier array so it can match properly
						//also check that the modifiers were originally held down, otherwise exclude them.
						if (_isModifier(character) && callback.modifiers.indexOf(character)!==-1 ) {
							modifiers = [];
							for (j = 0; j < callback.modifiers.length; ++j) {
								if(action == 'keyup' && self._releasedKeys.indexOf(callback.modifiers[j]) !== -1 && modifiers.indexOf(callback.modifiers[j])==-1 )modifiers.push(callback.modifiers[j]);
								if(self._heldKeys.indexOf(callback.modifiers[j]) !== -1 && modifiers.indexOf(callback.modifiers[j])==-1 )modifiers.push(callback.modifiers[j]);
							}
						}
						//if keyup and a combo that has all keys lifted but other keys held that are unrelatedto combo, should still fire. This ensures modifiers match.
						if (action == 'keyup' && callback.modifiers.length<modifiers.length){
							for (j = modifiers.length-1; j>=0; j--) {
								if(callback.modifiers.indexOf(modifiers[j])==-1)modifiers.splice(j,1);
							}
						}
						//if (!e.repeat || action == 'keyup')console.log(originalChar+"|"+character+"|"+modifiers+"|"+callback.modifiers);
						
						// if a sequence name is not specified, but this is a sequence at
						// the wrong level then move onto the next match
						if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
							continue;
						}

						// if the action we are looking for doesn't match the action we got
						// then we should keep going
						if (action != callback.action) {
							continue;
						}

						// if this is a keypress event and the meta key and control key
						// are not pressed that means that we need to only look at the
						// character, otherwise check the modifiers as well
						//
						// chrome will not fire a keypress if meta or control is down
						// safari will fire a keypress if meta or meta+shift is down
						// firefox will fire a keypress if meta or control is down
						if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

							// when you bind a combination or sequence a second time it
							// should overwrite the first one.  if a sequenceName or
							// combination is specified in this call it does just that
							//
							// @todo make deleting its own method?
							var deleteCombo = !sequenceName && callback.combo == combination;
							var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
							if (deleteCombo || deleteSequence) {
								self._callbacks[character].splice(i, 1);
							}

							matches.push(callback);
						}
					}
				}
			}

			//try ordering them based on combo length (number of +s) to see if can use it to let shorter ones check if longer ones have fired already
			var order = matches.sort( function(a,b){
				var nA = a.combo.split("+").length;
				var nB = b.combo.split("+").length;
				return nA > nB ? -1 : nA < nB ? 1 : 0;  
			});
			
            return matches;
        }

        /**
         * actually calls the callback function
         *
         * if your callback function returns false this will use the jquery
         * convention - prevent default and stop propogation on the event
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo, sequence) {
            // if this event should not happen stop here
            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                return;
            }
			//if (!e.repeat || e.type=='keyup')console.log(combo+","+combo.indexOf(" "));
			//check if there are keys before this one that are part of the combo (ex: ctrl+space+c), make sure they are still held down
			if(combo.indexOf("+")>-1){
				if(e.type!=='keyup'){
					var charArray = combo.split("+");
					for(var i=0; i<charArray.length-1; i++){
						var heldIndex = self._heldKeys.indexOf(charArray[i]);
						if(heldIndex==-1)return;
					}
				}
			}else if(combo.indexOf(" ")==-1){
				//if (!e.repeat || e.type=='keyup')console.log(combo+","+combo.indexOf(" "));
				//if it is just a single key, don't fire if others are being held.
				var character = combo.split(".")[0];
				if(e.type!=='keyup' && self._heldKeys.length>1 && !_isModifier(character))return;
			}
			
			//if (!e.repeat || e.type=='keyup')console.log(combo+","+combo.indexOf(" "));
				
            if (callback(e, combo) === false) {
                _preventDefault(e);
                _stopPropagation(e);
            }
        }

        /**
         * handles a character key event
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        self._handleKey = function(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e);
            var i;
            var doNotReset = {};
            var maxLevel = 0;
            var processedSequenceCallback = false;
			
            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }

            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {

                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {

                    // only fire callbacks for the maxLevel to prevent
                    // subsequences from also firing
                    //
                    // for example 'a option b' should not cause 'option b' to fire
                    // even though 'option b' is part of the other sequence
                    //
                    // any sequences that do not match here will be discarded
                    // below by the _resetSequences call
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }

                    processedSequenceCallback = true;

                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }

                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }

            // if the key you pressed matches the type of sequence without
            // being a modifier (ie "keyup" or "keypress") then we should
            // reset all sequences that were not matched by this event
            //
            // this is so, for example, if you have the sequence "h a t" and you
            // type "h e a r t" it does not match.  in this case the "e" will
            // cause the sequence to reset
            //
            // modifier keys are ignored because you can have a sequence
            // that contains modifiers such as "enter ctrl+space" and in most
            // cases the modifier key will be pressed before the next key
            //
            // also if you have a sequence such as "ctrl+b a" then pressing the
            // "b" key will trigger a "keypress" and a "keydown"
            //
            // the "keydown" is expected when there is a modifier, but the
            // "keypress" ends up matching the _nextExpectedAction since it occurs
            // after and that causes the sequence to reset
            //
            // we ignore keypresses in a sequence that directly follow a keydown
            // for the same character
            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                _resetSequences(doNotReset);
            }

            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
			
        };

        /**
         * handles a onblur event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleBlurEvent(e) {
			//make sure the held keys and released keys get cleared if window loses focus.
		   self._heldKeys = [];
		   self._releasedKeys = [];
		   /*
		   //self._sequenceLevels = {};
		   _resetSequences({});
		   
			_sequenceLevels = {};

			//_resetTimer;
			_ignoreNextKeyup = false;
			_ignoreNextKeypress = false;
			_nextExpectedAction = false;*/

			//the only way that seems to work with clearing whatever needs to be cleared is to force the keyup events to run
			var event = document.createEvent("HTMLEvents");
			event.initEvent('keyup', false, true);
			event.keyCode = 18;	//alt
			document.dispatchEvent(event);
			event = document.createEvent("HTMLEvents");
			event.initEvent('keyup', false, true);
			event.keyCode = 17;	//ctrl
			document.dispatchEvent(event);
			event = document.createEvent("HTMLEvents");
			event.initEvent('keyup', false, true);
			event.keyCode = 16;	//shift
			document.dispatchEvent(event);
		}
		
		self._doKeyEvent = function(e) {
			_handleKeyEvent(e);
        };
		self._doBlurEvent = function(e) {
			_handleBlurEvent(e);
        };
        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {

			//if dialog open, return
			//if($('#MyDialog').is(':visible'))return;
			//console.log($('#MyDialog'));
            
			// normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }
            var character = _characterFromEvent(e);
			
			try{
				//this is to fix the plus sign on the numpad not working (change it to =)
				if(character.charCodeAt(0)==43){
					character = '=';
					//console.log(character+","+character.charCodeAt(0));
				}
			}catch{}
			//for some odd reason holding ctrl and pressing a key that isn't bound with keydown will get some strange unprintable character from keypress?
			if(character.length == 1 && (typeof character === 'string' && character.charCodeAt(0)<32)){
                return;
			}
            // no character found then stop
            if (!character) {
                return;
            }
			
			//if character falls outside the range, ignore it (if using international languages, pressing multiple keys will cause charcodes outside the range)
			if( e.type !== 'keyup' && character.charCodeAt(0) > 222 ){
				return;
			}
			
			//make sure the keys that are released are remembered until another keypress/keydown
			//make sure keys that are being held, are remembered
			var held = -1;
			if(typeof character === 'string') held = character.toLowerCase();
			//console.log(held);
			if(_SHIFT_MAP[character] || held === -1 || (held.length == 1 && held.charCodeAt(0)<32 && typeof _MAP[held.charCodeAt(0)] === 'undefined' ) ){
				held = -1;
			}else{
				held = held.trim();	//get weird whitespace when pressing tab then enter. This will remove it.
			}
			
			if(held!==-1 && held!=="" && held!==" "){
				if(!e.repeat && e.type!='keyup'){
					self._releasedKeys = [];
					if(self._heldKeys.indexOf(held)==-1)self._heldKeys.push(held);
				}else if(e.type=='keyup'){
					if(self._releasedKeys.indexOf(held)==-1)self._releasedKeys.push(held);
					do{
						var heldIndex = self._heldKeys.indexOf(held);
						if(heldIndex>-1)self._heldKeys.splice(heldIndex,1);
					}while(heldIndex>-1);
				}
			}
			
            // need to use === for the character check because the character can be 0
            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                _ignoreNextKeyup = false;
                return;
            }
			
            self.handleKey(character, _eventModifiers(e), e);
        }

        /**
         * called to set a 1 second timeout on the specified sequence
         *
         * this is so after each key press in the sequence you have 1 second
         * to press the next key before you have to start over
         *
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }

        /**
         * binds a key sequence to an event
         *
         * @param {string} combo - combo specified in bind call
         * @param {Array} keys
         * @param {Function} callback
         * @param {string=} action
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {

            // start off by adding a sequence level record for this combination
            // and setting the level to 0
            _sequenceLevels[combo] = 0;

            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {string} nextAction
             * @returns {Function}
             */
            function _increaseSequence(nextAction) {
                return function() {
                    _nextExpectedAction = nextAction;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                };
            }

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            function _callbackAndReset(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            }

            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            //
            // if an action is specified in the original bind call then that will
            // be used throughout.  otherwise we will pass the action that the
            // next key in the sequence should match.  this allows a sequence
            // to mix and match keypress and keydown events depending on which
            // ones are better suited to the key provided
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                _bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        }

        /**
         * binds a single keyboard combination
         *
         * @param {string} combination
         * @param {Function} callback
         * @param {string=} action
         * @param {string=} sequenceName - name of sequence if part of sequence
         * @param {number=} level - what part of the sequence the command is
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {

            // store a direct mapped reference for use with Mousetrap.trigger
            self._directMap[combination + ':' + action] = callback;

            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');

            var sequence = combination.split(' ');
            var info;

            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }

            info = _getKeyInfo(combination, action);

            // make sure to initialize array if this is the first time
            // a callback is added for this key
            self._callbacks[info.key] = self._callbacks[info.key] || [];

            // remove an existing match if there is one
            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level, info.namespace);

            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
				namespace: info.namespace,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }

        /**
         * binds multiple combinations to the same callback
         *
         * @param {Array} combinations
         * @param {Function} callback
         * @param {string|undefined} action
         * @returns void
         */
        self._bindMultiple = function(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        };

        // start!
        _addEvent(targetElement, 'keypress', _handleKeyEvent);
        _addEvent(targetElement, 'keydown', _handleKeyEvent);
        _addEvent(targetElement, 'keyup', _handleKeyEvent);
		
        _addEvent(window, 'blur', _handleBlurEvent);
		//we now call this from outside
        //_addEvent(targetElement, 'contextmenu', _handleBlurEvent);
    }

    /**
     * binds an event to mousetrap
     *
     * can be a single key, a combination of keys separated with +,
     * an array of keys, or a sequence of keys separated by spaces
     *
     * be sure to list the modifier keys first to make sure that the
     * correct key ends up getting bound (the last key in the pattern)
     *
     * @param {string|Array} keys
     * @param {Function} callback
     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
     * @returns void
     */
    Mousetrap.prototype.bind = function(keys, callback, action) {
        var self = this;
        keys = keys instanceof Array ? keys : [keys];
        self._bindMultiple.call(self, keys, callback, action);
        return self;
    };

    /**
     * unbinds an event to mousetrap
     *
     * the unbinding sets the callback function of the specified key combo
     * to an empty function and deletes the corresponding key in the
     * _directMap dict.
     *
     * TODO: actually remove this from the _callbacks dictionary instead
     * of binding an empty function
     *
     * the keycombo+action has to be exactly the same as
     * it was defined in the bind method
     *
     * @param {string|Array} keys
     * @param {string} action
     * @returns void
     */
    Mousetrap.prototype.unbind = function(keys, action) {
        var self = this;
        return self.bind.call(self, keys, function() {}, action);
    };

    /**
     * triggers an event that has already been bound
     *
     * @param {string} keys
     * @param {string=} action
     * @returns void
     */
    Mousetrap.prototype.trigger = function(keys, action) {
        var self = this;
        if (self._directMap[keys + ':' + action]) {
            self._directMap[keys + ':' + action]({}, keys);
        }
        return self;
    };

    /**
     * resets the library back to its initial state.  this is useful
     * if you want to clear out the current keyboard shortcuts and bind
     * new ones - for example if you switch to another page
     *
     * @returns void
     */
    Mousetrap.prototype.reset = function() {
        var self = this;
        self._callbacks = {};
        self._directMap = {};
        return self;
    };

    /**
     * should we stop this event before firing off callbacks
     *
     * @param {Event} e
     * @param {Element} element
     * @return {boolean}
     */
    Mousetrap.prototype.stopCallback = function(e, element) {
        var self = this;

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        if (_belongsTo(element, self.target)) {
            return false;
        }
		
        // Events originating from a shadow DOM are re-targetted and `e.target` is the shadow host,
        // not the initial event target in the shadow tree. Note that not all events cross the
        // shadow boundary.
        // For shadow trees with `mode: 'open'`, the initial event target is the first element in
        // the eventâ€™s composed path. For shadow trees with `mode: 'closed'`, the initial event
        // target cannot be obtained.
        if ('composedPath' in e && typeof e.composedPath === 'function') {
            // For open shadow trees, update `element` so that the following check works.
            var initialEventTarget = e.composedPath()[0];
            if (initialEventTarget !== e.target) {
                element = initialEventTarget;
            }
        }

        // stop for input, select, and textarea
        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
    };

    /**
     * exposes _handleKey publicly so it can be overwritten by extensions
     */
    Mousetrap.prototype.handleKey = function() {
        var self = this;
        return self._handleKey.apply(self, arguments);
    };
	
    /**
     * exposes _handleKeyEvent publicly so it can call events manually
     */
    Mousetrap.prototype.handleKeyEvent = function(e) {
        var self = this;
        return self._doKeyEvent(e);
    };

    /**
     * exposes _handleblurEvent publicly so it can call events manually
     */
    Mousetrap.prototype.handleBlurEvent = function(e) {
        var self = this;
        return self._doBlurEvent(e);
    };

	/**
     * allow custom key mappings
     */
    Mousetrap.addKeycodes = function(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                _MAP[key] = object[key];
            }
        }
        _REVERSE_MAP = null;
    };
	
    /**
     * Init the global mousetrap functions
     *
     * This method is needed to allow the global mousetrap functions to work
     * now that mousetrap is a constructor function.
     */
    Mousetrap.init = function() {
        var documentMousetrap = Mousetrap(document);
        for (var method in documentMousetrap) {
            if (method.charAt(0) !== '_') {
                Mousetrap[method] = (function(method) {
                    return function() {
                        return documentMousetrap[method].apply(documentMousetrap, arguments);
                    };
                } (method));
            }
        }
    };

    Mousetrap.init();

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;
	
    // expose as a common js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Mousetrap;
    }

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Mousetrap;
        });
    }
}) (typeof window !== 'undefined' ? window : null, typeof  window !== 'undefined' ? document : null);
