Mousetrap is a simple library for handling keyboard shortcuts in Javascript.

It is licensed under the Apache 2.0 license.

It is around **2kb** minified and gzipped and **4.5kb** minified, has no external dependencies, and has been tested in the following browsers:

- Internet Explorer 6+
- Safari
- Firefox
- Chrome

It has support for ``keypress``, ``keydown``, and ``keyup`` events on specific keys, keyboard combinations, or key sequences.

## Getting started

1.  Install mousetrap-ts

    install `mousetrap-ts` from `npm` and import it

    ```ts
    import Mousetrap from 'mousetrap-ts';
    ```

2.  Add some keyboard events to listen for

    ```html
    <script>
        // single keys
        Mousetrap.bind('4', () => { console.log('4'); });
        Mousetrap.bind("?", () => { console.log('show shortcuts!'); });
        Mousetrap.bind('esc', () => { console.log('escape'); }, 'keyup');

        // combinations
        Mousetrap.bind('command+shift+k', () => { console.log('command shift k'); });

        // map multiple combinations to the same callback
        Mousetrap.bind(['command+k', 'ctrl+k'], () => {
            console.log('command k or control k');

            // return false to prevent default browser behavior and stop event from bubbling

            return false;
        });

        // gmail style sequences
        Mousetrap.bind('g i', () => { console.log('go to inbox'); });
        Mousetrap.bind('* a', () => { console.log('select all'); });

        // konami code!
        Mousetrap.bind('up up down down left right left right b a enter', () => {
            console.log('konami code');
        });

        // Use the KeyBindings Enum - Replace import statement with the following line
        import Mousetrap, { KeyBindings } from 'mousetrap-ts';
        Mousetrap.bind(KeyBindings.moveDown, () => { console.log('Triggered on arrow down') });

        // Type your callback - Replace import statement with the following line
        import Mousetrap, { CallbackFunction, KeyBindings } from 'mousetrap-ts';
        const callback: CallbackFunction = (e, combo) => {
            console.log('Corrects attributes and return value');
            return false;
        };
        Mousetrap.bind(KeyBindings.moveDown, callback);

        // Remove all listeners and reset callbacks
        Mousetrap.destroy();
    </script>
    ```

## Why Mousetrap?

There are a number of other similar libraries out there so what makes this one different?

- There are no external dependencies, no framework is required
- You are not limited to ``keydown`` events (You can specify ``keypress``, ``keydown``, or ``keyup`` or let Mousetrap choose for you).
- You can bind key events directly to special keys such as ``?`` or ``*`` without having to specify ``shift+/`` or ``shift+8`` which are not consistent across all keyboards
- It works with international keyboard layouts
- You can bind Gmail like key sequences in addition to regular keys and key combinations
- You can programatically trigger key events with the ``trigger()`` method
- It works with the numeric keypad on your keyboard
- The code is well documented/commented


## Documentation

Full documentation can be found at https://craig.is/killing/mice
