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
  element.setAttribute("nonce", nonce) if nonce = getCSPNonce()
  document.head.insertBefore(element, document.head.firstChild)
  element

getCSPNonce = ->
  if element = getMetaElement("trix-csp-nonce") or getMetaElement("csp-nonce")
    element.getAttribute("content")

getMetaElement = (name) ->
  document.head.querySelector("meta[name=#{name}]")

rewriteFunctionsAsValues = (definition) ->
  object = {}
  for key, value of definition
    object[key] = if typeof value is "function" then {value} else value
  object

rewriteLifecycleCallbacks = do ->
  extract = (definition) ->
    callbacks = {}
    for key in ["initialize", "connect", "disconnect"]
      callbacks[key] = definition[key]
      delete definition[key]
    callbacks

  if window.customElements
    (definition) ->
      {initialize, connect, disconnect} = extract(definition)

      # Call `initialize` once in `connectedCallback` if defined
      if initialize
        original = connect
        connect = ->
          unless @initialized
            @initialized = true
            initialize.call(this)
          original?.call(this)

      definition.connectedCallback = connect if connect
      definition.disconnectedCallback = disconnect if disconnect
      definition
  else
    (definition) ->
      {initialize, connect, disconnect} = extract(definition)
      definition.createdCallback = initialize if initialize
      definition.attachedCallback = connect if connect
      definition.detachedCallback = disconnect if disconnect
      definition

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
