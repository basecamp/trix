id = 0

class Trix.Attachment
  @forFile: (file) ->
    mimeType = file.type
    new this {mimeType}, file

  constructor: (@attributes = {}, @file) ->
    @id = ++id

  isImage: ->
    /image/.test(@attributes.mimeType) and @attributes.url

  toJSON: ->
    @attributes
