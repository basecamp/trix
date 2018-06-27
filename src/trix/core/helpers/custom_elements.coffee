Trix.registerElement = (tagName, definition = {}) ->
  tagName = tagName.toLowerCase()

  definition = rewriteLifecycleCallbacks(definition)
  properties = rewriteFunctionsAsValues(definition)

  if defaultCSS = properties.defaultCSS
    delete properties.defaultCSS
    installDefaultCSSForTagName(defaultCSS, tagName)

  registerElement(tagName, properties)

installDefaultCSSForTagName = (defaultCSS, tagName) ->
  styleElement = insertStyleElementForTagName(tagName)
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName)

insertStyleElementForTagName = (tagName) ->
  element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.setAttribute("data-tag-name", tagName.toLowerCase())
  document.head.insertBefore(element, document.head.firstChild)
  element

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

lifecycleMap = do ->
  if window.customElements
    connect: "connectedCallback"
    disconnect: "disconnectedCallback"
  else
    initialize: "createdCallback"
    connect: "attachedCallback"
    disconnect: "detachedCallback"

registerElement = do ->
  if window.customElements
    (tagName, properties) ->
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
    (tagName, properties) ->
      prototype = Object.create(HTMLElement.prototype, properties)
      constructor = document.registerElement(tagName, prototype: prototype)
      Object.defineProperty(prototype, "constructor", value: constructor)
      constructor
