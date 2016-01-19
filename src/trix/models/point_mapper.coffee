{getDOMRange, setDOMRange} = Trix

class Trix.PointMapper
  createDOMRangeFromPoint: ({x, y}) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(x, y)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)
      domRange

    else if document.caretRangeFromPoint
      document.caretRangeFromPoint(x, y)

    else if document.body.createTextRange
      originalDOMRange = getDOMRange()
      try
        # IE 11 throws "Unspecified error" when using moveToPoint
        # during a drag-and-drop operation.
        textRange = document.body.createTextRange()
        textRange.moveToPoint(x, y)
        textRange.select()
      domRange = getDOMRange()
      setDOMRange(originalDOMRange)
      domRange

  getClientRectsForDOMRange: (domRange) ->
    [start, ..., end] = [domRange.getClientRects()...]
    [start, end]
