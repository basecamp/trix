import * as config from "trix/config"

import {
  findClosestElementFromNode,
  handleEvent,
  handleEventOnce,
  installDefaultCSSForTagName,
  makeElement,
  triggerEvent,
} from "trix/core/helpers"

import { attachmentSelector } from "trix/config/attachments"
import EditorController from "trix/controllers/editor_controller"
import "trix/elements/trix_toolbar_element"

let id = 0

// Contenteditable support helpers

const autofocus = function(element) {
  if (!document.querySelector(":focus")) {
    if (element.hasAttribute("autofocus") && document.querySelector("[autofocus]") === element) {
      return element.focus()
    }
  }
}

const makeEditable = function(element) {
  if (element.hasAttribute("contenteditable")) {
    return
  }
  element.setAttribute("contenteditable", "")
  return handleEventOnce("focus", {
    onElement: element,
    withCallback() {
      return configureContentEditable(element)
    },
  })
}

const configureContentEditable = function(element) {
  disableObjectResizing(element)
  return setDefaultParagraphSeparator(element)
}

const disableObjectResizing = function(element) {
  if (document.queryCommandSupported?.("enableObjectResizing")) {
    document.execCommand("enableObjectResizing", false, false)
    return handleEvent("mscontrolselect", { onElement: element, preventDefault: true })
  }
}

const setDefaultParagraphSeparator = function(element) {
  if (document.queryCommandSupported?.("DefaultParagraphSeparator")) {
    const { tagName } = config.blockAttributes.default
    if ([ "div", "p" ].includes(tagName)) {
      return document.execCommand("DefaultParagraphSeparator", false, tagName)
    }
  }
}

// Accessibility helpers

const addAccessibilityRole = function(element) {
  if (element.hasAttribute("role")) {
    return
  }
  return element.setAttribute("role", "textbox")
}

const ensureAriaLabel = function(element) {
  if (element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")) {
    return
  }

  const update = function() {
    const texts = Array.from(element.labels).map((label) => {
      if (!label.contains(element)) return label.textContent
    }).filter(text => text)

    const text = texts.join(" ")
    if (text) {
      return element.setAttribute("aria-label", text)
    } else {
      return element.removeAttribute("aria-label")
    }
  }
  update()
  return handleEvent("focus", { onElement: element, withCallback: update })
}

// Style

const cursorTargetStyles = (function() {
  if (config.browser.forcesObjectResizing) {
    return {
      display: "inline",
      width: "auto",
    }
  } else {
    return {
      display: "inline-block",
      width: "1px",
    }
  }
})()

installDefaultCSSForTagName("trix-editor", `\
%t {
    display: block;
}

%t:empty::before {
    content: attr(placeholder);
    color: graytext;
    cursor: text;
    pointer-events: none;
    white-space: pre-line;
}

%t a[contenteditable=false] {
    cursor: text;
}

%t img {
    max-width: 100%;
    height: auto;
}

%t ${attachmentSelector} figcaption textarea {
    resize: none;
}

%t ${attachmentSelector} figcaption textarea.trix-autoresize-clone {
    position: absolute;
    left: -9999px;
    max-height: 0px;
}

%t ${attachmentSelector} figcaption[data-trix-placeholder]:empty::before {
    content: attr(data-trix-placeholder);
    color: graytext;
}

%t [data-trix-cursor-target] {
    display: ${cursorTargetStyles.display} !important;
    width: ${cursorTargetStyles.width} !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
}

%t [data-trix-cursor-target=left] {
    vertical-align: top !important;
    margin-left: -1px !important;
}

%t [data-trix-cursor-target=right] {
    vertical-align: bottom !important;
    margin-right: -1px !important;
}`)

class InputElementDelegate {
  #element

  constructor(element) {
    this.#element = element
  }

  // Properties

