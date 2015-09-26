#= require ./inspector_panel_view

{findClosestElementFromNode} = Trix

class Trix.StructurePanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    {@composition} = @editorController
    @handleEvent "mousedown", onElement: @element, matchingSelector: ".expandable .title", withCallback: @didClickExpandableTitle

  didClickExpandableTitle: (event) ->
    if expandable = findClosestElementFromNode(this, matchingSelector: ".expandable")
      expandable.classList.toggle("expanded")
      event.preventDefault()

  render: ->
    element = make("div", className: "trix-inspector-text")
    document = @composition.document
    for block, index in document.blockList.toArray()
      element.appendChild(@renderBlock(block, index))
    @clear()
    @element.appendChild(element)

  show: ->
    super
    @editorController.editorElement.classList.add("outline-blocks")

  hide: ->
    super
    @editorController.editorElement.classList.remove("outline-blocks")

  renderBlock: (block, index) ->
    element = make("div", className: "block")
    element.appendChild(@renderTitle("Block #{block.id}", "Index: #{index}"))
    element.appendChild(@renderBlockAttributes(block.attributes))
    element.appendChild(@renderText(block.text))
    element

  renderText: (text) ->
    element = make("div", className: "text")
    pieces = text.pieceList.toArray()
    element.appendChild(@renderTitle("Text #{text.id}", "Piece Count: #{pieces.length}, Length: #{text.getLength()}"))
    for piece, index in pieces
      element.appendChild(@renderPiece(piece, index))
    element

  renderPiece: (piece, index) ->
    element = make("div", className: "piece")
    element.appendChild(@renderTitle("Piece #{piece.id}", "Index: #{index}"))
    element.appendChild(@renderAttributes(piece.attributes))
    element.appendChild(@renderString(piece.toString()))
    element

  renderTitle: (content, description = "") ->
    element = make("div", className: "title")
    element.appendChild(make("span", className: "content", text: content))
    element.appendChild(make("span", className: "description", text: description))
    element

  renderAttributes: (attributes) ->
    @renderObject("Attributes", attributes.toObject())

  renderBlockAttributes: (attributes) ->
    element = make("div", className: "block_attributes")
    element.appendChild(@renderString(attributes.toArray()))
    element

  renderObject: (title, object) ->
    element = make("div", className: "object expandable")

    previewText = []
    contentElement = make("div", className: "content")
    for key, value of object
      previewText.push("#{key}=#{value}")
      propertyElement = make("div", className: "property")
      propertyElement.appendChild(make("span", className: "key", text: key))
      propertyElement.appendChild(make("span", className: "value", text: value))
      contentElement.appendChild(propertyElement)

    previewText.push("(none)") unless previewText.length
    element.appendChild(@renderTitle(title, previewText.join(", ")))
    element.appendChild(contentElement)
    element

  renderString: (string) ->
    make("div", className: "string", text: JSON.stringify(string))

  renderAttachment: (attachment) ->
    @renderObject("Attachment #{attachment.id}", attachment.toJSON())

  make = (tagName, options = {}) ->
    element = document.createElement(tagName)
    element.className = options.className if options.className?
    if options.text?
      text = document.createTextNode(options.text)
      element.appendChild(text)
    element
