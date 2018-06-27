defaults =
  extendsTagName: "div"
  css: "%t { display: block; }"

Trix.registerElement = (tagName, definition = {}) ->
  tagName = tagName.toLowerCase()

  definition = rewriteLifecycleCallbacks(definition)
  properties = rewriteFunctionsAsValues(definition)

  extendsTagName = properties.extendsTagName ? defaults.extendsTagName
  delete properties.extendsTagName

  defaultCSS = properties.defaultCSS
  delete properties.defaultCSS

  if defaultCSS? and extendsTagName is defaults.extendsTagName
    defaultCSS += "\n#{defaults.css}"
  else
    defaultCSS = defaults.css

  installDefaultCSSForTagName(defaultCSS, tagName)

  if window.customElements
    constructor = ->
      if typeof Reflect is "object"
        Reflect.construct(HTMLElement, [], constructor)
      else
        HTMLElement.apply(this)

    Object.setPrototypeOf(constructor.prototype, HTMLElement.prototype)
    Object.setPrototypeOf(constructor, HTMLElement)
    Object.defineProperties(constructor.prototype, properties)

    window.customElements.define(tagName, constructor)
    constructor
  else
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

lifecycleMap = do ->
  if window.customElements
    connect: "connectedCallback"
    disconnect: "disconnectedCallback"
  else
    initialize: "createdCallback"
    connect: "attachedCallback"
    disconnect: "detachedCallback"

rewriteLifecycleCallbacks = (definition) ->
  result = Trix.copyObject(definition)

  for key, value of lifecycleMap
    if callback = result[key]
      result[value] = callback
      delete result[key]

  # Call `initialize` once in `connectedCallback` if defined
  if result.initialize
    {connectedCallback} = result
    result.connectedCallback = ->
      @initialize?()
      @initialize = null
      connectedCallback?.call(this)

  result

rewriteFunctionsAsValues = (definition) ->
  object = {}
  for key, value of definition
    object[key] = if typeof value is "function" then {value, writable: true} else value
  object
