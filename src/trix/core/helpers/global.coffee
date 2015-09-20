# Explicitly require this file (not included in the main
# Trix bundle) to install the following global helpers.

@getEditorElement = ->
  document.querySelector("trix-editor")

@getToolbarElement = ->
  getEditorElement().toolbarElement

@getEditorController = ->
  getEditorElement().editorController

@getComposition = ->
  getEditorController().composition

@getDocument = ->
  getComposition().document

@getSelectionManager = ->
  getEditorController().selectionManager
