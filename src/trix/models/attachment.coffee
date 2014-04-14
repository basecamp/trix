id = 0

class Trix.Attachment
  @attachments: {}

  @get: (id) ->
    @attachments[id]

  @forFile: (file) ->
    attachment = new this {}, file

    if handler = @delegate?.onAdd
      callback = (attributes) =>
        attachment.setAttributes(attributes)

      unless handler(file, callback) is false
        attachment
    else
      attachment

  constructor: (@attributes = {}, @file) ->
    if @file
      @attributes.contentType ?= @file.type

  save: ->
    return this if @id
    @id = ++id
    @constructor.attachments[@id] = this
    this

  remove: ->
    delete @constructor.attachments[@id]
    @constructor.delegate?.onRemove?(@toJSON())

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
