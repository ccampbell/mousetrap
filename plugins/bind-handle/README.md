# Bind handle

This extension alters Mousetrap bindings to return a handle, allowing manipulation of the specific binding. This is useful if you want to remove a specific binding at a later stage.

Usage looks like:

```javascript
var handle = Mousetrap.bind('4', function() { highlight(2); });

// stop the binding from firing
handle.unbind();

// allow binding to fire again
handle.bind();
```
