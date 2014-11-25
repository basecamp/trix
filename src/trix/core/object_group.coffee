class Trix.ObjectGroup
  constructor: (@objects) ->

  getObjects: ->
    @objects

  toKey: ->
    keys = ["objectGroup"]
    keys.push(object.toKey()) for object in @getObjects()
    keys.join("/")
