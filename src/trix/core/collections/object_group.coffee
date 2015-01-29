class Trix.ObjectGroup
  @groupObjects: (ungroupedObjects = [], {depth, asTree} = {}) ->
    depth ?= 0 if asTree
    objects = []
    for object in ungroupedObjects
      if group
        if object.canBeGrouped?(depth) and group[group.length - 1].canBeGroupedWith?(object, depth)
          group.push(object)
          continue
        else
          objects.push(new this group, {depth, asTree})
          group = null

      if object.canBeGrouped?(depth)
        group = [object]
      else
        objects.push(object)

    if group
      objects.push(new this group, {depth, asTree})
    objects

  constructor: (@objects = [], {depth, asTree}) ->
    if asTree
      @depth = depth
      @objects = @constructor.groupObjects(@objects, {asTree, depth: @depth + 1})

  getObjects: ->
    @objects

  getDepth: ->
    @depth

  getCacheKey: ->
    keys = ["objectGroup"]
    keys.push(object.getCacheKey()) for object in @getObjects()
    keys.join("/")
