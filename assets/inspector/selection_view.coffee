class Trix.SelectionView
  constructor: (@element, @editorController) ->

  render: ->
    composition = @editorController.composition
    frozen = composition.hasFrozenSelection()

    if range = composition.getLocationRange()
      @element.innerHTML = "Location: #{JSON.stringify(range)}"
      @element.innerHTML += " (Frozen)" if frozen
      @element.innerHTML += ", Position: #{composition.getPosition()}"
    else
      @element.innerHTML = "(No Selection)"
