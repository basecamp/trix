#= require trix/composition
#= require trix/editor_view
#= require trix/composition_view
#= require trix/keyboard_input

class Trix.Editor
  constructor: (@element) ->
    @composition = new Trix.Composition

    @editorView = new Trix.EditorView this, @element
    @compositionView = new Trix.CompositionView @editorView, @composition
    @keyboardInput = new Trix.KeyboardInput this, @element

    @composition.setCaretPosition 0
    @keyboardInput.start()

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
