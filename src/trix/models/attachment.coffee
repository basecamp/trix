#= require trix/utilities/object

class Trix.Attachment extends Trix.Object
  @forFile: (file) ->
    attachment = new this { contentType: file.type, filename: file.name }
    attachment.file = file
    attachment

  constructor: (@attributes = {}) ->
    super

  setAttributes: (attributes) =>
    for key, value of attributes
      @attributes[key] = value

    delete @file if @attributes.url

    @delegate?.attachmentDidChange(this)

  getAttributes: ->
    @attributes

  isPending: ->
    @file and not @attributes.url

  isImage: ->
    /image/.test(@attributes.contentType)

  getExtension: ->
    @attributes.filename.match(/\.(\w+)$/)?[1]

  toJSON: ->
    @attributes

  toObject: ->
    {@id, @file, @attributes}
