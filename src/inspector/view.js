/* eslint-disable
    no-undef,
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
import { handleEvent } from "trix/core/helpers"

export default class View {
  constructor(editorElement) {
    this.editorElement = editorElement
    this.editorController = this.editorElement.editorController
    this.editor = this.editorElement.editor
    this.compositionController = this.editorController.compositionController
    this.composition = this.editorController.composition

    this.element = document.createElement("details")
    if (this.getSetting("open") === "true") {
      this.element.open = true
    }
    this.element.classList.add(this.template)

    this.titleElement = document.createElement("summary")
    this.element.appendChild(this.titleElement)

    this.panelElement = document.createElement("div")
    this.panelElement.classList.add("panel")
    this.element.appendChild(this.panelElement)

    this.element.addEventListener("toggle", (event) => {
      if (event.target === this.element) {
        return this.didToggle()
      }
    })

    if (this.events) {
      this.installEventHandlers()
    }
  }

  installEventHandlers() {
    return (() => {
      const result = []
      for (const eventName in this.events) {
        const handler = this.events[eventName]
        result.push(
          ((eventName, handler) => {
            return handleEvent(eventName, {
              onElement: this.editorElement,
              withCallback: (event) => {
                return requestAnimationFrame(() => {
                  return handler.call(this, event)
                })
              },
            })
          })(eventName, handler)
        )
      }
      return result
    })()
  }

  didToggle(event) {
    this.saveSetting("open", this.isOpen())
    return this.render()
  }

  isOpen() {
    return this.element.hasAttribute("open")
  }

  getTitle() {
    return this.title != null ? this.title : ""
  }

  render() {
    this.renderTitle()
    if (this.isOpen()) {
      this.panelElement.innerHTML = JST[`trix/inspector/templates/${this.template}`].apply(this)
    }
  }

  renderTitle() {
    this.titleElement.innerHTML = this.getTitle()
  }

  getSetting(key) {
    key = this.getSettingsKey(key)
    return window.sessionStorage?.[key]
  }

  saveSetting(key, value) {
    key = this.getSettingsKey(key)
    if (window.sessionStorage != null) {
      window.sessionStorage[key] = value
    }
  }

  getSettingsKey(key) {
    return `trix/inspector/${this.template}/${key}`
  }
}
