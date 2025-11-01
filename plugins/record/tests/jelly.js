/**
 * Peanut butter goes great with jelly.
 *
 * @author Dan Tao <daniel.tao@gmail.com>
 */
const Jelly = (function () {
  const recordButton = $('button.test-record')
  const recordResult = $('div.test-record-result')

  function _formatSequenceAsHtml(sequence) {
    const combos = []
    let i

    for (i = 0; i < sequence.length; ++i) {
      combos.push(`<span>${_formatKeysAsHtml(sequence[i].split('+'))}</span>`)
    }

    return combos.join(' ')
  }

  function _formatKeysAsHtml(keys) {
    const htmlKeys = []
    let i

    for (i = 0; i < keys.length; ++i) {
      htmlKeys.push(`<kbd>${keys[i]}</kbd>`)
    }

    return htmlKeys.join('+')
  }

  function _prepareRecordTest() {
    recordButton.prop('disabled', true)
    recordButton.text('Recording')

    Mousetrap.record((sequence) => {
      recordResult.html(_formatSequenceAsHtml(sequence))
      recordButton.prop('disabled', false)
      recordButton.text('Record')
    })

    // take focus away from the button so that Mousetrap will actually
    // capture keystrokes
    recordButton.blur()
  }

  return {
    spread() {
      recordButton.click(_prepareRecordTest)
    },
  }
})()
