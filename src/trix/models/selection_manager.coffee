#= require trix/models/location_mapper
#= require trix/observers/selection_change_observer

{defer, elementContainsNode, nodeIsCursorTarget, innerElementIsActive,
 handleEvent, handleEventOnce, normalizeRange, rangeIsCollapsed, rangesAreEqual} = Trix

class Trix.SelectionManager extends Trix.BasicObject
  constructor: (@element) ->
    @locationMapper = new Trix.LocationMapper @element
    @lockCount = 0
    handleEvent("mousedown", onElement: @element, withCallback: @didMouseDown)

  getLocationRange: (options = {}) ->
    locationRange = if options.ignoreLock
      @currentLocationRange
    else
      @lockedLocationRange ? @currentLocationRange

  setLocationRange: (locationRange) ->
    return if @lockedLocationRange
    locationRange = normalizeRange(locationRange)
    if domRange = @createDOMRangeFromLocationRange(locationRange)
      setDOMRange(domRange)
      @updateCurrentLocationRange(locationRange)

  setLocationRangeFromPoint: (point) ->
    if locationRange = @getLocationRangeAtPoint(point)
      @setLocationRange(locationRange)

  getClientRectAtLocationRange: (locationRange) ->
    if range = @createDOMRangeFromLocationRange(locationRange)
      rects = [range.getClientRects()...]
      rects[-1..][0]

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
      @lockedLocationRange = null
      @setLocationRange(lockedLocationRange) if lockedLocationRange?

  preserveSelection: (block) ->
    endPoints = @getSelectionEndPoints()
    locationRange = @getLocationRange()
    block()

    if endPoints
      start = @getLocationRangeAtPoint(endPoints[0])
      end = @getLocationRangeAtPoint(endPoints[1])

      if start? and not end?
        end = start
      else if end? and not start?
        start = end

      if start? and end?
        locationRange = normalizeRange([start, end])

    if locationRange
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

  didMouseDown: =>
    @pauseTemporarily()

  pauseTemporarily: ->
    @paused = true

    resume = =>
      @paused = false
      clearTimeout(resumeTimeout)
      for handler in resumeHandlers
        handler.destroy()
      if elementContainsNode(document, @element)
        @selectionDidChange()

    resumeTimeout = setTimeout(resume, 200)
    resumeHandlers = for eventName in ["mousemove", "keydown"]
      handleEvent(eventName, onElement: document, withCallback: resume)

  selectionDidChange: =>
    unless @paused or innerElementIsActive(@element)
      @updateCurrentLocationRange()

  updateCurrentLocationRange: (locationRange) ->
    locationRange ?= @createLocationRangeFromDOMRange(getDOMRange())
    if not rangesAreEqual(locationRange, @currentLocationRange)
      @currentLocationRange = locationRange
      @delegate?.locationRangeDidChange?(@currentLocationRange?.slice(0))

  createDOMRangeFromLocationRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetFromLocation(locationRange[0])
    rangeEnd = if rangeIsCollapsed(locationRange)
      rangeStart
    else
      @findContainerAndOffsetFromLocation(locationRange[1]) ? rangeStart

    if rangeStart? and rangeEnd?
      domRange = document.createRange()
      domRange.setStart(rangeStart...)
      domRange.setEnd(rangeEnd...)
      domRange

  createLocationRangeFromDOMRange: (domRange) ->
    return unless domRange? and @domRangeWithinElement(domRange)
    return unless start = @findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset)
    end = @findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset) unless domRange.collapsed
    normalizeRange([start, end])

  domRangeWithinElement: (domRange) ->
    if domRange.collapsed
      elementContainsNode(@element, domRange.startContainer)
    else
      elementContainsNode(@element, domRange.startContainer) and elementContainsNode(@element, domRange.endContainer)

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
    return unless domRange = getDOMRange()
    rects = domRange.getClientRects()
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
