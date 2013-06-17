class Trix.View
  setOwner: (owner) ->
    unless owner is @owner
      @owner?.element.removeChild @element
      @owner = owner
      @owner?.element.appendChild @element

  createElement: (tagName, className, cssText = "") ->
    element = document.createElement(tagName)
    element.className = "trix_#{className}"
    element.style.cssText = cssText
    element

  addSubview: (view) ->
    @subviews ?= []
    unless view in @subviews
      view.setOwner this
      @subviews.push view

  removeSubview: (view) ->
    @subviews ?= []
    if (index = @subviews.indexOf view) != -1
      view.setOwner null
      @subviews.splice index, 1

  getSubviews: ->
    @subviews ?= []
    @subviews.slice 0

  destroy: ->
    for view in @getSubviews()
      @removeSubview view
