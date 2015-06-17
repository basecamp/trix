class Trix.LocationRange extends Trix.BasicObject
  @forLocationWithLength: (location, length) ->
    locationWithLength = index: location.index, offset: location.offset + length

    if length >= 0
      start = location
      end = locationWithLength
    else
      start = locationWithLength
      end = location

    new this start, end

  @fromJSON: (json) ->
    new this json...

  constructor: (start, end) ->
    @start = parse(start)
    @end = if end? then parse(end) else copy(@start)
    {@index, @offset} = @start

  parse = (location) ->
    if Array.isArray(location)
      index: location[0], offset: location[1]
    else
      copy(location)

  copy = (object) ->
    return object unless object?
    result = {}
    result[key] = value for key, value of object
    result

  copy: ->
    new @constructor @start, @end

  copyWithEndLocation: (end) ->
    new @constructor @start, end

  isEqualTo: (locationRange) ->
    @start.index is locationRange?.start?.index and
      @end.index is locationRange?.end?.index and
      @start.offset is locationRange?.start?.offset and
      @end.offset is locationRange?.end?.offset

  isCollapsed: ->
    @start.index is @end.index and @start.offset is @end.offset

  isExpanded: ->
    not @isCollapsed()

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
    if @isCollapsed() then [@start] else [@start, @end]

  toString: ->
    JSON.stringify(@toJSON())

  inspect: ->
    strings = ("#{location.index}/#{location.offset}" for location in @toJSON())
    "(#{strings.join(" — ")})"

  toConsole: ->
    @inspect()
