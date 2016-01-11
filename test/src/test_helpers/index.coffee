#= require_self
#= require_tree ./fixtures
#= require_tree .

Trix.TEST_HELPERS = helpers =
  extend: (properties) ->
    for key, value of properties
      this[key] = value
    this

  after: (delay, callback) ->
    setTimeout(callback, delay)

  defer: (callback) ->
    helpers.after(1, callback)
