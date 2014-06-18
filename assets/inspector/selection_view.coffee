class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if range = @composition.getLocationRange()
      @element.innerHTML = "Range: #{JSON.stringify(range)}"
      @element.innerHTML += " (Frozen)" if frozen
    else
      @element.innerHTML = "(No Selection)"
