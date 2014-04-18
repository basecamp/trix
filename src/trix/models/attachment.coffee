id = 0

class Trix.Attachment
  modelName: "Attachment"

  @forFile: (file) ->
    attachment = new this { contentType: file.type }
    attachment.file = file
    attachment

  constructor: (@attributes = {}) ->
    @id = ++id

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
