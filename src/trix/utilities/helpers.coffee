Trix.Helpers =
  defer: (fn) ->
    setTimeout fn, 1

  memoize: (fn) -> ->
    fn.memoizedResult ?= fn()
