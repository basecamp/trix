import { defer } from "trix/core/helpers"
import { createEvent, triggerEvent } from "./event_helpers"
import { selectionChangeObserver } from "trix/observers/selection_change_observer"

export clickToolbarButton = (selector, callback) ->
  selectionChangeObserver.update()
  button = getToolbarButton(selector)
  triggerEvent(button, "mousedown")
  defer(callback)

export typeToolbarKeyCommand = (selector, callback) ->
  button = getToolbarButton(selector)
  if {trixKey} = button.dataset
    keyCode = trixKey.toUpperCase().charCodeAt(0)
    triggerEvent(getEditorElement(), "keydown", {keyCode, charCode: 0, metaKey: true, ctrlKey: true})
  defer(callback)

export clickToolbarDialogButton = ({method}, callback) ->
  button = getToolbarElement().querySelector("[data-trix-dialog] [data-trix-method='#{method}']")
  triggerEvent(button, "click")
  defer(callback)

export isToolbarButtonActive = (selector) ->
  button = getToolbarButton(selector)
  button.hasAttribute("data-trix-active") and button.classList.contains("trix-active")

export isToolbarButtonDisabled = (selector) ->
  getToolbarButton(selector).disabled

export typeInToolbarDialog = (string, {attribute}, callback) ->
  dialog = getToolbarDialog({attribute})
  input = dialog.querySelector("[data-trix-input][name='#{attribute}']")
  button = dialog.querySelector("[data-trix-method='setAttribute']")
  input.value = string
  triggerEvent(button, "click")
  defer(callback)

export isToolbarDialogActive = (selector) ->
  dialog = getToolbarDialog(selector)
  dialog.hasAttribute("data-trix-active") and dialog.classList.contains("trix-active")

getToolbarButton = ({attribute, action}) ->
  getToolbarElement().querySelector("[data-trix-attribute='#{attribute}'], [data-trix-action='#{action}']")

getToolbarDialog = ({attribute, action}) ->
  getToolbarElement().querySelector("[data-trix-dialog='#{attribute}']")