  get labels() {
    const labels = []
    if (this.#element.id && this.#element.ownerDocument) {
      labels.push(...Array.from(this.#element.ownerDocument.querySelectorAll(`label[for='${this.#element.id}']`) || []))
    }

    const label = findClosestElementFromNode(this.#element, { matchingSelector: "label" })
    if (label) {
      if ([ this.#element, null ].includes(label.control)) {
        labels.push(label)
      }
    }

    return labels
  }

  get form() {
    return this.inputElement?.form
  }

  get inputElement() {
    if (this.#element.hasAttribute("input")) {
      return this.#element.ownerDocument?.getElementById(this.#element.getAttribute("input"))
    } else if (this.#element.parentNode) {
      const inputId = `trix-input-${this.#element.trixId}`
      this.#element.setAttribute("input", inputId)
      const element = makeElement("input", { type: "hidden", id: inputId })
      this.#element.parentNode.insertBefore(element, this.#element.nextElementSibling)
      return element
    } else {
      return undefined
    }
  }

  get name() {
    return this.inputElement?.name
  }

  get value() {
    return this.inputElement?.value
  }

  get defaultValue() {
    return this.value
  }

  // Element lifecycle

  connectedCallback() {
    ensureAriaLabel(this.#element)
    window.addEventListener("reset", this.#resetBubbled, false)
    window.addEventListener("click", this.#clickBubbled, false)
  }

  disconnectedCallback() {
    window.removeEventListener("reset", this.#resetBubbled, false)
    window.removeEventListener("click", this.#clickBubbled, false)
  }

  setFormValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value
    }
  }

  // Form support

  #resetBubbled = (event) => {
    if (event.defaultPrevented) return
    if (event.target !== this.form) return
    return this.#element.formResetCallback()
  }

  #clickBubbled = (event) => {
    if (event.defaultPrevented) return
    if (this.#element.contains(event.target)) return

    const label = findClosestElementFromNode(event.target, { matchingSelector: "label" })
    if (!label) return

    if (!Array.from(this.labels).includes(label)) return

    return this.#element.focus()
  }
}

export default class TrixEditorElement extends HTMLElement {
  static formAssociated = false

  #delegate

  constructor() {
    super()
    this.#delegate = new InputElementDelegate(this)
  }

  // Properties

  get type() {
    return this.localName
  }

  get trixId() {
    if (this.hasAttribute("trix-id")) {
      return this.getAttribute("trix-id")
    } else {
      this.setAttribute("trix-id", ++id)
      return this.trixId
    }
  }

  get labels() {
    return this.#delegate.labels
  }

  get toolbarElement() {
    if (this.hasAttribute("toolbar")) {
      return this.ownerDocument?.getElementById(this.getAttribute("toolbar"))
    } else if (this.parentNode) {
      const toolbarId = `trix-toolbar-${this.trixId}`
      this.setAttribute("toolbar", toolbarId)
      const element = makeElement("trix-toolbar", { id: toolbarId })
      this.parentNode.insertBefore(element, this)
      return element
    } else {
      return undefined
    }
  }

  get form() {
    return this.#delegate.form
  }

  get inputElement() {
    return this.#delegate.inputElement
  }

  get editor() {
    return this.editorController?.editor
  }

  get name() {
    return this.#delegate.name
  }

  get value() {
    return this.#delegate.value
  }

  set value(defaultValue) {
    this.defaultValue = defaultValue
    this.editor?.loadHTML(this.defaultValue)
  }

  // Controller delegate methods

  notify(message, data) {
    if (this.editorController) {
      return triggerEvent(`trix-${message}`, { onElement: this, attributes: data })
    }
  }

  setFormValue(value) {
    this.#delegate.setFormValue(value)
  }

  // Element lifecycle

  connectedCallback() {
    if (!this.hasAttribute("data-trix-internal")) {
      makeEditable(this)
      addAccessibilityRole(this)
      this.#delegate.connectedCallback()

      if (!this.editorController) {
        triggerEvent("trix-before-initialize", { onElement: this })
        this.editorController = new EditorController({
          editorElement: this,
          html: this.defaultValue = this.#delegate.defaultValue,
        })
        requestAnimationFrame(() => triggerEvent("trix-initialize", { onElement: this }))
      }
      this.editorController.registerSelectionManager()
      autofocus(this)
    }
  }

  disconnectedCallback() {
    this.editorController?.unregisterSelectionManager()
    this.#delegate.disconnectedCallback()
  }

  // Form support

  formAssociatedCallback(form) {
  }

  formDisabledCallback(disabled) {
  }

  formStateRestoreCallback(state, mode) {
  }

  formResetCallback() {
    this.reset()
  }

  reset() {
    this.value = this.defaultValue
  }
}
