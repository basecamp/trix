/* eslint-disable
    prefer-const,
*/
export const registerElement = function(tagName, definition = {}) {
  tagName = tagName.toLowerCase()

  definition = rewriteLifecycleCallbacks(definition)
  const properties = rewriteFunctionsAsValues(definition)
  const defaultCSS = properties.defaultCSS

  if (defaultCSS) {
    delete properties.defaultCSS
    installDefaultCSSForTagName(defaultCSS, tagName)
  }

  return doRegisterElement(tagName, properties)
}

const installDefaultCSSForTagName = function(defaultCSS, tagName) {
  const styleElement = insertStyleElementForTagName(tagName)
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName)
}

const insertStyleElementForTagName = function(tagName) {
  const element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.setAttribute("data-tag-name", tagName.toLowerCase())
  const nonce = getCSPNonce()
  if (nonce) {
    element.setAttribute("nonce", nonce)
  }
  document.head.insertBefore(element, document.head.firstChild)
  return element
}

const getCSPNonce = function() {
  const element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce")
  if (element) {
    return element.getAttribute("content")
  }
}

const getMetaElement = (name) => document.head.querySelector(`meta[name=${name}]`)

const rewriteFunctionsAsValues = function(definition) {
  const object = {}
  for (const key in definition) {
    const value = definition[key]
    object[key] = typeof value === "function" ? { value } : value
  }
  return object
}

const rewriteLifecycleCallbacks = (function() {
  const extract = function(definition) {
    const callbacks = {}

    ;[ "initialize", "connect", "disconnect" ].forEach((key) => {
      callbacks[key] = definition[key]
      delete definition[key]
    })

    return callbacks
  }

  if (window.customElements) {
    return function(definition) {
      let { initialize, connect, disconnect } = extract(definition)

      // Call `initialize` once in `connectedCallback` if defined
      if (initialize) {
        const original = connect
        connect = function() {
          if (!this.initialized) {
            this.initialized = true
            initialize.call(this)
          }
          return original?.call(this)
        }
      }

      if (connect) {
        definition.connectedCallback = connect
      }
      if (disconnect) {
        definition.disconnectedCallback = disconnect
      }
      return definition
    }
  } else {
    return function(definition) {
      const { initialize, connect, disconnect } = extract(definition)
      if (initialize) {
        definition.createdCallback = initialize
      }
      if (connect) {
        definition.attachedCallback = connect
      }
      if (disconnect) {
        definition.detachedCallback = disconnect
      }
      return definition
    }
  }
})()

const doRegisterElement = (function() {
  if (window.customElements) {
    return function(tagName, properties) {
      const constructor = function() {
        if (typeof Reflect === "object") {
          return Reflect.construct(HTMLElement, [], constructor)
        } else {
          return HTMLElement.apply(this)
        }
      }
      Object.setPrototypeOf(constructor.prototype, HTMLElement.prototype)
      Object.setPrototypeOf(constructor, HTMLElement)
      Object.defineProperties(constructor.prototype, properties)
      window.customElements.define(tagName, constructor)
      return constructor
    }
  } else {
    return function(tagName, properties) {
      const prototype = Object.create(HTMLElement.prototype, properties)
      const constructor = document.registerElement(tagName, { prototype })
      Object.defineProperty(prototype, "constructor", { value: constructor })
      return constructor
    }
  }
})()
