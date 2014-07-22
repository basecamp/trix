#= require trix/utilities/object

class Trix.Hash extends Trix.Object
  @fromCommonAttributesOfObjects: (objects = []) ->
    return new this unless objects.length
    hash = box(objects[0])
    keys = hash.getKeys()

    for object in objects[1..]
      keys = hash.getKeysCommonToHash(box(object))
      hash = hash.slice(keys)
    hash

  @box: (values) ->
    box(values)

  constructor: (@values = {}) ->
    super

  add: (key, value) ->
    @merge(object(key, value))

  remove: (key) ->
    new Trix.Hash copy(@values, key)

  get: (key) ->
    @values[key]

  has: (key) ->
    key of @values

  merge: (values) ->
    new Trix.Hash merge(@values, unbox(values))

  slice: (keys) ->
    values = {}
    values[key] = @values[key] for key in keys
    new Trix.Hash values

  getKeys: ->
    Object.keys(@values)

  getKeysCommonToHash: (hash) ->
    hash = box(hash)
    key for key in @getKeys() when @values[key] is hash.values[key]

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

  toJSON: ->
    @toObject()

  contentsForInspection: ->
    values: JSON.stringify(@values)

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
    if object instanceof Trix.Hash
      object
    else
      new Trix.Hash copy(object)

  unbox = (object) ->
    if object instanceof Trix.Hash
      object.values
    else
      object
