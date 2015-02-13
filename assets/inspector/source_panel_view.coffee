#= require ./inspector_panel_view

class Trix.SourcePanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    @handleEvent "click", onElement: @element, matchingSelector: "a.document", withCallback: @didClickDocumentLink

  didClickDocumentLink: (event, target) =>
    event.preventDefault()
    {documentKey} = target.dataset
    document = Trix.Document.fromJSON(window.trixDocuments[documentKey])
    @editor.undoManager.recordUndoEntry("Load Document", context: documentKey)
    @editor.document.replaceDocument(document)
    @editorController.render()

  render: ->
    html = ""
    for key of window.trixDocuments
      html += """<li><a href="#" class="document" data-document-key="#{key}">#{key}</a></li>"""

    @element.querySelector("ul").innerHTML = html
