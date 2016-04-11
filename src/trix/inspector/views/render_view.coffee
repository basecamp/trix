#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Renders"
  template: "render"
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

  getTitle: ->
    "#{@title} (#{@renderCount})"
