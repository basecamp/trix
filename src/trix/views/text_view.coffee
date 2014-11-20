#= require trix/views/object_view
#= require trix/views/piece_view

class Trix.TextView extends Trix.ObjectView
  constructor: ->
    super
    @text = @object
    {@textConfig} = @options

  findDeepestFirstChildOfElement = (element) ->
    element = element.firstChild while element.firstChild
    element

  createNodes: ->
    nodes = []
    @text.eachPiece (piece) =>
      return if piece.hasAttribute("blockBreak")
      [@previousPiece, @previousAttributes] = [@currentPiece, @currentAttributes]
      [@currentPiece, @currentAttributes] = [piece, piece.getAttributes()]
      pieceNodes = @findOrCreateCachedChildView(Trix.PieceView, piece, {@textConfig}).getNodes()

      if @previousAttributes?.href? and @previousAttributes.href is @currentAttributes.href
        parentHref = @previousAttributes.href
        delete @currentAttributes.href

      if element = @createElementForCurrentPiece()
        innerElement = findDeepestFirstChildOfElement(element)
        innerElement.appendChild(node) for node in pieceNodes
        pieceNodes = [element]

      if parentHref
        linkElement = nodes[nodes.length - 1]
        linkElement.appendChild(node) for node in pieceNodes
      else
        nodes.push(node) for node in pieceNodes
    nodes

  createElementForCurrentPiece: ->
    for key, value of @currentAttributes when config = Trix.textAttributes[key]
      if config.tagName
        configElement = document.createElement(config.tagName)
        configElement.setAttribute(key, value) unless typeof value is "boolean"
        configElement

        if element
          if key is "href"
            configElement.appendChild(element)
            element = configElement
          else
            findDeepestFirstChildOfElement(element).appendChild(configElement)
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
    span.dataset.trixCursorTarget = true
    span
