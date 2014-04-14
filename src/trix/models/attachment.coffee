id = 0

class Trix.Attachment
  @attachments: {}

  @get: (id) ->
    @attachments[id]

  @forFile: (file) ->
    attachment = new this {}, file
    attachment.dispatchAdd()

  constructor: (@attributes = {}, @file) ->
    @fileHandler = @constructor.delegate ? {}
    if @file
      @attributes.contentType ?= @file.type

  save: ->
    return this if @id
    @id = ++id
    @constructor.attachments[@id] = this
    this

  remove: ->
    delete @constructor.attachments[@id]
    @dispatchRemove()

  setAttributes: (attributes) =>
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

  # API

  dispatchAdd: ->
    this unless @fileHandler.onAdd?(@file, @setAttributes) is false

  dispatchRemove: ->
    @fileHandler.onRemove?(@toJSON())
