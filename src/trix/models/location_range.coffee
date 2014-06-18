class Trix.LocationRange
  constructor: (@start, @end) ->
    @end ?= @start
    {@index, @position} = @start

  isCollapsed: ->
    @start is @end

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
