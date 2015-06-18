#= require trix/models/location_mapper
#= require trix/models/location_range
#= require trix/observers/selection_change_observer

{defer, benchmark, elementContainsNode, nodeIsCursorTarget, innerElementIsActive} = Trix

class Trix.SelectionManager extends Trix.BasicObject
  constructor: (@element) ->
    @locationMapper = new Trix.LocationMapper @element
    @updateCurrentLocationRange(new Trix.LocationRange [0, 0])
    @lockCount = 0

  getLocationRange: (options = {}) ->
    locationRange = if options.ignoreLock
      @currentLocationRange
    else
      @lockedLocationRange ? @currentLocationRange
    locationRange?.copy()

  setLocationRange: (start, end) ->
    return if @lockedLocationRange

    locationRange = if start instanceof Trix.LocationRange
      start
    else
      new Trix.LocationRange start, end

    if domRange = @createDOMRangeFromLocationRange(locationRange)
      setDOMRange(domRange)
      @updateCurrentLocationRange(locationRange)

  setLocationRangeFromPoint: (point) ->
    if locationRange = @getLocationRangeAtPoint(point)
      @setLocationRange(locationRange)

  locationIsCursorTarget: (location) ->
    [node, offset] = @findNodeAndOffsetFromLocation(location)
    nodeIsCursorTarget(node)

  lock: ->
    if @lockCount++ is 0
      @updateCurrentLocationRange()
      @lockedLocationRange = @getLocationRange()

  unlock: ->
    if --@lockCount is 0
      lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      @setLocationRange(lockedLocationRange) if lockedLocationRange?

  preserveSelection: (block) ->
    endPoints = @getSelectionEndPoints()
    locationRange = @getLocationRange()
    block()

    if endPoints
      start = @getLocationRangeAtPoint(endPoints[0])
      end = @getLocationRangeAtPoint(endPoints[1])

    if start and end
      @setLocationRange(start, end)
    else if start
      @setLocationRange(start)
    else if end
      @setLocationRange(end)
    else if locationRange
      @setLocationRange(locationRange)

  clearSelection: ->
    getDOMSelection()?.removeAllRanges()

  selectionIsCollapsed: ->
    getDOMRange()?.collapsed is true

  selectionIsExpanded: ->
    not @selectionIsCollapsed()

  # Private

  @proxyMethod "locationMapper.findLocationFromContainerAndOffset"
  @proxyMethod "locationMapper.findContainerAndOffsetFromLocation"
  @proxyMethod "locationMapper.findNodeAndOffsetFromLocation"

  selectionDidChange: =>
    unless innerElementIsActive(@element)
      @updateCurrentLocationRange()

  updateCurrentLocationRange: (locationRange) ->
    locationRange ?= @createLocationRangeFromDOMRange(getDOMRange())
    if (@currentLocationRange and not locationRange) or not locationRange?.isEqualTo(@currentLocationRange)
      @currentLocationRange = locationRange
      @delegate?.locationRangeDidChange?(@currentLocationRange?.copy())

  createDOMRangeFromLocationRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetFromLocation(locationRange.start)
    rangeEnd = if locationRange.isCollapsed()
      rangeStart
    else
      @findContainerAndOffsetFromLocation(locationRange.end)

    if rangeStart? and rangeEnd?
      range = document.createRange()
      range.setStart(rangeStart...)
      range.setEnd(rangeEnd...)
      range

  createLocationRangeFromDOMRange: (range) ->
    return unless range? and @rangeWithinElement(range)
    return unless start = @findLocationFromContainerAndOffset(range.startContainer, range.startOffset)
    end = @findLocationFromContainerAndOffset(range.endContainer, range.endOffset) unless range.collapsed
    locationRange = new Trix.LocationRange start, end
    locationRange if locationRange.isValid()

  rangeWithinElement: (range) ->
    if range.collapsed
      elementContainsNode(@element, range.startContainer)
    else
      elementContainsNode(@element, range.startContainer) and elementContainsNode(@element, range.endContainer)

  getLocationRangeAtPoint: ([clientX, clientY]) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(clientX, clientY)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(clientX, clientY)

    else if document.body.createTextRange
      # IE 11 throws "Unspecified error" when using moveToPoint
      # during a drag-and-drop operation. We'll do our best to
      # map the point to a location range and fall back to the
      # current location range if there's a problem.
      try
        domRange = document.body.createTextRange()
        domRange.moveToPoint(clientX, clientY)
        domRange.select()

    @createLocationRangeFromDOMRange(domRange ? getDOMRange())

  getSelectionEndPoints: ->
    return unless range = getDOMRange()
    rects = range.getClientRects()
    if rects.length > 0
      leftRect = rects[0]
      rightRect = rects[rects.length - 1]

      leftPoint = [leftRect.left, leftRect.top + leftRect.height / 2]
      rightPoint = [rightRect.right, rightRect.top + rightRect.height / 2]

      [leftPoint, rightPoint]

  getDOMSelection = ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange = ->
    getDOMSelection()?.getRangeAt(0)

  setDOMRange = (domRange) ->
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(domRange)
    Trix.selectionChangeObserver.update()

  getClientRects = ->
    rects = getDOMRange()?.getClientRects()
    rects if rects?.length
