class Trix.Watchdog.PlayerController
  constructor: (@element, @recording) ->
    @player = new Trix.Watchdog.Player @recording
    @player.delegate = this
    @view = new Trix.Watchdog.PlayerView @element

  play: ->
    @player.play()

  stop: ->
    @player.stop()

  playerDidSeekToSnapshot: (snapshot) ->
    @view.renderSnapshot(snapshot)
