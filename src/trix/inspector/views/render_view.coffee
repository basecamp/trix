#= require trix/inspector/view

class Trix.Inspector.RenderView extends Trix.Inspector.View
  constructor: ->
    @renderCount = 0
    @syncCount = 0
    super

  events:
    "trix-render": ->
      @renderCount++
      @render()

    "trix-sync": ->
      @syncCount++
      @render()
