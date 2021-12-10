/* eslint-disable
    id-length,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export var copyObject = function(object = {}) {
  const result = {}
  for (const key in object) { const value = object[key]; result[key] = value }
  return result
}

export var objectsAreEqual = function(a = {}, b = {}) {
  if (Object.keys(a).length !== Object.keys(b).length) { return false }
  for (const key in a) {
    const value = a[key]
    if (value !== b[key]) { return false }
  }
  return true
}
