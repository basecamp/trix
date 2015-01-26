class Trix.Collection extends Trix.BasicObject
  constructor: (objects) ->
    @objects = {}
    @refresh(objects)

  get: (id) ->
    @objects[id]

  each: (callback) ->
    callback(object) for id, object of @objects

  has: (object) ->
    object.id of @objects

  add: (object) ->
    unless @has(object)
      @objects[object.id] = object
      @delegate?.collectionDidAddObject?(this, object)

  remove: (object) ->
    if @has(object)
      delete @objects[object.id]
      @delegate?.collectionDidRemoveObject?(this, object)
      object

  refresh: (newObjects = []) ->
    oldObjects = @toArray()
    @remove(object) for object in oldObjects when object not in newObjects
    @add(object) for object in newObjects

  toArray: ->
    object for id, object of @objects
