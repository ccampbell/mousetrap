/**
 * adds a bindGlobal method to Mousetrap that allows you to
 * bind specific keyboard shortcuts that will still work
 * inside a text input field
 *
 * usage:
 * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
 */
Mousetrap = (function(Mousetrap) {
    var _global_callbacks = {},
        _original_stop_callback = Mousetrap.stopCallback;

    Mousetrap.stopCallback = function(e, element, combo) {
        if (_global_callbacks[combo]) {
            return false;
        }

        return _original_stop_callback(e, element, combo);
    };

    Mousetrap.bindGlobal = function(keys, callback, action) {
        Mousetrap.bind(keys, callback, action);

        if (keys instanceof Array) {
            for (var i = 0; i < keys.length; i++) {
                _global_callbacks[keys[i]] = true;
            }
            return;
        }

        _global_callbacks[keys] = true;
    };

    return Mousetrap;
}) (Mousetrap);
