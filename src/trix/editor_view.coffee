#= require trix/view
#= require trix/composition
#= require trix/caret_view
#= require trix/composition_view
#= require trix/keyboard_input

class Trix.EditorView extends Trix.View
  constructor: (@outerElement) ->
    @element = @createElement "div", "editor_view", """
      position: absolute;
      overflow: auto;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    """
    @outerElement.appendChild @element
    @outerElement.addEventListener "focus", @onFocus
    @outerElement.addEventListener "blur", @onBlur

    @caretView = new Trix.CaretView this
    @compositionView = new Trix.CompositionView this

    @composition = new Trix.Composition this
    @composition.setPosition 0

    @keyboardInput = new Trix.KeyboardInput this, @outerElement
    @keyboardInput.start()

  deleteBackward: ->
    @composition.deleteBackward()
    @caretView.startBlinking()

  insertText: (text) ->
    @composition.insertText text
    @caretView.startBlinking()

  onFocus: =>
    @caretView.show()

  onBlur: =>
    @caretView.hide()

  compositionPositionChanged: (composition, position) ->
    if offsets = @compositionView.getMarkOffsets "position"
      @caretView.repositionAt offsets.left, offsets.top

  compositionLineModifiedAtIndex: (composition, index, line) ->
    @compositionView.updateLineAtIndex index, line

  compositionLineInsertedAtIndex: (composition, index, line) ->
    @compositionView.insertLineAtIndex index, line

  compositionLineDeletedAtIndex: (composition, index) ->
    @compositionView.deleteLineAtIndex index
