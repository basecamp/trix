class Trix.Watchdog.Recording
  @fromJSON: ({snapshots, events, frames}) ->
    new this snapshots, events, frames

  constructor: (@snapshots = [], @events = [], @frames = []) ->

  recordSnapshot: (snapshot) ->
    @snapshots.push(snapshot)
    @recordFrame()

  getSnapshotAtIndex: (index) ->
    @snapshots[index] if index >= 0

  getSnapshotAtFrameIndex: (frameIndex) ->
    snapshotIndex = @getSnapshotIndexAtFrameIndex(frameIndex)
    @getSnapshotAtIndex(snapshotIndex)

  recordEvent: (event) ->
    @events.push(event)
    @recordFrame()

  getEventAtIndex: (index) ->
    @events[index] if index >= 0

  getEventsUpToIndex: (index, size = 0) ->
    return [] if index < 0
    @events.slice(0, index).slice(-size).reverse()

  getEventsUpToFrameIndex: (frameIndex, size = 5) ->
    eventIndex = @getEventIndexAtFrameIndex(frameIndex)
    @getEventsUpToIndex(eventIndex, size)

  recordFrame: ->
    frame = [@getTimestamp(), @snapshots.length - 1, @events.length - 1]
    @frames.push(frame)

  getTimestampAtFrameIndex: (index) ->
    @frames[index]?[0]

  getSnapshotIndexAtFrameIndex: (index) ->
    @frames[index]?[1]

  getEventIndexAtFrameIndex: (index) ->
    @frames[index]?[2]

  getFrameCount: ->
    @frames.length

  getTimestamp: ->
    new Date().getTime()

  toJSON: ->
    {@snapshots, @events, @frames}
