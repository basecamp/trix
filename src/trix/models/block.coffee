#= require trix/models/text

{arraysAreEqual} = Trix

class Trix.Block extends Trix.Object
  @fromJSON: (blockJSON) ->
    text = Trix.Text.fromJSON(blockJSON.text)
    new this text, blockJSON.attributes

  constructor: (text = new Trix.Text, attributes = []) ->
    super
    @text = applyBlockBreakToText(text)
    @attributes = attributes

  isEmpty: ->
    @text.isBlockBreak()

  isEqualTo: (block) ->
    super or (
      @text.isEqualTo(block?.text) and
      arraysAreEqual(@attributes, block?.attributes)
    )

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
      @attributes.concat([listAttribute, attribute])
    else
      @attributes.concat([attribute])
    @copyWithAttributes(attributes)

  removeAttribute: (attribute) ->
    {listAttribute} = Trix.config.blockAttributes[attribute]
    attributes = removeLastElement(@attributes, attribute)
    attributes = removeLastElement(attributes, listAttribute) if listAttribute?
    @copyWithAttributes(attributes)

  removeLastAttribute: ->
    @removeAttribute(@getLastAttribute())

  getLastAttribute: ->
    getLastElement(@attributes)

  getAttributes: ->
    @attributes.slice(0)

  getAttributeLevel: ->
    @attributes.length

  getAttributeAtLevel: (level) ->
    @attributes[level - 1]

  hasAttributes: ->
    @getAttributeLevel() > 0

  getConfig: (key) ->
    return unless attribute = @getLastAttribute()
    return unless config = Trix.config.blockAttributes[attribute]
    if key then config[key] else config

  isSingleLine: ->
    @getConfig("singleLine")?

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
    attributes: @attributes

  toString: ->
    @text.toString()

  toJSON: ->
    text: @text
    attributes: @attributes

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

  getBlockBreakPosition: ->
    @text.getLength() - 1

  getTextWithoutBlockBreak: ->
    if textEndsInBlockBreak(@text)
      @text.getTextAtRange([0, @getBlockBreakPosition()])
    else
      @text.copy()

  # Grouping

  canBeGrouped: (depth) ->
    @attributes[depth]

  canBeGroupedWith: (otherBlock, depth) ->
    attributes = @attributes
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
      if piece.isBlockBreak()
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
    endText.isBlockBreak()

  unmarkBlockBreakPiece = (piece) ->
    piece.copyWithoutAttribute("blockBreak")

  # Array helpers

  removeLastElement = (array, element) ->
    if getLastElement(array) is element
      array.slice(0, -1)
    else
      array

  getLastElement = (array) ->
    array.slice(-1)[0]
