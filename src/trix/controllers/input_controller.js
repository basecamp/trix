// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import BasicObject from "trix/core/basic_object"
import MutationObserver from "trix/observers/mutation_observer"
import FileVerificationOperation from "trix/operations/file_verification_operation"

import { handleEvent, innerElementIsActive } from "trix/core/helpers"

export default class InputController extends BasicObject {
  static initClass() {
    this.prototype.events = {}
  }

  constructor(element) {
    super(...arguments)
    this.element = element
    this.mutationObserver = new MutationObserver(this.element)
    this.mutationObserver.delegate = this
    for (const eventName in this.events) {
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
      return this.handleInput(function() {
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
        return this.handleInput(function() {
          if (!innerElementIsActive(this.element)) {
            this.eventName = eventName
            return this.events[eventName].call(this, event)
          }
        })
      }
    }
  }

  handleInput(callback) {
    try {
      this.delegate?.inputControllerWillHandleInput()
      return callback.call(this)
    } finally {
      this.delegate?.inputControllerDidHandleInput()
    }
  }

  createLinkHTML(href, text) {
    const link = document.createElement("a")
    link.href = href
    link.textContent = text != null ? text : href
    return link.outerHTML
  }
}

InputController.initClass()

