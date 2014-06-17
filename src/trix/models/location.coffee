class Trix.Location
  constructor: (@start, @end) ->
    @end ?= @start
    {@index, @position} = @start

  isRange: ->
    @start? and @start isnt @end

  isRangeWithinIndex: ->
    @isRange() and @start.index is @end.index

  isCollapsed: ->
    not @isRange()

  getPositionRange: ->
    if @isRangeWithinIndex()
      [@start.position, @end.position]

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
