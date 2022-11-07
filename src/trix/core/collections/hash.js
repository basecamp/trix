import TrixObject from "trix/core/object" // Don't override window.Object
import { arraysAreEqual } from "trix/core/helpers"

export default class Hash extends TrixObject {
  static fromCommonAttributesOfObjects(objects = []) {
    if (!objects.length) {
      return new this()
    }
    let hash = box(objects[0])
    let keys = hash.getKeys()

    objects.slice(1).forEach((object) => {
      keys = hash.getKeysCommonToHash(box(object))
      hash = hash.slice(keys)
    })

    return hash
  }

  static box(values) {
    return box(values)
  }

  constructor(values = {}) {
    super(...arguments)
    this.values = copy(values)
  }

  add(key, value) {
    return this.merge(object(key, value))
  }

  remove(key) {
    return new Hash(copy(this.values, key))
  }

  get(key) {
    return this.values[key]
  }

  has(key) {
    return key in this.values
  }

  merge(values) {
    return new Hash(merge(this.values, unbox(values)))
  }

  slice(keys) {
    const values = {}

    Array.from(keys).forEach((key) => {
      if (this.has(key)) {
        values[key] = this.values[key]
      }
    })

    return new Hash(values)
  }

  getKeys() {
    return Object.keys(this.values)
  }

  getKeysCommonToHash(hash) {
    hash = box(hash)
    return this.getKeys().filter((key) => this.values[key] === hash.values[key])
  }

  isEqualTo(values) {
    return arraysAreEqual(this.toArray(), box(values).toArray())
  }

  isEmpty() {
    return this.getKeys().length === 0
  }

  toArray() {
    if (!this.array) {
      const result = []
      for (const key in this.values) {
        const value = this.values[key]
        result.push(result.push(key, value))
      }
      this.array = result.slice(0)
    }

    return this.array
  }

  toObject() {
    return copy(this.values)
  }

  toJSON() {
    return this.toObject()
  }

  contentsForInspection() {
    return { values: JSON.stringify(this.values) }
  }
}

const object = function(key, value) {
  const result = {}
  result[key] = value
  return result
}

const merge = function(object, values) {
  const result = copy(object)
  for (const key in values) {
    const value = values[key]
    result[key] = value
  }
  return result
}

const copy = function(object, keyToRemove) {
  const result = {}
  const sortedKeys = Object.keys(object).sort()

  sortedKeys.forEach((key) => {
    if (key !== keyToRemove) {
      result[key] = object[key]
    }
  })

  return result
}

const box = function(object) {
  if (object instanceof Hash) {
    return object
  } else {
    return new Hash(object)
  }
}

const unbox = function(object) {
  if (object instanceof Hash) {
    return object.values
  } else {
    return object
  }
}
