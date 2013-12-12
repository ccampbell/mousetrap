/**
 * Peanut butter goes great with banana.
 *
 * @author Thomas Coats <thomas.coats@gmail.com>
 */
var Banana = (function() {
    var toggleBindButton = $("button.test-toggle-bind"),
        testResult = $(".test-bind-handle-result");
    
    var handle = null;
    var isBound = false;
    
    function _prepareToggleBindTest() {
        handle = Mousetrap.bind("b", function() {
            testResult.text(testResult.text() + "x");
        });
        isBound = true;
    }
    
    function _toggleBindTest() {
        if (isBound) {
            handle.unbind();
            isBound = false;
            toggleBindButton.text("Bind");
        }
        else {
            handle.bind();
            isBound = true;
            toggleBindButton.text("Unbind");
        }
    }
    
    return {
        mash: function () {
            _prepareToggleBindTest();
            toggleBindButton.click(_toggleBindTest);
        }
    }
})();
