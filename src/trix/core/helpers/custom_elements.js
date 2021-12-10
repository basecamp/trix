/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export var registerElement = function(tagName, definition = {}) {
  let defaultCSS;
  tagName = tagName.toLowerCase();

  definition = rewriteLifecycleCallbacks(definition);
  const properties = rewriteFunctionsAsValues(definition);

  if (defaultCSS = properties.defaultCSS) {
    delete properties.defaultCSS;
    installDefaultCSSForTagName(defaultCSS, tagName);
  }

  return doRegisterElement(tagName, properties);
};

var installDefaultCSSForTagName = function(defaultCSS, tagName) {
  const styleElement = insertStyleElementForTagName(tagName);
  return styleElement.textContent = defaultCSS.replace(/%t/g, tagName);
};

var insertStyleElementForTagName = function(tagName) {
  let nonce;
  const element = document.createElement("style");
  element.setAttribute("type", "text/css");
  element.setAttribute("data-tag-name", tagName.toLowerCase());
  if (nonce = getCSPNonce()) { element.setAttribute("nonce", nonce); }
  document.head.insertBefore(element, document.head.firstChild);
  return element;
};

var getCSPNonce = function() {
  let element;
  if (element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce")) {
    return element.getAttribute("content");
  }
};

var getMetaElement = name => document.head.querySelector(`meta[name=${name}]`);

var rewriteFunctionsAsValues = function(definition) {
  const object = {};
  for (let key in definition) {
    const value = definition[key];
    object[key] = typeof value === "function" ? {value} : value;
  }
  return object;
};

var rewriteLifecycleCallbacks = (function() {
  const extract = function(definition) {
    const callbacks = {};
    for (let key of ["initialize", "connect", "disconnect"]) {
      callbacks[key] = definition[key];
      delete definition[key];
    }
    return callbacks;
  };

  if (window.customElements) {
    return function(definition) {
      let {initialize, connect, disconnect} = extract(definition);

      // Call `initialize` once in `connectedCallback` if defined
      if (initialize) {
        const original = connect;
        connect = function() {
          if (!this.initialized) {
            this.initialized = true;
            initialize.call(this);
          }
          return original?.call(this);
        };
      }

      if (connect) { definition.connectedCallback = connect; }
      if (disconnect) { definition.disconnectedCallback = disconnect; }
      return definition;
    };
  } else {
    return function(definition) {
      const {initialize, connect, disconnect} = extract(definition);
      if (initialize) { definition.createdCallback = initialize; }
      if (connect) { definition.attachedCallback = connect; }
      if (disconnect) { definition.detachedCallback = disconnect; }
      return definition;
    };
  }
})();

var doRegisterElement = (function() {
  if (window.customElements) {
    return function(tagName, properties) {
      var constructor = function() {
        if (typeof Reflect === "object") {
          return Reflect.construct(HTMLElement, [], constructor);
        } else {
          return HTMLElement.apply(this);
        }
      };
      Object.setPrototypeOf(constructor.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(constructor, HTMLElement);
      Object.defineProperties(constructor.prototype, properties);
      window.customElements.define(tagName, constructor);
      return constructor;
    };
  } else {
    return function(tagName, properties) {
      const prototype = Object.create(HTMLElement.prototype, properties);
      const constructor = document.registerElement(tagName, {prototype});
      Object.defineProperty(prototype, "constructor", {value: constructor});
      return constructor;
    };
  }
})();
