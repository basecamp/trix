class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if location = @composition.getLocation()
      @element.innerHTML = "Selection: #{JSON.stringify(location)}"
      @element.innerHTML += " (Frozen)" if frozen
    else
      @element.innerHTML = "(No Selection)"
