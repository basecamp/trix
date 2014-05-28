class Trix.Attachment
  id = 0

  @forFile: (file) ->
    attachment = new this { contentType: file.type, filename: file.name }
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

  getExtension: ->
    @attributes.filename.match(/\.(\w+)$/)?[1]

  toJSON: ->
    {@id, @attributes}

  toObject: ->
    {@id, @file, @attributes}
