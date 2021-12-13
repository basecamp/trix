/* eslint-disable
    constructor-super,
    no-undef,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Deserializer from "inspector/watchdog/deserializer"

const clear = (element) => {
  while (element.lastChild) {
    result.push(element.removeChild(element.lastChild))
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
  static initClass() {
    this.documentClassName = "trix-watchdog-player"
    this.playingClassName = "trix-watchdog-player-playing"
  }

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
    const renderedEvents = (() => {
      const result = []
      for (let index = events.length - 1; index >= 0; index--) {
        const event = events[index]
        result.push(this.renderEvent(event, index))
      }
      return result
    })()
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
      this.renderSnapshot(snapshot)
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
    const description = (() => {
      switch (event.type) {
        case "input":
          return "Browser input event received"
        case "keypress":
          var key = (event.character != null ? event.character : event.charCode) || event.keyCode
          return `Key pressed: ${JSON.stringify(key)}`
        case "log":
          return event.message
        case "snapshot":
          return "DOM update"
      }
    })()

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

PlayerView.initClass()

