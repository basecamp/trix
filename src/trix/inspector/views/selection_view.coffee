#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Selection"
  template: "selection"
  events:
    "trix-selectionchange": ->
      @render()

  render: ->
    @range = @composition.getSelectedRange()
    @locationRange = @composition.getLocationRange()
    super
