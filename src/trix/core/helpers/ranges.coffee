#= require trix/core/helpers/objects

{copyObject, objectsAreEqual} = Trix

Trix.extend
  normalizeRange: normalizeRange = (range) ->
    return unless range?
    range = [range, range] unless Array.isArray(range)
    [copyValue(range[0]), copyValue(range[1] ? range[0])]

  rangeIsCollapsed: (range) ->
    return unless range?
    [start, end] = normalizeRange(range)
    rangeValuesAreEqual(start, end)

  rangesAreEqual: (leftRange, rightRange) ->
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
