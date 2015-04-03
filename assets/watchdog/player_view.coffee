class Trix.Watchdog.PlayerView
  @className: "trix-watchdog-preview"
  @playingClassName: "trix-watchdog-preview-playing"

  constructor: (@element) ->
    @element.classList.add(@constructor.className)

    @frame = document.createElement("iframe")
    @frame.style.border = "none"
    @frame.style.width = "100%"
    @frame.onload = @frameDidLoadDefaultDocument

    bottomContainer = document.createElement("div")

    @playButton = document.createElement("button")
    @playButton.textContent = "Play"
    @playButton.onclick = @didClickPlayButton

    @slider = document.createElement("input")
    @slider.type = "range"
    @slider.oninput = @didChangeSliderValue

    speedControls = document.createElement("div")

    @decreaseSpeedButton = document.createElement("button")
    @decreaseSpeedButton.textContent = "–"
    @decreaseSpeedButton.onclick = @didClickDecreaseSpeedButton

    @speedMultiplierLabel = document.createElement("span")

    @increaseSpeedButton = document.createElement("button")
    @increaseSpeedButton.textContent = "+"
    @increaseSpeedButton.onclick = @didClickIncreaseSpeedButton

    @log = document.createElement("textarea")
    @log.setAttribute("readonly", "")
    @log.rows = 4

    render(speedControls, @decreaseSpeedButton, @speedMultiplierLabel, @increaseSpeedButton)
    render(bottomContainer, @playButton, @slider, speedControls, @log)
    render(@element, @frame, bottomContainer)
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

  setLength: (length) ->
    @slider.max = length

  setSpeed: (speed) ->
    @speedMultiplierLabel.textContent = speed + "×"

  playerDidStartPlaying: ->
    @element.classList.add(@constructor.playingClassName)
    @playButton.textContent = "Pause"

  playerDidStopPlaying: ->
    @element.classList.remove(@constructor.playingClassName)
    @playButton.textContent = "Play"

  frameDidLoadDefaultDocument: =>
    @document = @frame.contentDocument
    @document.head.innerHTML = document.head.innerHTML
    for stylesheet in @document.head.querySelectorAll("link[rel=stylesheet]")
      stylesheet.onload = @frameDidLoadStylesheet

    @body = @document.body
    @body.style.cssText = "margin: 0; padding: 0"

    if @snapshot
      @renderSnapshot(snapshot)
      @snapshot = null

  frameDidLoadStylesheet: =>
    @updateFrame()

  didClickPlayButton: =>
    @delegate?.playerViewDidClickPlayButton?()

  didChangeSliderValue: =>
    value = parseInt(@slider.value, 10)
    @delegate?.playerViewDidChangeSliderValue?(value)

  didClickDecreaseSpeedButton: =>
    @delegate?.playerViewDidClickDecreaseSpeedButton?()

  didClickIncreaseSpeedButton: =>
    @delegate?.playerViewDidClickIncreaseSpeedButton?()

  renderEvent: (event, index) ->
    description = switch event.type
      when "input"
        "Browser input event received"
      when "keypress"
        key = event.character ? event.charCode ? event.keyCode
        "Key pressed: #{JSON.stringify(key)}"

    "[#{index}] #{description}"

  deserializeSnapshot: (snapshot) ->
    deserializer = new Trix.Watchdog.Deserializer @document, snapshot
    element: deserializer.getElement()
    range: deserializer.getRange()

  updateFrame: ->
    @frame.style.height = 0
    @frame.style.height = @body.scrollHeight + "px"
    @frame.focus()

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
