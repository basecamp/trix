#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  name: "selection"
  title: "Selection"
  open: true
  position: 1
  events:
    "trix-selectionchange": ->
      @locationRange = @composition.getLocationRange()
      @render()
