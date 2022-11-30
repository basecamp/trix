import BasicObject from "trix/core/basic_object"
import MutationObserver from "trix/observers/mutation_observer"
import FileVerificationOperation from "trix/operations/file_verification_operation"
import FlakyAndroidKeyboardDetector from "../models/flaky_android_keyboard_detector"

import { handleEvent, innerElementIsActive } from "trix/core/helpers"

export default class InputController extends BasicObject {

  static events = {}

  constructor(element) {
    super(...arguments)
    this.element = element
    this.mutationObserver = new MutationObserver(this.element)
    this.mutationObserver.delegate = this
    this.flakyKeyboardDetector = new FlakyAndroidKeyboardDetector(this.element)
    for (const eventName in this.constructor.events) {
      handleEvent(eventName, { onElement: this.element, withCallback: this.handlerFor(eventName) })
    }
  }

  elementDidMutate(mutationSummary) {}

  editorWillSyncDocumentView() {
    return this.mutationObserver.stop()
  }

  editorDidSyncDocumentView() {
    return this.mutationObserver.start()
  }

  requestRender() {
    return this.delegate?.inputControllerDidRequestRender?.()
  }

  requestReparse() {
    this.delegate?.inputControllerDidRequestReparse?.()
    return this.requestRender()
  }

  attachFiles(files) {
    const operations = Array.from(files).map((file) => new FileVerificationOperation(file))
    return Promise.all(operations).then((files) => {
      this.handleInput(function() {
        this.delegate?.inputControllerWillAttachFiles()
        this.responder?.insertFiles(files)
        return this.requestRender()
      })
    })
  }

  // Private

  handlerFor(eventName) {
    return (event) => {
      if (!event.defaultPrevented) {
        this.handleInput(() => {
          if (!innerElementIsActive(this.element)) {
            if (this.flakyKeyboardDetector.shouldIgnore(event)) return

            this.eventName = eventName
            this.constructor.events[eventName].call(this, event)
          }
        })
      }
    }
  }

  handleInput(callback) {
    try {
      this.delegate?.inputControllerWillHandleInput()
      callback.call(this)
    } finally {
      this.delegate?.inputControllerDidHandleInput()
    }
  }

  createLinkHTML(href, text) {
    const link = document.createElement("a")
    link.href = href
    link.textContent = text ? text : href
    return link.outerHTML
  }
}

