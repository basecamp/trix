#= require trix/models/block
#= require trix/models/splittable_list
#= require trix/models/location_range
#= require trix/models/html_parser

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

    @attachments = new Trix.Collection
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

  copy: ->
    new @constructor @blockList.toArray()

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

  insertDocumentAtLocationRange: edit "insertDocumentAtLocationRange", (document, locationRange) ->
    block = @getBlockAtIndex(locationRange.index)

    position = @blockList.findPositionAtIndexAndOffset(locationRange.index, locationRange.offset)
    position++ if locationRange.end.offset is block.getBlockBreakPosition()

    @removeTextAtLocationRange(locationRange)
    @blockList = @blockList.insertSplittableListAtPosition(document.blockList, position)

  replaceDocument: edit "replaceDocument", (document) ->
    @blockList = document.blockList.copy()

  insertTextAtLocationRange: edit "insertTextAtLocationRange", (text, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, locationRange.offset))

  removeTextAtLocationRange: edit "removeTextAtLocationRange", (locationRange) ->
    return if locationRange.isCollapsed()

    leftIndex = locationRange.start.index
    leftBlock = @getBlockAtIndex(leftIndex)
    leftText = leftBlock.text.getTextAtRange([0, locationRange.start.offset])

    rightIndex = locationRange.end.index
    rightBlock = @getBlockAtIndex(rightIndex)
    rightText = rightBlock.text.getTextAtRange([locationRange.end.offset, rightBlock.getLength()])

    text = leftText.appendText(rightText)
    block = leftBlock.copyWithText(text)
    blocks = @blockList.toArray()
    affectedBlockCount = rightIndex + 1 - leftIndex
    blocks.splice(leftIndex, affectedBlockCount, block)

    @blockList = new Trix.SplittableList blocks

  moveTextFromLocationRangeToPosition: edit "moveTextFromLocationRangeToPosition", (locationRange, position) ->
    range = @rangeFromLocationRange(locationRange)
    return if range[0] <= position <= range[1]

    document = @getDocumentAtLocationRange(locationRange)
    @removeTextAtLocationRange(locationRange)

    movingRightward = range[0] < position
    position -= document.getLength() if movingRightward

    unless @firstBlockInLocationRangeIsEntirelySelected(locationRange)
      [firstBlock, blocks...] = document.getBlocks()
      if blocks.length is 0
        text = firstBlock.getTextWithoutBlockBreak()
        position += 1 if movingRightward
      else
        text = firstBlock.text

      @insertTextAtLocationRange(text, @locationRangeFromPosition(position))
      return if blocks.length is 0

      document = new Trix.Document blocks
      position += text.getLength()

    @insertDocumentAtLocationRange(document, @locationRangeFromPosition(position))

  addAttributeAtLocationRange: edit "addAttributeAtLocationRange", (attribute, value, locationRange) ->
    @eachBlockAtLocationRange locationRange, (block, range, index) =>
      @blockList = @blockList.editObjectAtIndex index, ->
        if Trix.config.blockAttributes[attribute]
          block.addAttribute(attribute, value)
        else
          if range[0] isnt range[1]
            block.copyWithText(block.text.addAttributeAtRange(attribute, value, range))
          else
            block

  addAttribute: edit "addAttribute", (attribute, value) ->
    @eachBlock (block, index) =>
      @blockList = @blockList.editObjectAtIndex (index), ->
        block.addAttribute(attribute, value)

  removeAttributeAtLocationRange: edit "removeAttributeAtLocationRange", (attribute, locationRange) ->
    @eachBlockAtLocationRange locationRange, (block, range, index) =>
      if Trix.config.blockAttributes[attribute]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.removeAttribute(attribute)
      else if range[0] isnt range[1]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, range))

  updateAttributesForAttachment: edit "updateAttributesForAttachment", (attributes, attachment) ->
    locationRange = @getLocationRangeOfAttachment(attachment)
    text = @getTextAtIndex(locationRange.index)
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(text.updateAttributesForAttachment(attributes, attachment))

  insertBlockBreakAtLocationRange: edit "insertBlockBreakAtLocationRange", (locationRange) ->
    position = @blockList.findPositionAtIndexAndOffset(locationRange.index, locationRange.offset)
    @removeTextAtLocationRange(locationRange)
    blocks = [new Trix.Block] if locationRange.offset is 0
    @blockList = @blockList.insertSplittableListAtPosition(new Trix.SplittableList(blocks), position)

  applyBlockAttributeAtLocationRange: edit "applyBlockAttributeAtLocationRange", (attributeName, value, locationRange) ->
    locationRange = @expandLocationRangeToLineBreaksAndSplitBlocks(locationRange)
    if Trix.config.blockAttributes[attributeName].parentAttribute
      locationRange = @convertLineBreaksToBlockBreaksInLocationRange(locationRange)
    @addAttributeAtLocationRange(attributeName, value, locationRange)

  firstBlockInLocationRangeIsEntirelySelected: (locationRange) ->
    if locationRange.start.offset is 0 and locationRange.start.index < locationRange.end.index
      true
    else if locationRange.start.index is locationRange.end.index
      length = @getBlockAtIndex(locationRange.start.index).getLength()
      locationRange.start.offset is 0 and locationRange.end.offset is length
    else
      false

  expandLocationRangeToLineBreaksAndSplitBlocks: (locationRange) ->
    start = index: locationRange.start.index, offset: locationRange.start.offset
    end = index: locationRange.end.index, offset: locationRange.end.offset

    @edit =>
      startBlock = @getBlockAtIndex(start.index)
      if (start.offset = startBlock.findLineBreakInDirectionFromPosition("backward", start.offset))?
        @insertBlockBreakAtLocationRange(Trix.LocationRange.forLocationWithLength(start, 1))
        end.index += 1
        end.offset -= @getBlockAtIndex(start.index).getLength()
        start.index += 1
      start.offset = 0

      if end.offset is 0 and end.index > start.index
        end.index -= 1
        end.offset = @getBlockAtIndex(end.index).getBlockBreakPosition()
      else
        endBlock = @getBlockAtIndex(end.index)
        if endBlock.text.getStringAtRange([end.offset - 1, end.offset]) is "\n"
          end.offset -= 1
        else
          end.offset = endBlock.findLineBreakInDirectionFromPosition("forward", end.offset)
        unless end.offset is endBlock.getBlockBreakPosition()
          @insertBlockBreakAtLocationRange(Trix.LocationRange.forLocationWithLength(end, 1))

    new Trix.LocationRange start, end

  convertLineBreaksToBlockBreaksInLocationRange: (locationRange) ->
    string = @getStringAtLocationRange(locationRange).slice(0, -1)
    range = @rangeFromLocationRange(locationRange)
    position = range[0]

    @edit =>
      string.replace /.*?\n/g, (match) =>
        position += Trix.UTF16String.fromUCS2String(match).length
        locationRange = @locationRangeFromRange([position - 1, position])
        @insertBlockBreakAtLocationRange(locationRange)

    @locationRangeFromRange(range)

  getDocumentAtLocationRange: (locationRange) ->
    range = @rangeFromLocationRange(locationRange)
    blocks = @blockList.getSplittableListInRange(range).toArray()
    new @constructor blocks

  getStringAtLocationRange: (locationRange) ->
    @getDocumentAtLocationRange(locationRange).toString()

  getBlockAtIndex: (index) ->
    @blockList.getObjectAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  getLength: ->
    @blockList.getEndPosition()

  getBlocks: ->
    @blockList.toArray()

  eachBlock: (callback) ->
    @blockList.eachObject(callback)

  eachBlockAtLocationRange: (locationRange, callback) ->
    if locationRange.isInSingleIndex()
      block = @getBlockAtIndex(locationRange.index)
      textRange = [locationRange.start.offset, locationRange.end.offset]
      callback(block, textRange, locationRange.index)
    else
      locationRange.eachIndex (index) =>
        block = @getBlockAtIndex(index)

        textRange = switch index
          when locationRange.start.index
            [locationRange.start.offset, block.text.getLength()]
          when locationRange.end.index
            [0, locationRange.end.offset]
          else
            [0, block.text.getLength()]

        callback(block, textRange, index)

  getCommonAttributesAtLocationRange: (locationRange) ->
    if locationRange.isCollapsed()
      @getCommonAttributesAtLocation(locationRange.start)
    else
      textAttributes = []
      blockAttributes = []

      @eachBlockAtLocationRange locationRange, (block, textRange) ->
        unless textRange[0] is textRange[1]
          textAttributes.push(block.text.getCommonAttributesAtRange(textRange))
          blockAttributes.push(attributesForBlock(block))

      Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
        .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
        .toObject()

  getCommonAttributesAtLocation: ({index, offset}) ->
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

  getLocationRangeOfAttachment: (attachment) ->
    for {text}, index in @blockList.toArray()
      if range = text.getRangeOfAttachment(attachment)
        return new Trix.LocationRange {index, offset: range[0]}, {index, offset: range[1]}

  getAttachmentPieceForAttachment: (attachment) ->
    return piece for piece in @getAttachmentPieces() when piece.attachment is attachment

  rangeFromLocationRange: (locationRange) ->
    leftPosition = @blockList.findPositionAtIndexAndOffset(locationRange.start.index, locationRange.start.offset)
    rightPosition = @blockList.findPositionAtIndexAndOffset(locationRange.end.index, locationRange.end.offset) unless locationRange.isCollapsed()
    [leftPosition, rightPosition ? leftPosition]

  locationFromPosition: (position) ->
    location = @blockList.findIndexAndOffsetAtPosition(Math.max(0, position))
    if location.index?
      location
    else
      blocks = @getBlocks()
      index: blocks.length - 1, offset: blocks[blocks.length - 1].getLength()

  locationRangeFromPosition: (position) ->
    new Trix.LocationRange @locationFromPosition(position)

  locationRangeFromRange: ([start, end]) ->
    startLocation = @locationFromPosition(start)
    endLocation = @locationFromPosition(end)
    new Trix.LocationRange startLocation, endLocation

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
    object.delegate = this
    @delegate?.documentDidAddAttachment(this, object)

  collectionDidRemoveObject: (collection, object) ->
    delete object.delegate
    @delegate?.documentDidRemoveAttachment(this, object)

  # Attachment delegate

  attachmentDidChangeAttributes: (attachment) ->
    @delegate?.documentDidEditAttachment(this, attachment)

  # Private

  refresh: ->
    @refreshAttachments()

  refreshAttachments: ->
    @attachments.refresh(@getAttachments())
