id = 0

class Trix.Attachment
  @forFile: (file) ->
    contentType = file.type
    new this {contentType}, file

  constructor: (@attributes = {}, @file) ->
    @id = ++id

  isImage: ->
    /image/.test(@attributes.contentType) and @attributes.url

  toJSON: ->
    @attributes
