describe('Mousetrap.bind', function() {
    var expect = chai.expect;

    it('z key fires when pressing z', function() {
        var spy = sinon.spy();

        Mousetrap.bind('z', spy);

        var charCode = 'Z'.charCodeAt(0);

        var event = new KeyEvent({
            charCode: charCode
        });
        event.fire(document);

        // really slow for some reason
        // expect(spy).to.have.been.calledOnce;
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.be.an.instanceOf(Event);
        expect(spy.args[0][1]).to.equal('z');
    });

    it('z key does not fire when pressing b', function() {
        var spy = sinon.spy();

        Mousetrap.bind('z', spy);

        event = new KeyEvent({
            charCode: 'B'.charCodeAt(0)
        });
        event.fire(document);
        expect(spy.callCount).to.equal(0);
    });

    it('z key does not fire when holding a modifier key', function() {
        var spy = sinon.spy();
        var modifiers = ['ctrl', 'alt', 'meta', 'shift'];
        var charCode;
        var modifier;

        Mousetrap.bind('z', spy);

        for (var i = 0; i < 4; i++) {
            modifier = modifiers[i];
            charCode = 'Z'.charCodeAt(0);

            // character code is different when alt is pressed
            if (modifier == 'alt') {
                charCode = 'Ω'.charCodeAt(0);
            }

            spy.reset();

            event = new KeyEvent({
                charCode: charCode,
                modifiers: [modifier]
            });

            event.fire(document);
            expect(spy.callCount).to.equal(0);
        }
    });
});
