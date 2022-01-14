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
    this.element.classList.add(this.constructor.template)

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
    for (const eventName in this.events) {
      const handler = this.events[eventName]
      const callback = (event) => {
        requestAnimationFrame(() => {
          handler.call(this, event)
        })
      }

      handleEvent(eventName, { onElement: this.editorElement, withCallback: callback })
    }
  }

  didToggle(event) {
    this.saveSetting("open", this.isOpen())
    return this.render()
  }

  isOpen() {
    return this.element.hasAttribute("open")
  }

  getTitle() {
    return this.title || ""
  }

  render() {
    this.renderTitle()
    if (this.isOpen()) {
      this.panelElement.innerHTML = window.JST[`trix/inspector/templates/${this.constructor.template}`].apply(this)
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
    if (window.sessionStorage) {
      window.sessionStorage[key] = value
    }
  }

  getSettingsKey(key) {
    return `trix/inspector/${this.template}/${key}`
  }

  get title() {
    return this.constructor.title
  }

  get template() {
    return this.constructor.template
  }

  get events() {
    return this.constructor.events
  }
}
