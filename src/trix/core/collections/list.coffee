{arraysAreEqual} = Trix

class Trix.List extends Trix.Object
  @box: (object) ->
    box(object)

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

  isEqualTo: (items) ->
    super or arraysAreEqual(@items, box(items).items)

  copy = (array) ->
    array.slice(0)

  box = (object) ->
    if object instanceof Trix.List
      object
    else if Array.isArray(object)
      new Trix.List object
    else
      new Trix.List (key for key, value of object when value)
