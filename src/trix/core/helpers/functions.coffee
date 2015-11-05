Trix.extend
  defer: (fn) ->
    setTimeout fn, 1

  memoize: (fn) ->
    memo = memos++
    ->
      @memos ?= {}
      @memos[memo] ?= fn.apply(this, arguments)

memos = 0

formatValue = (value) ->
  value?.inspect?() ? (try JSON.stringify(value)) ? value
