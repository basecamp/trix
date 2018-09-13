#= require trix/models/block
#= require trix/models/splittable_list
#= require trix/models/html_parser

{arraysAreEqual, normalizeRange, rangeIsCollapsed, getBlockConfig} = Trix

class Trix.Document extends Trix.Object
  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  @fromHTML: (html, options) ->
    Trix.HTMLParser.parse(html, options).getDocument()

  @fromString: (string, textAttributes) ->
    text = Trix.Text.textForStringWithAttributes(string, textAttributes)
    new this [new Trix.Block text]


  constructor: (blocks = []) ->
    super
    blocks = [new Trix.Block] if blocks.length is 0
    @blockList = Trix.SplittableList.box(blocks)

  isEmpty: ->
    @blockList.length is 1 and (
      block = @getBlockAtIndex(0)
      block.isEmpty() and not block.hasAttributes()
    )

  copy: (options = {})->
    blocks = if options.consolidateBlocks
      @blockList.consolidate().toArray()
    else
      @blockList.toArray()

    new @constructor blocks

  copyUsingObjectsFromDocument: (sourceDocument) ->
    objectMap = new Trix.ObjectMap sourceDocument.getObjects()
    @copyUsingObjectMap(objectMap)

  copyUsingObjectMap: (objectMap) ->
    blocks = for block in @getBlocks()
      if mappedBlock = objectMap.find(block)
        mappedBlock
      else
        block.copyUsingObjectMap(objectMap)
    new @constructor blocks

  copyWithBaseBlockAttributes: (blockAttributes = []) ->
    blocks = for block in @getBlocks()
      attributes = blockAttributes.concat(block.getAttributes())
      block.copyWithAttributes(attributes)
    new @constructor blocks

  replaceBlock: (oldBlock, newBlock) ->
    index = @blockList.indexOf(oldBlock)
    return this if index is -1
    new @constructor @blockList.replaceObjectAtIndex(newBlock, index)

  insertDocumentAtRange: (document, range) ->
    {blockList} = document
    [position] = range = normalizeRange(range)
    {index, offset} = @locationFromPosition(position)

    result = this
    block = @getBlockAtPosition(position)

    if rangeIsCollapsed(range) and block.isEmpty() and not block.hasAttributes()
      result = new @constructor result.blockList.removeObjectAtIndex(index)
    else if block.getBlockBreakPosition() is offset
      position++

    result = result.removeTextAtRange(range)
    new @constructor result.blockList.insertSplittableListAtPosition(blockList, position)

  mergeDocumentAtRange: (document, range) ->
    [startPosition] = range = normalizeRange(range)
    startLocation = @locationFromPosition(startPosition)
    blockAttributes = @getBlockAtIndex(startLocation.index).getAttributes()
    baseBlockAttributes = document.getBaseBlockAttributes()
    trailingBlockAttributes = blockAttributes.slice(-baseBlockAttributes.length)

    if arraysAreEqual(baseBlockAttributes, trailingBlockAttributes)
      leadingBlockAttributes = blockAttributes.slice(0, -baseBlockAttributes.length)
      formattedDocument = document.copyWithBaseBlockAttributes(leadingBlockAttributes)
    else
      formattedDocument = document.copy(consolidateBlocks: true).copyWithBaseBlockAttributes(blockAttributes)

    blockCount = formattedDocument.getBlockCount()
    firstBlock = formattedDocument.getBlockAtIndex(0)

    if arraysAreEqual(blockAttributes, firstBlock.getAttributes())
      firstText = firstBlock.getTextWithoutBlockBreak()
      result = @insertTextAtRange(firstText, range)

      if blockCount > 1
        formattedDocument = new @constructor formattedDocument.getBlocks().slice(1)
        position = startPosition + firstText.getLength()
        result = result.insertDocumentAtRange(formattedDocument, position)
    else
      result = @insertDocumentAtRange(formattedDocument, range)

    result

  insertTextAtRange: (text, range) ->
    [startPosition] = range = normalizeRange(range)
    {index, offset} = @locationFromPosition(startPosition)

    document = @removeTextAtRange(range)
    new @constructor document.blockList.editObjectAtIndex index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, offset))

  removeTextAtRange: (range) ->
    [leftPosition, rightPosition] = range = normalizeRange(range)
    return this if rangeIsCollapsed(range)
    [leftLocation, rightLocation] = @locationRangeFromRange(range)

    leftIndex = leftLocation.index
    leftOffset = leftLocation.offset
    leftBlock = @getBlockAtIndex(leftIndex)

    rightIndex = rightLocation.index
    rightOffset = rightLocation.offset
    rightBlock = @getBlockAtIndex(rightIndex)

    removeRightNewline = rightPosition - leftPosition is 1 and
      leftBlock.getBlockBreakPosition() is leftOffset and
      rightBlock.getBlockBreakPosition() isnt rightOffset and
      rightBlock.text.getStringAtPosition(rightOffset) is "\n"

    if removeRightNewline
      blocks = @blockList.editObjectAtIndex rightIndex, (block) ->
        block.copyWithText(block.text.removeTextAtRange([rightOffset, rightOffset + 1]))
    else
      leftText = leftBlock.text.getTextAtRange([0, leftOffset])
      rightText = rightBlock.text.getTextAtRange([rightOffset, rightBlock.getLength()])
      text = leftText.appendText(rightText)

      removingLeftBlock = leftIndex isnt rightIndex and leftOffset is 0
      useRightBlock = removingLeftBlock and leftBlock.getAttributeLevel() >= rightBlock.getAttributeLevel()

      if useRightBlock
        block = rightBlock.copyWithText(text)
      else
        block = leftBlock.copyWithText(text)

      affectedBlockCount = rightIndex + 1 - leftIndex
      blocks = @blockList.splice(leftIndex, affectedBlockCount, block)

    new @constructor blocks

  moveTextFromRangeToPosition: (range, position) ->
    [startPosition, endPosition] = range = normalizeRange(range)
    return this if startPosition <= position <= endPosition

    document = @getDocumentAtRange(range)
    result = @removeTextAtRange(range)

    movingRightward = startPosition < position
    position -= document.getLength() if movingRightward

    [firstBlock, blocks...] = document.getBlocks()
    if blocks.length is 0
      text = firstBlock.getTextWithoutBlockBreak()
      position += 1 if movingRightward
    else
      text = firstBlock.text

    result = result.insertTextAtRange(text, position)
    return result if blocks.length is 0

    document = new @constructor blocks
    position += text.getLength()

    result.insertDocumentAtRange(document, position)

  addAttributeAtRange: (attribute, value, range) ->
    blockList = @blockList
    @eachBlockAtRange range, (block, textRange, index) ->
      blockList = blockList.editObjectAtIndex index, ->
        if getBlockConfig(attribute)
          block.addAttribute(attribute, value)
        else
          if textRange[0] is textRange[1]
            block
          else
            block.copyWithText(block.text.addAttributeAtRange(attribute, value, textRange))
    new @constructor blockList

  addAttribute: (attribute, value) ->
    blockList = @blockList
    @eachBlock (block, index) ->
      blockList = blockList.editObjectAtIndex (index), ->
        block.addAttribute(attribute, value)
    new @constructor blockList

  removeAttributeAtRange: (attribute, range) ->
    blockList = @blockList
    @eachBlockAtRange range, (block, textRange, index) ->
      if getBlockConfig(attribute)
        blockList = blockList.editObjectAtIndex index, ->
          block.removeAttribute(attribute)
      else if textRange[0] isnt textRange[1]
        blockList = blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, textRange))
    new @constructor blockList

  updateAttributesForAttachment: (attributes, attachment) ->
    [startPosition] = range = @getRangeOfAttachment(attachment)
    {index} = @locationFromPosition(startPosition)
    text = @getTextAtIndex(index)

    new @constructor @blockList.editObjectAtIndex index, (block) ->
      block.copyWithText(text.updateAttributesForAttachment(attributes, attachment))

  removeAttributeForAttachment: (attribute, attachment) ->
    range = @getRangeOfAttachment(attachment)
    @removeAttributeAtRange(attribute, range)

  insertBlockBreakAtRange: (range) ->
    [startPosition] = range = normalizeRange(range)
    {offset} = @locationFromPosition(startPosition)

    document = @removeTextAtRange(range)
    blocks = [new Trix.Block] if offset is 0
    new @constructor document.blockList.insertSplittableListAtPosition(new Trix.SplittableList(blocks), startPosition)

  applyBlockAttributeAtRange: (attributeName, value, range) ->
    {document, range} = @expandRangeToLineBreaksAndSplitBlocks(range)
    config = getBlockConfig(attributeName)

    if config.listAttribute
      document = document.removeLastListAttributeAtRange(range, exceptAttributeName: attributeName)
      {document, range} = document.convertLineBreaksToBlockBreaksInRange(range)
    else if config.exclusive
      document = document.removeBlockAttributesAtRange(range)
    else if config.terminal
      document = document.removeLastTerminalAttributeAtRange(range)
    else
      document = document.consolidateBlocksAtRange(range)

    document.addAttributeAtRange(attributeName, value, range)

  removeLastListAttributeAtRange: (range, options = {}) ->
    blockList = @blockList
    @eachBlockAtRange range, (block, textRange, index) ->
      return unless lastAttributeName = block.getLastAttribute()
      return unless getBlockConfig(lastAttributeName).listAttribute
      return if lastAttributeName is options.exceptAttributeName
      blockList = blockList.editObjectAtIndex index, ->
        block.removeAttribute(lastAttributeName)
    new @constructor blockList

  removeLastTerminalAttributeAtRange: (range) ->
    blockList = @blockList
    @eachBlockAtRange range, (block, textRange, index) ->
      return unless lastAttributeName = block.getLastAttribute()
      return unless getBlockConfig(lastAttributeName).terminal
      blockList = blockList.editObjectAtIndex index, ->
        block.removeAttribute(lastAttributeName)
    new @constructor blockList

  removeBlockAttributesAtRange: (range) ->
    blockList = @blockList
    @eachBlockAtRange range, (block, textRange, index) ->
      if block.hasAttributes()
        blockList = blockList.editObjectAtIndex index, ->
          block.copyWithoutAttributes()
    new @constructor blockList

  expandRangeToLineBreaksAndSplitBlocks: (range) ->
    [startPosition, endPosition] = range = normalizeRange(range)
    startLocation = @locationFromPosition(startPosition)
    endLocation = @locationFromPosition(endPosition)
    document = this

    startBlock = document.getBlockAtIndex(startLocation.index)
    if (startLocation.offset = startBlock.findLineBreakInDirectionFromPosition("backward", startLocation.offset))?
      position = document.positionFromLocation(startLocation)
      document = document.insertBlockBreakAtRange([position, position + 1])
      endLocation.index += 1
      endLocation.offset -= document.getBlockAtIndex(startLocation.index).getLength()
      startLocation.index += 1
    startLocation.offset = 0

    if endLocation.offset is 0 and endLocation.index > startLocation.index
      endLocation.index -= 1
      endLocation.offset = document.getBlockAtIndex(endLocation.index).getBlockBreakPosition()
    else
      endBlock = document.getBlockAtIndex(endLocation.index)
      if endBlock.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) is "\n"
        endLocation.offset -= 1
      else
        endLocation.offset = endBlock.findLineBreakInDirectionFromPosition("forward", endLocation.offset)
      unless endLocation.offset is endBlock.getBlockBreakPosition()
        position = document.positionFromLocation(endLocation)
        document = document.insertBlockBreakAtRange([position, position + 1])

    startPosition = document.positionFromLocation(startLocation)
    endPosition = document.positionFromLocation(endLocation)
    range = normalizeRange([startPosition, endPosition])

    {document, range}

  convertLineBreaksToBlockBreaksInRange: (range) ->
    [position] = range = normalizeRange(range)
    string = @getStringAtRange(range).slice(0, -1)
    document = this

    string.replace /.*?\n/g, (match) ->
      position += match.length
      document = document.insertBlockBreakAtRange([position - 1, position])

    {document, range}

  consolidateBlocksAtRange: (range) ->
    [startPosition, endPosition] = range = normalizeRange(range)
    startIndex = @locationFromPosition(startPosition).index
    endIndex = @locationFromPosition(endPosition).index
    new @constructor @blockList.consolidateFromIndexToIndex(startIndex, endIndex)

  getDocumentAtRange: (range) ->
    range = normalizeRange(range)
    blocks = @blockList.getSplittableListInRange(range).toArray()
    new @constructor blocks

  getStringAtRange: (range) ->
    [..., endPosition] = range = normalizeRange(range)
    endIndex = -1 unless endPosition is @getLength()
    @getDocumentAtRange(range).toString().slice(0, endIndex)

  getBlockAtIndex: (index) ->
    @blockList.getObjectAtIndex(index)

  getBlockAtPosition: (position) ->
    {index} = @locationFromPosition(position)
    @getBlockAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  getTextAtPosition: (position) ->
    {index} = @locationFromPosition(position)
    @getTextAtIndex(index)

  getPieceAtPosition: (position) ->
    {index, offset} = @locationFromPosition(position)
    @getTextAtIndex(index).getPieceAtPosition(offset)

  getCharacterAtPosition: (position) ->
    {index, offset} = @locationFromPosition(position)
    @getTextAtIndex(index).getStringAtRange([offset, offset + 1])

  getLength: ->
    @blockList.getEndPosition()

  getBlocks: ->
    @blockList.toArray()

  getBlockCount: ->
    @blockList.length

  getEditCount: ->
    @editCount

  eachBlock: (callback) ->
    @blockList.eachObject(callback)

  eachBlockAtRange: (range, callback) ->
    [startPosition, endPosition] = range = normalizeRange(range)
    startLocation = @locationFromPosition(startPosition)
    endLocation = @locationFromPosition(endPosition)

    if startLocation.index is endLocation.index
      block = @getBlockAtIndex(startLocation.index)
      textRange = [startLocation.offset, endLocation.offset]
      callback(block, textRange, startLocation.index)
    else
      for index in [startLocation.index..endLocation.index]
        if block = @getBlockAtIndex(index)
          textRange = switch index
            when startLocation.index
              [startLocation.offset, block.text.getLength()]
            when endLocation.index
              [0, endLocation.offset]
            else
              [0, block.text.getLength()]
          callback(block, textRange, index)

  getCommonAttributesAtRange: (range) ->
    [startPosition] = range = normalizeRange(range)
    if rangeIsCollapsed(range)
      @getCommonAttributesAtPosition(startPosition)
    else
      textAttributes = []
      blockAttributes = []

      @eachBlockAtRange range, (block, textRange) ->
        unless textRange[0] is textRange[1]
          textAttributes.push(block.text.getCommonAttributesAtRange(textRange))
          blockAttributes.push(attributesForBlock(block))

      Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
        .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
        .toObject()

  getCommonAttributesAtPosition: (position) ->
    {index, offset} = @locationFromPosition(position)
    block = @getBlockAtIndex(index)
    return {} unless block

    commonAttributes = attributesForBlock(block)
    attributes = block.text.getAttributesAtPosition(offset)
    attributesLeft = block.text.getAttributesAtPosition(offset - 1)
    inheritableAttributes = (key for key, value of Trix.config.textAttributes when value.inheritable)

    for key, value of attributesLeft
      if value is attributes[key] or key in inheritableAttributes
        commonAttributes[key] = value

    commonAttributes

  getRangeOfCommonAttributeAtPosition: (attributeName, position) ->
    {index, offset} = @locationFromPosition(position)
    text = @getTextAtIndex(index)
    [startOffset, endOffset] = text.getExpandedRangeForAttributeAtOffset(attributeName, offset)

    start = @positionFromLocation {index, offset: startOffset}
    end = @positionFromLocation {index, offset: endOffset}
    normalizeRange([start, end])

  getBaseBlockAttributes: ->
    baseBlockAttributes = @getBlockAtIndex(0).getAttributes()

    for blockIndex in [1...@getBlockCount()]
      blockAttributes = @getBlockAtIndex(blockIndex).getAttributes()
      lastAttributeIndex = Math.min(baseBlockAttributes.length, blockAttributes.length)

      baseBlockAttributes = for index in [0...lastAttributeIndex]
        break unless blockAttributes[index] is baseBlockAttributes[index]
        blockAttributes[index]

    baseBlockAttributes

  attributesForBlock = (block) ->
    attributes = {}
    if attributeName = block.getLastAttribute()
      attributes[attributeName] = true
    attributes

  getAttachmentById: (attachmentId) ->
    return attachment for attachment in @getAttachments() when attachment.id is attachmentId

  getAttachmentPieces: ->
    attachmentPieces = []
    @blockList.eachObject ({text}) ->
      attachmentPieces = attachmentPieces.concat(text.getAttachmentPieces())
    attachmentPieces

  getAttachments: ->
    piece.attachment for piece in @getAttachmentPieces()

  getRangeOfAttachment: (attachment) ->
    position = 0
    for {text}, index in @blockList.toArray()
      if textRange = text.getRangeOfAttachment(attachment)
        return normalizeRange([position + textRange[0], position + textRange[1]])
      position += text.getLength()
    return

  getLocationRangeOfAttachment: (attachment) ->
    range = @getRangeOfAttachment(attachment)
    @locationRangeFromRange(range)

  getAttachmentPieceForAttachment: (attachment) ->
    return piece for piece in @getAttachmentPieces() when piece.attachment is attachment

  findRangesForBlockAttribute: (attributeName) ->
    position = 0
    ranges = []

    for block in @getBlocks()
      length = block.getLength()
      if block.hasAttribute(attributeName)
        ranges.push([position, position + length])
      position += length

    ranges

  findRangesForTextAttribute: (attributeName, {withValue} = {}) ->
    position = 0
    range = []
    ranges = []

    match = (piece) ->
      if withValue?
        piece.getAttribute(attributeName) is withValue
      else
        piece.hasAttribute(attributeName)

    for piece in @getPieces()
      length = piece.getLength()
      if match(piece)
        if range[1] is position
          range[1] = position + length
        else
          ranges.push(range = [position, position + length])
      position += length

    ranges

  locationFromPosition: (position) ->
    location = @blockList.findIndexAndOffsetAtPosition(Math.max(0, position))
    if location.index?
      location
    else
      blocks = @getBlocks()
      index: blocks.length - 1, offset: blocks[blocks.length - 1].getLength()

  positionFromLocation: (location) ->
    @blockList.findPositionAtIndexAndOffset(location.index, location.offset)

  locationRangeFromPosition: (position) ->
    normalizeRange(@locationFromPosition(position))

  locationRangeFromRange: (range) ->
    return unless range = normalizeRange(range)
    [startPosition, endPosition] = range
    startLocation = @locationFromPosition(startPosition)
    endLocation = @locationFromPosition(endPosition)
    normalizeRange([startLocation, endLocation])

  rangeFromLocationRange: (locationRange) ->
    locationRange = normalizeRange(locationRange)
    leftPosition = @positionFromLocation(locationRange[0])
    rightPosition = @positionFromLocation(locationRange[1]) unless rangeIsCollapsed(locationRange)
    normalizeRange([leftPosition, rightPosition])

  isEqualTo: (document) ->
    @blockList.isEqualTo(document?.blockList)

  getTexts: ->
    block.text for block in @getBlocks()

  getPieces: ->
    pieces = []
    for text in @getTexts()
      pieces.push(text.getPieces()...)
    pieces

  getObjects: ->
    @getBlocks().concat(@getTexts()).concat(@getPieces())

  toSerializableDocument: ->
    blocks = []
    @blockList.eachObject (block) ->
      blocks.push(block.copyWithText(block.text.toSerializableText()))
    new @constructor blocks

  toString: ->
    @blockList.toString()

  toJSON: ->
    @blockList.toJSON()

  toConsole: ->
    JSON.stringify(JSON.parse(block.text.toConsole()) for block in @blockList.toArray())
