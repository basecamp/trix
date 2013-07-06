#= require trix/composition
#= require trix/editor_view
#= require trix/composition_view
#= require trix/keyboard_input
#= require trix/browser_selection

class Trix.Editor
  constructor: (@element) ->
    @composition = new Trix.Composition

    @editorView = new Trix.EditorView this, @element
    @compositionView = new Trix.CompositionView @editorView, @composition

    @composition.setCaretPosition 0

    @keyboardInput = new Trix.KeyboardInput this, @element
    @browserSelection = new Trix.BrowserSelection this, @element

    @keyboardInput.start()
    @browserSelection.start()

  moveBackward: ->
    @composition.moveBackward()

  moveForward: ->
    @composition.moveForward()

  deleteBackward: ->
    @composition.deleteBackward()

  insertText: (text) ->
    @composition.insertText text

  didReceiveFocus: ->
    @compositionView.didReceiveFocus()

  didLoseFocus: ->
    @compositionView.didLoseFocus()

  browserSelectionChanged: (selectionInfo) ->
    if selectionInfo
      @compositionView.hideCaret()
    else
      @compositionView.showCaret()
