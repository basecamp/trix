#= require trix/operations/image_preload_operation
#= require trix/operations/document_preload_operation

class Trix.Attachment extends Trix.Object
  @previewablePattern: /^image(\/(gif|png|jpe?g)|$)/

  @attachmentForFile: (file) ->
    attributes = @attributesForFile(file)
    attachment = new this attributes
    attachment.setFile(file)
    attachment

  @attributesForFile: (file) ->
    new Trix.Hash
      filename:    file.name
      filesize:    file.size
      contentType: file.type

  @fromJSON: (attachmentJSON) ->
    new this attachmentJSON

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

  getType: ->
    if @hasContent()
      "content"
    else if @isPreviewable()
      "preview"
    else
      "file"

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
    if typeof filesize is "number"
      Trix.config.fileSize.formatter(filesize)
    else
      ""

  getExtension: ->
    @getFilename().match(/\.(\w+)$/)?[1].toLowerCase()

  getContentType: ->
    @attributes.get("contentType")

  hasContent: ->
    @attributes.has("content")

  getContent: ->
    @attributes.get("content")

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
    @file = null

  getUploadProgress: ->
    @uploadProgress ? 0

  setUploadProgress: (value) ->
    unless @uploadProgress is value
      @uploadProgress = value
      @uploadProgressDelegate?.attachmentDidChangeUploadProgress?(this)

  toJSON: ->
    attributes = @getAttributes()
    if @getContentType() == 'text/html' && @getURL()
      delete attributes.content

    attributes

  getCacheKey: (prependWith) ->
    parts = [super, @attributes.getCacheKey(), @getPreloadedURL()]
    parts.unshift(prependWith) if prependWith
    parts.join("/")

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
      @fileObjectURL = null

  preload: (url, callback) ->
    if url and url isnt @preloadedURL
      @preloadedURL ?= url
      if @getContentType() == 'text/html'
        operation = new Trix.DocumentPreloadOperation url
        operation.then (content) =>
          @setAttributes({content})
          @previewDelegate?.attachmentDidPreload?()
          callback?()
      else
        operation = new Trix.ImagePreloadOperation url
        operation.then ({width, height}) =>
          @preloadedURL = url
          @setAttributes({width, height})
          @previewDelegate?.attachmentDidPreload?()
          callback?()
