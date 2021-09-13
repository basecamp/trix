import Trix from "global"

Trix.extend
  defer: (fn) ->
    setTimeout fn, 1
