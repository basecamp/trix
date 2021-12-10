/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Recording from "inspector/watchdog/recording"
import Serializer from "inspector/watchdog/serializer"

export default class Recorder {
  constructor(element, { snapshotLimit } = {}) {
    this.recordSnapshotDuringNextAnimationFrame = this.recordSnapshotDuringNextAnimationFrame.bind(this)
    this.handleEvent = this.handleEvent.bind(this)
    this.element = element
    this.snapshotLimit = snapshotLimit
    this.recording = new Recording
  }

  start() {
    if (this.started) { return }
    this.installMutationObserver()
    this.installEventListeners()
    this.recordSnapshot()
    this.started = true
  }

  stop() {
    if (!this.started) { return }
    this.uninstallMutationObserver()
    this.uninstallEventListeners()
    this.started = false
  }

  log(message) {
    return this.recording.recordEvent({ type: "log", message })
  }

  installMutationObserver() {
    this.mutationObserver = new MutationObserver(this.recordSnapshotDuringNextAnimationFrame)
    return this.mutationObserver.observe(this.element, { attributes: true, characterData: true, childList: true, subtree: true })
  }

  uninstallMutationObserver() {
    this.mutationObserver.disconnect()
    this.mutationObserver = null
  }

  recordSnapshotDuringNextAnimationFrame() {
    return this.animationFrameRequest != null ? this.animationFrameRequest : this.animationFrameRequest = requestAnimationFrame(() => {
      this.animationFrameRequest = null
      return this.recordSnapshot()
    })
  }

  installEventListeners() {
    this.element.addEventListener("input", this.handleEvent, true)
    this.element.addEventListener("keypress", this.handleEvent, true)
    return document.addEventListener("selectionchange", this.handleEvent, true)
  }

  uninstallEventListeners() {
    this.element.removeEventListener("input", this.handleEvent, true)
    this.element.removeEventListener("keypress", this.handleEvent, true)
    return document.removeEventListener("selectionchange", this.handleEvent, true)
  }

  handleEvent(event) {
    switch (event.type) {
      case "input":
        return this.recordInputEvent(event)
      case "keypress":
        return this.recordKeypressEvent(event)
      case "selectionchange":
        return this.recordSnapshotDuringNextAnimationFrame()
    }
  }

  recordInputEvent(event) {
    return this.recording.recordEvent({ type: "input" })
  }

  recordKeypressEvent(event) {
    return this.recording.recordEvent({
      type: "keypress",
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      keyCode: event.keyCode,
      charCode: event.charCode,
      character: characterFromKeyboardEvent(event)
    })
  }

  recordSnapshot() {
    this.recording.recordSnapshot(this.getSnapshot())
    if (this.snapshotLimit != null) { return this.recording.truncateToSnapshotCount(this.snapshotLimit) }
  }

  getSnapshot() {
    const serializer = new Serializer(this.element)
    return serializer.getSnapshot()
  }
}

var characterFromKeyboardEvent = function(event) {
  if (event.which === null) {
    return String.fromCharCode(event.keyCode)
  } else if (event.which !== 0 && event.charCode !== 0) {
    return String.fromCharCode(event.charCode)
  }
}
