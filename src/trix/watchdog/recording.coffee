class Trix.Watchdog.Recording
  @fromJSON: ({snapshots, frames}) ->
    new this snapshots, frames

  constructor: (@snapshots = [], @frames = []) ->

  recordSnapshot: (snapshot) ->
    snapshotJSON = JSON.stringify(snapshot)
    if snapshotJSON isnt @lastSnapshotJSON
      @lastSnapshotJSON = snapshotJSON
      @snapshots.push(snapshot)
      @recordEvent(type: "snapshot")

  recordEvent: (event) ->
    frame = [@getTimestamp(), @snapshots.length - 1, event]
    @frames.push(frame)

  getSnapshotAtIndex: (index) ->
    @snapshots[index] if index >= 0

  getSnapshotAtFrameIndex: (frameIndex) ->
    snapshotIndex = @getSnapshotIndexAtFrameIndex(frameIndex)
    @getSnapshotAtIndex(snapshotIndex)

  getTimestampAtFrameIndex: (index) ->
    @frames[index]?[0]

  getSnapshotIndexAtFrameIndex: (index) ->
    @frames[index]?[1]

  getEventAtFrameIndex: (index) ->
    @frames[index]?[2]

  getEventsUpToFrameIndex: (index) ->
    frame[2] for frame in @frames.slice(0, index + 1)

  getFrameCount: ->
    @frames.length

  getTimestamp: ->
    new Date().getTime()

  truncateToSnapshotCount: (snapshotCount) ->
    offset = @snapshots.length - snapshotCount
    return if offset < 0

    frames = @frames
    @frames = for [timestamp, index, event] in frames when index >= offset
      [timestamp, index - offset, event]

    @snapshots = @snapshots.slice(offset)

  toJSON: ->
    {@snapshots, @frames}
