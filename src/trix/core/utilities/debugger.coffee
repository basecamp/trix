# This file is not included in the main Trix bundle and
# should be explicitly required to enable the debugger.

DEBUG_METHODS =
  "Trix.AttachmentEditorController": "
    didClickRemoveButton
    uninstall
  "

  "Trix.DocumentController": "
    didClickAttachment
  "

  "Trix.EditorController": "
    setEditor
    loadDocument
  "

  "Trix.ImageAttachmentEditorController": "
    startResize
    resize
    endResize
  "

  "Trix.InputController": "
    elementDidMutate
    events.keydown
    events.keypress
    events.dragstart
    events.dragover
    events.dragend
    events.drop
    events.cut
    events.paste
    events.compositionstart
    events.compositionend
  "

  "Trix.ToolbarController": "
    didClickActionButton
    didClickAttributeButton
    didClickDialogButton
    didKeyDownDialogInput
  "

TrixToolbarElement::constructor.defaultHTML += """
  <span class="button_group">
    <button type="button" data-action="debug">?</button>
  </span>

  <div class="dialog" data-attribute="debug">
    <div>Copy and paste:</div>
    <textarea readonly></textarea>
  </div>
"""

TrixToolbarElement::constructor.defaultCSS += """
  %t button[data-action=debug].error {
    font-weight: bold;
    border: 1px solid red;
  }

  %t .dialog[data-attribute=debug] {
    position: absolute;
    width: 500px;
    padding: 10px;
    margin: 5px 0 0 5px;
    border-radius: 2px;
    background-color: white;
    border: 1px solid black;
    font-family: monospace;
    font-size: 12px;
  }

  %t .dialog[data-attribute=debug] textarea {
    box-sizing: border-box;
    width: 100%;
    margin: 10px 0 0 0;
    height: 200px;
    border: none;
  }
"""


{tagName, findClosestElementFromNode, handleEvent} = Trix

buttonSelector = "button[data-action=debug]"

handleEvent "click", onElement: document, matchingSelector: buttonSelector, withCallback: (event) ->
  setDebugInfo(element: event.target, focus: true)
  event.preventDefault()

setDebugInfo = ({element, error, focus}) ->
  editorElement = findClosestElementFromNode(element, matchingSelector: "trix-editor")
  {editorController} = editorElement
  toolbarElement = editorElement.querySelector("trix-toolbar")
  buttonElement = toolbarElement.querySelector(buttonSelector)
  textareaElement = toolbarElement.querySelector(".dialog[data-attribute=debug] textarea")
  documentElement = editorElement.querySelector("trix-document")

  info = ""

  if error?
    buttonElement.classList.add("error")
    buttonElement.textContent = "!!"
    info += "Error: #{error.message}\n  #{error.stack}"

  info += """
    URL:
      #{window.location}
    Location range:
      #{editorController.getLocationRange()?.inspect()}
    Last input:
      #{JSON.stringify(editorController.inputController.inputSummary)}
    Document:
      #{JSON.stringify(editorController.document)}
    HTML:
      #{documentElement.innerHTML}
  """

  shouldUpdateTextarea = error? or not buttonElement.classList.contains("error")

  textareaElement.value = info if shouldUpdateTextarea
  textareaElement.select() if focus?

reportError = (error) ->
  console.error "Trix error!", error
  console.log error.stack

  element = document.activeElement
  if tagName(element) is "trix-document"
    setDebugInfo({element, error})
  else
    console.warn "Can't find <trix-document> element. document.activeElement =", element

wrapFunctionWithErrorHandler = (fn) ->
  trixDebugWrapper = ->
    try
      fn.apply(this, arguments)
    catch error
      reportError(error)
  trixDebugWrapper

installMethodDebugger = (className, methodName) ->
  [objectName, constructorNames...] = className.split(".")
  [propertyNames..., methodName] = methodName.split(".")

  object = @[objectName]
  object = object[constructorName] for constructorName in constructorNames
  object = object.prototype
  object = object[propertyName] for propertyName in propertyNames

  if typeof object?[methodName] is "function"
    object[methodName] = wrapFunctionWithErrorHandler(object[methodName])
  else
    throw new Error "Can't install on non-function"

install = ->
  console.groupCollapsed("Trix debugger")

  for className, methodNames of DEBUG_METHODS
    for methodName in methodNames.split(/\s/)
      try
        installMethodDebugger(className, methodName)
        console.log "✓ #{className}##{methodName}"
      catch error
        console.warn "✗ #{className}##{methodName}:", error.message

  console.groupEnd()

install()
