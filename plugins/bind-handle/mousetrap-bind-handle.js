/**
 * This extension alters Mousetrap bindings to return a handle,
 * allowing manipulation of the specific binding. This is 
 * useful if you want to remove a specific binding at a later
 * stage.
 */
/* global Mousetrap:true */
Mousetrap = (function(Mousetrap) {
    var self = Mousetrap,
        _originalBind = Mousetrap.bind;
        
    self.bind = function(keys, originalCallback, action) {
        var isBound = true;
        
        var callback = function() {
            if (!isBound) {
                return;
            }
            originalCallback.apply(this, arguments);
        };
        
        _originalBind(keys, callback, action);
        
        return {
            unbind: function() {
                isBound = false;
            },
            bind: function() {
                isBound = true;
            }
        };
    };
    return Mousetrap;
})(Mousetrap);
