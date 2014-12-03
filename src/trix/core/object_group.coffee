class Trix.ObjectGroup
  @groupObjects: (ungroupedObjects = [], depth = 0) ->
    objects = []
    for object in ungroupedObjects
      if objectGroup
        if objectGroup.canAddObject(object)
          objectGroup.addObject(object)
          continue
        else
          objectGroup.finalize()
          objects.push(objectGroup)
          objectGroup = null

      if object.canBeGrouped?(depth)
        objectGroup = new this [object], depth
      else
        objects.push(object)

    if objectGroup
      objectGroup.finalize()
      objects.push(objectGroup)
    objects

  constructor: (@objects = [], @depth = 0) ->

  canAddObject: (object) ->
    if object.canBeGrouped?(@depth)
      if @objects.length is 0
        true
      else
        @objects[@objects.length - 1].canBeGroupedWith(object, @depth)

  addObject: (object) ->
    @objects.push(object)

  getObjects: ->
    @objects

  finalize: ->
    if @objects.length > 1
      @objects = @groupObjects()

  groupObjects: ->
    @constructor.groupObjects(@objects, @depth + 1)

  getCacheKey: ->
    keys = ["objectGroup"]
    keys.push(object.getCacheKey()) for object in @getObjects()
    keys.join("/")
