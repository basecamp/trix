memos = 0

Trix.Helpers =
  defer: (fn) ->
    setTimeout fn, 1

  memoize: (fn) ->
    memo = memos++
    ->
      @memos ?= {}
      @memos[memo] ?= fn.apply(this, arguments)

  trace: (name, fn) -> ->
    result = fn.apply(this, arguments)
    args = (formatValue(arg) for arg in arguments)
    Trix.Logger.log("methodTraces", name, "(", args..., ") =", result)
    result

  benchmark: (name, fn) -> ->
    logger = Trix.Logger.get("benchmarks")
    logger.time(name)
    result = fn.apply(this, arguments)
    logger.timeEnd(name)
    result

  forwardMethods: ({ofConstructor, ofObject, onConstructor, toMethod, toProperty} = {}) ->
    source = ofObject ? ofConstructor.prototype
    methodNames = getPropertyNames(source)
    destination = onConstructor.prototype
    reservedNames = ["constructor", "toString", "valueOf"]

    forward = (object, name, value, args) ->
      subject = if toMethod?
        object[toMethod]?()
      else if toProperty?
        object[toProperty]

      if subject?
        value.apply(subject, args)

    for name in methodNames when name not in reservedNames
      do (name) =>
        value = source[name]
        if typeof value is "function"
          destination[name] = -> forward(this, name, value, arguments)

  arraysAreEqual: (a, b) ->
    return false unless a.length is b.length
    for value, index in a
      return false unless value is b[index]
    true

formatValue = (value) ->
  value?.inspect?() ? (try JSON.stringify(value)) ? value

getPropertyNames = (object) ->
  result = {}
  while object
    for name in Object.getOwnPropertyNames(object)
      result[name] = true
    object = object.__proto__
  Object.keys(result)
