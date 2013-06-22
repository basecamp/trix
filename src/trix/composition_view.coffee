#= require trix/view
#= require trix/line_view

class Trix.CompositionView extends Trix.View
  constructor: (owner) ->
    @element = @createElement "div", "composition_view"
    @setOwner owner

  refresh: (composition) ->
    @element.innerHTML = ""
    for line, index in composition.getLines()
      @insertLineAtIndex index, line

  insertLineAtIndex: (index, line) ->
    lineView = new Trix.LineView line
    siblingView = @getSubview index
    @addSubview lineView, siblingView

  updateLineAtIndex: (index, line) ->
    lineView = @getSubview index
    lineView.update line

  deleteLineAtIndex: (index) ->
    lineView = @getSubview index
    lineView.destroy()
    @removeSubview lineView

  createLineElement: (line) ->
    element = @createElement "div", "line"
    element.appendChild document.createTextNode formatLine(line) + "\uFEFF"
    element.appendChild @createElement "span", "position_mark"
    element

  getMarkOffsets: (markName) ->
    elements = @element.querySelectorAll "span.trix_#{markName}_mark"
    if element = elements[elements.length - 1]
      return element.getBoundingClientRect()

