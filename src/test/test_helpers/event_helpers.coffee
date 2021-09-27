export createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

export triggerEvent = (element, type, properties) ->
  element.dispatchEvent(createEvent(type, properties))
