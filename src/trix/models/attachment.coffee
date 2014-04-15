id = 0

class Trix.Attachment
  @attachments: {}

  @get: (id) ->
    @attachments[id]

  @forFile: (file, {context} = {}) ->
    attachment = new this { contentType: file.type }
    attachment.file = file
    attachment.context = context
    if attachment.notifyHostDelegateOfFileAdded()
      attachment

  constructor: (@attributes = {}) ->

  save: ->
    return this if @id
    @id = ++id
    @constructor.attachments[@id] = this
    this

  remove: ->
    delete @constructor.attachments[@id]
    @notifyHostDelegate("fileRemoved", @toJSON())

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

  # Host delegate

  notifyHostDelegate: (message, args...) ->
    Trix.delegate?[message]?.apply(@context, args)

  notifyHostDelegateOfFileAdded: ->
    @notifyHostDelegate("fileAdded", @file, @setAttributes) isnt false
