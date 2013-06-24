class Trix.Document
  constructor: ->
    @objects = []
    @length = 0

  getText: (startPosition, endPosition = @objects.length - 1) ->
    objects = @objects.slice startPosition, endPosition + 1
    objects.join ""

  insertText: (text, position) ->
    for object, index in objectsFromText text
      @insertObject object, position + index

  insertObject: (object, position) ->
    if object?
      @objects.splice position, 0, object
      @length = @objects.length
      @delegate?.documentObjectInsertedAtPosition this, object, position

  deleteObject: (position) ->
    object = @objects[position]
    if object?
      @objects.splice position, 1
      @length = @objects.length
      @delegate?.documentObjectDeletedAtPosition this, object, position

  normalize = (text) ->
    text.replace /\r\n?/g, "\n"

  objectsFromText = (text) ->
    text = normalize text
    text.split ""
