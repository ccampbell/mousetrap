# Mousetrap

Mousetrap is a simple library for handling keyboard shortcuts in Javascript.

It is around **1.6kb** minified and gzipped, has no external dependencies, and has been tested in the following browsers:

- Internet Explorer 6+
- Safari
- Firefox
- Chrome

It has support for ``keypress``, ``keydown``, and ``keyup`` events on specific keys, keyboard combinations, or key sequences.

## Getting started

1.  Include mousetrap on your page before the closing ``</body>`` tag

    ```html
    <script src="/path/to/mousetrap.min.js"></script>
    ```

2.  Add some keyboard events to listen for

    ```html
    <script>
        // single keys
        Mousetrap.bind('4', function() { console.log('4'); });
        Mousetrap.bind("$", function() { console.log('money!'); }, 'keydown');
        Mousetrap.bind('esc', function() { console.log('escape'); }, 'keyup');

        // combinations
        Mousetrap.bind('command+shift+K', function() { console.log('command shift k'); });
        Mousetrap.bind(['command+k', 'ctrl+k'], function() { console.log('command k or control k'); });

        // gmail style sequences
        Mousetrap.bind('g i', function() { console.log('go to inbox'); });
        Mousetrap.bind('* a', function() { console.log('select all'); });

        // konami code!
        Mousetrap.bind('up up down down left right left right b a enter', function() {
            console.log('konami code');
        });
    </script>
    ```

## Why Mousetrap?

There are a number of other similar libraries out there so what makes this one different?

- There are no external dependencies, no framework is required
- You are not limited to ``keydown`` events (You can specify ``keypress``, ``keydown``, or ``keyup`` or let Mousetrap choose for you).
- You can bind key events directly to special keys such as ``?`` or ``*``
- It works with international keyboard layouts by intelligently choosing when to use ``keypress`` vs. ``keydown`` depending on what key you bind.
- You can bind Gmail like key sequences in addition to regular keys and key combinations
- You can programatically trigger key events with the ``trigger()`` method
- It works with the numeric keypad on your keyboard
- The code is well documented/commented

## Documentation

Full documentation can be found at http://craig.is/killing/mice
