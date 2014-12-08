class Trix.List extends Trix.Object
  @box: (object) ->
    if object instanceof this
      object
    else if Array.isArray(object)
      new this object
    else
      new this (key for key, value of object when value)

  constructor: (items = []) ->
    @items = copy(items)
    @length = @items.length
    super

  add: (items...) ->
    new @constructor @items.concat(items)

  remove: (items...) ->
    newItems = copy(@items)
    for item in items
      newItems.splice(newItems.lastIndexOf(item), 1)
    new @constructor newItems

  toArray: ->
    copy(@items)

  toObject: ->
    object = {}
    object[item] = true for item in @toArray()
    object

  copy = (array) ->
    array.slice(0)
