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

  add: (item) ->
    new @constructor @items.concat(item)

  remove: (item) ->
    items = copy(@items)
    items.splice(items.lastIndexOf(item), 1)
    new @constructor items

  toArray: ->
    copy(@items)

  toObject: ->
    object = {}
    object[item] = true for item in @toArray()
    object

  copy = (array) ->
    array.slice(0)
