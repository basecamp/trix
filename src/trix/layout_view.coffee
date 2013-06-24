#= require trix/view
#= require trix/line_view

class Trix.LayoutView extends Trix.View
  constructor: (compositionView) ->
    @element = @createElement "div", "layout_view"
    @setOwner compositionView

  refresh: (lines) ->
    @element.innerHTML = ""
    for line, row in lines
      @insertLineViewAtRow row, line

  insertLineViewAtRow: (row, line) ->
    lineView = new Trix.LineView line
    siblingView = @getSubviewAtIndex row
    @addSubview lineView, siblingView

  updateLineViewAtRow: (row, line) ->
    lineView = @getSubviewAtIndex row
    lineView.update line

  deleteLineViewAtRow: (row) ->
    lineView = @getSubviewAtIndex row
    lineView.destroy()
    @removeSubview lineView

  getBoundingClientRectAtRowAndColumn: (row, column) ->
    lineView = @getSubviewAtIndex row
    lineView.getBoundingClientRectAtColumn column
