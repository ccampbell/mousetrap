/* globals describe, chai, it, sinon, Mousetrap, KeyEvent, Event */
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
        expect(spy.callCount).to.equal(1, 'callback should have been called once');
        expect(spy.args[0][0]).to.be.an.instanceOf(Event, 'first argument should be Event');
        expect(spy.args[0][1]).to.equal('z', 'second argument should be key combo');

        event = new KeyEvent({
            charCode: charCode
        }, 'keydown');
        event.fire(document);

        expect(spy.callCount).to.equal(1, 'callback should not fire from keydown');

        event = new KeyEvent({
            charCode: charCode
        }, 'keyup');
        event.fire(document);

        expect(spy.callCount).to.equal(1, 'callback should not fire from keyup');
    });

    it('z key does not fire when pressing b', function() {
        var spy = sinon.spy();

        Mousetrap.bind('z', spy);

        var event = new KeyEvent({
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

            var event = new KeyEvent({
                charCode: charCode,
                modifiers: [modifier]
            });
            event.fire(document);
            expect(spy.callCount).to.equal(0);
        }
    });

    it('rebinding a key overwrites the callback for that key', function() {
        var spy1 = sinon.spy();
        var spy2 = sinon.spy();
        Mousetrap.bind('x', spy1);
        Mousetrap.bind('x', spy2);

        var event = new KeyEvent({
            charCode: 'X'.charCodeAt(0)
        });
        event.fire(document);

        expect(spy1.callCount).to.equal(0, 'original callback was not called');
        expect(spy2.callCount).to.equal(1, 'new callback was called');
    });

    it('binding an array of keys works', function() {
        var spy = sinon.spy();
        Mousetrap.bind(['a', 'b', 'c'], spy);

        var event = new KeyEvent({
            charCode: 'A'.charCodeAt(0)
        });
        event.fire(document);
        expect(spy.callCount).to.equal(1, 'new callback was called');
        expect(spy.args[0][1]).to.equal('a', 'callback should have matched for a');

        event = new KeyEvent({
            charCode: 'B'.charCodeAt(0)
        });
        event.fire(document);
        expect(spy.callCount).to.equal(2, 'new callback was called twice');
        expect(spy.args[1][1]).to.equal('b', 'callback should have matched for b');

        event = new KeyEvent({
            charCode: 'C'.charCodeAt(0)
        });
        event.fire(document);
        expect(spy.callCount).to.equal(3, 'new callback was called three times');
        expect(spy.args[2][1]).to.equal('c', 'callback should have matched for c');
    });

    it('binding special characters works', function() {
        var spy = sinon.spy();
        Mousetrap.bind('*', spy);

        var event = new KeyEvent({
            charCode: '*'.charCodeAt(0)
        });
        event.fire(document);
        expect(spy.callCount).to.equal(1, 'callback fired once');
        expect(spy.args[0][1]).to.equal('*', 'callback should have matched for *');
    });
});
