Trix.extend
  getDOMSelection: ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange: ->
    if domRange = Trix.getDOMSelection()?.getRangeAt(0)
      unless domRangeIsPrivate(domRange)
        domRange

  setDOMRange: (domRange) ->
    if domRange
      selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(domRange)
      Trix.selectionChangeObserver.update()

  withDOMRange: (domRange, fn) ->
    original = Trix.getDOMRange()
    Trix.setDOMRange(domRange)
    try
      result = fn()
    finally
      Trix.setDOMRange(original)
    result

# In Firefox, clicking certain <input> elements changes the selection to a
# private element used to draw its UI. Attempting to access properties of those
# elements throws an error.
# https://bugzilla.mozilla.org/show_bug.cgi?id=208427
domRangeIsPrivate = (domRange) ->
  nodeIsPrivate(domRange.startContainer) or nodeIsPrivate(domRange.endContainer)

nodeIsPrivate = (node) ->
  not Object.getPrototypeOf(node)
