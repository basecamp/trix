#= require trix/models/block
#= require trix/models/block_list

class Trix.Document
  @fromJSONString: (string) ->
    @fromJSON JSON.parse(string)

  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  @fromHTML: (html) ->
    Trix.HTMLParser.parse(html).getDocument()

  constructor: (blocks = []) ->
    @blockList = new Trix.BlockList blocks
    @blockList.delegate = this

  getBlockAtIndex: (index) ->
    @blockList.getBlockAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  eachBlock: (callback) ->
    callback(text, index) for text, index in @blockList.blocks

  eachBlockAtLocation: (location, callback) ->
    if location.isRangeWithinIndex()
      block = @getBlockAtIndex(location.index)
      callback(block, location.getPositionRange())
    else
      location.eachIndex (index) =>
        block = @getBlockAtIndex(index)

        range = switch index
          when location.start.index
            [location.start.position, block.text.getLength()]
          when location.end.index
            [0, location.end.position]
          else
            [0, block.text.getLength()]

        callback(block, range)

  insertTextAtLocation: (text, location) ->
    @removeTextAtLocation(location) if location.isRange()
    @getTextAtIndex(location.index).insertTextAtPosition(text, location.position)

  insertDocumentAtLocation: (document, location) ->
    @removeTextAtLocation(location) if location.isRange()
    @blockList.insertBlockListAtLocation(document.blockList, location)
    @delegate?.didEditDocument?(this)

  removeTextAtLocation: (location) ->
    textRuns = []
    @eachBlockAtLocation location, ({text}, range) ->
      textRuns.push({text, range})

    if textRuns.length is 1
      textRuns[0].text.removeTextAtRange(textRuns[0].range)
    else
      [first, ..., last] = textRuns

      last.text.removeTextAtRange([0, location.end.position])
      first.text.removeTextAtRange([location.start.position, first.text.getLength()])
      first.text.appendText(last.text)

      @blockList.removeText(text) for {text} in textRuns[1..]

    @delegate?.didEditDocument?(this)

  addAttributeAtLocation: (attribute, value, location) ->
    @eachBlockAtLocation location, (block, range) ->
      if Trix.attributes[attribute]?.block
        block.addAttribute(attribute, value)
      else
        unless range[0] is range[1]
          block.text.addAttributeAtRange(attribute, value, range)

  removeAttributeAtLocation: (attribute, location) ->
    @eachBlockAtLocation location, (block, range) ->
      if Trix.attributes[attribute]?.block
        block.removeAttribute(attribute)
      else
        unless range[0] is range[1]
          block.text.removeAttributeAtRange(attribute, range)

  replaceDocument: (document) ->
    @blockList.replaceBlockList(document.blockList)
    @delegate?.didEditDocument?(this)

  getCommonAttributesAtLocation: (location) ->
    textAttributes = []
    blockAttributes = []

    @eachBlockAtLocation location, (block, range) ->
      textAttributes.push(block.text.getCommonAttributesAtRange(range))
      blockAttributes.push(block.getAttributes())

    Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
      .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
      .toObject()

  getAttachments: ->
    attachments = []
    for {text} in @blockList.blocks
      attachments = attachments.concat(text.getAttachments())
    attachments

  getTextAndRangeOfAttachment: (attachment) ->
    for {text} in @blockList.blocks
      if range = text.getRangeOfAttachment(attachment)
        return {text, range}

  getAttachmentById: (id) ->
    for {text} in @blockList.blocks
      if attachment = text.getAttachmentById(id)
        return attachment

  # BlockList delegate

  didEditBlockList: (blockList) ->
    @delegate?.didEditDocument?(this)

  toJSON: ->
    @blockList.toJSON()

  asJSON: ->
    JSON.stringify(this)
