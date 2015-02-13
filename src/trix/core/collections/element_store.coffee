class Trix.ElementStore
  constructor: (elements) ->
    @reset(elements)

  add: (element) ->
    key = hash(element)
    @elements[key] ?= []
    @elements[key].push(element)

  remove: (element) ->
    key = hash(element)
    if @elements[key]
      result = @elements[key].pop()
      delete @elements[key] unless @elements[key].length
      result

  reset: (elements = []) ->
    @elements = {}
    @add(element) for element in elements
    elements

  hash = (element) ->
    element.outerHTML
