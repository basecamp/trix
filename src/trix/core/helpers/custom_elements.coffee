Trix.registerElement = (tagName, definition = {}) ->
  tagName = tagName.toLowerCase()
  properties = rewriteFunctionsAsValues(definition)

  if defaultCSS = properties.defaultCSS
    delete properties.defaultCSS
    installDefaultCSSForTagName(defaultCSS , tagName)

  constructor = createCustomElementConstructor(properties)
  window.customElements.define(tagName, constructor)

installDefaultCSSForTagName = (defaultCSS, tagName) ->
  styleElement = insertStyleElementForTagName(tagName)
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName)

insertStyleElementForTagName = (tagName) ->
  element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.setAttribute("data-tag-name", tagName.toLowerCase())
  document.head.insertBefore(element, document.head.firstChild)
  element

rewriteFunctionsAsValues = (definition) ->
  object = {}
  for key, value of definition
    object[key] = if typeof value is "function" then {value} else value
  object

createCustomElementConstructor = (properties) ->
  CustomElement = ->
    if typeof Reflect is "object"
      Reflect.construct(HTMLElement, [], CustomElement)
    else
      HTMLElement.apply(this)

  Object.setPrototypeOf(CustomElement.prototype, HTMLElement.prototype)
  Object.setPrototypeOf(CustomElement, HTMLElement)
  Object.defineProperties(CustomElement.prototype, properties)

  CustomElement
