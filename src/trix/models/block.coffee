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

  isEqualTo: (block) ->
    super or (@text.isEqualTo(block.text) and @attributes.isEqualTo(block.attributes))

  copyWithText: (text) ->
    new @constructor text, @attributes

  copyWithoutText: ->
    @copyWithText(null)

  copyWithAttributes: (attributes) ->
    new @constructor @text, attributes

  copyUsingObjectMap: (objectMap) ->
    if mappedText = objectMap.find(@text)
      @copyWithText(mappedText)
    else
      @copyWithText(@text.copyUsingObjectMap(objectMap))

  addAttribute: (attribute) ->
    {listAttribute} = Trix.config.blockAttributes[attribute]
    attributes = if listAttribute
      @attributes.push(listAttribute, attribute)
    else
      @attributes.push(attribute)
    @copyWithAttributes(attributes)

  removeAttribute: (attribute) ->
    {listAttribute} = Trix.config.blockAttributes[attribute]
    attributes = if listAttribute
      @attributes.pop(attribute, listAttribute)
    else
      @attributes.pop(attribute)
    @copyWithAttributes(attributes)

  removeLastAttribute: ->
    @removeAttribute(@getLastAttribute())

  getLastAttribute: ->
    @attributes.getLast()

  getAttributes: ->
    @attributes.toArray()

  getAttributeLevel: ->
    @attributes.length

  getAttributeAtLevel: (level) ->
    @getAttributes()[level - 1]

  hasAttributes: ->
    @getAttributeLevel() > 0

  getConfig: (key) ->
    return unless attribute = @getLastAttribute()
    return unless config = Trix.config.blockAttributes[attribute]
    if key then config[key] else config

  isListItem: ->
    @getConfig("listAttribute")?

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
    not @hasAttributes() and not block.hasAttributes()

  consolidateWith: (block) ->
    newlineText = Trix.Text.textForStringWithAttributes("\n")
    text = @getTextWithoutBlockBreak().appendText(newlineText)
    @copyWithText(text.appendText(block.text))

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

  canBeGroupedWith: (otherBlock, depth) ->
    attributes = @getAttributes()
    otherAttributes = otherBlock.getAttributes()
    if attributes[depth] is otherAttributes[depth]
      if attributes[depth] in ["bullet", "number"] and otherAttributes[depth + 1] not in ["bulletList", "numberList"]
        false
      else
        true

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
