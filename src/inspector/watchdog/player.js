import "inspector/watchdog/recording"

export default class Player {
  constructor(recording) {
    this.tick = this.tick.bind(this)
    this.recording = recording
    this.playing = false
    this.index = -1
    this.length = this.recording.getFrameCount()
  }

  play() {
    if (this.playing) return
    if (this.hasEnded()) {
      this.index = -1
    }
    this.playing = true
    this.delegate?.playerDidStartPlaying?.()
    return this.tick()
  }

  tick() {
    if (this.hasEnded()) {
      return this.stop()
    } else {
      this.seek(this.index + 1)
      const duration = this.getTimeToNextFrame()
      this.timeout = setTimeout(this.tick, duration)
    }
  }

  seek(index) {
    const previousIndex = this.index

    if (index < 0) {
      this.index = 0
    } else if (index >= this.length) {
      this.index = this.length - 1
    } else {
      this.index = index
    }

    if (this.index !== previousIndex) {
      return this.delegate?.playerDidSeekToIndex?.(index)
    }
  }

  stop() {
    if (!this.playing) return
    clearTimeout(this.timeout)
    this.timeout = null
    this.playing = false
    return this.delegate?.playerDidStopPlaying?.()
  }

  isPlaying() {
    return this.playing
  }

  hasEnded() {
    return this.index >= this.length - 1
  }

  getSnapshot() {
    return this.recording.getSnapshotAtFrameIndex(this.index)
  }

  getEvents() {
    return this.recording.getEventsUpToFrameIndex(this.index)
  }

  getTimeToNextFrame() {
    const current = this.recording.getTimestampAtFrameIndex(this.index)
    const next = this.recording.getTimestampAtFrameIndex(this.index + 1)
    const duration = current && next ? next - current : 0
    return Math.min(duration, 500)
  }
}
