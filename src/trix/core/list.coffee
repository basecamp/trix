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

  push: (itemsToAdd...) ->
    new @constructor @items.concat(itemsToAdd)

  pop: (itemsToRemove...) ->
    items = copy(@items)
    if itemsToRemove.length
      items.pop() for item in itemsToRemove when items[items.length - 1] is item
    else
      items.pop()
    new @constructor items

  getLast: ->
    @items[@items.length - 1]

  toArray: ->
    copy(@items)

  toObject: ->
    object = {}
    object[item] = true for item in @toArray()
    object

  copy = (array) ->
    array.slice(0)
