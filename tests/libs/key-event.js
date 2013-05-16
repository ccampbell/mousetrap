(function() {
    var KeyEvent = function(data, type) {
        this.keyCode = 'keyCode' in data ? data.keyCode : 0;
        this.charCode = 'charCode' in data ? data.charCode : 0;

        var modifiers = 'modifiers' in data ? data.modifiers : [];

        this.ctrlKey = false;
        this.metaKey = false;
        this.altKey = false;
        this.shiftKey = false;

        for (var i = 0; i < modifiers.length; i++) {
            this[modifiers[i] + 'Key'] = true;
        }

        this.type = type || 'keypress';
    };

    KeyEvent.prototype.toNative = function() {
        var event = document.createEventObject ? document.createEventObject() : document.createEvent('Events');

        if (event.initEvent) {
            event.initEvent(this.type, true, true);
        }

        event.keyCode = this.keyCode;
        event.which = this.charCode || this.keyCode;
        event.shiftKey = this.shiftKey;
        event.metaKey = this.metaKey;
        event.altKey = this.altKey;
        event.ctrlKey = this.ctrlKey;

        return event;
    };

    KeyEvent.prototype.fire = function(element) {
        var event = this.toNative();
        if (element.dispatchEvent) {
            element.dispatchEvent(event);
            return;
        }

        element.fireEvent('on' + this.type, event);
    };

    window.KeyEvent = KeyEvent;
}) ();
