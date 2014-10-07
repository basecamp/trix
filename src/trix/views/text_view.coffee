#= require trix/views/object_view
#= require trix/views/piece_view
#= require trix/utilities/dom

{DOM} = Trix

class Trix.TextView extends Trix.ObjectView
  constructor: ->
    super
    @text = @object
    {@textConfig} = @options

  createNodes: ->
    nodes = []
    @text.eachPiece (piece) =>
      return if piece.hasAttribute("blockBreak")
      [@previousPiece, @previousAttributes] = [@currentPiece, @currentAttributes]
      [@currentPiece, @currentAttributes] = [piece, piece.getAttributes()]

      if @previousAttributes?.href? and @previousAttributes.href is @currentAttributes.href
        parentHref = @previousAttributes.href
        delete @currentAttributes.href

      beforeElement = @createCursorTarget() if piece.attachment

      pieceView = @findOrCreateCachedChildView(Trix.PieceView, piece, {@textConfig})
      if element = @createElementForCurrentPiece()
        DOM.deepestFirstChild(element).appendChild(pieceView.render())
      else
        element = pieceView.render()

      if piece.attachment
        element.setAttribute("contenteditable", "false") if element.tagName?.toLowerCase() is "a"
        afterElement = @createCursorTarget()

      if parentHref
        nodes.splice(nodes.length - 2, beforeElement) if beforeElement?
        nodes[nodes.length - 1].appendChild(element)
        nodes.push(afterElement) if afterElement?
      else
        nodes.push(beforeElement) if beforeElement?
        nodes.push(element)
        nodes.push(afterElement) if afterElement?
    nodes

  createElementForCurrentPiece: ->
    for key, value of @currentAttributes when config = Trix.attributes[key]
      if config.tagName
        configElement = document.createElement(config.tagName)
        configElement.setAttribute(key, value) unless typeof value is "boolean"
        configElement

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
      element ?= document.createElement("span")
      element.style[key] = value for key, value of styles

    element

  createCursorTarget: ->
    text = document.createTextNode(Trix.ZERO_WIDTH_SPACE)
    span = document.createElement("span")
    span.appendChild(text)
    span.dataset.trixSerialize = false
    span
