class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if locationRange = @composition.getLocationRange()
      @element.innerHTML = "Selection: #{JSON.stringify(locationRange)}"
      @element.innerHTML += " (Frozen)" if frozen
    else
      @element.innerHTML = "(No Selection)"
