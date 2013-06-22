class Trix.LineView extends Trix.View
  constructor: (line) ->
    @element = @createElement "div", "line_view"
    @positionMark = @createElement "span", "position_mark"
    @update line

  update: (@line) ->
    @refresh()

  refresh: ->
    @element.innerHTML = ""
    @element.appendChild document.createTextNode formatLine(@line) + "\uFEFF"
    @element.appendChild @positionMark

  formatLine = (line) ->
    line
      .replace(/\n$/, "")
      .replace /^ +/, (match) ->
        Array(match.length + 1).join "\u00A0"
      .replace /\ ( +)/, (match) ->
        " " + Array(match.length).join "\u00A0"
