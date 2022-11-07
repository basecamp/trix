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

%t:empty:not(:focus)::before {
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

export default class TrixEditorElement extends HTMLElement {

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
    const labels = []
    if (this.id && this.ownerDocument) {
      labels.push(...Array.from(this.ownerDocument.querySelectorAll(`label[for='${this.id}']`) || []))
    }

    const label = findClosestElementFromNode(this, { matchingSelector: "label" })
    if (label) {
      if ([ this, null ].includes(label.control)) {
        labels.push(label)
      }
    }

    return labels
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
    return this.inputElement?.form
  }

  get inputElement() {
    if (this.hasAttribute("input")) {
      return this.ownerDocument?.getElementById(this.getAttribute("input"))
    } else if (this.parentNode) {
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
    return this.inputElement?.name
  }

  get value() {
    return this.inputElement?.value
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

  setInputElementValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value
    }
  }

  // Element lifecycle

  connectedCallback() {
    if (!this.hasAttribute("data-trix-internal")) {
      makeEditable(this)
      addAccessibilityRole(this)
      ensureAriaLabel(this)

      if (!this.editorController) {
        triggerEvent("trix-before-initialize", { onElement: this })
        this.editorController = new EditorController({
          editorElement: this,
          html: this.defaultValue = this.value,
        })
        requestAnimationFrame(() => triggerEvent("trix-initialize", { onElement: this }))
      }
      this.editorController.registerSelectionManager()
      this.registerResetListener()
      this.registerClickListener()
      autofocus(this)
    }
  }

  disconnectedCallback() {
    this.editorController?.unregisterSelectionManager()
    this.unregisterResetListener()
    return this.unregisterClickListener()
  }

  // Form support

  registerResetListener() {
    this.resetListener = this.resetBubbled.bind(this)
    return window.addEventListener("reset", this.resetListener, false)
  }

  unregisterResetListener() {
    return window.removeEventListener("reset", this.resetListener, false)
  }

  registerClickListener() {
    this.clickListener = this.clickBubbled.bind(this)
    return window.addEventListener("click", this.clickListener, false)
  }

  unregisterClickListener() {
    return window.removeEventListener("click", this.clickListener, false)
  }

  resetBubbled(event) {
    if (event.defaultPrevented) return
    if (event.target !== this.form) return
    return this.reset()
  }

  clickBubbled(event) {
    if (event.defaultPrevented) return
    if (this.contains(event.target)) return

    const label = findClosestElementFromNode(event.target, { matchingSelector: "label" })
    if (!label) return

    if (!Array.from(this.labels).includes(label)) return

    return this.focus()
  }

  reset() {
    this.value = this.defaultValue
  }
}
