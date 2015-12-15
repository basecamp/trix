Trix.extend
  copyObject: (object = {}) ->
    result = {}
    result[key] = value for key, value of object
    result

  objectsAreEqual: (a = {}, b = {}) ->
    return false unless Object.keys(a).length is Object.keys(b).length
    for key, value of a
      return false unless value is b[key]
    true
