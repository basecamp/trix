// An element with a name attribute, such as <img name="createElement">, shadows the document
// property of the same name. Read document properties from the document's prototype chain
// instead, so markup in the page can't replace them.
export const getDocumentProperty = function(name, doc = document) {
  const descriptor = findPrototypePropertyDescriptor(doc, name)
  if (descriptor?.get) {
    return descriptor.get.call(doc)
  } else {
    return descriptor?.value
  }
}

export const callDocumentMethod = function(name, ...args) {
  return callDocumentMethodOn(document, name, ...args)
}

export const callDocumentMethodOn = function(doc, name, ...args) {
  return getDocumentProperty(name, doc).apply(doc, args)
}

const findPrototypePropertyDescriptor = function(object, name) {
  let prototype = Object.getPrototypeOf(object)
  while (prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, name)
    if (descriptor) {
      return descriptor
    }
    prototype = Object.getPrototypeOf(prototype)
  }
}
