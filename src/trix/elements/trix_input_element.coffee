{triggerEvent} = Trix

Trix.defineElement class extends Trix.Element
  @tagName: "trix-input"

  @defaultCSS: """
    %t:empty:not(:focus)::before {
      content: attr(placeholder);
      color: graytext;
    }
  """

  @defineProperty "value",
    get: ->
      @textContent
    set: (value) ->
      @textContent = value

  createdCallback: ->
    super
    @contentEditable = true
    @value = @getAttribute("value") if @hasAttribute("value")

  attachedCallback: ->
    super
    simulateChangeEvent.call(this)
    ensurePlainTextInput.call(this)

  attributeChangedCallback: (name, oldValue, newValue) ->
    super
    @[name] = newValue if @[name]?

  # Private

  simulateChangeEvent = ->
    @addEventListener "focus", =>
      @focusValue = @value

    @addEventListener "blur", =>
      if @focusValue isnt @value
        triggerEvent("change", onElement: this)
      delete @focusValue

  inputEvents = "keypress input paste change".split(" ")

  ensurePlainTextInput = ->
    for event in inputEvents
      @addEventListener event, =>
        @value = @textContent
