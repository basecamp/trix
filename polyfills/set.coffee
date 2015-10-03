window.Set ?= class Set
  constructor: ->
    @clear()

  clear: ->
    @values = []

  has: (value) ->
    @values.indexOf(value) isnt -1

  add: (value) ->
    unless @has(value)
      @values.push(value)
    this

  delete: (value) ->
    if (index = @values.indexOf(value)) is -1
      false
    else
      @values.splice(index, 1)
      true

  forEach: ->
    @values.forEach(arguments...)
