class Trix.SelectionView
  constructor: (@element, @editorController) ->

  render: ->
    composition = @editorController.composition
    frozen = composition.hasFrozenSelection()

    if locationRange = composition.getLocationRange()
      @element.innerHTML = "Location: #{JSON.stringify(locationRange)}"
      @element.innerHTML += " (Frozen)" if frozen
      @element.innerHTML += ", Position: #{composition.getPosition()}"
    else
      @element.innerHTML = "(No Selection)"
