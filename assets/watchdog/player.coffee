class Trix.Watchdog.Player
  constructor: (@recording) ->
    @playing = false
    @index = -1
    @length = @recording.getSnapshotCount()
    @interval = 100

  play: ->
    return if @playing
    @index = -1 if @hasEnded()
    @playing = true
    @delegate?.playerDidStartPlaying?()
    @tick()

  tick: =>
    if @hasEnded()
      @stop()
    else
      @seek(@index + 1)
      @timeout = setTimeout(@tick, @interval)

  seek: (index) ->
    previousIndex = @index

    if index < 0
      @index = 0
    else if index >= @length
      @index = @length - 1
    else
      @index = index

    if @index isnt previousIndex
      @delegate?.playerDidSeekToIndex?(index)

  stop: ->
    return unless @playing
    clearTimeout(@timeout)
    @timeout = null
    @playing = false
    @delegate?.playerDidStopPlaying?()

  hasEnded: ->
    @index >= @length - 1

  getSnapshot: ->
    @recording.getSnapshotAtIndex(@index)
