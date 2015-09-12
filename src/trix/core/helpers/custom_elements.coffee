Trix.registerElement = (tagName, definition = {}) ->
  tagName = tagName.toLowerCase()
  properties = rewriteFunctionsAsValues(definition)

  # TODO: Figure out why adding defaultCSS nukes all other styles in demo.css
  # defaultCSS = properties.defaultCSS ? "%t { display: block }"
  defaultCSS = "%t { display: block }"
  delete properties.defaultCSS
  installDefaultCSSForTagName(defaultCSS, tagName)

  extendsTagName = properties.extendsTagName ? "div"
  delete properties.extendsTagName
  extendedPrototype = Object.getPrototypeOf(document.createElement(extendsTagName))
  extendedPrototype.__super__ = extendedPrototype

  prototype = Object.create(extendedPrototype, properties)
  constructor = document.registerElement(tagName, prototype: prototype)
  Object.defineProperty(prototype, "constructor", value: constructor)
  constructor

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
