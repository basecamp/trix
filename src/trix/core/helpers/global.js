/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Explicitly require this file (not included in the main
// Trix bundle) to install the following global helpers.

this.getEditorElement = () => document.querySelector("trix-editor");

this.getToolbarElement = () => getEditorElement().toolbarElement;

this.getEditorController = () => getEditorElement().editorController;

this.getEditor = () => getEditorController().editor;

this.getComposition = () => getEditorController().composition;

this.getDocument = () => getComposition().document;

this.getSelectionManager = () => getEditorController().selectionManager;
