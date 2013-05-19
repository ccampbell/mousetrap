/* jshint es5: true, browser: true, expr: true */
/* globals describe, beforeEach, chai, it, sinon, Mousetrap, KeyEvent, Event */
describe('Mousetrap.bind', function() {
    var expect = chai.expect;

    beforeEach(function() {
        Mousetrap.reset();
    });

    describe('basic', function() {
        it('z key fires when pressing z', function() {
            var spy = sinon.spy();

            Mousetrap.bind('z', spy);

            KeyEvent.simulate('Z'.charCodeAt(0), 90);

            // really slow for some reason
            // expect(spy).to.have.been.calledOnce;
            expect(spy.callCount).to.equal(1, 'callback should fire once');
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, 'first argument should be Event');
            expect(spy.args[0][1]).to.equal('z', 'second argument should be key combo');
        });

        it('z key fires from keydown', function() {
            var spy = sinon.spy();

            Mousetrap.bind('z', spy, 'keydown');

            KeyEvent.simulate('Z'.charCodeAt(0), 90);

            // really slow for some reason
            // expect(spy).to.have.been.calledOnce;
            expect(spy.callCount).to.equal(1, 'callback should fire once');
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, 'first argument should be Event');
            expect(spy.args[0][1]).to.equal('z', 'second argument should be key combo');
        });

        it('z key does not fire when pressing b', function() {
            var spy = sinon.spy();

            Mousetrap.bind('z', spy);

            KeyEvent.simulate('B'.charCodeAt(0), 66);

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

                KeyEvent.simulate(charCode, 90, [modifier]);

                expect(spy.callCount).to.equal(0);
            }
        });

        it('keyup events should fire', function() {
            var spy = sinon.spy();

            Mousetrap.bind('z', spy, 'keyup');

            KeyEvent.simulate('Z'.charCodeAt(0), 90);

            expect(spy.callCount).to.equal(1, 'keyup event for "z" should fire');

            // for key held down we should only get one key up
            KeyEvent.simulate('Z'.charCodeAt(0), 90, [], document, 10);
            expect(spy.callCount).to.equal(2, 'keyup event for "z" should fire once for held down key');
        });

        it('rebinding a key overwrites the callback for that key', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            Mousetrap.bind('x', spy1);
            Mousetrap.bind('x', spy2);

            KeyEvent.simulate('X'.charCodeAt(0), 88);

            expect(spy1.callCount).to.equal(0, 'original callback should not fire');
            expect(spy2.callCount).to.equal(1, 'new callback should fire');
        });

        it('binding an array of keys', function() {
            var spy = sinon.spy();
            Mousetrap.bind(['a', 'b', 'c'], spy);

            KeyEvent.simulate('A'.charCodeAt(0), 65);
            expect(spy.callCount).to.equal(1, 'new callback was called');
            expect(spy.args[0][1]).to.equal('a', 'callback should match "a"');

            KeyEvent.simulate('B'.charCodeAt(0), 66);
            expect(spy.callCount).to.equal(2, 'new callback was called twice');
            expect(spy.args[1][1]).to.equal('b', 'callback should match "b"');

            KeyEvent.simulate('C'.charCodeAt(0), 67);
            expect(spy.callCount).to.equal(3, 'new callback was called three times');
            expect(spy.args[2][1]).to.equal('c', 'callback should match "c"');
        });

        it('return false should prevent default and stop propagation', function() {
            var spy = sinon.spy(function() {
                return false;
            });

            Mousetrap.bind('command+s', spy);

            KeyEvent.simulate('S'.charCodeAt(0), 83, ['meta']);

            expect(spy.callCount).to.equal(1, 'callback should fire');
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, 'first argument should be Event');
            expect(spy.args[0][0].cancelBubble).to.be.true;
            expect(spy.args[0][0].defaultPrevented).to.be.true;

            // try without return false
            spy = sinon.spy();
            Mousetrap.bind('command+s', spy);
            KeyEvent.simulate('S'.charCodeAt(0), 83, ['meta']);

            expect(spy.callCount).to.equal(1, 'callback should fire');
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, 'first argument should be Event');
            expect(spy.args[0][0].cancelBubble).to.be.false;
            expect(spy.args[0][0].defaultPrevented).to.be.false;
        });

        it.skip('capslock key is ignored');
    });

    describe('special characters', function() {
        it('binding special characters', function() {
            var spy = sinon.spy();
            Mousetrap.bind('*', spy);

            KeyEvent.simulate('*'.charCodeAt(0), 56, ['shift']);

            expect(spy.callCount).to.equal(1, 'callback should fire');
            expect(spy.args[0][1]).to.equal('*', 'callback should match *');
        });

        it('binding special characters keyup', function() {
            var spy = sinon.spy();
            Mousetrap.bind('*', spy, 'keyup');

            KeyEvent.simulate('*'.charCodeAt(0), 56, ['shift']);

            expect(spy.callCount).to.equal(1, 'callback should fire');
            expect(spy.args[0][1]).to.equal('*', 'callback should match "*"');
        });

        it('binding keys with no associated charCode', function() {
            var spy = sinon.spy();
            Mousetrap.bind('left', spy);

            KeyEvent.simulate(0, 37);

            expect(spy.callCount).to.equal(1, 'callback should fire');
            expect(spy.args[0][1]).to.equal('left', 'callback should match "left"');
        });
    });

    describe('combos with modifiers', function() {
        it('binding key combinations', function() {
            var spy = sinon.spy();
            Mousetrap.bind('command+o', spy);

            KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta']);

            expect(spy.callCount).to.equal(1, 'command+o callback should fire');
            expect(spy.args[0][1]).to.equal('command+o', 'keyboard string returned is correct');
        });

        it('binding key combos with multiple modifiers', function() {
            var spy = sinon.spy();
            Mousetrap.bind('command+shift+o', spy);
            KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta']);
            expect(spy.callCount).to.equal(0, 'command+o callback should not fire');

            KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta', 'shift']);
            expect(spy.callCount).to.equal(1, 'command+o callback should fire');
        });
    });

    describe('sequences', function() {
        it('binding sequences', function() {
            var spy = sinon.spy();
            Mousetrap.bind('g i', spy);

            KeyEvent.simulate('G'.charCodeAt(0), 71);
            expect(spy.callCount).to.equal(0, 'callback should not fire');

            KeyEvent.simulate('I'.charCodeAt(0), 73);
            expect(spy.callCount).to.equal(1, 'callback should fire');
        });

        it.skip('binding sequences with mixed types', function() {
            var spy = sinon.spy();
            Mousetrap.bind('g o enter', spy);

            KeyEvent.simulate('G'.charCodeAt(0), 71);
            expect(spy.callCount).to.equal(0, 'callback should not fire');

            KeyEvent.simulate('O'.charCodeAt(0), 79);
            expect(spy.callCount).to.equal(0, 'callback should not fire');

            KeyEvent.simulate(0, 13);
            expect(spy.callCount).to.equal(1, 'callback should fire');
        });

        it('key within sequence should not fire', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            Mousetrap.bind('a', spy1);
            Mousetrap.bind('c a t', spy2);

            KeyEvent.simulate('A'.charCodeAt(0), 65);
            expect(spy1.callCount).to.equal(1, 'callback 1 should fire');
            spy1.reset();

            KeyEvent.simulate('C'.charCodeAt(0), 67);
            KeyEvent.simulate('A'.charCodeAt(0), 65);
            KeyEvent.simulate('T'.charCodeAt(0), 84);
            expect(spy1.callCount).to.equal(0, 'callback for "a" key should not fire');
            expect(spy2.callCount).to.equal(1, 'callback for "c a t" sequence should fire');
        });

        it('keyup at end of sequence should not fire', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Mousetrap.bind('t', spy1, 'keyup');
            Mousetrap.bind('b a t', spy2);

            KeyEvent.simulate('B'.charCodeAt(0), 66);
            KeyEvent.simulate('A'.charCodeAt(0), 65);
            KeyEvent.simulate('T'.charCodeAt(0), 84);

            expect(spy1.callCount).to.equal(0, 'callback for "t" keyup should not fire');
            expect(spy2.callCount).to.equal(1, 'callback for "b a t" sequence should fire');
        });

        it('modifiers and sequences play nicely', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Mousetrap.bind('ctrl a', spy1);
            Mousetrap.bind('ctrl+b', spy2);

            KeyEvent.simulate(0, 17, ['ctrl']);
            KeyEvent.simulate('A'.charCodeAt(0), 65);
            expect(spy1.callCount).to.equal(1, '"ctrl a" should fire');

            KeyEvent.simulate('B'.charCodeAt(0), 66, ['ctrl']);
            expect(spy2.callCount).to.equal(1, '"ctrl+b" should fire');
        });

        it('sequences should not fire subsequences', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Mousetrap.bind('a b c', spy1);
            Mousetrap.bind('b c', spy2);

            KeyEvent.simulate('A'.charCodeAt(0), 65);
            KeyEvent.simulate('B'.charCodeAt(0), 66);
            KeyEvent.simulate('C'.charCodeAt(0), 67);

            expect(spy1.callCount).to.equal(1, '"a b c" should fire');
            expect(spy2.callCount).to.equal(0, '"b c" should not fire');

            spy1.reset();
            spy2.reset();
            Mousetrap.bind('option b', spy1);
            Mousetrap.bind('a option b', spy2);

            KeyEvent.simulate('A'.charCodeAt(0), 65);
            KeyEvent.simulate(0, 18, ['alt']);
            KeyEvent.simulate('B'.charCodeAt(0), 66);

            expect(spy1.callCount).to.equal(0, '"option b" should not fire');
            expect(spy2.callCount).to.equal(1, '"a option b" should fire');
        });

        it.skip('broken sequences');

        it.skip('sequence timeout');
    });

    describe('default actions', function() {
        it.skip('"a" key uses "keypress"');
    });
});

describe('Mousetrap.unbind', function() {
    it.skip('unbind works');
    it.skip('unbind accepts an array');
});
