#= require trix/views/view
#= require trix/views/piece_view
#= require trix/utilities/dom

{DOM} = Trix

class Trix.TextView extends Trix.View
  constructor: (@text, @options) ->

  render: ->
    @element = document.createDocumentFragment()

    @text.eachPieceWithPosition (piece, position) =>
      [@previousPiece, @previousAttributes] = [@currentPiece, @currentAttributes]
      [@currentPiece, @currentAttributes] = [piece, piece.getAttributes()]

      if parentAttribute = @findParentAttribute()
        delete @currentAttributes[parentAttribute]

      element = @createElementForCurrentPieceWithPosition(position)
      pieceView = @createChildView(Trix.PieceView, piece, position)
      DOM.deepestFirstChild(element).appendChild(pieceView.render())

      if piece.attachment
        element.setAttribute("contenteditable", "false") if element.tagName?.toLowerCase() is "a"
        before = @createCursorTargetForPosition(position)
        after = @createCursorTargetForPosition(position + 1)

      if parentAttribute
        @element.insertBefore(left, @element.lastChild) if left?
        @element.lastChild.appendChild(element)
        @element.appendChild(right) if right?
      else
        @element.appendChild(left) if left?
        @element.appendChild(element)
        @element.appendChild(right) if right?

    @element

  findParentAttribute: ->
    if @previousAttributes
      for key, value of @currentAttributes when Trix.attributes[key]?.parent
        return key if value is @previousAttributes[key]

  createElementForCurrentPieceWithPosition: (position) ->
    elements = []
    styles = []

    for key, value of @currentAttributes when config = Trix.attributes[key]
      if config.style
        styles.push(config.style)

      if config.tagName
        element = document.createElement(config.tagName)
        element.setAttribute(key, value) unless typeof(value) is "boolean"
        @recordNode(element, offset: position)

        if config.parent
          elements.unshift(element)
        else
          elements.push(element)

    if styles.length
      unless elements.length
        span = document.createElement("span")
        @recordNode(span, offset: position)
        elements.push(span)

      for style in styles
        elements[0].style[key] = value for key, value of style

    if elements.length
      element = innerElement = elements[0]
      for child in elements[1..]
        innerElement.appendChild(child)
        innerElement = child
      element
    else
      element = document.createDocumentFragment()
      @recordNode(element, offset: position)
      element

  createCursorTargetForPosition: (position) ->
    text = document.createTextNode(Trix.ZERO_WIDTH_SPACE)
    @recordNode(text, offset: position)
    span = document.createElement("span")
    span.appendChild(text)
    span.dataset.trixSerialze = false
    span
