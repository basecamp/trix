/* eslint-disable
    id-length,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export var arraysAreEqual = function(a = [], b = []) {
  if (a.length !== b.length) { return false }
  for (let index = 0; index < a.length; index++) {
    const value = a[index]
    if (value !== b[index]) { return false }
  }
  return true
}

export var arrayStartsWith = (a = [], b = []) => arraysAreEqual(a.slice(0, b.length), b)

export var spliceArray = function(array, ...args) {
  const result = array.slice(0)
  result.splice(...Array.from(args || []))
  return result
}

export var summarizeArrayChange = function(oldArray = [], newArray = []) {
  const added = []
  const removed = []

  const existingValues = new Set

  Array.from(oldArray).forEach((value) => {
    existingValues.add(value)
  })

  const currentValues = new Set

  Array.from(newArray).forEach((value) => {
    currentValues.add(value)
    if (!existingValues.has(value)) {
      added.push(value)
    }
  })

  Array.from(oldArray).forEach((value) => {
    if (!currentValues.has(value)) {
      removed.push(value)
    }
  })

  return { added, removed }
}
