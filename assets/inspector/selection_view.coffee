class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if range = @composition.getLocationRange()
      @element.innerHTML = "Location: #{range.inspect()}"
      @element.innerHTML += " (Frozen)" if frozen
      @element.innerHTML += ", Position: #{@composition.getPosition()}"
    else
      @element.innerHTML = "(No Selection)"
