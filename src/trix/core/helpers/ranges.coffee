import { copyObject, objectsAreEqual } from "trix/core/helpers/objects"

export normalizeRange = normalizeRange = (range) ->
  return unless range?
  range = [range, range] unless Array.isArray(range)
  [copyValue(range[0]), copyValue(range[1] ? range[0])]

export rangeIsCollapsed = (range) ->
  return unless range?
  [start, end] = normalizeRange(range)
  rangeValuesAreEqual(start, end)

export rangesAreEqual = (leftRange, rightRange) ->
  return unless leftRange? and rightRange?
  [leftStart, leftEnd] = normalizeRange(leftRange)
  [rightStart, rightEnd] = normalizeRange(rightRange)
  rangeValuesAreEqual(leftStart, rightStart) and
    rangeValuesAreEqual(leftEnd, rightEnd)

copyValue = (value) ->
  if typeof value is "number"
    value
  else
    copyObject(value)

rangeValuesAreEqual = (left, right) ->
  if typeof left is "number"
    left is right
  else
    objectsAreEqual(left, right)
