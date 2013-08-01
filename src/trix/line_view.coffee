class Trix.LineView extends Trix.View
  constructor: (line) ->
    @element = @createElement "div", "line_view", "white-space: pre-wrap"
    @update line

  update: (@line) ->
    @refresh()

  refresh: ->
    @element.innerHTML = ""
    @element.appendChild document.createTextNode "\uFEFF" + formatLine(@line) + "\uFEFF"

  getObservedEvents: ->
    super.concat [["mousedown", @onMouseDown, true]]

  onMouseDown: (event) =>
    column = @getColumnAtPoint event.clientX, event.clientY
    @owner.lineViewClickedAtColumn this, column

  getBoundingClientRectAtColumn: (column) ->
    anteriorTextNode = @element.childNodes[0]
    columnTextNode = anteriorTextNode.splitText column + 1
    posteriorTextNode = columnTextNode.splitText 1 if columnTextNode.length > 1

    range = document.createRange()
    range.selectNodeContents(columnTextNode)
    rect = range.getClientRects()[0]

    @element.normalize()

    return rect if rect
    @getBoundingClientRectAtColumn column + 1 if column < @line.length

  getColumnAtPoint: (left, top) ->
    column = @line.length

    while column >= 0
      if rect = @getBoundingClientRectAtColumn column
        return column if rect.left <= left <= rect.right and rect.top <= top <= rect.bottom
      column--

    null

  formatLine = (line) ->
    line.replace(/^\n/, "\uFEFF")
