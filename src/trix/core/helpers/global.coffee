# Explicitly require this file (not included in the main
# Trix bundle) to install the following global helpers.

@getEditorElement = ->
  document.querySelector("trix-editor")

@getToolbarElement = ->
  getEditorElement().querySelector("trix-toolbar")

@getDocumentElement = ->
  getEditorElement().querySelector("trix-document")

@getEditorController = ->
  getEditorElement().editorController

@getComposition = ->
  getEditorController().composition

@getDocument = ->
  getComposition().document

@getSelectionManager = ->
  getEditorController().selectionManager
