{getDOMRange, setDOMRange, findNodeFromContainerAndOffset,
 tagName, selectionElements, normalizeRange, defer} = Trix

class Trix.PointMapper
  findPointRangeFromDOMRange: (domRange) ->
    end = @findPointFromDOMRangeAtIndex(domRange, 1)
    points = [end]

    unless domRange.collapsed
      start = @findPointFromDOMRangeAtIndex(domRange, 0)
      points.unshift(start)

    normalizeRange(points)

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

  # Private

  findPointFromDOMRangeAtIndex: (domRange, index) ->
    domRange = domRange.cloneRange()
    side = if index is 0 then "start" else "end"
    element = findNodeFromContainerAndOffset(domRange["#{side}Container"], domRange["#{side}Offset"])

    if tagName(element) is "br"
      rect = getClientRectForElement(element)
      rect ?= @getClientRectsForDOMRange(domRange)[index]
      if rect
        x = rect.left
        y = rect.bottom
    else
      element = selectionElements.create("cursorPoint")
      domRange.collapse(false) if side is "end"
      domRange.insertNode(element)
      rect = element.getBoundingClientRect()
      selectionElements.remove(element)
      x = rect.left - index
      y = rect.top + 1

    if x? and y?
      {x, y}

  getClientRectForElement = (element) ->
    rect = element.getBoundingClientRect()
    rect if clientRectIsValid(rect)

  # Android creates an empty bounding rect for
  # BR elements where all values are 0.
  clientRectIsValid = (rect) ->
    return true for key, value of rect when Math.abs(value)
    false
