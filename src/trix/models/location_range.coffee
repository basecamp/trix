class Trix.LocationRange
  @create: (start, end) ->
    if start instanceof this
      start
    else
      new this start, end

  @forLocationWithLength: (location, length) ->
    if length > 0
      start = location
      end = index: location.index, offset: location.offset + length
    else if length < 0
      start = index: location.index, offset: location.offset - length
      end = location
    else
      start = end = location

    new this start, end

  constructor: (@start, @end) ->
    {@index, @offset} = @start

    unless @end?
      @end = {}
      @end[key] = val for key, val of start

  isEqualTo: (locationRange) ->
    @start.index is locationRange?.start?.index and
      @end.index is locationRange?.end?.index and
      @start.offset is locationRange?.start?.offset and
      @end.offset is locationRange?.end?.offset

  isCollapsed: ->
    @start.index is @end.index and @start.offset is @end.offset

  isInSingleIndex: ->
    @start.index is @end.index

  eachIndex: (callback) ->
    callback(index) for index in [@start.index..@end.index]

  collapse: ->
    @end = @start
    this

  toArray: ->
    [@start, @end]

  toJSON: ->
    if @isCollapsed()
      @start
    else
      @toArray()

  inspect: ->
    locations = if @isCollapsed() then [@start] else [@start, @end]
    strings = ("#{location.index}/#{location.offset}" for location in locations)
    "(#{strings.join(" — ")})"

  toConsole: ->
    @inspect()
