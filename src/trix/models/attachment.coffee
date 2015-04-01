#= require trix/operations/image_preload_operation

class Trix.Attachment extends Trix.Object
  @previewablePattern: /^image(\/(gif|png|jpe?g)|$)/

  @attachmentForFile: (file) ->
    attributes = @attributesForFile(file)
    attachment = @attachmentForAttributes(attributes)
    attachment.setFile(file)
    attachment

  @attachmentForAttributes: (attributes) ->
    new this attributes

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
    if @isPreviewable()
      @preloadURL()

  isPending: ->
    @file? and not (@getURL() or @getHref())

  isPreviewable: ->
    @attributes.get("previewable") or @constructor.previewablePattern.test(@getContentType())

  getURL: ->
    @attributes.get("url")

  getHref: ->
    @attributes.get("href")

  getFilename: ->
    @attributes.get("filename") ? ""

  getFilesize: ->
    @attributes.get("filesize")

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
    if @isPreviewable()
      @createPreviewPreloadOperationForFile(@file)

  releaseFile: ->
    @releasePreviewPreload()
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

  # Previewable

  preloadURL: ->
    url = @getURL()
    if url? and not @preloadOperation
      @preloadOperation = new Trix.ImagePreloadOperation url
      @preloadOperation.then ({width, height}) =>
        @setAttributes({width, height})
        @releaseFile()

  createPreviewPreloadOperationForFile: (file) ->
    previewObjectURL = URL.createObjectURL(file)
    @previewPreloadOperation = new Trix.ImagePreloadOperation previewObjectURL
    @previewPreloadOperation.then ({width, height}) =>
      @setAttributes({width, height})

  releasePreviewPreload: ->
    if @previewPreloadOperation
      URL.revokeObjectURL(@previewPreloadOperation.url)
      @previewPreloadOperation.release()
      delete @previewPreloadOperation
