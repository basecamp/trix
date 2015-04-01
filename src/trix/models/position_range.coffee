class Trix.PositionRange extends Trix.BasicObject
  @box: (value) ->
    if value instanceof this
      value
    else if typeof value is "number"
      new this value
    else if Array.isArray(value)
      new this value[0], value[1]

  constructor: (start, end) ->
    @start = @[0] = start
    @end = @[1] = end ? @start

  copyWithEndPosition: (end) ->
    new @constructor @start, end

  expandInDirection: (direction) ->
    if direction is "backward"
      new @constructor @start - 1, @end
    else
      new @constructor @start, @end + 1

  isEqualTo: (positionRange) ->
    positionRange = @constructor.box(positionRange)
    @start is positionRange?.start and @end is positionRange?.end

  isCollapsed: ->
    @start is @end

  collapse: ->
    @copyWithEndPosition(@start)

  toArray: ->
    [@start, @end]
