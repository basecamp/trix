# This file is not included in the main Trix bundle and
# should be explicitly required to enable the debugger.

DEBUG_METHODS =
  "Trix.AttachmentEditorController": "
    didClickRemoveButton
    uninstall
  "

  "Trix.CompositionController": "
    didClickAttachment
  "

  "Trix.EditorController": "
    setEditor
    loadDocument
  "

  "Trix.Level0InputController": "
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

  "Trix.Level2InputController": "
    elementDidMutate
    events.beforeinput
    events.input
    events.compositionend
  "

  "Trix.ToolbarController": "
    didClickActionButton
    didClickAttributeButton
    didClickDialogButton
    didKeyDownDialogInput
  "

{findClosestElementFromNode} = Trix

errorListeners = []

Trix.Debugger =
  addErrorListener: (listener) ->
    unless listener in errorListeners
      errorListeners.push(listener)

  removeErrorListener: (listener) ->
    errorListeners = (l for l in errorListeners when l isnt listener)

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

wrapFunctionWithErrorHandler = (fn) ->
  trixDebugWrapper = ->
    try
      fn.apply(this, arguments)
    catch error
      reportError(error)
      throw error
  trixDebugWrapper

reportError = (error) ->
  Trix.Debugger.lastError = error

  console.error "Trix error!"
  console.log error.stack

  activeElement = document.activeElement
  editorElement = findClosestElementFromNode(activeElement, matchingSelector: "trix-editor")

  if editorElement
    notifyErrorListeners(error, editorElement)
  else
    console.warn "Can't find <trix-editor> element. document.activeElement =", activeElement

notifyErrorListeners = (error, element) ->
  for listener in errorListeners
    try listener(error, element)

do ->
  console.groupCollapsed("Trix debugger")

  for className, methodNames of DEBUG_METHODS
    for methodName in methodNames.split(/\s/)
      try
        installMethodDebugger(className, methodName)
        console.log "✓ #{className}##{methodName}"
      catch error
        console.warn "✗ #{className}##{methodName}:", error.message

  console.groupEnd()
