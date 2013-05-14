/**
 * adds a pause and unpause method to Mousetrap
 * this allows you to enable or disable keyboard shortcuts
 * without having to reset Mousetrap and rebind everything
 */
Mousetrap = (function(Mousetrap) {
    var self = Mousetrap,
        _original_stop_callback = self.stopCallback,
        enabled = true;

    self.stopCallback = function(e, element) {
        if (!enabled) {
            return true;
        }

        return _original_stop_callback(e, element);
    };

    self.pause = function() {
        enabled = false;
    };

    self.unpause = function() {
        enabled = true;
    };

    return self;
}) (Mousetrap);
