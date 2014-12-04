#= require trix/models/text

class Trix.Block extends Trix.Object
  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (text = new Trix.Text, attributes = []) ->
    super
    @text = applyBlockBreakToText(text)
    @attributes = Trix.List.box(attributes)

  isEmpty: ->
    textIsBlockBreak(@text)

  copyWithText: (text) ->
    new @constructor text, @attributes

  copyWithAttributes: (attributes) ->
    new @constructor @text, attributes

  copyUsingObjectMap: (objectMap) ->
    if mappedText = objectMap.find(@text)
      @copyWithText(mappedText)
    else
      @copyWithText(@text.copyUsingObjectMap(objectMap))

  addAttribute: (attribute, value) ->
    @copyWithAttributes @attributes.add(attribute, value)

  removeAttribute: (attribute) ->
    @copyWithAttributes @attributes.remove(attribute)

  getAttributes: ->
    @attributes.toArray()

  hasAttributes: ->
    @attributes.length

  findLineBreakInDirectionFromPosition: (direction, position) ->
    string = @toString()
    result = switch direction
      when "forward"
        string.indexOf("\n", position)
      when "backward"
        string.slice(0, position).lastIndexOf("\n")

    result unless result is -1

  contentsForInspection: ->
    text: @text.inspect()
    attributes: @attributes.inspect()

  toString: ->
    @text.toString()

  toJSON: ->
    text: @text
    attributes: @getAttributes()

  # Splittable

  getLength: ->
    @text.getLength()

  canBeConsolidatedWith: (block) ->
    false

  consolidateWith: (block) ->
    @copyWithText(@text.appendText(block.text))

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @getLength()
      left = this
      right = null
    else
      left = @copyWithText(@text.getTextAtRange([0, offset]))
      right = @copyWithText(@text.getTextAtRange([offset, @getLength()]))
    [left, right]

  toString: ->
    @text.toString()

  getBlockBreakPosition: ->
    @text.getLength() - 1

  getTextWithoutBlockBreak: ->
    if textEndsInBlockBreak(@text)
      @text.getTextAtRange([0, @getBlockBreakPosition()])
    else
      @text.copy()

  # Grouping

  canBeGrouped: (depth) ->
    @getAttributes()[depth]

  canBeGroupedWith: (block, depth) ->
    @getAttributes()[depth] is block.getAttributes()[depth]

  # Block breaks

  applyBlockBreakToText = (text) ->
    text = unmarkExistingInnerBlockBreaksInText(text)
    text = addBlockBreakToText(text)
    text

  unmarkExistingInnerBlockBreaksInText = (text) ->
    modified = false
    [innerPieces..., lastPiece] = text.getPieces()
    return text unless lastPiece?

    innerPieces = for piece in innerPieces
      if pieceIsBlockBreak(piece)
        modified = true
        unmarkBlockBreakPiece(piece)
      else
        piece

    if modified
      new Trix.Text [innerPieces..., lastPiece]
    else
      text

  blockBreakText = Trix.Text.textForStringWithAttributes("\n", blockBreak: true)

  addBlockBreakToText = (text) ->
    if textEndsInBlockBreak(text)
      text
    else
      text.appendText(blockBreakText)

  textEndsInBlockBreak = (text) ->
    length = text.getLength()
    return false if length is 0
    endText = text.getTextAtRange([length - 1, length])
    textIsBlockBreak(endText)

  textIsBlockBreak = (text) ->
    return false unless text.getLength() is 1
    piece = text.pieceList.getObjectAtIndex(0)
    pieceIsBlockBreak(piece)

  pieceIsBlockBreak = (piece) ->
    piece.toString() is "\n" and piece.getAttribute("blockBreak") is true

  unmarkBlockBreakPiece = (piece) ->
    piece.copyWithoutAttribute("blockBreak")
