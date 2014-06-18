class Trix.SelectionView
  constructor: (@element, @editorController) ->
    @composition = @editorController.composition

  render: ->
    frozen = @composition.hasFrozenSelection()

    if range = @composition.getLocationRange()
      description = if range.isCollapsed() then "Location" else "Location range"
      @element.innerHTML = "#{description}: #{JSON.stringify(range)}"
      @element.innerHTML += " (Frozen)" if frozen
    else
      @element.innerHTML = "(No Selection)"
