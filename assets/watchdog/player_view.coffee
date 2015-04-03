class Trix.Watchdog.PlayerView
  @className: "trix-watchdog-preview"
  @playingClassName: "trix-watchdog-preview-playing"

  constructor: (@element, @player) ->
    @element.classList.add(@constructor.className)

    @frame = document.createElement("iframe")
    @frame.style.border = "none"
    @frame.style.width = "100%"
    @frame.onload = @frameDidLoadDefaultDocument

    container = document.createElement("div")

    @button = document.createElement("button")
    @button.textContent = "Play"
    @button.onclick = @didClickButton

    @slider = document.createElement("input")
    @slider.type = "range"
    @slider.max = @player.length
    @slider.oninput = @didChangeSliderValue

    @log = document.createElement("textarea")
    @log.setAttribute("readonly", "")
    @log.rows = 4

    render(container, @button, @slider, @log)
    render(@element, @frame, container)
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

  playerDidStartPlaying: ->
    @element.classList.add(@constructor.playingClassName)
    @button.textContent = "Pause"

  playerDidStopPlaying: ->
    @element.classList.remove(@constructor.playingClassName)
    @button.textContent = "Play"

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

  didClickButton: =>
    @delegate?.playerViewDidClickButton?()

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
