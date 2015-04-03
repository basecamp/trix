class Trix.Watchdog.PlayerController
  constructor: (@element, @recording) ->
    @player = new Trix.Watchdog.Player @recording
    @player.delegate = this

    @view = new Trix.Watchdog.PlayerView @element, @player
    @view.delegate = this

  play: ->
    @player.play()

  stop: ->
    @player.stop()

  playerViewSliderDidChangeValue: (value) ->
    @player.seek(value)

  playerDidSeekToIndex: (index) ->
    @view.setIndex(index)
    if snapshot = @player.getSnapshot(index)
      @view.renderSnapshot(snapshot)
