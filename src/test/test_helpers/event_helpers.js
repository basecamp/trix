export const createEvent = function (type, properties = {}) {
  const event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for (const key in properties) {
    const value = properties[key]
    event[key] = value
  }
  return event
}

export const triggerEvent = (element, type, properties) => element.dispatchEvent(createEvent(type, properties))
