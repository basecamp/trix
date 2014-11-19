getToolbarButton = ({attribute, action}) ->
  document.getElementById("toolbar").querySelector(".button[data-attribute='#{attribute}'], .button[data-action='#{action}']")

@clickToolbarButton = (selector, callback) ->
  button = getToolbarButton(selector)
  triggerEvent(button, "mousedown")
  defer(callback)

@clickToolbarDialogButton = ({method}, callback) ->
  button = document.querySelector("#toolbar .dialog input[type=button][data-method='#{method}']")
  triggerEvent(button, "click")
  defer(callback)

@isToolbarButtonActive = (selector) ->
  button = getToolbarButton(selector)
  button.classList.contains("active")

@typeInToolbarDialog = (string, {attribute}, callback) ->
  dialog = document.getElementById("toolbar").querySelector(".dialog[data-attribute='#{attribute}']")
  input = dialog.querySelector("input[name='#{attribute}']")
  button = dialog.querySelector("input[data-method='setAttribute']")
  input.value = string
  triggerEvent(button, "click")
  defer(callback)

@expectAttributes = (range, attributes) ->
  locationRange = editor.document.locationRangeFromRange(range)
  document = editor.document.getDocumentAtLocationRange(locationRange)
  blocks = document.getBlocks()
  throw "range #{JSON.stringify(range)} spans more than one block" unless blocks.length is 1

  textIndex = locationRange.index
  textRange = [locationRange.start.offset, locationRange.end.offset]
  text = editor.document.getTextAtIndex(textIndex).getTextAtRange(textRange)
  pieces = text.getPieces()
  throw "range #{JSON.stringify(range)} must only span one piece" unless pieces.length is 1

  piece = pieces[0]
  deepEqual piece.getAttributes(), attributes

@expectBlockAttributes = (range, attributes) ->
  locationRange = editor.document.locationRangeFromRange(range)
  document = editor.document.getDocumentAtLocationRange(locationRange)
  blocks = document.getBlocks()
  throw "range #{JSON.stringify(range)} spans more than one block" unless blocks.length is 1

  block = blocks[0]
  deepEqual block.getAttributes(), attributes

@expectHTML = (trixDocument, html) ->
  element = document.createElement("div")
  view = new Trix.DocumentView trixDocument, {element}
  view.render()
  equal element.innerHTML, html
