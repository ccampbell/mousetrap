# Mousetrap

Mousetrap is a simple library for handling keyboard shortcuts in Javascript. 

It is around **1.5kb** minified and gzipped, has no external dependencies, and has been tested in the following browsers:

- Internet Explorer 6+
- Safari
- Firefox
- Chrome

It has support for ``keyup`` and ``keydown`` events on specific keys, keyboard combinations, or key sequences.

## Getting started

1.  Include mousetrap on your page before the closing ``<body>`` tag

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

## Documentation

Full documentation can be found at http://craig.is/killing/mice