#= require trix/watchdog/recording

class Trix.Watchdog.Player
  constructor: (@recording, @speed = 1) ->
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
      duration = @getTimeToNextFrame() / @speed
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

  increaseSpeed: ->
    @setSpeed switch @speed
      when 0.5 then 1
      when 1 then 2
      when 2 then 4
      else @speed

  decreaseSpeed: ->
    @setSpeed switch @speed
      when 1 then 0.5
      when 2 then 1
      when 4 then 2
      else @speed

  setSpeed: (speed) ->
    return if speed is @speed
    @speed = speed
    @delegate?.playerDidChangeSpeed?(speed)

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
