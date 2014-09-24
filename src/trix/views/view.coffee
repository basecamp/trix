class Trix.View
  recordNode: (node, location) ->
    if @parentView
      @parentView.recordNode(node, location)
    else
      @nodeRecords[location.index] ?= {}
      @nodeRecords[location.index][location.offset] ?= []
      @nodeRecords[location.index][location.offset].push(node)

  resetNodeRecords: ->
    @nodeRecords = {}

  createChildView: (viewClass, args...) ->
    view = new viewClass args...
    view.parentView = this
    @childViews ?= []
    @childViews.push(view)
    view
