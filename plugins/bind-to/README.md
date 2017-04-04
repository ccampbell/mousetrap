# Bind To

This extension allows you to bind key events to specific elements using the `target` property of the event object.

Usage looks like:

```javascript
Mousetrap.bindTo(element, 'mod+s', function() {
    console.log('saved!');
});
```

You can optionally pass in ``keypress``, ``keydown`` or ``keyup`` as a second argument.

Other bind calls work the same way as they do by default.