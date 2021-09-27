import BasicObject from "trix/core/basic_object"

export default class ObjectMap extends BasicObject
  constructor: (objects = []) ->
    super(arguments...)
    @objects = {}
    for object in objects
      hash = JSON.stringify(object)
      @objects[hash] ?= object

  find: (object) ->
    hash = JSON.stringify(object)
    @objects[hash]
