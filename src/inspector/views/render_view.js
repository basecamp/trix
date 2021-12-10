import View from "inspector/view"

Trix.Inspector.registerView class extends View
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
    super(arguments...)
    @renderCount = 0
    @syncCount = 0

  getTitle: ->
    "#{@title} (#{@renderCount})"
