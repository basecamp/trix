import { triggerEvent } from "./event_helpers"
import { selectionChangeObserver } from "trix/observers/selection_change_observer"
import { delay, nextFrame } from "./timing_helpers"

export const clickToolbarButton = async (selector) => {
  selectionChangeObserver.update()
  const button = getToolbarButton(selector)
  triggerEvent(button, "mousedown")
  await delay(5)
}

export const typeToolbarKeyCommand = async (selector) => {
  const button = getToolbarButton(selector)
  const { trixKey } = button.dataset
  if (trixKey) {
    const keyCode = trixKey.toUpperCase().charCodeAt(0)
    triggerEvent(getEditorElement(), "keydown", { keyCode, charCode: 0, metaKey: true, ctrlKey: true })
  }
  await nextFrame()
}

export const clickToolbarDialogButton = async ({ method }) => {
  const button = getToolbarElement().querySelector(`[data-trix-dialog] [data-trix-method='${method}']`)
  triggerEvent(button, "click")
  await nextFrame()
}

export const isToolbarButtonActive = function (selector) {
  const button = getToolbarButton(selector)
  return button.hasAttribute("data-trix-active") && button.classList.contains("trix-active")
}

export const isToolbarButtonDisabled = (selector) => getToolbarButton(selector).disabled

export const typeInToolbarDialog = async (string, { attribute }) => {
  const dialog = getToolbarDialog({ attribute })
  const input = dialog.querySelector(`[data-trix-input][name='${attribute}']`)
  const button = dialog.querySelector("[data-trix-method='setAttribute']")
  input.value = string
  triggerEvent(button, "click")
  await nextFrame()
}

export const isToolbarDialogActive = function (selector) {
  const dialog = getToolbarDialog(selector)
  return dialog.hasAttribute("data-trix-active") && dialog.classList.contains("trix-active")
}

const getToolbarButton = ({ attribute, action }) =>
  getToolbarElement().querySelector(`[data-trix-attribute='${attribute}'], [data-trix-action='${action}']`)

const getToolbarDialog = ({ attribute, action }) => getToolbarElement().querySelector(`[data-trix-dialog='${attribute}']`)
