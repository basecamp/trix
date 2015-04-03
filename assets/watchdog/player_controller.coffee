class Trix.Watchdog.PlayerController
  constructor: (@element, @recording) ->
    @player = new Trix.Watchdog.Player @recording
    @player.delegate = this

    @view = new Trix.Watchdog.PlayerView @element, @player
    @view.delegate = this

    @player.seek(0)

  play: ->
    @player.play()

  stop: ->
    @player.stop()

  playerViewDidClickButton: ->
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
