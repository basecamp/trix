class Trix.Watchdog.PlayerView
  constructor: (@element, @player) ->
    @frame = document.createElement("iframe")
    @frame.style.border = "none"
    @frame.style.width = "100%"
    @frame.onload = @frameDidLoad

    container = document.createElement("div")

    @button = document.createElement("button")
    @button.textContent = "Play"
    @button.onclick = @didClickButton

    @slider = document.createElement("input")
    @slider.type = "range"
    @slider.max = @player.length
    @slider.oninput = @didChangeSliderValue

    render(container, @button, @slider)
    render(@element, @frame, container)
    @setIndex(0)

  setIndex: (index) ->
    @slider.value = index

  frameDidLoad: =>
    @document = @frame.contentDocument
    @document.head.innerHTML = document.head.innerHTML

    @body = @document.body
    @body.style.cssText = "margin: 0; padding: 0"

    if @snapshot
      @renderSnapshot(snapshot)
      @snapshot = null

  didClickButton: =>
    @delegate?.playerViewDidClickButton?()

  didChangeSliderValue: =>
    value = parseInt(@slider.value, 10)
    @delegate?.playerViewDidChangeSliderValue?(value)

  renderSnapshot: (snapshot) ->
    if @body
      {element, range} = @deserializeSnapshot(snapshot)
      render(@body, element)
      select(@document, range)
      @updateFrame()
    else
      @snapshot = snapshot

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
