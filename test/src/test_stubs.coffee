class Trix.TestCompositionDelegate
  compositionDidRequestLocationRange: ->
    @getSelectionManager().setLocationRange(arguments...)

  getSelectionManager: ->
    @selectionManager ?= new Trix.TestSelectionManager

class Trix.TestSelectionManager
  constructor: ->
    @setLocationRange([0, 0])

  getLocationRange: ->
    @locationRange

  setLocationRange: (start, end) ->
    @locationRange = if start instanceof Trix.LocationRange
      start
    else
      new Trix.LocationRange start, end

  preserveSelection: (block) ->
    locationRange = @getLocationRange()
    block()
    @locationRange = locationRange

  setLocationRangeFromPoint: (point) ->

  locationIsCursorTarget: ->
    false

  selectionIsExpanded: ->
    not @getLocationRange().isCollapsed()
