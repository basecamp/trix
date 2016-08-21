{spliceArray} = Trix

class Trix.SplittableList extends Trix.Object
  @box: (objects) ->
    if objects instanceof this
      objects
    else
      new this objects

  constructor: (objects = []) ->
    super
    @objects = objects.slice(0)
    @length = @objects.length

  indexOf: (object) ->
    @objects.indexOf(object)

  splice: (args...) ->
    new @constructor spliceArray(@objects, args...)

  eachObject: (callback) ->
    callback(object, index) for object, index in @objects

  insertObjectAtIndex: (object, index) ->
    @splice(index, 0, object)

  insertSplittableListAtIndex: (splittableList, index) ->
    @splice(index, 0, splittableList.objects...)

  insertSplittableListAtPosition: (splittableList, position) ->
    [objects, index] = @splitObjectAtPosition(position)
    new @constructor(objects).insertSplittableListAtIndex(splittableList, index)

  editObjectAtIndex: (index, callback) ->
    @replaceObjectAtIndex(callback(@objects[index]), index)

  replaceObjectAtIndex: (object, index) ->
    @splice(index, 1, object)

  removeObjectAtIndex: (index) ->
    @splice(index, 1)

  getObjectAtIndex: (index) ->
    @objects[index]

  getSplittableListInRange: (range) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    new @constructor objects.slice(leftIndex, rightIndex + 1)

  selectSplittableList: (test) ->
    objects = (object for object in @objects when test(object))
    new @constructor objects

  removeObjectsInRange: (range) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    new @constructor(objects).splice(leftIndex, rightIndex - leftIndex + 1)

  transformObjectsInRange: (range, transform) ->
    [objects, leftIndex, rightIndex] = @splitObjectsAtRange(range)
    transformedObjects = for object, index in objects
      if leftIndex <= index <= rightIndex
        transform(object)
      else
        object
    new @constructor transformedObjects

  splitObjectsAtRange: (range) ->
    [objects, leftInnerIndex, offset] = @splitObjectAtPosition(startOfRange(range))
    [objects, rightOuterIndex] = new @constructor(objects).splitObjectAtPosition(endOfRange(range) + offset)
    [objects, leftInnerIndex, rightOuterIndex - 1]

  getObjectAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    @objects[index]

  splitObjectAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    objects = @objects.slice(0)
    if index?
      if offset is 0
        splitIndex = index
        splitOffset = 0
      else
        object = @getObjectAtIndex(index)
        [leftObject, rightObject] = object.splitAtOffset(offset)
        objects.splice(index, 1, leftObject, rightObject)
        splitIndex = index + 1
        splitOffset = leftObject.getLength() - offset
    else
      splitIndex = objects.length
      splitOffset = 0

    [objects, splitIndex, splitOffset]

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

  consolidateFromIndexToIndex: (startIndex, endIndex) ->
    objects = @objects.slice(0)
    objectsInRange = objects.slice(startIndex, endIndex + 1)
    consolidatedInRange = new @constructor(objectsInRange).consolidate().toArray()
    @splice(startIndex, objectsInRange.length, consolidatedInRange...)

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

  getEndPosition: ->
    @endPosition ?= (
      position = 0
      position += object.getLength() for object in @objects
      position
    )

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
