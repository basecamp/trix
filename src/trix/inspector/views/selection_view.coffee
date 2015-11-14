#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Selection"
  template: "selection"
  events:
    "trix-selection-change": ->
      @render()

  render: ->
    @range = @editor.getSelectedRange()
    @locationRange = @composition.getLocationRange()
    super
