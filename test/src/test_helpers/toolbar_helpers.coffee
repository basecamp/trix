helpers = Trix.TestHelpers

helpers.extend
  clickToolbarButton: (selector, callback) ->
    Trix.selectionChangeObserver.update()
    button = getToolbarButton(selector)
    helpers.triggerEvent(button, "mousedown")
    helpers.defer(callback)

  typeToolbarKeyCommand: (selector, callback) ->
    button = getToolbarButton(selector)
    if {key} = button.dataset
      keyCode = key.toUpperCase().charCodeAt(0)
      helpers.triggerEvent(getEditorElement(), "keydown", {keyCode, charCode: 0, metaKey: true, ctrlKey: true})
    helpers.defer(callback)

  clickToolbarDialogButton: ({method}, callback) ->
    button = getToolbarElement().querySelector(".dialog input[type=button][data-method='#{method}']")
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
    button = dialog.querySelector("input[data-method='setAttribute']")
    input.value = string
    helpers.triggerEvent(button, "click")
    helpers.defer(callback)

  isToolbarDialogActive: (selector) ->
    dialog = getToolbarDialog(selector)
    dialog.classList.contains("active")

getToolbarButton = ({attribute, action}) ->
  getToolbarElement().querySelector("button[data-attribute='#{attribute}'], button[data-action='#{action}']")

getToolbarDialog = ({attribute, action}) ->
  getToolbarElement().querySelector(".dialog[data-attribute='#{attribute}'], .dialog[data-action='#{action}']")
