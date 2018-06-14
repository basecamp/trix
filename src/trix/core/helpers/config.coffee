allAttributeNames = null
blockAttributeNames = null
textAttributeNames = null
listAttributeNames = null

Trix.extend
  getAllAttributeNames: ->
    allAttributeNames ?= Trix.getTextAttributeNames().concat Trix.getBlockAttributeNames()

  getBlockConfig: (attributeName) ->
    Trix.config.blockAttributes[attributeName]

  getBlockAttributeNames: ->
    blockAttributeNames ?= Object.keys(Trix.config.blockAttributes)

  getTextConfig: (attributeName) ->
    Trix.config.textAttributes[attributeName]

  getTextAttributeNames: ->
    textAttributeNames ?= Object.keys(Trix.config.textAttributes)

  getListAttributeNames: ->
    listAttributeNames ?= (listAttribute for key, {listAttribute} of Trix.config.blockAttributes when listAttribute?)

  getAttachmentGroupTypes: ->
    for type, config of Trix.config.attachments when config.group
      "attachment:#{type}"

  getGroupTypeForAttachment: (attachment) ->
    type = attachment.getType()
    if Trix.config.attachments[type]?.group
      "attachment:#{type}"
