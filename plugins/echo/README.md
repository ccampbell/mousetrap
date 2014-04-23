# Echo

This extension lets you use Mousetrap to record keyboard sequences and play them back;
it differs from the [record](https://github.com/ccampbell/mousetrap/tree/master/plugins/record) plugin by allowing character duplicates, retaining order, and ending the sequence after a defined break character.

Essentially, echo implements blind typing:

```html
<button onclick="echoType()">Echo</button>

<script>
  function echoType() {
    Mousetrap.echo(function(plaintextString, objectArray) {
      /** plaintextString is a string like 'this one'.
       * objectArray is an array of objects exposing modifiers and special characters:
       *     [{character: 'enter', modifiers: 'shift'}]
       */
      alert('You pressed: ' + plaintextString);
    }, 'shift+enter');
      /** typing 'shift+enter' will trigger the callback);
       *      only one character can be used to trigger,
       *      although any modifiers may be used in conjunction
       */
    }
</script>
```

