id = 0

class Trix.Attachment
  @attachments: {}

  @get: (id) ->
    @attachments[id]

  @forFile: (file) ->
    contentType = file.type
    new this {contentType}, file

  constructor: (@attributes = {}, @file) ->
    @id = ++id
    @constructor.attachments[@id] = this

  remove: ->
    delete @constructor.attachments[@id]
    @constructor.delegate?.attachmentWasRemoved?(this)

  setAttributes: (attributes) ->
    for key, value of attributes
      @attributes[key] = value

    delete @file if @attributes.url

    @delegate?.attachmentDidChange(this)

  isPending: ->
    @file and not @attributes.url

  isImage: ->
    /image/.test(@attributes.contentType)

  toJSON: ->
    @attributes
