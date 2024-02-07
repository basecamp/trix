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

class ElementInternalsDelegate {
  value = ""
  #internals
  #formDisabled

  constructor(element) {
    this.element = element
    this.#internals = element.attachInternals()
    this.#formDisabled = false
  }

  connectedCallback() {
    this.#validate()
  }

  disconnectedCallback() {
  }

  get form() {
    return this.#internals.form
  }

  get name() {
    return this.element.getAttribute("name")
  }

  set name(value) {
    this.element.setAttribute("name", value)
  }

  get labels() {
    return this.#internals.labels
  }

  get disabled() {
    return this.#formDisabled || this.element.hasAttribute("disabled")
  }

  set disabled(value) {
    this.element.toggleAttribute("disabled", value)
  }

  get required() {
    return this.element.hasAttribute("required")
  }

  set required(value) {
    this.element.toggleAttribute("required", value)
    this.#validate()
  }

  get validity() {
    return this.#internals.validity
  }

  get validationMessage() {
    return this.#internals.validationMessage
  }

  get willValidate() {
    return this.#internals.willValidate
  }

  formDisabledCallback(disabled) {
    this.#formDisabled = disabled
  }

  setFormValue(value) {
    this.value = value
    this.#validate()
    this.#internals.setFormValue(this.element.disabled ? undefined : this.value)
  }

  checkValidity() {
    return this.#internals.checkValidity()
  }

  reportValidity() {
    return this.#internals.reportValidity()
  }

  setCustomValidity(validationMessage) {
    this.#validate(validationMessage)
  }

  #validate(customValidationMessage = "") {
    const { required, value } = this.element
    const valueMissing = required && !value
    const customError = !!customValidationMessage
    const input = makeElement("input", { required })
    const validationMessage = customValidationMessage || input.validationMessage

    this.#internals.setValidity({ valueMissing, customError }, validationMessage)
  }
}

class LegacyDelegate {
  #focusHandler

  constructor(element) {
    this.element = element
  }

  connectedCallback() {
    this.#focusHandler = ensureAriaLabel(this.element)
    window.addEventListener("reset", this.#resetBubbled, false)
    window.addEventListener("click", this.#clickBubbled, false)
  }

  disconnectedCallback() {
    this.#focusHandler?.destroy()
    window.removeEventListener("reset", this.#resetBubbled, false)
    window.removeEventListener("click", this.#clickBubbled, false)
  }

  get labels() {
    const labels = []
    if (this.element.id && this.element.ownerDocument) {
      labels.push(...Array.from(this.element.ownerDocument.querySelectorAll(`label[for='${this.element.id}']`) || []))
    }

    const label = findClosestElementFromNode(this.element, { matchingSelector: "label" })
    if (label) {
      if ([ this.element, null ].includes(label.control)) {
        labels.push(label)
      }
    }

    return labels
  }

  get form() {
    console.warn("This browser does not support the .form property for trix-editor elements.")

    return null
  }

  get name() {
    console.warn("This browser does not support the .name property for trix-editor elements.")

    return null
  }

  set name(value) {
    console.warn("This browser does not support the .name property for trix-editor elements.")
  }

  get disabled() {
    console.warn("This browser does not support the [disabled] attribute for trix-editor elements.")

    return false
  }

  set disabled(value) {
    console.warn("This browser does not support the [disabled] attribute for trix-editor elements.")
  }

  get required() {
    console.warn("This browser does not support the [required] attribute for trix-editor elements.")

    return false
  }

  set required(value) {
    console.warn("This browser does not support the [required] attribute for trix-editor elements.")
  }

  get validity() {
    console.warn("This browser does not support the validity property for trix-editor elements.")
    return null
  }

  get validationMessage() {
    console.warn("This browser does not support the validationMessage property for trix-editor elements.")

    return ""
  }

  get willValidate() {
    console.warn("This browser does not support the willValidate property for trix-editor elements.")

    return false
  }

  formDisabledCallback(value) {
  }

  setFormValue(value) {
  }

  checkValidity() {
    console.warn("This browser does not support checkValidity() for trix-editor elements.")

    return true
  }

  reportValidity() {
    console.warn("This browser does not support reportValidity() for trix-editor elements.")

    return true
  }

  setCustomValidity(validationMessage) {
    console.warn("This browser does not support setCustomValidity(validationMessage) for trix-editor elements.")
  }

  #resetBubbled = (event) => {
    if (event.defaultPrevented) return
    if (event.target !== this.element.form) return
    this.element.reset()
  }

  #clickBubbled = (event) => {
    if (event.defaultPrevented) return
    if (this.element.contains(event.target)) return

    const label = findClosestElementFromNode(event.target, { matchingSelector: "label" })
    if (!label) return

    if (!Array.from(this.labels).includes(label)) return

    this.element.focus()
  }
}

export default class TrixEditorElement extends HTMLElement {
  static formAssociated = "ElementInternals" in window

  static observedAttributes = [ "connected" ]

  #delegate

  constructor() {
    super()
    this.willCreateInput = true
    this.#delegate = this.constructor.formAssociated ?
      new ElementInternalsDelegate(this) :
      new LegacyDelegate(this)
  }

  // Properties

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

  get disabled() {
    const { inputElement } = this

    if (inputElement) {
      return inputElement.disabled
    } else {
      return this.#delegate.disabled
    }
  }

  set disabled(value) {
    const { inputElement } = this

    if (inputElement) {
      inputElement.disabled = value
    }
    this.#delegate.disabled = value
  }

  get required() {
    return this.#delegate.required
  }

  set required(value) {
    this.#delegate.required = value
  }

  get validity() {
    return this.#delegate.validity
  }

  get validationMessage() {
    return this.#delegate.validationMessage
  }

  get willValidate() {
    return this.#delegate.willValidate
  }

  get type() {
    return this.localName
  }

  get toolbarElement() {
    if (this.hasAttribute("toolbar")) {
      return this.ownerDocument?.getElementById(this.getAttribute("toolbar"))
    } else if (this.parentNode) {
      const toolbarId = `trix-toolbar-${this.trixId}`
      this.setAttribute("toolbar", toolbarId)
      this.internalToolbar = makeElement("trix-toolbar", { id: toolbarId })
      this.parentNode.insertBefore(this.internalToolbar, this)
      return this.internalToolbar
    } else {
      return undefined
    }
  }

  get form() {
    const { inputElement } = this

    if (inputElement) {
      return inputElement.form
    } else {
      return this.#delegate.form
    }
  }

  get inputElement() {
    if (this.hasAttribute("input")) {
      return this.ownerDocument?.getElementById(this.getAttribute("input"))
    } else if (this.parentNode && this.willCreateInput) {
      const inputId = `trix-input-${this.trixId}`
      this.setAttribute("input", inputId)
      const element = makeElement("input", { type: "hidden", id: inputId })
      this.parentNode.insertBefore(element, this.nextElementSibling)
      return element
    } else {
      return undefined
    }
  }

  get editor() {
    return this.editorController?.editor
  }

  get name() {
    const { inputElement } = this

    if (inputElement) {
      return inputElement.name
    } else {
      return this.#delegate.name
    }
  }

  set name(value) {
    const { inputElement } = this

    if (inputElement) {
      inputElement.name = value
    } else {
      this.#delegate.name = value
    }
  }

  get value() {
    const { inputElement } = this

    if (inputElement) {
      return inputElement.value
    } else {
      return this.#delegate.value
    }
  }

  set value(defaultValue) {
    this.defaultValue = defaultValue
    this.editor?.loadHTML(this.defaultValue)
  }

  // Element callbacks

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "connected" && this.isConnected && oldValue != null && oldValue !== newValue) {
      requestAnimationFrame(() => this.reconnect())
    }
  }

