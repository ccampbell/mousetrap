/**
 * adds a stack method to Mousetrap that allows you to
 * chain a keyboard binding instead of clobbering the old binding
 * 
 * usage:
 * Mousetrap.stackBind('ctrl+s', _saveChanges);
 * Mousetrap.stackBindGlobal('ctrl+s', _saveChanges);
 */
/* global Mousetrap:true */
Mousetrap = (function(Mousetrap) {
    var _globalCallbacks = {},
        _bindGlobal = Mousetrap.bindGlobal;

    var _stackCallback = function(keys, callback, action) {
        var stack = Mousetrap.getCallback(keys, action);

        if (stack) {
          return function(e, keys) {
            callback(e, keys);
            stack(e, keys);
          };
        } else {
          return callback;
        }
    }

    Mousetrap.stackBind = function(keys, callback, action) {
        Mousetrap.bind(keys, _stackCallback(keys, callback, action), action);
    };

    Mousetrap.stackBindGlobal = function(keys, callback, action) {
        Mousetrap.bindGlobal(
          keys, _stackCallback(keys, callback, action), action
        );
    }

    return Mousetrap;
}) (Mousetrap);
