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
    button = getToolbarElement().querySelector(".dialog input[type=button][data-trix-method='#{method}']")
    helpers.triggerEvent(button, "click")
    helpers.defer(callback)

  isToolbarButtonActive: (selector) ->
    button = getToolbarButton(selector)
    button.classList.contains("active")

  isToolbarButtonDisabled: (selector) ->
    getToolbarButton(selector).disabled

  typeInToolbarDialog: (string, {attribute}, callback) ->
    dialog = getToolbarDialog({attribute})
    input = dialog.querySelector("input[name='#{attribute}']")
    button = dialog.querySelector("input[data-trix-method='setAttribute']")
    input.value = string
    helpers.triggerEvent(button, "click")
    helpers.defer(callback)

  isToolbarDialogActive: (selector) ->
    dialog = getToolbarDialog(selector)
    dialog.classList.contains("active")

getToolbarButton = ({attribute, action}) ->
  getToolbarElement().querySelector("button[data-trix-attribute='#{attribute}'], button[data-trix-action='#{action}']")

getToolbarDialog = ({attribute, action}) ->
  getToolbarElement().querySelector(".dialog[data-trix-attribute='#{attribute}'], .dialog[data-trix-action='#{action}']")
