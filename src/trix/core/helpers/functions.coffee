Trix.extend
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

memos = 0

formatValue = (value) ->
  value?.inspect?() ? (try JSON.stringify(value)) ? value
