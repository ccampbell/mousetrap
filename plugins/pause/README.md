# Pause/unpause

This extension allows Mousetrap to be paused and unpaused without having to reset keyboard shortcuts and rebind them.

Usage looks like:

```javascript
// stop Mousetrap events from firing
Mousetrap.pause();

// stop Mousetrap events from firing except for the specified ones
Mousetrap.pauseExceptFor( '?' );
Mousetrap.pauseExceptFor( ['?', 'h'] );

// allow Mousetrap events to fire again
Mousetrap.unpause();
```