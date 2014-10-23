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

  forwardMethods: ({ofConstructor, ofObject, onConstructor, toProperty} = {}) ->
    methods = ofObject ? ofConstructor.prototype
    destination = onConstructor.prototype
    reservedNames = ["constructor", "toString", "valueOf"]

    for name, value of methods when name not in reservedNames and typeof value is "function"
      do (name, value) =>
        destination[name] = -> value.apply(@[toProperty], arguments) if @[toProperty]?
