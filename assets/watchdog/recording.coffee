class Trix.Watchdog.Recording
  constructor: ->
    @snapshots = []
    @timestampOffset = new Date().getTime()

  getTimestamp: ->
    new Date().getTime() - @timestampOffset

  recordSnapshot: (snapshot) ->
    @snapshots.push([@getTimestamp(), snapshot])

  getSnapshotAtIndex: (index) ->
    @snapshots[index]?[1]

  getSnapshotCount: ->
    @snapshots.length
