import Player from "inspector/watchdog/player"
import PlayerView from "inspector/watchdog/player_view"

export default class PlayerController {
  constructor(element, recording) {
    this.element = element
    this.recording = recording
    this.player = new Player(this.recording)
    this.player.delegate = this

    this.view = new PlayerView(this.element)
    this.view.delegate = this

    this.view.setLength(this.player.length)
    this.player.seek(0)
  }

  play() {
    return this.player.play()
  }

  stop() {
    return this.player.stop()
  }

  playerViewDidClickPlayButton() {
    if (this.player.isPlaying()) {
      return this.player.stop()
    } else {
      return this.player.play()
    }
  }

  playerViewDidChangeSliderValue(value) {
    return this.player.seek(value)
  }

  playerDidSeekToIndex(index) {
    this.view.setIndex(index)

    const snapshot = this.player.getSnapshot(index)
    if (snapshot) {
      this.view.renderSnapshot(snapshot)
    }

    const events = this.player.getEvents(index)
    if (events) {
      return this.view.renderEvents(events)
    }
  }

  playerDidStartPlaying() {
    return this.view.playerDidStartPlaying()
  }

  playerDidStopPlaying() {
    return this.view.playerDidStopPlaying()
  }
}
