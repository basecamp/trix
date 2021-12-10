# Explicitly require this file (not included in the main
# Trix bundle) to install the following global helpers.

@getEditorElement = ->
  document.querySelector("trix-editor")

@getToolbarElement = ->
  getEditorElement().toolbarElement

@getEditorController = ->
  getEditorElement().editorController

@getEditor = ->
  getEditorController().editor

@getComposition = ->
  getEditorController().composition

@getDocument = ->
  getComposition().document

@getSelectionManager = ->
  getEditorController().selectionManager
