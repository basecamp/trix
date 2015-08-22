class Trix.RenderCountView
  constructor: (@element) ->
    @renderCount = 1
    @syncCount = 1

  incrementRenderCount: ->
    @renderCount++

  incrementSyncCount: ->
    @syncCount++

  render: ->
    @element.innerHTML = "Document renders: #{@renderCount}<br>Document syncs: #{@syncCount}"
