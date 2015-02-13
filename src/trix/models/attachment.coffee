class Trix.Attachment extends Trix.Object
  @constructorForContentType: (contentType) ->
    if /image/.test(contentType)
      Trix.ImageAttachment
    else
      Trix.Attachment

  @attachmentForFile: (file) ->
    attributes = @attributesForFile(file)
    attachment = @attachmentForAttributes(attributes)
    attachment.setFile(file)
    attachment

  @attachmentForAttributes: (attributes) ->
    contentType = Trix.Hash.box(attributes).get("contentType")
    constructor = @constructorForContentType(contentType)
    new constructor attributes

  @attributesForFile: (file) ->
    new Trix.Hash
      filename:    file.name
      filesize:    file.size
      contentType: file.type

  @fromJSON: (attachmentJSON) ->
    @attachmentForAttributes(attachmentJSON)

  constructor: (attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)
    @didChangeAttributes()

  getAttribute: (attribute) ->
    @attributes.get(attribute)

  hasAttribute: (attribute) ->
    @attributes.has(attribute)

  getAttributes: ->
    @attributes.toObject()

  setAttributes: (attributes = {}) ->
    newAttributes = @attributes.merge(attributes)
    unless @attributes.isEqualTo(newAttributes)
      @attributes = newAttributes
      @didChangeAttributes()
      @delegate?.attachmentDidChangeAttributes?(this)

  didChangeAttributes: ->

  isPending: ->
    @file? and not (@getURL() or @getHref())

  isImage: ->
    false

  getURL: ->
    @attributes.get("url")

  getHref: ->
    @attributes.get("href")

  getFilename: ->
    @attributes.get("filename") ? "Untitled"

  getFilesize: ->
    @attributes.get("filesize") ? 0

  getFormattedFilesize: ->
    filesize = @attributes.get("filesize")
    switch typeof filesize
      when "number" then Trix.config.fileSize.formatter(filesize)
      when "string" then filesize
      else ""

  getExtension: ->
    @getFilename().match(/\.(\w+)$/)?[1].toLowerCase()

  getContentType: ->
    @attributes.get("contentType")

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  getFile: ->
    @file

  setFile: (@file) ->

  releaseFile: ->
    delete @file

  getUploadProgress: ->
    @uploadProgress ? 0

  setUploadProgress: (value) ->
    unless @uploadProgress is value
      @uploadProgress = value
      @uploadProgressDelegate?.attachmentDidChangeUploadProgress?(this)

  toJSON: ->
    @getAttributes()

  getCacheKey: ->
    [super, @attributes.getCacheKey()].join("/")
