class Trix.RenderCountView
  constructor: (@element) ->
    @count = 1

  incrementAndRender: ->
    @count++
    @render()

  render: ->
    @element.innerHTML = "Document renders: #{@count}"
