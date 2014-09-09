class Trix.LocationRange
  @forLocationWithLength: (location, length) ->
    locationWithLength = index: location.index, offset: location.offset + length

    if length >= 0
      start = location
      end = locationWithLength
    else
      start = locationWithLength
      end = location

    new this start, end

  constructor: (start, end) ->
    @start = parse(start)
    @end = parse(end)

    {@index, @offset} = @start

    unless @end?
      @end = {}
      @end[key] = val for key, val of @start

  parse = (location) ->
    if Array.isArray(location)
      index: location[0], offset: location[1]
    else
      location

  isEqualTo: (locationRange) ->
    @start.index is locationRange?.start?.index and
      @end.index is locationRange?.end?.index and
      @start.offset is locationRange?.start?.offset and
      @end.offset is locationRange?.end?.offset

  isCollapsed: ->
    @start.index is @end.index and @start.offset is @end.offset

  isInSingleIndex: ->
    @start.index is @end.index

  isValid: ->
    @start.index? and @start.offset? and @end.index? and @end.offset?

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
