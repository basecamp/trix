#= require trix/views/object_view
#= require trix/views/piece_view
#= require trix/utilities/dom

{DOM} = Trix

class Trix.TextView extends Trix.ObjectView
  constructor: ->
    super
    @text = @object
    {@textConfig} = @options

  render: ->
    @element = document.createDocumentFragment()

    @text.eachPieceWithPosition (piece, position) =>
      [@previousPiece, @previousAttributes] = [@currentPiece, @currentAttributes]
      [@currentPiece, @currentAttributes] = [piece, piece.getAttributes()]

      if @previousAttributes?.href? and @previousAttributes.href is @currentAttributes.href
        parentHref = @previousAttributes.href
        delete @currentAttributes.href

      pieceView = @findOrCreateChildView(Trix.PieceView, piece, {position, @textConfig})
      if element = @createElementForCurrentPieceWithPosition(position)
        DOM.deepestFirstChild(element).appendChild(pieceView.render())
      else
        element = pieceView.render()

      if piece.attachment
        element.setAttribute("contenteditable", "false") if element.tagName?.toLowerCase() is "a"
        beforeElement = @createCursorTargetForPosition(position)
        afterElement = @createCursorTargetForPosition(position + 1)

      if parentHref
        @element.insertBefore(beforeElement, @element.lastChild) if beforeElement?
        @element.lastChild.appendChild(element)
        @element.appendChild(afterElement) if afterElement?
      else
        @element.appendChild(beforeElement) if beforeElement?
        @element.appendChild(element)
        @element.appendChild(afterElement) if afterElement?

    @element

  createElementForCurrentPieceWithPosition: (position) ->
    for key, value of @currentAttributes when config = Trix.attributes[key]
      if config.tagName
        configElement = document.createElement(config.tagName)
        configElement.setAttribute(key, value) unless typeof value is "boolean"
        @recordNodeWithLocation(configElement, offset: position)

        if element
          if key is "href"
            configElement.appendChild(element)
            element = configElement
          else
            DOM.deepestFirstChild(element).appendChild(configElement)
        else
          element = configElement

      if config.style
        if styles
          styles[key] = val for key, value of config.style
        else
          styles = config.style

    if styles
      element ?= @recordNodeWithLocation(document.createElement("span"), offset: position)
      element.style[key] = value for key, value of styles

    element

  createCursorTargetForPosition: (position) ->
    text = document.createTextNode(Trix.ZERO_WIDTH_SPACE)
    @recordNodeWithLocation(text, offset: position)
    span = document.createElement("span")
    span.appendChild(text)
    span.dataset.trixSerialze = false
    span
