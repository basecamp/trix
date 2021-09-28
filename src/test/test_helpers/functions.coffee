export extend = (properties) ->
  for key, value of properties
    this[key] = value
  this

export after = (delay, callback) ->
  setTimeout(callback, delay)

export defer = (callback) ->
  after(1, callback)
