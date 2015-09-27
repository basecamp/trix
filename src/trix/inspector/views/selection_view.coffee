#= require trix/inspector/view

class Trix.Inspector.SelectionView extends Trix.Inspector.View
  events:
    "trix-selectionchange": ->
      @locationRange = @composition.getLocationRange()
      @render()
