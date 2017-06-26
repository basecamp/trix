unless typeof Object.setPrototypeOf is "function"
  {set} = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__")
  Object.setPrototypeOf = (object, prototype) ->
    set.call(object, prototype)
    object
