/**
 * adds a pause and unpause method to Mousetrap
 * this allows you to enable or disable keyboard shortcuts
 * without having to reset Mousetrap and rebind everything
 */
/* global Mousetrap:true */
(function(Mousetrap) {
    var _originalStopCallback = Mousetrap.prototype.stopCallback;

    Mousetrap.prototype.stopCallback = function(e, element, combo) {
        var self = this;

        if (self.isUnpausedCombo(combo)) {
            return _originalStopCallback.call(self, e, element, combo);
        }

        if (self.paused) {
            return true;
        }

        if (self.isPausedCombo(combo)) {
            return true;
        }

        return _originalStopCallback.call(self, e, element, combo);
    };

    Mousetrap.prototype.pause = function() {
        var self = this;
        self.paused = true;
    };

    Mousetrap.prototype.unpause = function() {
        var self = this;
        self.paused = false;
    };

    Mousetrap.prototype.isUnpausedCombo = function(combo) {
        return (self.unpausedCombos && -1 < self.unpausedCombos.indexOf(combo));
    };

    Mousetrap.prototype.isPausedCombo = function(combo) {
        return (self.pausedCombos && -1 < self.pausedCombos.indexOf(combo));
    };

    Mousetrap.prototype.pauseCombo = function(combo) {
        var self = this;
        if (self.paused) {
            if (self.isUnpausedCombo(combo)) {
                var index = self.unpausedCombos.indexOf(combo);
                if (-1 < index) {
                    self.unpausedCombos.splice(index, 1);
                }
            }
        } else {
            if (!self.pausedCombos) {
                self.pausedCombos = [];
            }
            self.pausedCombos.push(combo);
        }
    };

    Mousetrap.prototype.unpauseCombo = function(combo) {
        var self = this;
        if (self.paused) {
            if (!self.unpausedCombos) {
                self.unpausedCombos = [];
            }
            self.unpausedCombos.push(combo);
        } else {
            if (self.isPausedCombo(combo)) {
                var index = self.pausedCombos.indexOf(combo);
                if (-1 < index) {
                    self.pausedCombos.splice(index, 1);
                }
            }
        }
    };

    Mousetrap.init();
}) (Mousetrap);
