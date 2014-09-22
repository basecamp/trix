#= require trix/utilities/dom
#= require trix/utilities/helpers

{DOM} = Trix
{memoize} = Trix.Helpers

class Trix.DOMRangeChange
  constructor: (@range, @previousRange) ->

  needsAdjustment: ->
    @isntEditable() or @containsCursorTarget()

  containsCursorTarget: ->
    range = document.createRange()
    range.setStart(@getStartContainerAndOffset()...)
    range.setEnd(@getEndContainerAndOffset()...)

    {firstChild, lastChild} = range.cloneContents()
    firstChild = firstChild.firstChild while firstChild.firstChild
    lastChild = lastChild.lastChild while lastChild.lastChild

    firstChild.textContent is Trix.ZERO_WIDTH_SPACE and lastChild.textContent is Trix.ZERO_WIDTH_SPACE

  isntEditable: ->
    focusElement = DOM.findElementForContainerAtOffset(@getFocusContainerAndOffset()...)
    not focusElement?.isContentEditable

  getDirection: memoize ->
    if @range.compareBoundaryPoints(Range.START_TO_START, @previousRange) is -1
      "backward"
    else if @range.compareBoundaryPoints(Range.END_TO_END, @previousRange) is 1
      "forward"

  getStartContainerAndOffset: ->
    if @getDirection() is "backward"
      [@range.startContainer, @range.startOffset]
    else
      [@previousRange.endContainer, @previousRange.endOffset]

  getEndContainerAndOffset: ->
    if @getDirection() is "backward"
      [@previousRange.startContainer, @previousRange.startOffset]
    else
      [@range.endContainer, @range.endOffset]

  getFocusContainerAndOffset: ->
    if @getDirection() is "backward"
      [@range.startContainer, @range.startOffset]
    else
      [@range.endContainer, @range.endOffset]
