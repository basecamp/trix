import Trix from "trix/global"

Trix.extend
  defer: (fn) ->
    setTimeout fn, 1
