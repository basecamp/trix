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
    @depths = [@depth]

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
    objects = @groupObjects()
    if not (objects.length is 1 and objects[0] instanceof @constructor and objects[0].getObjects().length is @getObjects().length)
      @objects = objects
    else
      @depths.push(@depth + 1)

  getDepths: ->
    @depths

  groupObjects: ->
    @constructor.groupObjects(@objects, @depth + 1)

  getCacheKey: ->
    keys = ["objectGroup"]
    keys.push(object.getCacheKey()) for object in @getObjects()
    keys.join("/")
