#= require trix/view
#= require trix/caret_view
#= require trix/layout_view

class Trix.CompositionView extends Trix.View
  constructor: (editorView, composition) ->
    @element = @createElement "div", "composition_view"

    @setOwner editorView
    @caretView = new Trix.CaretView this
    @layoutView = new Trix.LayoutView this

    @composition = composition
    @composition.delegate = this
    @refresh()

  didReceiveFocus: ->
    @caretView.show()

  didLoseFocus: ->
    @caretView.hide()

  refresh: ->
    @layoutView.refresh @composition.getLines()

  compositionCaretPositionChanged: (composition, caretPosition) ->
    if rect = @getBoundingClientRectAtPosition caretPosition - 1
      @caretView.repositionAt rect.left + rect.width, rect.top

  compositionLineModifiedAtRow: (composition, row, line) ->
    @layoutView.updateLineViewAtRow row, line

  compositionLineInsertedAtRow: (composition, row, line) ->
    @layoutView.insertLineViewAtRow row, line

  compositionLineDeletedAtRow: (composition, row) ->
    @layoutView.deleteLineViewAtRow row

  getBoundingClientRectAtPosition: (position) ->
    [row, column] = @composition.getRowAndColumnAtPosition(position) ? [0, -1]
    @layoutView.getBoundingClientRectAtRowAndColumn row, column
