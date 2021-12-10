/* eslint-disable
    no-empty,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const testTransferData = { "application/x-trix-feature-detection": "test" }

export var dataTransferIsPlainText = function(dataTransfer) {
  const text = dataTransfer.getData("text/plain")
  const html = dataTransfer.getData("text/html")

  if (text && html) {
    const { body } = new DOMParser().parseFromString(html, "text/html")
    if (body.textContent === text) {
      return !body.querySelector("*")
    }
  } else {
    return text?.length
  }
}

export var dataTransferIsWritable = function(dataTransfer) {
  if (dataTransfer?.setData == null) { return }
  for (var key in testTransferData) {
    var value = testTransferData[key]
    if (!(() => { try {
      dataTransfer.setData(key, value)
      return dataTransfer.getData(key) === value
    } catch (error) {} })()) { return }
  }
  return true
}

export var keyEventIsKeyboardCommand = (function() {
  if (/Mac|^iP/.test(navigator.platform)) {
    return event => event.metaKey
  } else {
    return event => event.ctrlKey
  }
})()
