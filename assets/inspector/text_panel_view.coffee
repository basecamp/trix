#= require ./inspector_panel_view
#= require trix/utilities/dom

class Trix.TextPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    @document = @editorController.document
    Trix.DOM.on(@element, "mousedown", ".expandable .title", @didClickExpandableTitle)

  didClickExpandableTitle: (event) ->
    if expandable = Trix.DOM.closest(this, ".expandable")
      expandable.classList.toggle("expanded")
      event.preventDefault()

  render: ->
    element = make("div", className: "trix-inspector-text")
    for block, index in @document.blockList.toArray()
      element.appendChild(@renderBlock(block, index))
    @clear()
    @element.appendChild(element)

  renderBlock: (block, index) ->
    element = make("div", className: "block")
    element.appendChild(@renderTitle("Block", "Index: #{index}"))
    element.appendChild(@renderAttributes(block.attributes))
    element.appendChild(@renderText(block.text))
    element

  renderText: (text) ->
    element = make("div", className: "text")
    pieces = text.pieceList.toArray()
    element.appendChild(@renderTitle("Text", "Piece Count: #{pieces.length}, Length: #{text.getLength()}"))
    for piece, index in pieces
      element.appendChild(@renderPiece(piece, index))
    element

  renderPiece: (piece, index) ->
    element = make("div", className: "piece")
    element.appendChild(@renderTitle("Piece", "Index: #{index}"))
    element.appendChild(@renderAttributes(piece.attributes))
    if piece.attachment
      element.appendChild(@renderAttachment(piece.attachment))
    else
      element.appendChild(@renderString(piece.string))
    element

  renderTitle: (content, description = "") ->
    element = make("div", className: "title")
    element.appendChild(make("span", className: "content", text: content))
    element.appendChild(make("span", className: "description", text: description))
    element

  renderAttributes: (attributes) ->
    @renderObject("Attributes", attributes.toObject())

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
    @renderObject("Attachment", attachment.toJSON())

  make = (tagName, options = {}) ->
    element = document.createElement(tagName)
    element.className = options.className if options.className?
    if options.text?
      text = document.createTextNode(options.text)
      element.appendChild(text)
    element
