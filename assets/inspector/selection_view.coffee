class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if selectedRange = @composition.getSelectedRange()
      @element.innerHTML = "Selection: #{JSON.stringify(selectedRange)}"
      @element.innerHTML += " (Frozen)" if frozen
    else if (location = @composition.getLocation())?
      @element.innerHTML = "Location: #{JSON.stringify(location)}"
    else
      @element.innerHTML = "(No Selection)"
