#= require trix/view

class Trix.CompositionView extends Trix.View
  constructor: (owner) ->
    @element = @createElement "div", "composition_view"
    @setOwner owner

  refresh: (composition) ->
    @element.innerHTML = ""
    for line, index in composition.getLines()
      @insertLineAtIndex index, line

  getLineElementAtIndex: (index) ->
    @element.childNodes[index]

  insertLineAtIndex: (index, line) ->
    element = @createLineElement line
    sibling = @getLineElementAtIndex index
    @element.insertBefore element, sibling

  updateLineAtIndex: (index, line) ->
    originalElement = @getLineElementAtIndex index
    element = @createLineElement line
    @element.replaceChild element, originalElement

  deleteLineAtIndex: (index) ->
    element = @getLineElementAtIndex index
    @element.removeChild element

  createLineElement: (line) ->
    element = @createElement "div", "line"
    element.appendChild document.createTextNode formatLine(line) + "\uFEFF"
    element.appendChild @createElement "span", "position_mark"
    element

  getMarkOffsets: (markName) ->
    elements = @element.querySelectorAll "span.trix_#{markName}_mark"
    if element = elements[elements.length - 1]
      return element.getBoundingClientRect()

  formatLine = (line) ->
    line
      .replace(/\n$/, "")
      .replace /^ +/, (match) ->
        Array(match.length + 1).join "\u00A0"
      .replace /\ ( +)/, (match) ->
        " " + Array(match.length).join "\u00A0"

  highlightElement = (element) ->
    element.style.outline = "1px solid rgba(255, 0, 0, 1)"
    element.style.webkitTransition = "outline 350ms 100ms ease-out"
    setTimeout ->
      element.style.outline = "1px solid rgba(255, 0, 0, 0)"
    , 1
    setTimeout ->
      element.style.outline = null
      element.style.webkitTransition = null
    , 450
