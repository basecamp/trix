class Trix.Watchdog.PlayerView
  constructor: (@element) ->
    @frame = document.createElement("iframe")
    @frame.onload = @frameDidLoad
    render(@element, @frame)

  frameDidLoad: =>
    @document = @frame.contentDocument
    @body = @document.body

    if @snapshot
      @renderSnapshot(snapshot)
      @snapshot = null

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

  render = (element, content) ->
    clear(element)
    element.appendChild(content)

  select = (document, range) ->
    return unless range
    window = document.defaultView
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
