import Player from "inspector/watchdog/player"
import PlayerView from "inspector/watchdog/player_view"

export default class PlayerController
  constructor: (element, recording) ->
    @element = element
    @recording = recording
    @player = new Player @recording
    @player.delegate = this

    @view = new PlayerView @element
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
