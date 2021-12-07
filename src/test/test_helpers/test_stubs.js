import { normalizeRange, rangeIsCollapsed } from "trix/core/helpers"

export class TestCompositionDelegate
  compositionDidRequestChangingSelectionToLocationRange: ->
    @getSelectionManager().setLocationRange(arguments...)

  getSelectionManager: ->
    @selectionManager ?= new TestSelectionManager

export class TestSelectionManager
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
