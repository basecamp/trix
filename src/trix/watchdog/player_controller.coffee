#= require trix/watchdog/player
#= require trix/watchdog/player_view

class Trix.Watchdog.PlayerController
  constructor: (@element, @recording) ->
    @player = new Trix.Watchdog.Player @recording
    @player.delegate = this

    @view = new Trix.Watchdog.PlayerView @element
    @view.delegate = this

    @view.setLength(@player.length)
    @player.seek(0)

  play: ->
    @player.play()

  stop: ->
    @player.stop()

  playerViewDidClickPlayButton: ->
    if @player.isPlaying()
      @player.stop()
    else
      @player.play()

  playerViewDidChangeSliderValue: (value) ->
    @player.seek(value)

  playerDidSeekToIndex: (index) ->
    @view.setIndex(index)

    if snapshot = @player.getSnapshot(index)
      @view.renderSnapshot(snapshot)

    if events = @player.getEvents(index)
      @view.renderEvents(events)

  playerDidStartPlaying: ->
    @view.playerDidStartPlaying()

  playerDidStopPlaying: ->
    @view.playerDidStopPlaying()
