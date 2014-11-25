class Trix.ObjectGroup
  @groupObjects: (ungroupedObjects = []) ->
    objects = []
    for object in ungroupedObjects
      if objectGroup
        if objectGroup.canAddObject(object)
          objectGroup.addObject(object)
          continue
        else
          objects.push(objectGroup)
          objectGroup = null

      if object.canBeGrouped?()
        objectGroup = new this [object]
      else
        objects.push(object)

    if objectGroup
      objects.push(objectGroup)
    objects

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

  getCacheKey: ->
    keys = ["objectGroup"]
    keys.push(object.getCacheKey()) for object in @getObjects()
    keys.join("/")
