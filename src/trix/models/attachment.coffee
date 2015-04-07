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
    if @attributes.has("previewable")
      @attributes.get("previewable")
    else
      @constructor.previewablePattern.test(@getContentType())

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
      @preloadFile()

  releaseFile: =>
    @releasePreloadedFile()
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

  getPreloadedURL: ->
    @preloadedURL

  preloadURL: ->
    @preload(@getURL(), @releaseFile)

  preloadFile: ->
    if @file
      @fileObjectURL = URL.createObjectURL(@file)
      @preload(@fileObjectURL)

  releasePreloadedFile: ->
    if @fileObjectURL
      URL.revokeObjectURL(@fileObjectURL)
      delete @fileObjectURL

  preload: (url, callback) ->
    if url and url isnt @preloadedURL
      @preloadedURL ?= url
      operation = new Trix.ImagePreloadOperation url
      operation.then ({width, height}) =>
        @preloadedURL = url
        @setAttributes({width, height})
        @previewDelegate?.attachmentDidPreload?()
        callback?()
