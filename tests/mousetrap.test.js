import Mousetrap from '../mousetrap'
import KeyEvent from './libs/key-event'

describe('mousetrap', () => {
  afterEach(() => {
    Mousetrap.reset()
  })
  describe('basic', () => {
    it('z key fires when pressing z', () => {
      const spy = vi.fn()

      Mousetrap.bind('z', spy)

      KeyEvent.simulate('Z'.charCodeAt(0), 90)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'z')
    })

    it('z key fires from keydown', () => {
      const spy = vi.fn()

      Mousetrap.bind('z', spy, 'keydown')

      KeyEvent.simulate('Z'.charCodeAt(0), 90)
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'z')
    })

    it('z key does not fire when pressing b', () => {
      const spy = vi.fn()

      Mousetrap.bind('z', spy)

      KeyEvent.simulate('B'.charCodeAt(0), 66)

      expect(spy).toBeCalledTimes(0)
    })

    it('z key does not fire when holding a modifier key', () => {
      const spy = vi.fn()
      const modifiers = ['ctrl', 'alt', 'meta', 'shift']
      let charCode
      let modifier

      Mousetrap.bind('z', spy)

      for (let i = 0; i < 4; i++) {
        modifier = modifiers[i]
        charCode = 'Z'.charCodeAt(0)

        // character code is different when alt is pressed
        if (modifier === 'alt') {
          charCode = 'Ω'.charCodeAt(0)
        }

        KeyEvent.simulate(charCode, 90, [modifier])
        expect(spy).toBeCalledTimes(0)
      }
    })

    it('z key does not fire when inside an input element in an open shadow dom', () => {
      const spy = vi.fn()

      const shadowHost = document.createElement('div')
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
      document.body.appendChild(shadowHost)

      const inputElement = document.createElement('input')
      shadowRoot.appendChild(inputElement)
      expect(shadowHost.shadowRoot).to.equal(shadowRoot, 'shadow root accessible')

      Mousetrap.bind('z', spy)
      KeyEvent.simulate('Z'.charCodeAt(0), 90, [], inputElement, 1, { shadowHost })
      document.body.removeChild(shadowHost)
      expect(spy).toBeCalledTimes(0)
    })

    it('z key does fire when inside an input element in a closed shadow dom', () => {
      const spy = vi.fn()

      const shadowHost = document.createElement('div')
      const shadowRoot = shadowHost.attachShadow({ mode: 'closed' })
      document.body.appendChild(shadowHost)

      const inputElement = document.createElement('input')
      shadowRoot.appendChild(inputElement)
      expect(shadowHost.shadowRoot).to.equal(null, 'shadow root unaccessible')

      Mousetrap.bind('z', spy)
      KeyEvent.simulate('Z'.charCodeAt(0), 90, [], inputElement, 1, { shadowHost })
      document.body.removeChild(shadowHost)
      expect(spy).toBeCalledTimes(1)
    })

    it('keyup events should fire', () => {
      const spy = vi.fn()

      Mousetrap.bind('z', spy, 'keyup')

      KeyEvent.simulate('Z'.charCodeAt(0), 90)
      expect(spy).toBeCalledTimes(1)

      // for key held down we should only get one key up
      KeyEvent.simulate('Z'.charCodeAt(0), 90, [], document, 10)
      expect(spy).toBeCalledTimes(2)
    })

    it('keyup event for 0 should fire', () => {
      const spy = vi.fn()

      Mousetrap.bind('0', spy, 'keyup')

      KeyEvent.simulate(0, 48)
      expect(spy).toBeCalledTimes(1)
    })

    it('rebinding a key overwrites the callback for that key', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()
      Mousetrap.bind('x', spy1)
      Mousetrap.bind('x', spy2)

      KeyEvent.simulate('X'.charCodeAt(0), 88)
      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('binding an array of keys', () => {
      const spy = vi.fn()
      Mousetrap.bind(['a', 'b', 'c'], spy)

      KeyEvent.simulate('A'.charCodeAt(0), 65)
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'a')

      KeyEvent.simulate('B'.charCodeAt(0), 66)
      expect(spy).toBeCalledTimes(2)
      expect(spy).toBeCalledWith(expect.any(Event), 'b')

      KeyEvent.simulate('C'.charCodeAt(0), 67)
      expect(spy).toBeCalledTimes(3)
      expect(spy).toBeCalledWith(expect.any(Event), 'c')
    })

    it('return false should prevent default and stop propagation', () => {
      const spy = vi.fn(() => {
        return false
      })

      Mousetrap.bind('command+s', spy)

      KeyEvent.simulate('S'.charCodeAt(0), 83, ['meta'])

      expect(spy).toHaveBeenCalledTimes(1)
      const event = spy.mock.calls[0][0]

      expect(event).toBeInstanceOf(Event)
      expect(event.defaultPrevented).toBe(true)

      // Test again without returning false
      const spy2 = vi.fn()
      Mousetrap.reset() // Ensure previous handler doesn't interfere
      Mousetrap.bind('command+s', spy2)
      KeyEvent.simulate('S'.charCodeAt(0), 83, ['meta'])

      expect(spy2).toHaveBeenCalledTimes(1)
      const event2 = spy2.mock.calls[0][0]

      expect(event2).toBeInstanceOf(Event)
      expect(event2.cancelBubble).toBe(false)
      expect(event2.defaultPrevented).toBe(false)
    })

    it('capslock key is ignored', () => {
      const spy = vi.fn()
      Mousetrap.bind('a', spy)

      KeyEvent.simulate('a'.charCodeAt(0), 65)
      expect(spy).toBeCalledTimes(1)
      spy.mockClear()
      KeyEvent.simulate('A'.charCodeAt(0), 65)
      expect(spy).toBeCalledTimes(1)

      spy.mockClear()
      KeyEvent.simulate('A'.charCodeAt(0), 65, ['shift'])
      expect(spy).toBeCalledTimes(0)
    })
  })
  describe('special characters', () => {
    it('binding special characters', () => {
      const spy = vi.fn()
      Mousetrap.bind('*', spy)

      KeyEvent.simulate('*'.charCodeAt(0), 56, ['shift'])
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), '*')
    })

    it('binding special characters keyup', () => {
      const spy = vi.fn()
      Mousetrap.bind('*', spy, 'keyup')

      KeyEvent.simulate('*'.charCodeAt(0), 56, ['shift'])
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), '*')
    })

    it('binding keys with no associated charCode', () => {
      const spy = vi.fn()
      Mousetrap.bind('left', spy)

      KeyEvent.simulate(0, 37)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'left')
    })

    it('binding plus key alone should work', () => {
      const spy = vi.fn()
      Mousetrap.bind('+', spy)

      // fires for regular + character
      KeyEvent.simulate('+'.charCodeAt(0), 43)

      // and for shift+=
      KeyEvent.simulate(43, 187, ['shift'])
      expect(spy).toBeCalledTimes(2)
      expect(spy).toBeCalledWith(expect.any(Event), '+')
    })

    it('binding plus key as "plus" should work', () => {
      const spy = vi.fn()
      Mousetrap.bind('plus', spy)

      // fires for regular + character
      KeyEvent.simulate('+'.charCodeAt(0), 43)

      // and for shift+=
      KeyEvent.simulate(43, 187, ['shift'])
      expect(spy).toBeCalledTimes(2)
      expect(spy).toBeCalledWith(expect.any(Event), 'plus')
    })

    it('binding to alt++ should work', () => {
      const spy = vi.fn()
      Mousetrap.bind('alt++', spy)

      KeyEvent.simulate('+'.charCodeAt(0), 43, ['alt'])
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'alt++')
    })

    it('binding to alt+shift++ should work as well', () => {
      const spy = vi.fn()
      Mousetrap.bind('alt+shift++', spy)

      KeyEvent.simulate('+'.charCodeAt(0), 43, ['shift', 'alt'])
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'alt+shift++')
    })
  })
  describe('combos with modifiers', () => {
    it('binding key combinations', () => {
      const spy = vi.fn()
      Mousetrap.bind('command+o', spy)

      KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta'])
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'command+o')
    })

    it('binding key combos with multiple modifiers', () => {
      const spy = vi.fn()
      Mousetrap.bind('command+shift+o', spy)
      KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta'])
      expect(spy).toBeCalledTimes(0)

      KeyEvent.simulate('O'.charCodeAt(0), 79, ['meta', 'shift'])
      expect(spy).toBeCalledTimes(1)
    })

    it('should fire callback when ctrl+numpad 0 is pressed', () => {
      const spy = vi.fn()

      Mousetrap.bind('ctrl+0', spy)

      // numpad 0 keycode
      KeyEvent.simulate(96, 96, ['ctrl'])

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'ctrl+0')
    })
  })
  describe('sequences', () => {
    it('binding sequences', () => {
      const spy = vi.fn()
      Mousetrap.bind('g i', spy)

      KeyEvent.simulate('G'.charCodeAt(0), 71)
      expect(spy).toBeCalledTimes(0)

      KeyEvent.simulate('I'.charCodeAt(0), 73)
      expect(spy).toBeCalledTimes(1)
    })

    it('binding sequences with mixed types', () => {
      const spy = vi.fn()
      Mousetrap.bind('g o enter', spy)

      KeyEvent.simulate('G'.charCodeAt(0), 71)
      expect(spy).toBeCalledTimes(0)

      KeyEvent.simulate('O'.charCodeAt(0), 79)
      expect(spy).toBeCalledTimes(0)

      KeyEvent.simulate(0, 13)
      expect(spy).toBeCalledTimes(1)
    })

    it('binding sequences starting with modifier keys', () => {
      let spy = vi.fn()
      Mousetrap.bind('option enter', spy)
      KeyEvent.simulate(0, 18, ['alt'])
      KeyEvent.simulate(0, 13)
      expect(spy).toBeCalledTimes(1)

      spy = vi.fn()
      Mousetrap.bind('command enter', spy)
      KeyEvent.simulate(0, 91, ['meta'])
      KeyEvent.simulate(0, 13)
      expect(spy).toBeCalledTimes(1)

      spy = vi.fn()
      Mousetrap.bind('escape enter', spy)
      KeyEvent.simulate(0, 27)
      KeyEvent.simulate(0, 13)
      expect(spy).toBeCalledTimes(1)
    })

    it('key within sequence should not fire', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()
      Mousetrap.bind('a', spy1)
      Mousetrap.bind('c a t', spy2)

      KeyEvent.simulate('A'.charCodeAt(0), 65)
      expect(spy1).toBeCalledTimes(1)
      spy1.mockClear()

      KeyEvent.simulate('C'.charCodeAt(0), 67)
      KeyEvent.simulate('A'.charCodeAt(0), 65)
      KeyEvent.simulate('T'.charCodeAt(0), 84)
      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('keyup at end of sequence should not fire', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()

      Mousetrap.bind('t', spy1, 'keyup')
      Mousetrap.bind('b a t', spy2)

      KeyEvent.simulate('B'.charCodeAt(0), 66)
      KeyEvent.simulate('A'.charCodeAt(0), 65)
      KeyEvent.simulate('T'.charCodeAt(0), 84)

      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('keyup sequences should work', () => {
      const spy = vi.fn()
      Mousetrap.bind('b a t', spy, 'keyup')

      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('a'.charCodeAt(0), 65)

      // hold the last key down for a while
      KeyEvent.simulate('t'.charCodeAt(0), 84, [], document, 10)

      expect(spy).toBeCalledTimes(1)
    })

    it('extra spaces in sequences should be ignored', () => {
      const spy = vi.fn()
      Mousetrap.bind('b   a  t', spy)

      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('t'.charCodeAt(0), 84)

      expect(spy).toBeCalledTimes(1)
    })

    it('modifiers and sequences play nicely', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()

      Mousetrap.bind('ctrl a', spy1)
      Mousetrap.bind('ctrl+b', spy2)

      KeyEvent.simulate(0, 17, ['ctrl'])
      KeyEvent.simulate('A'.charCodeAt(0), 65)
      expect(spy1).toBeCalledTimes(1)

      KeyEvent.simulate('B'.charCodeAt(0), 66, ['ctrl'])
      expect(spy2).toBeCalledTimes(1)
    })

    it('sequences that start the same work', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()

      Mousetrap.bind('g g l', spy2)
      Mousetrap.bind('g g o', spy1)

      KeyEvent.simulate('g'.charCodeAt(0), 71)
      KeyEvent.simulate('g'.charCodeAt(0), 71)
      KeyEvent.simulate('o'.charCodeAt(0), 79)
      expect(spy1).toBeCalledTimes(1)
      expect(spy2).toBeCalledTimes(0)

      spy1.mockClear()
      spy2.mockClear()
      KeyEvent.simulate('g'.charCodeAt(0), 71)
      KeyEvent.simulate('g'.charCodeAt(0), 71)
      KeyEvent.simulate('l'.charCodeAt(0), 76)
      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('sequences should not fire subsequences', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()

      Mousetrap.bind('a b c', spy1)
      Mousetrap.bind('b c', spy2)

      KeyEvent.simulate('A'.charCodeAt(0), 65)
      KeyEvent.simulate('B'.charCodeAt(0), 66)
      KeyEvent.simulate('C'.charCodeAt(0), 67)

      expect(spy1).toBeCalledTimes(1)
      expect(spy2).toBeCalledTimes(0)
      spy1.mockClear()
      spy2.mockClear()
      Mousetrap.bind('option b', spy1)
      Mousetrap.bind('a option b', spy2)

      KeyEvent.simulate('A'.charCodeAt(0), 65)
      KeyEvent.simulate(0, 18, ['alt'])
      KeyEvent.simulate('B'.charCodeAt(0), 66)
      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('rebinding same sequence should override previous', () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()
      Mousetrap.bind('a b c', spy1)
      Mousetrap.bind('a b c', spy2)

      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('c'.charCodeAt(0), 67)
      expect(spy1).toBeCalledTimes(0)
      expect(spy2).toBeCalledTimes(1)
    })

    it('broken sequences', () => {
      const spy = vi.fn()
      Mousetrap.bind('h a t', spy)

      KeyEvent.simulate('h'.charCodeAt(0), 72)
      KeyEvent.simulate('e'.charCodeAt(0), 69)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('r'.charCodeAt(0), 82)
      KeyEvent.simulate('t'.charCodeAt(0), 84)
      expect(spy).toBeCalledTimes(0)
    })

    it('sequences containing combos should work', () => {
      let spy = vi.fn()
      Mousetrap.bind('a ctrl+b', spy)

      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('B'.charCodeAt(0), 66, ['ctrl'])
      expect(spy).toBeCalledTimes(1)

      Mousetrap.unbind('a ctrl+b')

      spy = vi.fn()
      Mousetrap.bind('ctrl+b a', spy)

      KeyEvent.simulate('b'.charCodeAt(0), 66, ['ctrl'])
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      expect(spy).toBeCalledTimes(1)
    })

    it('sequences starting with spacebar should work', () => {
      const spy = vi.fn()
      Mousetrap.bind('a space b c', spy)

      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate(32, 32)
      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('c'.charCodeAt(0), 67)
      expect(spy).toBeCalledTimes(1)
    })

    it('konami code', () => {
      const spy = vi.fn()
      Mousetrap.bind('up up down down left right left right b a enter', spy)

      KeyEvent.simulate(0, 38)
      KeyEvent.simulate(0, 38)
      KeyEvent.simulate(0, 40)
      KeyEvent.simulate(0, 40)
      KeyEvent.simulate(0, 37)
      KeyEvent.simulate(0, 39)
      KeyEvent.simulate(0, 37)
      KeyEvent.simulate(0, 39)
      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate(0, 13)
      expect(spy).toBeCalledTimes(1)
    })

    it('sequence timer resets', () => {
      const spy = vi.fn()
      const clock = vi.useFakeTimers()

      Mousetrap.bind('h a t', spy)

      KeyEvent.simulate('h'.charCodeAt(0), 72)
      clock.advanceTimersByTime(600)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      clock.advanceTimersByTime(900)
      KeyEvent.simulate('t'.charCodeAt(0), 84)
      expect(spy).toBeCalledTimes(1)
      clock.useRealTimers()
    })

    it('sequences timeout', () => {
      const spy = vi.fn()
      const clock = vi.useFakeTimers()

      Mousetrap.bind('g t', spy)
      KeyEvent.simulate('g'.charCodeAt(0), 71)
      clock.advanceTimersByTime(1000)
      KeyEvent.simulate('t'.charCodeAt(0), 84)
      expect(spy).toBeCalledTimes(0)
      clock.useRealTimers()
    })
  })
  describe('default actions', () => {
    const keys = {
      keypress: [
        ['a', 65],
        ['A', 65, ['shift']],
        ['7', 55],
        ['?', 191],
        ['*', 56],
        ['+', 187],
        ['$', 52],
        ['[', 219],
        ['.', 190],
      ],
      keydown: [
        ['shift+\'', 222, ['shift']],
        ['shift+a', 65, ['shift']],
        ['shift+5', 53, ['shift']],
        ['command+shift+p', 80, ['meta', 'shift']],
        ['space', 32],
        ['left', 37],
      ],
    }

    function getCallback(key, keyCode, type, modifiers) {
      return () => {
        const spy = vi.fn()
        Mousetrap.bind(key, spy)

        KeyEvent.simulate(key.charCodeAt(0), keyCode, modifiers)
        expect(spy).toHaveBeenCalledTimes(1)
        const event = spy.mock.calls[0][0]

        expect(event.type).toBe(type)
      }
    }

    for (const type in keys) {
      for (let i = 0; i < keys[type].length; i++) {
        const key = keys[type][i][0]
        const keyCode = keys[type][i][1]
        const modifiers = keys[type][i][2] || []
        it(`"${key}" uses "${type}"`, getCallback(key, keyCode, type, modifiers))
      }
    }
  })
  describe('mousetrap.unbind', () => {
    it('unbind works', () => {
      const spy = vi.fn()
      Mousetrap.bind('a', spy)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      expect(spy).toHaveBeenCalledTimes(1)

      Mousetrap.unbind('a')
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('unbind accepts an array', () => {
      const spy = vi.fn()
      Mousetrap.bind(['a', 'b', 'c'], spy)
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('c'.charCodeAt(0), 67)
      expect(spy).toHaveBeenCalledTimes(3)

      Mousetrap.unbind(['a', 'b', 'c'])
      KeyEvent.simulate('a'.charCodeAt(0), 65)
      KeyEvent.simulate('b'.charCodeAt(0), 66)
      KeyEvent.simulate('c'.charCodeAt(0), 67)
      expect(spy).toHaveBeenCalledTimes(3)
    })
  })
  describe('wrapping a specific element', () => {
    // Prepare the DOM for these tests.
    document.body.insertAdjacentHTML('afterbegin', `
              <form style="display: none;">
                <textarea></textarea>
              </form>
          `)

    const form = document.querySelector('form')
    const textarea = form.querySelector('textarea')

    it('z key fires when pressing z in the target element', () => {
      const spy = vi.fn()

      Mousetrap(form).bind('z', spy)

      KeyEvent.simulate('Z'.charCodeAt(0), 90, [], form)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'z')
    })

    it('z key fires when pressing z in a child of the target element', () => {
      const spy = vi.fn()

      Mousetrap(form).bind('z', spy)

      KeyEvent.simulate('Z'.charCodeAt(0), 90, [], textarea)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'z')
    })

    it('z key does not fire when pressing z outside the target element', () => {
      const spy = vi.fn()

      Mousetrap(textarea).bind('z', spy)

      KeyEvent.simulate('Z'.charCodeAt(0), 90)
      expect(spy).toBeCalledTimes(0)
    })

    it('should work when constructing a new mousetrap object', () => {
      const spy = vi.fn()

      const mousetrap = new Mousetrap(form)
      mousetrap.bind('a', spy)

      KeyEvent.simulate('a'.charCodeAt(0), 65, [], textarea)
      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'a')
    })

    it('should allow you to create an empty mousetrap constructor', () => {
      const spy = vi.fn()

      const mousetrap = new Mousetrap()
      mousetrap.bind('a', spy)

      KeyEvent.simulate('a'.charCodeAt(0), 65)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(expect.any(Event), 'a')
    })
  })
  describe('mouestrap.addKeycodes', () => {
    it('should properly recognize non-default mapping', () => {
      const spy = vi.fn()

      Mousetrap.addKeycodes({
        144: 'num',
      })

      Mousetrap.bind('num', spy)

      KeyEvent.simulate(144, 144)
      expect(spy).toHaveBeenCalledTimes(1)

      spy.mockClear()
    })
  })
})
