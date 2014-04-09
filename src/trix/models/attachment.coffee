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

  update: (attributes) ->
    for key, value of attributes
      @attributes[key] = value

  isPending: ->
    @file and not @attributes.url

  isImage: ->
    /image/.test(@attributes.contentType)

  toJSON: ->
    @attributes
