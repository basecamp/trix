#= require trix/watchdog/recording

class Trix.Watchdog.Player
  constructor: (@recording) ->
    @playing = false
    @index = -1
    @length = @recording.getFrameCount()

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
      duration = @getTimeToNextFrame()
      @timeout = setTimeout(@tick, duration)

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

  isPlaying: ->
    @playing

  hasEnded: ->
    @index >= @length - 1

  getSnapshot: ->
    @recording.getSnapshotAtFrameIndex(@index)

  getEvents: ->
    @recording.getEventsUpToFrameIndex(@index)

  getTimeToNextFrame: ->
    current = @recording.getTimestampAtFrameIndex(@index)
    next = @recording.getTimestampAtFrameIndex(@index + 1)
    duration = if current? and next? then next - current else 0
    Math.min(duration, 500)
