helpers = Trix.TestHelpers

helpers.extend
  clickToolbarButton: (selector, callback) ->
    Trix.selectionChangeObserver.update()
    button = getToolbarButton(selector)
    helpers.triggerEvent(button, "mousedown")
    helpers.defer(callback)

  typeToolbarKeyCommand: (selector, callback) ->
    button = getToolbarButton(selector)
    if {trixKey} = button.dataset
      keyCode = trixKey.toUpperCase().charCodeAt(0)
      helpers.triggerEvent(getEditorElement(), "keydown", {keyCode, charCode: 0, metaKey: true, ctrlKey: true})
    helpers.defer(callback)

  clickToolbarDialogButton: ({method}, callback) ->
    button = getToolbarElement().querySelector("[data-trix-dialog] [data-trix-method='#{method}']")
    helpers.triggerEvent(button, "click")
    helpers.defer(callback)

  isToolbarButtonActive: (selector) ->
    button = getToolbarButton(selector)
    button.hasAttribute("data-trix-active") and button.classList.contains("trix-active")

  isToolbarButtonDisabled: (selector) ->
    getToolbarButton(selector).disabled

  typeInToolbarDialog: (string, {attribute}, callback) ->
    dialog = getToolbarDialog({attribute})
    input = dialog.querySelector("[data-trix-input][name='#{attribute}']")
    button = dialog.querySelector("[data-trix-method='setAttribute']")
    input.value = string
    helpers.triggerEvent(button, "click")
    helpers.defer(callback)

  isToolbarDialogActive: (selector) ->
    dialog = getToolbarDialog(selector)
    dialog.hasAttribute("data-trix-active") and dialog.classList.contains("trix-active")

getToolbarButton = ({attribute, action}) ->
  getToolbarElement().querySelector("[data-trix-attribute='#{attribute}'], [data-trix-action='#{action}']")

getToolbarDialog = ({attribute, action}) ->
  getToolbarElement().querySelector("[data-trix-dialog='#{attribute}']")
