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

  forwardMethods: ({ofConstructor, ofObject, onConstructor, toProperty} = {}) ->
    methods = ofObject ? ofConstructor.prototype
    destination = onConstructor.prototype
    reservedNames = ["constructor", "toString", "valueOf"]

    for name, value of methods when name not in reservedNames and typeof value is "function"
      do (name, value) =>
        destination[name] = -> value.apply(@[toProperty], arguments) if @[toProperty]?

  arraysAreEqual: (a, b) ->
    return false unless a.length is b.length
    for value, index in a
      return false unless value is b[index]
    true

  bytesToHumanSize: (bytes, {precision, prefix} = {}) ->
    return "0 Bytes" if bytes is 0
    return "1 Byte" if bytes is 1
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    base = if prefix is "si" then 1000 else 1024
    exp = Math.floor(Math.log(bytes) / Math.log(base))
    humanSize = bytes / Math.pow(base, exp)
    "#{formatNumber(humanSize, precision)} #{sizes[exp]}"

formatNumber = (number, precision = 2) ->
  string = number.toFixed(precision)
  withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "")
  withoutInsignificantZeros

formatValue = (value) ->
  value?.inspect?() ? (try JSON.stringify(value)) ? value
