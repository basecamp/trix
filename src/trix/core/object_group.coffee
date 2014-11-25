class Trix.ObjectGroup
  constructor: (@objects = []) ->

  canAddObject: (object) ->
    if object.canBeGrouped?()
      if @objects.length is 0
        true
      else
        @objects[@objects.length - 1].canBeGroupedWith(object)

  addObject: (object) ->
    @objects.push(object)

  getObjects: ->
    @objects

  toKey: ->
    keys = ["objectGroup"]
    keys.push(object.toKey()) for object in @getObjects()
    keys.join("/")
