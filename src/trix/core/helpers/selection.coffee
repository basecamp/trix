Trix.extend
  getDOMSelection: ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange: ->
    Trix.getDOMSelection()?.getRangeAt(0)

  setDOMRange: (domRange) ->
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(domRange)
    Trix.selectionChangeObserver.update()
