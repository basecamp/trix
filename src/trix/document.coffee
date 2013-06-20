class Trix.Document
  constructor: ->
    @objects = []
    @marks = {}
    @length = 0

  getText: (position, length) ->
    objects = @objects.slice position, position + length
    objects.join ""

  insertText: (text, position) ->
    for object, index in objectsFromText text
      @insertObject object, position + index

  insertObject: (object, position) ->
    @objects.splice position, 0, object
    @length = @objects.length
    @delegate?.documentObjectInsertedAtPosition this, object, position

  deleteObject: (position) ->
    object = @objects[position]
    @objects.splice position, 1
    @length = @objects.length
    @delegate?.documentObjectDeletedAtPosition this, object, position

  normalize = (text) ->
    text.replace /\r\n?/g, "\n"

  objectsFromText = (text) ->
    text = normalize text
    text.split ""
