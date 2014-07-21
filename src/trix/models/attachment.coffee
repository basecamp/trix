#= require trix/utilities/object

class Trix.Attachment extends Trix.Object
  @forFile: (file) ->
    attachment = new this { contentType: file.type, filename: file.name }
    attachment.file = file
    attachment

  constructor: (@attributes = {}) ->
    super

  setAttributes: (attributes) =>
    changed = false

    for key, value of attributes
      if @attributes[key] isnt value
        @attributes[key] = value
        changed = true

    if @attributes.url and @file?
      delete @file
      changed = true

    if changed
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
