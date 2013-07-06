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
    @showCaret()
    @refresh()

  didReceiveFocus: ->
    @elementFocused = true
    @updateCaretVisibility()

  didLoseFocus: ->
    @elementFocused = false
    @updateCaretVisibility()

  showCaret: ->
    @caretVisible = true
    @updateCaretVisibility()

  hideCaret: ->
    @caretVisible = false
    @updateCaretVisibility()

  updateCaretVisibility: ->
    if @elementFocused and @caretVisible
      @caretView.show()
    else
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

  layoutViewClickedAtRowAndColumn: (layoutView, row, column) ->
    position = @composition.getPositionAtRowAndColumn row, column
    @composition.setCaretPosition position

  getBoundingClientRectAtPosition: (position) ->
    [row, column] = @composition.getRowAndColumnAtPosition(position) ? [0, -1]
    @layoutView.getBoundingClientRectAtRowAndColumn row, column
