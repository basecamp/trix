import { copyObject, objectsAreEqual } from "trix/core/helpers/objects"

export const normalizeRange = function(range) {
  if (range == null) return

  if (!Array.isArray(range)) {
    range = [ range, range ]
  }
  return [ copyValue(range[0]), copyValue(range[1] != null ? range[1] : range[0]) ]
}

export const rangeIsCollapsed = function(range) {
  if (range == null) return

  const [ start, end ] = normalizeRange(range)
  return rangeValuesAreEqual(start, end)
}

export const rangesAreEqual = function(leftRange, rightRange) {
  if (leftRange == null || rightRange == null) return

  const [ leftStart, leftEnd ] = normalizeRange(leftRange)
  const [ rightStart, rightEnd ] = normalizeRange(rightRange)
  return rangeValuesAreEqual(leftStart, rightStart) && rangeValuesAreEqual(leftEnd, rightEnd)
}

const copyValue = function(value) {
  if (typeof value === "number") {
    return value
  } else {
    return copyObject(value)
  }
}

const rangeValuesAreEqual = function(left, right) {
  if (typeof left === "number") {
    return left === right
  } else {
    return objectsAreEqual(left, right)
  }
}
