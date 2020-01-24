# Record

This extension lets you use Mousetrap to record keyboard sequences and play them back:

```html
<button onclick="recordSequence()">Record</button>
<button onclick="stopRecord()">Stop</button>

<script>
    function recordSequence() {
        Mousetrap.record(function(sequence) {
            // sequence is an array like ['ctrl+k', 'c']
            alert('You pressed: ' + sequence.join(' '));
        });
    }
    function stopRecord() {
        Mousetrap.stopRecord();
    }
</script>
```
