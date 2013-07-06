#= require trix/observer

class Trix.BrowserSelection extends Trix.Observer
  constructor: (delegate, element) ->
    @delegate = delegate
    @element = element

  getObservedEvents: ->
    [["mousedown", @onMouseDown, false],
     ["mouseup", @onMouseUp, false],
     ["blur", @onBlur, false]]

  onMouseDown: (event) =>
    @on "mousemove", @onMouseMove, false
    @asynchronouslyUpdateSelectionInfo()

  onMouseUp: (event) =>
    @off "mousemove", @onMouseMove, false
    @asynchronouslyUpdateSelectionInfo()

  onBlur: (event) =>
    @asynchronouslyUpdateSelectionInfo()

  onMouseMove: (event) =>
    @asynchronouslyUpdateSelectionInfo()

  asynchronouslyUpdateSelectionInfo: ->
    setTimeout @updateSelectionInfo, 0

  updateSelectionInfo: =>
    selectionInfo = getSelectionInfo()
    if selectionInfoHasChanged @selectionInfo, selectionInfo
      @delegate.browserSelectionChanged selectionInfo
      @selectionInfo = selectionInfo

  getSelectionInfo = ->
    selection = document.getSelection()
    return if selection.rangeCount is 0
    range = selection.getRangeAt 0
    {startContainer, endContainer, startOffset, endOffset} = range
    return if startContainer is endContainer and startOffset is endOffset
    {startContainer, endContainer, startOffset, endOffset}

  selectionInfoHasChanged = (from, to) ->
    from?.startContainer isnt to?.startContainer or
    from?.endContainer   isnt to?.endContainer   or
    from?.startOffset    isnt to?.startOffset    or
    from?.endOffset      isnt to?.endOffset
