import * as config from "trix/config"

// Each software keyboard on Android emmits its own set of events and some of them can be buggy.
// This class detects when some buggy events are being emmitted and lets know the input controller
// that they should be ignored.
export default class FlakyAndroidKeyboardDetector {
  constructor(element) {
    this.element = element
  }

  shouldIgnore(event) {
    if (!config.browser.samsungAndroid) return false

    this.previousEvent = this.event
    this.event = event

    this.checkSamsungKeyboardBuggyModeStart()
    this.checkSamsungKeyboardBuggyModeEnd()

    return this.buggyMode
  }

  // private

  // The Samsung keyboard on Android can enter a buggy state in which it emmits a flurry of confused events that,
  // if processed, corrupts the editor. The buggy mode always starts with an insertText event, right after a
  // keydown event with for an "Unidentified" key, with the same text as the editor element, except for an
  // extra new line after the cursor.
  checkSamsungKeyboardBuggyModeStart() {
    if (this.insertingLongTextAfterUnidentifiedChar() && differsInWhitespace(this.element.innerText, this.event.data)) {
      this.buggyMode = true
      this.event.preventDefault()
    }
  }

  // The flurry of buggy events are always insertText. If we see any other type, it means it's over.
  checkSamsungKeyboardBuggyModeEnd() {
    if (this.buggyMode && this.event.inputType !== "insertText") {
      this.buggyMode = false
    }
  }

  insertingLongTextAfterUnidentifiedChar() {
    return this.isBeforeInputInsertText() && this.previousEventWasUnidentifiedKeydown() && this.event.data?.length > 100
  }

  isBeforeInputInsertText() {
    return this.event.type === "beforeinput" && this.event.inputType === "insertText"
  }

  previousEventWasUnidentifiedKeydown() {
    return this.previousEvent?.type === "keydown" && this.previousEvent?.key === "Unidentified"
  }
}

const differsInWhitespace = (text1, text2) => {
  return normalize(text1) === normalize(text2)
}

const normalize = (text) => text.replace(/\s+/g, " ").trim()
