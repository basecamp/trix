#= require trix/observer

class Trix.View extends Trix.Observer
  unsetOwner: ->
    if @owner
      @owner?.element.removeChild @element
      @owner = null
      @stop()

  setOwner: (owner) ->
    return if owner is @owner
    @unsetOwner()
    if owner
      @owner = owner
      @owner?.element.appendChild @element
      @start()

  elementId = 0

  createElement: (tagName, className, cssText = "") ->
    element = document.createElement(tagName)
    element.id = "trix_#{elementId++}"
    element.className = "trix_#{className}"
    element.style.cssText = cssText
    element

  addSubview: (view, beforeView) ->
    @subviews ?= []
    unless view in @subviews
      view.setOwner this
      if (index = @subviews.indexOf beforeView) != -1
        @element.insertBefore view.element, beforeView.element
        @subviews.splice index, 0, view
      else
        @subviews.push view

  removeSubview: (view) ->
    @subviews ?= []
    if (index = @subviews.indexOf view) != -1
      view.unsetOwner()
      @subviews.splice index, 1

  getSubviewAtIndex: (index) ->
    @subviews ?= []
    @subviews[index]

  getSubviews: ->
    @subviews ?= []
    @subviews.slice 0

  destroy: ->
    for view in @getSubviews()
      @removeSubview view
    @unsetOwner()
