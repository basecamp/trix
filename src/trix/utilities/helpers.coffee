memos = 0

Trix.Helpers =
  defer: (fn) ->
    setTimeout fn, 1

  memoize: (fn) ->
    memo = memos++
    ->
      @memos ?= {}
      @memos[memo] ?= fn.apply(this, arguments)

  capitalize: (string) ->
    string.charAt(0).toUpperCase() + string.substring(1)

  decapitalize: (string) ->
    string.charAt(0).toLowerCase() + string.substring(1)

  forwardMethods: ({fromConstructor, toConstructor, viaProperty} = {}) ->
    methods = toConstructor.prototype
    destination = fromConstructor.prototype

    for own name, value of methods when name isnt "constructor" and typeof value is "function"
      do (name, value) =>
        destination[name] = -> value.apply(@[viaProperty], arguments) if @[viaProperty]?
