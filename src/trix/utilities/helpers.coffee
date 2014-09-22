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
