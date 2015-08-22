#= require trix/models/block
#= require trix/models/splittable_list
#= require trix/models/html_parser

{arraysAreEqual, normalizeRange, rangeIsCollapsed} = Trix

editOperationLog = Trix.Logger.get("editOperations")

class Trix.Document extends Trix.Object
  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  @fromHTML: (html) ->
    Trix.HTMLParser.parse(html).getDocument()

  @fromString: (string, textAttributes) ->
    text = Trix.Text.textForStringWithAttributes(string, textAttributes)
    new this [new Trix.Block text]

  constructor: (blocks = []) ->
    super
    @editDepth = 0
    @editCount = 0

    @blockList = new Trix.SplittableList blocks
    @ensureDocumentHasBlock()

    @attachments = new Trix.Set
    @attachments.delegate = this

    @refresh()

  ensureDocumentHasBlock: ->
    if @blockList.length is 0
      @blockList = new Trix.SplittableList [new Trix.Block]

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

  edit = (name, fn) -> ->
    @beginEditing()
    fn.apply(this, arguments)
    @ensureDocumentHasBlock()

    editOperationLog.group(name)
    editOperationLog.log(format(object)...) for object in arguments
    editOperationLog.groupEnd()

    @endEditing()

  format = (object) ->
    if (value = object?.toConsole?())?
      ["%o%c%s%c", object, "color: #888", value, "color: auto"]
    else if typeof object is "string"
      ["%s", object]
    else
      ["%o", object]

  edit: edit "edit", (fn) -> fn()

  beginEditing: ->
    if @editDepth++ is 0
      @editCount++

      editOperationLog.group("Document #{@id}: Edit operation #{@editCount}")
      editOperationLog.groupCollapsed("Backtrace")
      editOperationLog.trace()
      editOperationLog.groupEnd()

    this

  endEditing: ->
    if --@editDepth is 0
      @refresh()
      @delegate?.didEditDocument?(this)

      editOperationLog.groupEnd()

    this

  insertDocumentAtPositionRange: edit "insertDocumentAtPositionRange", (document, positionRange) ->
    [position] = positionRange = normalizeRange(positionRange)
    {index, offset} = @locationFromPosition(position)

    block = @getBlockAtPosition(position)

    if rangeIsCollapsed(positionRange) and block.isEmpty() and not block.hasAttributes()
      @blockList = @blockList.removeObjectAtIndex(index)
    else if block.getBlockBreakPosition() is offset
      position++

    @removeTextAtPositionRange(positionRange)
    @blockList = @blockList.insertSplittableListAtPosition(document.blockList, position)

  mergeDocumentAtPositionRange: edit "mergeDocumentAtPositionRange", (document, positionRange) ->
    [startPosition] = positionRange = normalizeRange(positionRange)
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
      @insertTextAtPositionRange(firstText, positionRange)

      if blockCount > 1
        formattedDocument = new @constructor formattedDocument.getBlocks().slice(1)
        position = startPosition + firstText.getLength()
        @insertDocumentAtPositionRange(formattedDocument, position)
    else
      @insertDocumentAtPositionRange(formattedDocument, positionRange)

  replaceDocument: edit "replaceDocument", (document) ->
    @blockList = document.blockList.copy()

  insertTextAtPositionRange: edit "insertTextAtPositionRange", (text, positionRange) ->
    [startPosition] = positionRange = normalizeRange(positionRange)
    {index, offset} = @locationFromPosition(startPosition)

    @removeTextAtPositionRange(positionRange)
    @blockList = @blockList.editObjectAtIndex index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, offset))

  removeTextAtPositionRange: edit "removeTextAtPositionRange", (positionRange) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
    return if rangeIsCollapsed(positionRange)

    leftLocation = @locationFromPosition(startPosition)
    leftIndex = leftLocation.index
    leftBlock = @getBlockAtIndex(leftIndex)
    leftText = leftBlock.text.getTextAtRange([0, leftLocation.offset])

    rightLocation = @locationFromPosition(endPosition)
    rightIndex = rightLocation.index
    rightBlock = @getBlockAtIndex(rightIndex)
    rightText = rightBlock.text.getTextAtRange([rightLocation.offset, rightBlock.getLength()])

    text = leftText.appendText(rightText)

    removingLeftBlock = leftIndex isnt rightIndex and leftLocation.offset is 0
    useRightBlock = removingLeftBlock and leftBlock.getAttributeLevel() >= rightBlock.getAttributeLevel()

    if useRightBlock
      block = rightBlock.copyWithText(text)
    else
      block = leftBlock.copyWithText(text)

    blocks = @blockList.toArray()
    affectedBlockCount = rightIndex + 1 - leftIndex
    blocks.splice(leftIndex, affectedBlockCount, block)

    @blockList = new Trix.SplittableList blocks

  moveTextFromPositionRangeToPosition: edit "moveTextFromPositionRangeToPosition", (positionRange, position) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
    return if startPosition <= position <= endPosition

    document = @getDocumentAtPositionRange(positionRange)
    @removeTextAtPositionRange(positionRange)

    movingRightward = startPosition < position
    position -= document.getLength() if movingRightward

    unless @firstBlockInPositionRangeIsEntirelySelected(positionRange)
      [firstBlock, blocks...] = document.getBlocks()
      if blocks.length is 0
        text = firstBlock.getTextWithoutBlockBreak()
        position += 1 if movingRightward
      else
        text = firstBlock.text

      @insertTextAtPositionRange(text, position)
      return if blocks.length is 0

      document = new Trix.Document blocks
      position += text.getLength()

    @insertDocumentAtPositionRange(document, position)

  addAttributeAtPositionRange: edit "addAttributeAtPositionRange", (attribute, value, positionRange) ->
    @eachBlockAtPositionRange positionRange, (block, textRange, index) =>
      @blockList = @blockList.editObjectAtIndex index, ->
        if Trix.config.blockAttributes[attribute]
          block.addAttribute(attribute, value)
        else
          if textRange[0] is textRange[1]
            block
          else
            block.copyWithText(block.text.addAttributeAtRange(attribute, value, textRange))

  addAttribute: edit "addAttribute", (attribute, value) ->
    @eachBlock (block, index) =>
      @blockList = @blockList.editObjectAtIndex (index), ->
        block.addAttribute(attribute, value)

  removeAttributeAtPositionRange: edit "removeAttributeAtPositionRange", (attribute, positionRange) ->
    @eachBlockAtPositionRange positionRange, (block, textRange, index) =>
      if Trix.config.blockAttributes[attribute]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.removeAttribute(attribute)
      else if textRange[0] isnt textRange[1]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, textRange))

  updateAttributesForAttachment: edit "updateAttributesForAttachment", (attributes, attachment) ->
    [startPosition] = positionRange = @getPositionRangeOfAttachment(attachment)
    {index} = @locationFromPosition(startPosition)
    text = @getTextAtIndex(index)

    @blockList = @blockList.editObjectAtIndex index, (block) ->
      block.copyWithText(text.updateAttributesForAttachment(attributes, attachment))

  removeAttributeForAttachment: edit "removeAttributeForAttachment", (attribute, attachment) ->
    positionRange = @getPositionRangeOfAttachment(attachment)
    @removeAttributeAtPositionRange(attribute, positionRange)

  insertBlockBreakAtPositionRange: edit "insertBlockBreakAtPositionRange", (positionRange) ->
    [startPosition] = positionRange = normalizeRange(positionRange)
    {offset} = @locationFromPosition(startPosition)

    @removeTextAtPositionRange(positionRange)
    blocks = [new Trix.Block] if offset is 0
    @blockList = @blockList.insertSplittableListAtPosition(new Trix.SplittableList(blocks), startPosition)

  applyBlockAttributeAtPositionRange: edit "applyBlockAttributeAtPositionRange", (attributeName, value, positionRange) ->
    positionRange = @expandPositionRangeToLineBreaksAndSplitBlocks(positionRange)

    if Trix.config.blockAttributes[attributeName].listAttribute
      @removeLastListAttributeAtPositionRange(positionRange, exceptAttributeName: attributeName)
      positionRange = @convertLineBreaksToBlockBreaksInPositionRange(positionRange)
    else
      positionRange = @consolidateBlocksAtPositionRange(positionRange)

    @addAttributeAtPositionRange(attributeName, value, positionRange)

  removeLastListAttributeAtPositionRange: edit "removeLastListAttributeAtPositionRange", (positionRange, options = {}) ->
    @eachBlockAtPositionRange positionRange, (block, textRange, index) =>
      return unless lastAttributeName = block.getLastAttribute()
      return unless Trix.config.blockAttributes[lastAttributeName].listAttribute
      return if lastAttributeName is options.exceptAttributeName
      @blockList = @blockList.editObjectAtIndex index, ->
        block.removeAttribute(lastAttributeName)

  firstBlockInPositionRangeIsEntirelySelected: (positionRange) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
    leftLocation = @locationFromPosition(startPosition)
    rightLocation = @locationFromPosition(endPosition)

    if leftLocation.offset is 0 and leftLocation.index < rightLocation.index
      true
    else if leftLocation.index is rightLocation.index
      length = @getBlockAtIndex(leftLocation.index).getLength()
      leftLocation.offset is 0 and rightLocation.offset is length
    else
      false

  expandPositionRangeToLineBreaksAndSplitBlocks: (positionRange) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
    startLocation = @locationFromPosition(startPosition)
    endLocation = @locationFromPosition(endPosition)

    @edit =>
      startBlock = @getBlockAtIndex(startLocation.index)
      if (startLocation.offset = startBlock.findLineBreakInDirectionFromPosition("backward", startLocation.offset))?
        position = @positionFromLocation(startLocation)
        @insertBlockBreakAtPositionRange([position, position + 1])
        endLocation.index += 1
        endLocation.offset -= @getBlockAtIndex(startLocation.index).getLength()
        startLocation.index += 1
      startLocation.offset = 0

      if endLocation.offset is 0 and endLocation.index > startLocation.index
        endLocation.index -= 1
        endLocation.offset = @getBlockAtIndex(endLocation.index).getBlockBreakPosition()
      else
        endBlock = @getBlockAtIndex(endLocation.index)
        if endBlock.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) is "\n"
          endLocation.offset -= 1
        else
          endLocation.offset = endBlock.findLineBreakInDirectionFromPosition("forward", endLocation.offset)
        unless endLocation.offset is endBlock.getBlockBreakPosition()
          position = @positionFromLocation(endLocation)
          @insertBlockBreakAtPositionRange([position, position + 1])

    startPosition = @positionFromLocation(startLocation)
    endPosition = @positionFromLocation(endLocation)
    normalizeRange([startPosition, endPosition])

  convertLineBreaksToBlockBreaksInPositionRange: (positionRange) ->
    [position] = positionRange = normalizeRange(positionRange)
    string = @getStringAtPositionRange(positionRange).slice(0, -1)

    @edit =>
      string.replace /.*?\n/g, (match) =>
        position += match.length
        @insertBlockBreakAtPositionRange([position - 1, position])

    positionRange

  consolidateBlocksAtPositionRange: (positionRange) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
    @edit =>
      startIndex = @locationFromPosition(startPosition).index
      endIndex = @locationFromPosition(endPosition).index
      @blockList = @blockList.consolidateFromIndexToIndex(startIndex, endIndex)
    positionRange

  getDocumentAtPositionRange: (positionRange) ->
    positionRange = normalizeRange(positionRange)
    blocks = @blockList.getSplittableListInRange(positionRange).toArray()
    new @constructor blocks

  getStringAtPositionRange: (positionRange) ->
    @getDocumentAtPositionRange(positionRange).toString()

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
    @getTextAtIndex(index).getPieceAtPosition(position)

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

  eachBlockAtPositionRange: (positionRange, callback) ->
    [startPosition, endPosition] = positionRange = normalizeRange(positionRange)
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

  getCommonAttributesAtPositionRange: (positionRange) ->
    [startPosition] = positionRange = normalizeRange(positionRange)
    if rangeIsCollapsed(positionRange)
      @getCommonAttributesAtPosition(startPosition)
    else
      textAttributes = []
      blockAttributes = []

      @eachBlockAtPositionRange positionRange, (block, textRange) ->
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

  getPositionRangeOfCommonAttributeAtPosition: (attributeName, position) ->
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
    @attachments.get(attachmentId)

  getAttachmentPieces: ->
    attachmentPieces = []
    @blockList.eachObject ({text}) ->
      attachmentPieces = attachmentPieces.concat(text.getAttachmentPieces())
    attachmentPieces

  getAttachments: ->
    piece.attachment for piece in @getAttachmentPieces()

  getPositionRangeOfAttachment: (attachment) ->
    position = 0
    for {text}, index in @blockList.toArray()
      if textRange = text.getRangeOfAttachment(attachment)
        return normalizeRange([position + textRange[0], position + textRange[1]])
      position += text.getLength()
    return

  getAttachmentPieceForAttachment: (attachment) ->
    return piece for piece in @getAttachmentPieces() when piece.attachment is attachment

  rangeFromLocationRange: (locationRange) ->
    locationRange = normalizeRange(locationRange)
    leftPosition = @positionFromLocation(locationRange[0])
    rightPosition = @positionFromLocation(locationRange[1]) unless rangeIsCollapsed(locationRange)
    [leftPosition, rightPosition ? leftPosition]

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

  locationRangeFromRange: ([start, end]) ->
    startLocation = @locationFromPosition(start)
    endLocation = @locationFromPosition(end)
    normalizeRange([startLocation, endLocation])

  locationRangeFromPositionRange: (positionRange) ->
    return unless positionRange = normalizeRange(positionRange)
    [startPosition, endPosition] = positionRange
    startLocation = @locationFromPosition(startPosition)
    endLocation = @locationFromPosition(endPosition)
    normalizeRange([startLocation, endLocation])

  positionRangeFromLocationRange: (locationRange) ->
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

  # Attachments collection delegate

  collectionDidAddObject: (collection, object) ->
    object.delegate ?= this
    @delegate?.documentDidAddAttachment(this, object)

  collectionDidRemoveObject: (collection, object) ->
    delete object.delegate if object.delegate is this
    @delegate?.documentDidRemoveAttachment(this, object)

  # Attachment delegate

  attachmentDidChangeAttributes: (attachment) ->
    @delegate?.documentDidEditAttachment(this, attachment)

  # Private

  refresh: ->
    @refreshAttachments()

  refreshAttachments: ->
    @attachments.refresh(@getAttachments())
