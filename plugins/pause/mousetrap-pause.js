/**
 * adds a pause and unpause method to Mousetrap
 * this allows you to enable or disable keyboard shortcuts
 * without having to reset Mousetrap and rebind everything
 */
/* global Mousetrap:true */
Mousetrap = (function(Mousetrap) {
    var self = Mousetrap,
        _originalStopCallback = self.stopCallback,
        enabled = true,
        enabledExceptFor = true,
        pausedExceptForCombinations;

    self.stopCallback = function(e, element, combo) {

        if (!enabled) {
            return true;
        }

        if (!enabledExceptFor) {
            var i           = 0,
                comboLength = pausedExceptForCombinations.length,
                isMatch     = false;

            for ( ; i < comboLength; i++ ) {
                if ( pausedExceptForCombinations[i] === combo ) {
                    isMatch = true;
                }
            }

            if ( !isMatch ) {
                return true;
            }
        }

        return _originalStopCallback(e, element, combo);
    };

    self.pause = function() {
        enabled = false;
    };

    self.unpause = function() {
        enabled = true;
        enabledExceptFor = true;
    };

    self.pauseExceptFor = function( combinations ) {
        enabledExceptFor = false;
        combinations = combinations instanceof Array ? combinations : [combinations];
        pausedExceptForCombinations = combinations;
    };

    return self;
}) (Mousetrap);