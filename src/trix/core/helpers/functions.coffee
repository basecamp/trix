Trix.extend
  defer: (fn) ->
    setTimeout fn, 1

  throttleAnimationFrame: (fn) ->
    request = null
    (args...) ->
      request ?= requestAnimationFrame =>
        request = null
        fn.apply(this, args)
