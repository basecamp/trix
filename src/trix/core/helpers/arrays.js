/* eslint-disable
    id-length,
*/
export const arraysAreEqual = function(a = [], b = []) {
  if (a.length !== b.length) {
    return false
  }
  for (let index = 0; index < a.length; index++) {
    const value = a[index]
    if (value !== b[index]) {
      return false
    }
  }
  return true
}

export const arrayStartsWith = (a = [], b = []) => arraysAreEqual(a.slice(0, b.length), b)

export const spliceArray = function(array, ...args) {
  const result = array.slice(0)
  result.splice(...args)
  return result
}

export const summarizeArrayChange = function(oldArray = [], newArray = []) {
  const added = []
  const removed = []

  const existingValues = new Set()

  oldArray.forEach((value) => {
    existingValues.add(value)
  })

  const currentValues = new Set()

  newArray.forEach((value) => {
    currentValues.add(value)
    if (!existingValues.has(value)) {
      added.push(value)
    }
  })

  oldArray.forEach((value) => {
    if (!currentValues.has(value)) {
      removed.push(value)
    }
  })

  return { added, removed }
}
