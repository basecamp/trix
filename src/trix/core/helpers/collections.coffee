Trix.extend
  arraysAreEqual: (a, b) ->
    return false unless a.length is b.length
    for value, index in a
      return false unless value is b[index]
    true
