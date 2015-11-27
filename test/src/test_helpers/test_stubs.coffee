{normalizeRange, rangeIsCollapsed} = Trix

class Trix.TestCompositionDelegate
  compositionDidRequestChangingSelection: ({locationRange, pointRange}) ->
    if locationRange
      @getSelectionManager().setLocationRange(locationRange)
    else if pointRange
      @getSelectionManager().setLocationRangeFromPointRange(pointRange)

  getSelectionManager: ->
    @selectionManager ?= new Trix.TestSelectionManager

class Trix.TestSelectionManager
  constructor: ->
    @setLocationRange(index: 0, offset: 0)

  getLocationRange: ->
    @locationRange

  setLocationRange: (locationRange) ->
    @locationRange = normalizeRange(locationRange)

  preserveSelection: (block) ->
    locationRange = @getLocationRange()
    block()
    @locationRange = locationRange

  setLocationRangeFromPoint: (point) ->

  locationIsCursorTarget: ->
    false

  selectionIsExpanded: ->
    not rangeIsCollapsed(@getLocationRange())
