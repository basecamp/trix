#= require trix/models/location_mapper
#= require trix/observers/selection_change_observer

{defer, elementContainsNode, nodeIsCursorTarget, innerElementIsActive, makeElement,
 handleEvent, handleEventOnce, normalizeRange, rangeIsCollapsed, rangesAreEqual,
 findNodeFromContainerAndOffset, tagName} = Trix

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

  getSelectedPointRange: ->
    return unless getDOMSelection()
    points = [getSelectionPoint("end")]
    points.unshift(getSelectionPoint("start")) if @selectionIsExpanded()
    normalizeRange(points)

  setLocationRangeFromPointRange: (pointRange) ->
    pointRange = normalizeRange(pointRange)
    startLocation = @getLocationRangeAtPoint(pointRange[0])?[0]
    endLocation = @getLocationRangeAtPoint(pointRange[1])?[0]
    @setLocationRange([startLocation, endLocation])

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

  getLocationRangeAtPoint: ({x, y}) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(x, y)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(x, y)

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

    @createLocationRangeFromDOMRange(domRange)

  getSelectionPoint = (side) ->
    domRange = getDOMRange().cloneRange()
    element = findNodeFromContainerAndOffset(domRange["#{side}Container"], domRange["#{side}Offset"])

    if tagName(element) is "br"
      {left, bottom} = element.getBoundingClientRect()
      x: left, y: bottom
    else
      element = makeMeasurementElement()
      domRange.collapse(false) if side is "end"
      domRange.insertNode(element)
      {left, top} = element.getBoundingClientRect()
      left -= 1 if side is "end"
      x: left, y: top + 1

  makeMeasurementElement = ->
    makeElement
      tagName: "span"
      data: trixMutable: true
      trixSerialize: false

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
