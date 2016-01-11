#= require_self
#= require_tree ./fixtures
#= require_tree .

@trix =
  extend: (properties) ->
    for key, value of properties
      this[key] = value
    this

  after: (delay, callback) ->
    setTimeout(callback, delay)

  defer: (callback) ->
    trix.after(1, callback)
