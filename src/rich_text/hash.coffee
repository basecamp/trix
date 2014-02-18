class RichText.Hash
  @box: (values) ->
    box(values)

  constructor: (@values = {}) ->

  add: (key, value) ->
    @merge(object(key, value))

  remove: (key) ->
    new RichText.Hash copy(@values, key)

  merge: (values) ->
    new RichText.Hash merge(@values, unbox(values))

  isEqualTo: (values) ->
    thisArray = @toArray()
    thatArray = box(values).toArray()
    return false unless thisArray.length is thatArray.length
    for value, index in thisArray
      return false unless value is thatArray[index]
    true

  toArray: ->
    (@array ?= (
      result = []
      keys = (key for key of @values).sort()
      result.push key, @values[key] for key in keys
      result
    )).slice(0)

  toObject: ->
    copy(@values)

  inspect: ->
    JSON.stringify(@values)

  object = (key, value) ->
    result = {}
    result[key] = value
    result

  merge = (object, values) ->
    result = copy(object)
    for key, value of values
      result[key] = value
    result

  copy = (object, keyToRemove) ->
    result = {}
    for key, value of object when key isnt keyToRemove
      result[key] = value
    result

  box = (object) ->
    if object instanceof RichText.Hash
      object
    else
      new RichText.Hash object

  unbox = (object) ->
    if object instanceof RichText.Hash
      object.values
    else
      object
