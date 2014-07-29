#= require trix/utilities/object

class Trix.Attachment extends Trix.Object
  constructor: (@file) ->
    super

  getPreviewURL: (callback) ->
    if @previewURL?
      callback(@previewURL)
    else if @file?
      reader = new FileReader
      reader.onload = (event) =>
        return unless @file?
        callback(@previewURL = event.target.result)
      reader.readAsDataURL(@file)

  toAttachmentForDocument: (@document) ->
    @getAttributes = ->
      @document.getAttachmentPieceForAttachment(this)?.getAttributes()

    @setAttributes = (attributes) ->
      if attributes.url?
        delete @file
        delete @previewURL
      @document.updateAttributesForAttachment(attributes, this)

    @remove = ->
      if range = @document.getLocationRangeOfAttachment(this)
        @document.removeTextAtLocationRange(range)

    this
