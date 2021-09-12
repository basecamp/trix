#= require_self
#= require_tree ./fixtures
#= require_tree .

# Remove QUnit's globals
delete window[key] for key, value of QUnit when window[key] is value

Trix.TestHelpers = helpers =
  extend: (properties) ->
    for key, value of properties
      this[key] = value
    this

  after: (delay, callback) ->
    setTimeout(callback, delay)

  defer: (callback) ->
    helpers.after(1, callback)
