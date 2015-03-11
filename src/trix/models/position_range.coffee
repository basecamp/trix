class Trix.PositionRange extends Trix.BasicObject
  @box: (value) ->
    if value instanceof this
      value
    else if typeof value is "number"
      new this value
    else if Array.isArray(value)
      new this value[0], value[1]

  constructor: (start, end) ->
    @start = @position = parse(start)
    @end = parse(end) ? @start

  isEqualTo: (positionRange) ->
    positionRange = @constructor.box(positionRange)
    @start is positionRange?.start and @end is positionRange?.end

  isCollapsed: ->
    @start is @end

  collapse: ->
    new this @start, @start

  toArray: ->
    [@start, @end]
