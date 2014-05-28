class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if selectedRange = @composition.getSelectedRange()
      @element.innerHTML = "Selection: [#{selectedRange.join(", ")}]"
      @element.innerHTML += " (Frozen)" if frozen
    else if (position = @composition.getPosition())?
      @element.innerHTML = "Position: #{position}"
    else
      @element.innerHTML = "(No Selection)"
