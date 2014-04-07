id = 0

class Trix.Attachment
  constructor: (@attributes) ->
    @id = @attributes.id ? ++id
    @attributes.id = @id

    if @attributes.file
      @attributes.mimeType = @attributes.file.type

  isImage: ->
    /image/.test(@attributes.mimeType) and @attributes.src

  toJSON: ->
    @attributes
