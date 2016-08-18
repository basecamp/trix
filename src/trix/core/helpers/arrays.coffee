Trix.extend
  arraysAreEqual: (a = [], b = []) ->
    return false unless a.length is b.length
    for value, index in a
      return false unless value is b[index]
    true

  arrayStartsWith: (a = [], b = []) ->
    Trix.arraysAreEqual(a.slice(0, b.length), b)

  spliceArray: (array, args...) ->
    result = array.slice(0)
    result.splice(args...)
    result

  summarizeArrayChange: (oldArray = [], newArray = []) ->
    added = []
    removed = []

    existingValues = new Set
    for value in oldArray
      existingValues.add(value)

    currentValues = new Set
    for value in newArray
      currentValues.add(value)
      unless existingValues.has(value)
        added.push(value)

    for value in oldArray
      unless currentValues.has(value)
        removed.push(value)

    {added, removed}
