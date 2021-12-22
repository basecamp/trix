/* eslint-disable
    id-length,
*/
export const copyObject = function(object = {}) {
  const result = {}
  for (const key in object) {
    const value = object[key]
    result[key] = value
  }
  return result
}

export const objectsAreEqual = function(a = {}, b = {}) {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false
  }
  for (const key in a) {
    const value = a[key]
    if (value !== b[key]) {
      return false
    }
  }
  return true
}
