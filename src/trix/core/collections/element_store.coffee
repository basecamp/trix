class Trix.ElementStore
  constructor: (elements) ->
    @reset(elements)

  add: (element) ->
    key = getKey(element)
    @elements[key] = element

  remove: (element) ->
    key = getKey(element)
    if value = @elements[key]
      delete @elements[key]
      value

  reset: (elements = []) ->
    @elements = {}
    @add(element) for element in elements
    elements

  getKey = (element) ->
    element.dataset.trixStoreKey