  // Controller delegate methods

  notify(message, data) {
    if (this.editorController) {
      return triggerEvent(`trix-${message}`, { onElement: this, attributes: data })
    }
  }

  setFormValue(value) {
    const { inputElement } = this

    if (inputElement) {
      inputElement.value = value
    }
    this.#delegate.setFormValue(value)
  }

  // Element lifecycle

  connectedCallback() {
    if (!this.hasAttribute("data-trix-internal")) {
      makeEditable(this)
      addAccessibilityRole(this)

      if (!this.editorController) {
        triggerEvent("trix-before-initialize", { onElement: this })
        this.editorController = new EditorController({
          editorElement: this,
          html: this.defaultValue = this.value,
        })
        requestAnimationFrame(() => triggerEvent("trix-initialize", { onElement: this }))
      }
      this.editorController.registerSelectionManager()
      this.#delegate.connectedCallback()

      this.toggleAttribute("connected", true)
      autofocus(this)
    }
  }

  disconnectedCallback() {
    this.editorController?.unregisterSelectionManager()
    this.#delegate.disconnectedCallback()
    this.toggleAttribute("connected", false)
  }

  reconnect() {
    this.removeInternalToolbar()
    this.disconnectedCallback()
    this.connectedCallback()
  }

  removeInternalToolbar() {
    this.internalToolbar?.remove()
    this.internalToolbar = null
  }

  // Form support

  checkValidity() {
    return this.#delegate.checkValidity()
  }

  reportValidity() {
    return this.#delegate.reportValidity()
  }

  setCustomValidity(validationMessage) {
    this.#delegate.setCustomValidity(validationMessage)
  }

  formDisabledCallback(disabled) {
    const { inputElement } = this

    if (inputElement) {
      inputElement.disabled = disabled
    }
    this.toggleAttribute("contenteditable", !disabled)
    this.#delegate.formDisabledCallback(disabled)
  }

  formResetCallback() {
    this.reset()
  }

  reset() {
    this.value = this.defaultValue
  }
}
