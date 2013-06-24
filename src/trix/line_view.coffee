class Trix.LineView extends Trix.View
  constructor: (line) ->
    @element = @createElement "div", "line_view"
    @measurementElement = @createElement "span", "measurement"
    @update line

  update: (@line) ->
    @refresh()

  refresh: ->
    @element.innerHTML = ""
    @element.appendChild document.createTextNode formatLine(@line) + "\uFEFF"

  getBoundingClientRectAtColumn: (column) ->
    anteriorTextNode = @element.childNodes[0]
    columnTextNode = anteriorTextNode.splitText column
    posteriorTextNode = columnTextNode.splitText 1 if columnTextNode.length > 1

    @measurementElement.appendChild columnTextNode
    @element.insertBefore @measurementElement, posteriorTextNode

    rect = @measurementElement.getBoundingClientRect()
    @element.removeChild @measurementElement

    @element.insertBefore columnTextNode, posteriorTextNode
    @element.normalize()

    rect

  formatLine = (line) ->
    line
      .replace(/\n$/, "")
      .replace /^ +/, (match) ->
        Array(match.length + 1).join "\u00A0"
      .replace /\ ( +)/, (match) ->
        " " + Array(match.length).join "\u00A0"
