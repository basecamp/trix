#= require trix/inspector/view

class Trix.Inspector.DocumentView extends Trix.Inspector.View
  events:
    "trix-change": ->
      @render()

  render: ->
    {@document} = @composition
    super
