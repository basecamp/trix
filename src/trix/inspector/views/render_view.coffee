#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  name: "render"
  title: "Renders"
  open: true
  events:
    "trix-render": ->
      @renderCount++
      @render()

    "trix-sync": ->
      @syncCount++
      @render()

  constructor: ->
    @renderCount = 0
    @syncCount = 0
    super
