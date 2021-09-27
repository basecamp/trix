import Trix from "trix/global"
import TrixObject from "trix/core/object" # Don't override window.Object
import { arraysAreEqual } from "trix/core/helpers"


export default class Hash extends TrixObject
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

  constructor: (values = {}) ->
    super(arguments...)
    @values = copy(values)

  add: (key, value) ->
    @merge(object(key, value))

  remove: (key) ->
    new Hash copy(@values, key)

  get: (key) ->
    @values[key]

  has: (key) ->
    key of @values

  merge: (values) ->
    new Hash merge(@values, unbox(values))

  slice: (keys) ->
    values = {}
    values[key] = @values[key] for key in keys when @has(key)
    new Hash values

  getKeys: ->
    Object.keys(@values)

  getKeysCommonToHash: (hash) ->
    hash = box(hash)
    key for key in @getKeys() when @values[key] is hash.values[key]

  isEqualTo: (values) ->
    arraysAreEqual(@toArray(), box(values).toArray())

  isEmpty: ->
    @getKeys().length is 0

  toArray: ->
    (@array ?= (
      result = []
      result.push(key, value) for key, value of @values
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
    sortedKeys = Object.keys(object).sort()
    for key in sortedKeys when key isnt keyToRemove
      result[key] = object[key]
    result

  box = (object) ->
    if object instanceof Hash
      object
    else
      new Hash object

  unbox = (object) ->
    if object instanceof Hash
      object.values
    else
      object
