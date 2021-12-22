/* eslint-disable
    prefer-const,
*/
import TrixObject from "trix/core/object" // Don't override window.Object

import { spliceArray } from "trix/core/helpers"

export default class SplittableList extends TrixObject {
  static box(objects) {
    if (objects instanceof this) {
      return objects
    } else {
      return new this(objects)
    }
  }

  constructor(objects = []) {
    super(...arguments)
    this.objects = objects.slice(0)
    this.length = this.objects.length
  }

  indexOf(object) {
    return this.objects.indexOf(object)
  }

  splice(...args) {
    return new this.constructor(spliceArray(this.objects, ...args))
  }

  eachObject(callback) {
    return this.objects.map((object, index) => callback(object, index))
  }

  insertObjectAtIndex(object, index) {
    return this.splice(index, 0, object)
  }

  insertSplittableListAtIndex(splittableList, index) {
    return this.splice(index, 0, ...splittableList.objects)
  }

  insertSplittableListAtPosition(splittableList, position) {
    const [ objects, index ] = this.splitObjectAtPosition(position)
    return new this.constructor(objects).insertSplittableListAtIndex(splittableList, index)
  }

  editObjectAtIndex(index, callback) {
    return this.replaceObjectAtIndex(callback(this.objects[index]), index)
  }

  replaceObjectAtIndex(object, index) {
    return this.splice(index, 1, object)
  }

  removeObjectAtIndex(index) {
    return this.splice(index, 1)
  }

  getObjectAtIndex(index) {
    return this.objects[index]
  }

  getSplittableListInRange(range) {
    const [ objects, leftIndex, rightIndex ] = this.splitObjectsAtRange(range)
    return new this.constructor(objects.slice(leftIndex, rightIndex + 1))
  }

  selectSplittableList(test) {
    const objects = this.objects.filter((object) => test(object))
    return new this.constructor(objects)
  }

  removeObjectsInRange(range) {
    const [ objects, leftIndex, rightIndex ] = this.splitObjectsAtRange(range)
    return new this.constructor(objects).splice(leftIndex, rightIndex - leftIndex + 1)
  }

  transformObjectsInRange(range, transform) {
    const [ objects, leftIndex, rightIndex ] = this.splitObjectsAtRange(range)
    const transformedObjects = objects.map((object, index) =>
      leftIndex <= index && index <= rightIndex ? transform(object) : object
    )
    return new this.constructor(transformedObjects)
  }

  splitObjectsAtRange(range) {
    let rightOuterIndex
    let [ objects, leftInnerIndex, offset ] = this.splitObjectAtPosition(startOfRange(range))
    ;[ objects, rightOuterIndex ] = new this.constructor(objects).splitObjectAtPosition(endOfRange(range) + offset)

    return [ objects, leftInnerIndex, rightOuterIndex - 1 ]
  }

  getObjectAtPosition(position) {
    const { index } = this.findIndexAndOffsetAtPosition(position)
    return this.objects[index]
  }

  splitObjectAtPosition(position) {
    let splitIndex, splitOffset
    const { index, offset } = this.findIndexAndOffsetAtPosition(position)
    const objects = this.objects.slice(0)
    if (index != null) {
      if (offset === 0) {
        splitIndex = index
        splitOffset = 0
      } else {
        const object = this.getObjectAtIndex(index)
        const [ leftObject, rightObject ] = object.splitAtOffset(offset)
        objects.splice(index, 1, leftObject, rightObject)
        splitIndex = index + 1
        splitOffset = leftObject.getLength() - offset
      }
    } else {
      splitIndex = objects.length
      splitOffset = 0
    }

    return [ objects, splitIndex, splitOffset ]
  }

  consolidate() {
    const objects = []
    let pendingObject = this.objects[0]

    this.objects.slice(1).forEach((object) => {
      if (pendingObject.canBeConsolidatedWith?.(object)) {
        pendingObject = pendingObject.consolidateWith(object)
      } else {
        objects.push(pendingObject)
        pendingObject = object
      }
    })

    if (pendingObject) {
      objects.push(pendingObject)
    }

    return new this.constructor(objects)
  }

  consolidateFromIndexToIndex(startIndex, endIndex) {
    const objects = this.objects.slice(0)
    const objectsInRange = objects.slice(startIndex, endIndex + 1)
    const consolidatedInRange = new this.constructor(objectsInRange).consolidate().toArray()
    return this.splice(startIndex, objectsInRange.length, ...consolidatedInRange)
  }

  findIndexAndOffsetAtPosition(position) {
    let index
    let currentPosition = 0
    for (index = 0; index < this.objects.length; index++) {
      const object = this.objects[index]
      const nextPosition = currentPosition + object.getLength()
      if (currentPosition <= position && position < nextPosition) {
        return { index, offset: position - currentPosition }
      }
      currentPosition = nextPosition
    }
    return { index: null, offset: null }
  }

  findPositionAtIndexAndOffset(index, offset) {
    let position = 0
    for (let currentIndex = 0; currentIndex < this.objects.length; currentIndex++) {
      const object = this.objects[currentIndex]
      if (currentIndex < index) {
        position += object.getLength()
      } else if (currentIndex === index) {
        position += offset
        break
      }
    }
    return position
  }

  getEndPosition() {
    if (this.endPosition == null) {
      this.endPosition = 0
      this.objects.forEach((object) => this.endPosition += object.getLength())
    }

    return this.endPosition
  }

  toString() {
    return this.objects.join("")
  }

  toArray() {
    return this.objects.slice(0)
  }

  toJSON() {
    return this.toArray()
  }

  isEqualTo(splittableList) {
    return super.isEqualTo(...arguments) || objectArraysAreEqual(this.objects, splittableList?.objects)
  }

  contentsForInspection() {
    return {
      objects: `[${this.objects.map((object) => object.inspect()).join(", ")}]`,
    }
  }
}

const objectArraysAreEqual = function(left, right = []) {
  if (left.length !== right.length) {
    return false
  }
  let result = true
  for (let index = 0; index < left.length; index++) {
    const object = left[index]
    if (result && !object.isEqualTo(right[index])) {
      result = false
    }
  }
  return result
}

const startOfRange = (range) => range[0]

const endOfRange = (range) => range[1]
