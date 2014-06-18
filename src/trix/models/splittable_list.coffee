#= require trix/utilities/object

class Trix.SplittableList extends Trix.Object
  constructor: (objects = []) ->
    super
    @objects = objects.slice(0)

  copy: ->
    new @constructor @objects

  eachObject: (callback) ->
    callback(object, index) for object, index in @objects

  insertObjectAtIndex: (object, index) ->
    objects = @objects.slice(0)
    objects.splice(index, 0, object)
    new @constructor objects

  insertSplittableListAtIndex: (splittableList, index) ->
    objects = @objects.slice(0)
    objects.splice(index, 0, splittableList.objects...)
    new @constructor objects

  insertSplittableListAtPosition: (splittableList, position) ->
    [objects, index] = @splitObjectAtPosition(position)
    new @constructor(objects).insertSplittableListAtIndex(splittableList, index)

  editObjectAtIndex: (index, callback) ->
    @replaceObjectAtIndex(callback(@objects[index]), index)

  replaceObjectAtIndex: (object, index) ->
    objects = @objects.slice(0)
    objects.splice(index, 1, object)
    new @constructor objects

  removeObjectAtIndex: (index) ->
    objects = @objects.slice(0)
    objects.splice(index, 1)
    new @constructor objects

  getObjectAtIndex: (index) ->
    @objects[index]

  getSplittableListInRange: (range) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    new @constructor objects.slice(leftIndex, rightIndex + 1)

  removeObjectsInRange: (range) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    objects.splice(leftIndex, rightIndex - leftIndex + 1)
    new @constructor objects

  transformObjectsInRange: (range, transform) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    transformedObjects = for object, index in objects
      if leftIndex <= index <= rightIndex
        transform(object)
      else
        object
    new @constructor transformedObjects

  splitObjectsAtRange: (range) ->
    [objects, leftInnerIndex] = @splitObjectAtPosition(startOfRange(range))
    [objects, rightOuterIndex] = new @constructor(objects).splitObjectAtPosition(endOfRange(range))
    [objects, leftInnerIndex, rightOuterIndex - 1]

  getObjectAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    @objects[index]

  splitObjectAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    objects = @objects.slice(0)
    result = if index?
      if offset is 0
        index
      else
        object = @getObjectAtIndex(index)
        [leftObject, rightObject] = object.splitAtOffset(offset)
        objects.splice(index, 1, leftObject, rightObject)
        index + 1
    else
      objects.length

    [objects, result]

  consolidate: ->
    objects = []
    pendingObject = @objects[0]

    for object in @objects[1..]
      if pendingObject.canBeConsolidatedWith?(object)
        pendingObject = pendingObject.consolidateWith(object)
      else
        objects.push(pendingObject)
        pendingObject = object

    if pendingObject?
      objects.push(pendingObject)

    new @constructor objects

  findIndexAndOffsetAtPosition: (position) ->
    currentPosition = 0
    for object, index in @objects
      nextPosition = currentPosition + object.getLength()
      if currentPosition <= position < nextPosition
        return index: index, offset: position - currentPosition
      currentPosition = nextPosition
    index: null, offset: null

  findPositionAtIndexAndOffset: (index, offset) ->
    position = 0
    for object, currentIndex in @objects
      if currentIndex < index
        position += object.getLength()
      else if currentIndex is index
        position += offset
        break
    position

  getLength: ->
    length = 0
    length += object.getLength() for object in @objects
    length

  toString: ->
    @objects.join("")

  toArray: ->
    @objects.slice(0)

  toJSON: ->
    @toArray()

  isEqualTo: (splittableList) ->
    super or objectArraysAreEqual(@objects, splittableList?.objects)

  objectArraysAreEqual = (left, right = []) ->
    return false unless left.length is right.length
    result = true
    result = false for object, index in left when result and not object.isEqualTo(right[index])
    result

  contentsForInspection: ->
    objects: "[#{(object.inspect() for object in @objects).join(", ")}]"

  startOfRange = (range) ->
    range[0]

  endOfRange = (range) ->
    range[1]
