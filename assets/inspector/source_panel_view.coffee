#= require ./inspector_panel_view

{handleEvent} = Trix.DOM

class Trix.SourcePanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    handleEvent "click", onElement: @element, matchingSelector: "a.document", withCallback: @didClickDocumentLink

  didClickDocumentLink: (event, target) =>
    event.preventDefault()
    {documentKey} = target.dataset
    document = Trix.Document.fromJSON(window.trixDocuments[documentKey])
    @editorController.undoManager.recordUndoEntry("Load Document", context: documentKey)
    @editorController.document.replaceDocument(document)

  render: ->
    html = ""
    for key of window.trixDocuments
      html += """<li><a href="#" class="document" data-document-key="#{key}">#{key}</a></li>"""

    @element.querySelector("ul").innerHTML = html
