class Trix.Watchdog.PlayerView
  constructor: (@element, @player) ->
    @frame = document.createElement("iframe")
    @frame.onload = @frameDidLoad

    @slider = document.createElement("input")
    @slider.type = "range"
    @slider.max = @player.length
    @slider.oninput = @sliderDidChangeValue

    @setIndex(0)
    render(@element, @frame, @slider)

  setIndex: (index) ->
    @slider.value = index

  frameDidLoad: =>
    @document = @frame.contentDocument
    @body = @document.body

    if @snapshot
      @renderSnapshot(snapshot)
      @snapshot = null

  sliderDidChangeValue: =>
    @delegate?.playerViewSliderDidChangeValue?(@slider.value)

  renderSnapshot: (snapshot) ->
    if @body
      {element, range} = @deserializeSnapshot(snapshot)
      render(@body, element)
      select(@document, range)
    else
      @snapshot = snapshot

  deserializeSnapshot: (snapshot) ->
    deserializer = new Trix.Watchdog.Deserializer @document, snapshot
    element: deserializer.getElement()
    range: deserializer.getRange()

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
