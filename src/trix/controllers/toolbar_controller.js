import BasicObject from "trix/core/basic_object"

import { findClosestElementFromNode, handleEvent, triggerEvent } from "trix/core/helpers"

const attributeButtonSelector = "[data-trix-attribute]"
const actionButtonSelector = "[data-trix-action]"
const toolbarButtonSelector = `${attributeButtonSelector}, ${actionButtonSelector}`
const dialogSelector = "[data-trix-dialog]"
const activeDialogSelector = `${dialogSelector}[data-trix-active]`
const dialogButtonSelector = `${dialogSelector} [data-trix-method]`
const dialogInputSelector = `${dialogSelector} [data-trix-input]`
const getInputForDialog = (element, attributeName) => {
  if (!attributeName) { attributeName = getAttributeName(element) }
  return element.querySelector(`[data-trix-input][name='${attributeName}']`)
}
const getActionName = (element) => element.getAttribute("data-trix-action")
const getAttributeName = (element) => {
  return element.getAttribute("data-trix-attribute") || element.getAttribute("data-trix-dialog-attribute")
}
const getDialogName = (element) => element.getAttribute("data-trix-dialog")

export default class ToolbarController extends BasicObject {
  constructor(element) {
    super(element)
    this.didClickActionButton = this.didClickActionButton.bind(this)
    this.didClickAttributeButton = this.didClickAttributeButton.bind(this)
    this.didClickDialogButton = this.didClickDialogButton.bind(this)
    this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this)
    this.element = element
    this.attributes = {}
    this.actions = {}
    this.resetDialogInputs()

