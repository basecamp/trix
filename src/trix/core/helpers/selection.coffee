Trix.extend
  getDOMSelection: ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange: ->
    range = Trix.getDOMSelection()?.getRangeAt(0)
    try
      range if range.startContainer.nodeType
    catch
      return

  setDOMRange: (domRange) ->
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(domRange)
    Trix.selectionChangeObserver.update()
