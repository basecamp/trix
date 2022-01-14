import Deserializer from "inspector/watchdog/deserializer"
import View from "../view"

const clear = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild)
  }
}

const render = (element, ...contents) => {
  clear(element)
  contents.forEach((content) => element.appendChild(content))
}

const select = (document, range) => {
  if (!range) return
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

export default class PlayerView extends View {
  static documentClassName = "trix-watchdog-player"
  static playingClassName = "trix-watchdog-player-playing"

  constructor(element) {
    super(...arguments)
    this.frameDidLoadDefaultDocument = this.frameDidLoadDefaultDocument.bind(this)
    this.frameDidLoadStylesheet = this.frameDidLoadStylesheet.bind(this)
    this.frameDidLoseFocus = this.frameDidLoseFocus.bind(this)
    this.didClickPlayButton = this.didClickPlayButton.bind(this)
    this.didChangeSliderValue = this.didChangeSliderValue.bind(this)
    this.updateFrame = this.updateFrame.bind(this)

    this.element = element
    this.frame = document.createElement("iframe")
    this.frame.style.border = "none"
    this.frame.style.width = "100%"
    this.frame.onload = this.frameDidLoadDefaultDocument
    this.frame.onblur = this.frameDidLoseFocus

    const controlsContainer = document.createElement("div")

    this.playButton = document.createElement("button")
    this.playButton.textContent = "Play"
    this.playButton.onclick = this.didClickPlayButton

    this.slider = document.createElement("input")
    this.slider.type = "range"
    this.slider.oninput = this.didChangeSliderValue

    this.indexLabel = document.createElement("span")

    const logContainer = document.createElement("div")

    this.log = document.createElement("textarea")
    this.log.setAttribute("readonly", "")
    this.log.rows = 4

    render(controlsContainer, this.playButton, this.slider, this.indexLabel)
    render(logContainer, this.log)
    render(this.element, this.frame, controlsContainer, logContainer)
    this.setIndex(0)
  }

  renderSnapshot(snapshot) {
    if (this.body) {
      const { element, range } = this.deserializeSnapshot(snapshot)
      render(this.body, element)
      select(this.document, range)
      return this.updateFrame()
    } else {
      this.snapshot = snapshot
    }
  }

  renderEvents(events) {
    const renderedEvents = events.slice().reverse().map((event, index) => {
      return this.renderEvent(event, index)
    })
    this.log.innerText = renderedEvents.join("\n")
  }

  setIndex(index) {
    this.slider.value = index
    this.indexLabel.textContent = `Frame ${index}`
  }

  setLength(length) {
    this.slider.max = length - 1
  }

  playerDidStartPlaying() {
    this.element.classList.add(this.constructor.playingClassName)
    this.playButton.textContent = "Pause"
  }

  playerDidStopPlaying() {
    this.element.classList.remove(this.constructor.playingClassName)
    this.playButton.textContent = "Play"
  }

  frameDidLoadDefaultDocument() {
    this.document = this.frame.contentDocument
    this.document.documentElement.classList.add(this.constructor.documentClassName)

    this.document.head.innerHTML = document.head.innerHTML

    Array.from(this.document.head.querySelectorAll("link[rel=stylesheet]")).forEach((stylesheet) => {
      stylesheet.onload = this.frameDidLoadStylesheet
    })

    this.body = this.document.body
    this.body.style.cssText = "margin: 0; padding: 0"
    this.body.onkeydown = (event) => event.preventDefault()

    if (this.snapshot) {
      this.renderSnapshot(this.snapshot)
      this.snapshot = null
    }
  }

  frameDidLoadStylesheet() {
    return this.updateFrame()
  }

  frameDidLoseFocus() {
    if (this.element.classList.contains(this.constructor.playingClassName)) {
      return requestAnimationFrame(this.updateFrame)
    }
  }

  didClickPlayButton() {
    return this.delegate?.playerViewDidClickPlayButton?.()
  }

  didChangeSliderValue() {
    const value = parseInt(this.slider.value, 10)
    return this.delegate?.playerViewDidChangeSliderValue?.(value)
  }

  renderEvent(event, index) {
    let description, key

    switch (event.type) {
      case "input":
        description = "Browser input event received"
        break
      case "keypress":
        key = event.character || event.charCode || event.keyCode
        description = `Key pressed: ${JSON.stringify(key)}`
        break
      case "log":
        description = event.message
        break
      case "snapshot":
        description = "DOM update"
    }

    return `[${index}] ${description}`
  }

  deserializeSnapshot(snapshot) {
    const deserializer = new Deserializer(this.document, snapshot)
    return {
      element: deserializer.getElement(),
      range: deserializer.getRange(),
    }
  }

  updateFrame() {
    this.frame.style.height = 0
    this.frame.style.height = this.body.scrollHeight + "px"
    this.frame.focus()
    return this.frame.contentWindow.focus()
  }
}