    handleEvent("mousedown", {
      onElement: this.element,
      matchingSelector: actionButtonSelector,
      withCallback: this.didClickActionButton,
    })
    handleEvent("mousedown", {
      onElement: this.element,
      matchingSelector: attributeButtonSelector,
      withCallback: this.didClickAttributeButton,
    })
    handleEvent("click", { onElement: this.element, matchingSelector: toolbarButtonSelector, preventDefault: true })
    handleEvent("click", {
      onElement: this.element,
      matchingSelector: dialogButtonSelector,
      withCallback: this.didClickDialogButton,
    })
    handleEvent("keydown", {
      onElement: this.element,
      matchingSelector: dialogInputSelector,
      withCallback: this.didKeyDownDialogInput,
    })
  }

  // Event handlers

  didClickActionButton(event, element) {
    this.delegate?.toolbarDidClickButton()
    event.preventDefault()
    const actionName = getActionName(element)

    if (this.getDialog(actionName)) {
      return this.toggleDialog(actionName)
    } else {
      return this.delegate?.toolbarDidInvokeAction(actionName)
    }
  }

  didClickAttributeButton(event, element) {
    this.delegate?.toolbarDidClickButton()
    event.preventDefault()
    const attributeName = getAttributeName(element)

    if (this.getDialog(attributeName)) {
      this.toggleDialog(attributeName)
    } else {
      this.delegate?.toolbarDidToggleAttribute(attributeName)
    }

    return this.refreshAttributeButtons()
  }

  didClickDialogButton(event, element) {
    const dialogElement = findClosestElementFromNode(element, { matchingSelector: dialogSelector })
    const method = element.getAttribute("data-trix-method")
    return this[method].call(this, dialogElement)
  }

  didKeyDownDialogInput(event, element) {
    if (event.keyCode === 13) {
      // Enter key
      event.preventDefault()
      const attribute = element.getAttribute("name")
      const dialog = this.getDialog(attribute)
      this.setAttribute(dialog)
    }
    if (event.keyCode === 27) {
      // Escape key
      event.preventDefault()
      return this.hideDialog()
    }
  }

  // Action buttons

  updateActions(actions) {
    this.actions = actions
    return this.refreshActionButtons()
  }

  refreshActionButtons() {
    return this.eachActionButton((element, actionName) => {
      element.disabled = this.actions[actionName] === false
    })
  }

  eachActionButton(callback) {
    return Array.from(this.element.querySelectorAll(actionButtonSelector)).map((element) =>
      callback(element, getActionName(element))
    )
  }

  // Attribute buttons

  updateAttributes(attributes) {
    this.attributes = attributes
    return this.refreshAttributeButtons()
  }

  refreshAttributeButtons() {
    return this.eachAttributeButton((element, attributeName) => {
      element.disabled = this.attributes[attributeName] === false
      if (this.attributes[attributeName] || this.dialogIsVisible(attributeName)) {
        element.setAttribute("data-trix-active", "")
        return element.classList.add("trix-active")
      } else {
        element.removeAttribute("data-trix-active")
        return element.classList.remove("trix-active")
      }
    })
  }

  eachAttributeButton(callback) {
    return Array.from(this.element.querySelectorAll(attributeButtonSelector)).map((element) =>
      callback(element, getAttributeName(element))
    )
  }

  applyKeyboardCommand(keys) {
    const keyString = JSON.stringify(keys.sort())
    for (const button of Array.from(this.element.querySelectorAll("[data-trix-key]"))) {
      const buttonKeys = button.getAttribute("data-trix-key").split("+")
      const buttonKeyString = JSON.stringify(buttonKeys.sort())
      if (buttonKeyString === keyString) {
        triggerEvent("mousedown", { onElement: button })
        return true
      }
    }
    return false
  }

  // Dialogs

  dialogIsVisible(dialogName) {
    const element = this.getDialog(dialogName)
    if (element) {
      return element.hasAttribute("data-trix-active")
    }
  }

  toggleDialog(dialogName) {
    if (this.dialogIsVisible(dialogName)) {
      return this.hideDialog()
    } else {
      return this.showDialog(dialogName)
    }
  }

  showDialog(dialogName) {
    this.hideDialog()
    this.delegate?.toolbarWillShowDialog()

    const element = this.getDialog(dialogName)
    element.setAttribute("data-trix-active", "")
    element.classList.add("trix-active")

    Array.from(element.querySelectorAll("input[disabled]")).forEach((disabledInput) => {
      disabledInput.removeAttribute("disabled")
    })

    const attributeName = getAttributeName(element)
    if (attributeName) {
      const input = getInputForDialog(element, dialogName)
      if (input) {
        input.value = this.attributes[attributeName] || ""
        input.select()
      }
    }

    return this.delegate?.toolbarDidShowDialog(dialogName)
  }

  setAttribute(dialogElement) {
    const attributeName = getAttributeName(dialogElement)
    const input = getInputForDialog(dialogElement, attributeName)
    if (input.willValidate && !input.checkValidity()) {
      input.setAttribute("data-trix-validate", "")
      input.classList.add("trix-validate")
      return input.focus()
    } else {
      this.delegate?.toolbarDidUpdateAttribute(attributeName, input.value)
      return this.hideDialog()
    }
  }

  removeAttribute(dialogElement) {
    const attributeName = getAttributeName(dialogElement)
    this.delegate?.toolbarDidRemoveAttribute(attributeName)
    return this.hideDialog()
  }

  hideDialog() {
    const element = this.element.querySelector(activeDialogSelector)
    if (element) {
      element.removeAttribute("data-trix-active")
      element.classList.remove("trix-active")
      this.resetDialogInputs()
      return this.delegate?.toolbarDidHideDialog(getDialogName(element))
    }
  }

  resetDialogInputs() {
    Array.from(this.element.querySelectorAll(dialogInputSelector)).forEach((input) => {
      input.setAttribute("disabled", "disabled")
      input.removeAttribute("data-trix-validate")
      input.classList.remove("trix-validate")
    })
  }

  getDialog(dialogName) {
    return this.element.querySelector(`[data-trix-dialog=${dialogName}]`)
  }
}
