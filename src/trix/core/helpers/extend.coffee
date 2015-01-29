Trix.extend = (properties) ->
  for key, value of properties
    this[key] = value
  this
