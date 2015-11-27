#= require rangy-core
#= require rangy-textrange

keyCodes = {}
for code, name of Trix.InputController.keyNames
  keyCodes[name] = code

@moveCursor = (options, callback) ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  times ?= 1

  do move = -> defer ->
    if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction])
      selection = rangy.getSelection()
      selection.move("character", if direction is "right" then 1 else -1)
      Trix.selectionChangeObserver.update()

    if --times is 0
      defer -> callback(getCursorCoordinates())
    else
      move()

@expandSelection = (options, callback) -> defer ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  times ?= 1

  do expand = -> defer ->
    if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction], shiftKey: true)
      getComposition().expandSelectionInDirection(if direction is "left" then "backward" else "forward")

    if --times is 0
      defer(callback)
    else
      expand()

@collapseSelection = (direction, callback) ->
  selection = rangy.getSelection()
  if direction is "left"
    selection.collapseToStart()
  else
    selection.collapseToEnd()
  Trix.selectionChangeObserver.update()
  defer(callback)

@selectAll = (callback) ->
  rangy.getSelection().selectAllChildren(document.activeElement)
  Trix.selectionChangeObserver.update()
  defer(callback)

@deleteSelection = ->
  selection = rangy.getSelection()
  selection.getRangeAt(0).deleteContents()
  Trix.selectionChangeObserver.update()

@selectionIsCollapsed = ->
  rangy.getSelection().isCollapsed

@insertNode = (node, callback) ->
  selection = rangy.getSelection()
  range = selection.getRangeAt(0)
  range.splitBoundaries()
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()
  range.normalizeBoundaries()
  selection.setSingleRange(range)
  Trix.selectionChangeObserver.update()
  defer(callback)

@selectNode = (node, callback) ->
  selection = rangy.getSelection()
  selection.selectAllChildren(node)
  Trix.selectionChangeObserver.update()
  callback?()

getCursorCoordinates = ->
  if rect = window.getSelection().getRangeAt(0).getClientRects()[0]
    clientX: rect.left
    clientY: rect.top + rect.height / 2
