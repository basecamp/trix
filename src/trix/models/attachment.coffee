id = 0

class Trix.Attachment
  @forFile: (file) ->
    contentType = file.type
    new this {contentType}, file

  constructor: (@attributes = {}, @file) ->
    @id = ++id

  isPending: ->
    @file and not @attributes.url

  isImage: ->
    /image/.test(@attributes.contentType)

  toJSON: ->
    @attributes
