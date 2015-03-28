# Stack Bind

This extension allows you to specify keyboard events that will lay on top of existing keyboard events. Should a binding exist, the new binding will execute before the old one.

Usage looks like:

```javascript
Mousetrap.stackBind('ctrl+s', function() {
    _save();
});
```

If a callback does not exist on the keys you specify, it will just be treated like a regular bind.

## Global Bind and Stacking

If you are also using the Global Bind plugin, you can stack on them too by using:

```javascript
Mousetrap.stackBindGlobal('ctrl+s', function() {
    _save();
});
```

