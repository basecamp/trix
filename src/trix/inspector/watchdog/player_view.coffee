#= require trix/watchdog/deserializer

class Trix.Watchdog.PlayerView
  @documentClassName: "trix-watchdog-player"
  @playingClassName: "trix-watchdog-player-playing"

  constructor: (@element) ->
    @frame = document.createElement("iframe")
    @frame.style.border = "none"
    @frame.style.width = "100%"
    @frame.onload = @frameDidLoadDefaultDocument
    @frame.onblur = @frameDidLoseFocus

    controlsContainer = document.createElement("div")

    @playButton = document.createElement("button")
    @playButton.textContent = "Play"
    @playButton.onclick = @didClickPlayButton

    @slider = document.createElement("input")
    @slider.type = "range"
    @slider.oninput = @didChangeSliderValue

    @indexLabel = document.createElement("span")

    logContainer = document.createElement("div")

    @log = document.createElement("textarea")
    @log.setAttribute("readonly", "")
    @log.rows = 4

    render(controlsContainer, @playButton, @slider, @indexLabel)
    render(logContainer, @log)
    render(@element, @frame, controlsContainer, logContainer)
    @setIndex(0)

  renderSnapshot: (snapshot) ->
    if @body
      {element, range} = @deserializeSnapshot(snapshot)
      render(@body, element)
      select(@document, range)
      @updateFrame()
    else
      @snapshot = snapshot

  renderEvents: (events) ->
    renderedEvents = for event, index in events by -1
      @renderEvent(event, index)
    @log.innerText = renderedEvents.join("\n")

  setIndex: (index) ->
    @slider.value = index
    @indexLabel.textContent = "Frame #{index}"

  setLength: (length) ->
    @slider.max = length - 1

  playerDidStartPlaying: ->
    @element.classList.add(@constructor.playingClassName)
    @playButton.textContent = "Pause"

  playerDidStopPlaying: ->
    @element.classList.remove(@constructor.playingClassName)
    @playButton.textContent = "Play"

  frameDidLoadDefaultDocument: =>
    @document = @frame.contentDocument
    @document.documentElement.classList.add(@constructor.documentClassName)

    @document.head.innerHTML = document.head.innerHTML
    for stylesheet in @document.head.querySelectorAll("link[rel=stylesheet]")
      stylesheet.onload = @frameDidLoadStylesheet

    @body = @document.body
    @body.style.cssText = "margin: 0; padding: 0"
    @body.onkeydown = (event) -> event.preventDefault()

    if @snapshot
      @renderSnapshot(snapshot)
      @snapshot = null

  frameDidLoadStylesheet: =>
    @updateFrame()

  frameDidLoseFocus: =>
    if @element.classList.contains(@constructor.playingClassName)
      requestAnimationFrame(@updateFrame)

  didClickPlayButton: =>
    @delegate?.playerViewDidClickPlayButton?()

  didChangeSliderValue: =>
    value = parseInt(@slider.value, 10)
    @delegate?.playerViewDidChangeSliderValue?(value)

  renderEvent: (event, index) ->
    description = switch event.type
      when "input"
        "Browser input event received"
      when "keypress"
        key = event.character ? event.charCode ? event.keyCode
        "Key pressed: #{JSON.stringify(key)}"
      when "log"
        event.message
      when "snapshot"
        "DOM update"

    "[#{index}] #{description}"

  deserializeSnapshot: (snapshot) ->
    deserializer = new Trix.Watchdog.Deserializer @document, snapshot
    element: deserializer.getElement()
    range: deserializer.getRange()

  updateFrame: =>
    @frame.style.height = 0
    @frame.style.height = @body.scrollHeight + "px"
    @frame.focus()
    @frame.contentWindow.focus()

  clear = (element) ->
    element.removeChild(element.lastChild) while element.lastChild

  render = (element, contents...) ->
    clear(element)
    element.appendChild(content) for content in contents

  select = (document, range) ->
    return unless range
    window = document.defaultView
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
