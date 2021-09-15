/*
Trix 2.0.0-alpha
Copyright © 2021 Basecamp, LLC
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Trix = factory());
}(this, (function () { 'use strict';

  var name = "trix";
  var version = "2.0.0-alpha";
  var description = "A rich text editor for everyday writing";
  var main = "dist/trix.js";
  var style = "dist/trix.css";
  var files = [
  	"dist/*.css",
  	"dist/*.js"
  ];
  var repository = {
  	type: "git",
  	url: "git+https://github.com/basecamp/trix.git"
  };
  var keywords = [
  	"rich text",
  	"wysiwyg",
  	"editor"
  ];
  var author = "Basecamp, LLC";
  var license = "MIT";
  var bugs = {
  	url: "https://github.com/basecamp/trix/issues"
  };
  var homepage = "https://trix-editor.org/";
  var devDependencies = {
  	"@rollup/plugin-json": "^4.1.0",
  	coffeescript: "^2.5.1",
  	esm: "^3.2.25",
  	karma: "5.0.2",
  	"karma-chrome-launcher": "3.1.0",
  	"karma-qunit": "^4.1.2",
  	"karma-sauce-launcher": "^4.3.6",
  	"node-sass": "^6.0.1",
  	qunit: "2.9.3",
  	rangy: "^1.3.0",
  	rollup: "^2.56.3",
  	"rollup-plugin-coffee-script": "^2.0.0",
  	"rollup-plugin-commonjs": "^10.1.0",
  	"rollup-plugin-filesize": "^9.1.1",
  	"rollup-plugin-includepaths": "^0.2.4",
  	"rollup-plugin-node-resolve": "^5.2.0",
  	svgo: "^0.6.1"
  };
  var scripts = {
  	build: "rollup -c",
  	"build-css": "node-sass --functions=./assets/trix/stylesheets/functions assets/trix.scss dist/trix.css",
  	watch: "rollup -c -w",
  	test: "yarn run build && karma start"
  };
  var dependencies = {
  };
  var _package = {
  	name: name,
  	version: version,
  	description: description,
  	main: main,
  	style: style,
  	files: files,
  	repository: repository,
  	keywords: keywords,
  	author: author,
  	license: license,
  	bugs: bugs,
  	homepage: homepage,
  	devDependencies: devDependencies,
  	scripts: scripts,
  	dependencies: dependencies
  };

  var Trix$1;

  Trix$1 = {
    VERSION: version,
    ZERO_WIDTH_SPACE: "\uFEFF",
    NON_BREAKING_SPACE: "\u00A0",
    OBJECT_REPLACEMENT_CHARACTER: "\uFFFC",
    browser: {
      // Android emits composition events when moving the cursor through existing text
      // Introduced in Chrome 65: https://bugs.chromium.org/p/chromium/issues/detail?id=764439#c9
      composesExistingText: /Android.*Chrome/.test(navigator.userAgent),
      // IE 11 activates resizing handles on editable elements that have "layout"
      forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent),
      // https://www.w3.org/TR/input-events-1/ + https://www.w3.org/TR/input-events-2/
      supportsInputEvents: (function() {
        var i, len, property, ref;
        if (typeof InputEvent === "undefined") {
          return false;
        }
        ref = ["data", "getTargetRanges", "inputType"];
        for (i = 0, len = ref.length; i < len; i++) {
          property = ref[i];
          if (!(property in InputEvent.prototype)) {
            return false;
          }
        }
        return true;
      })()
    },
    config: {}
  };

  window.Trix = Trix$1;

  var Trix$2 = Trix$1;

  Trix$2.BasicObject = (function() {
    var apply, parseProxyMethodExpression, proxyMethodExpressionPattern;

    class BasicObject {
      static proxyMethod(expression) {
        var name, optional, toMethod, toProperty;
        ({name, toMethod, toProperty, optional} = parseProxyMethodExpression(expression));
        return this.prototype[name] = function() {
          var object, subject;
          object = toMethod != null ? optional ? typeof this[toMethod] === "function" ? this[toMethod]() : void 0 : this[toMethod]() : toProperty != null ? this[toProperty] : void 0;
          if (optional) {
            subject = object != null ? object[name] : void 0;
            if (subject != null) {
              return apply.call(subject, object, arguments);
            }
          } else {
            subject = object[name];
            return apply.call(subject, object, arguments);
          }
        };
      }

    };

    parseProxyMethodExpression = function(expression) {
      var args, match;
      if (!(match = expression.match(proxyMethodExpressionPattern))) {
        throw new Error(`can't parse @proxyMethod expression: ${expression}`);
      }
      args = {
        name: match[4]
      };
      if (match[2] != null) {
        args.toMethod = match[1];
      } else {
        args.toProperty = match[1];
      }
      if (match[3] != null) {
        args.optional = true;
      }
      return args;
    };

    ({apply} = Function.prototype);

    proxyMethodExpressionPattern = /^(.+?)(\(\))?(\?)?\.(.+?)$/;

    return BasicObject;

  }).call(window);

  Trix$2.Object = (function() {
    var id;

    class Object extends Trix$2.BasicObject {
      static fromJSONString(jsonString) {
        return this.fromJSON(JSON.parse(jsonString));
      }

      constructor() {
        super(...arguments);
        this.id = ++id;
      }

      hasSameConstructorAs(object) {
        return this.constructor === (object != null ? object.constructor : void 0);
      }

      isEqualTo(object) {
        return this === object;
      }

      inspect() {
        var contents, key, value;
        contents = (function() {
          var ref, ref1, results;
          ref1 = (ref = this.contentsForInspection()) != null ? ref : {};
          results = [];
          for (key in ref1) {
            value = ref1[key];
            results.push(`${key}=${value}`);
          }
          return results;
        }).call(this);
        return `#<${this.constructor.name}:${this.id}${contents.length ? ` ${contents.join(", ")}` : ""}>`;
      }

      contentsForInspection() {}

      toJSONString() {
        return JSON.stringify(this);
      }

      toUTF16String() {
        return Trix$2.UTF16String.box(this);
      }

      getCacheKey() {
        return this.id.toString();
      }

    };

    id = 0;

    return Object;

  }).call(window);

  Trix$2.extend = function(properties) {
    var key, value;
    for (key in properties) {
      value = properties[key];
      this[key] = value;
    }
    return this;
  };

  Trix$2.extend({
    defer: function(fn) {
      return setTimeout(fn, 1);
    }
  });

  var utf16StringDifference, utf16StringDifferences;

  Trix$2.extend({
    normalizeSpaces: function(string) {
      return string.replace(RegExp(`${Trix$2.ZERO_WIDTH_SPACE}`, "g"), "").replace(RegExp(`${Trix$2.NON_BREAKING_SPACE}`, "g"), " ");
    },
    normalizeNewlines: function(string) {
      return string.replace(/\r\n/g, "\n");
    },
    breakableWhitespacePattern: RegExp(`[^\\S${Trix$2.NON_BREAKING_SPACE}]`),
    squishBreakableWhitespace: function(string) {
      // Replace all breakable whitespace characters with a space
      return string.replace(RegExp(`${    // Replace two or more spaces with a single space
Trix$2.breakableWhitespacePattern.source}`, "g"), " ").replace(/\ {2,}/g, " ");
    },
    summarizeStringChange: function(oldString, newString) {
      var added, removed;
      oldString = Trix$2.UTF16String.box(oldString);
      newString = Trix$2.UTF16String.box(newString);
      if (newString.length < oldString.length) {
        [removed, added] = utf16StringDifferences(oldString, newString);
      } else {
        [added, removed] = utf16StringDifferences(newString, oldString);
      }
      return {added, removed};
    }
  });

  utf16StringDifferences = function(a, b) {
    var codepoints, diffA, diffB, length, offset;
    if (a.isEqualTo(b)) {
      return ["", ""];
    }
    diffA = utf16StringDifference(a, b);
    ({length} = diffA.utf16String);
    diffB = length ? (({offset} = diffA), codepoints = a.codepoints.slice(0, offset).concat(a.codepoints.slice(offset + length)), utf16StringDifference(b, Trix$2.UTF16String.fromCodepoints(codepoints))) : utf16StringDifference(b, a);
    return [diffA.utf16String.toString(), diffB.utf16String.toString()];
  };

  utf16StringDifference = function(a, b) {
    var leftIndex, rightIndexA, rightIndexB;
    leftIndex = 0;
    rightIndexA = a.length;
    rightIndexB = b.length;
    while (leftIndex < rightIndexA && a.charAt(leftIndex).isEqualTo(b.charAt(leftIndex))) {
      leftIndex++;
    }
    while (rightIndexA > leftIndex + 1 && a.charAt(rightIndexA - 1).isEqualTo(b.charAt(rightIndexB - 1))) {
      rightIndexA--;
      rightIndexB--;
    }
    return {
      utf16String: a.slice(leftIndex, rightIndexA),
      offset: leftIndex
    };
  };

  Trix$2.extend({
    copyObject: function(object = {}) {
      var key, result, value;
      result = {};
      for (key in object) {
        value = object[key];
        result[key] = value;
      }
      return result;
    },
    objectsAreEqual: function(a = {}, b = {}) {
      var key, value;
      if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      for (key in a) {
        value = a[key];
        if (value !== b[key]) {
          return false;
        }
      }
      return true;
    }
  });

  Trix$2.extend({
    arraysAreEqual: function(a = [], b = []) {
      var i, index, len, value;
      if (a.length !== b.length) {
        return false;
      }
      for (index = i = 0, len = a.length; i < len; index = ++i) {
        value = a[index];
        if (value !== b[index]) {
          return false;
        }
      }
      return true;
    },
    arrayStartsWith: function(a = [], b = []) {
      return Trix$2.arraysAreEqual(a.slice(0, b.length), b);
    },
    spliceArray: function(array, ...args) {
      var result;
      result = array.slice(0);
      result.splice(...args);
      return result;
    },
    summarizeArrayChange: function(oldArray = [], newArray = []) {
      var added, currentValues, existingValues, i, j, k, len, len1, len2, removed, value;
      added = [];
      removed = [];
      existingValues = new Set();
      for (i = 0, len = oldArray.length; i < len; i++) {
        value = oldArray[i];
        existingValues.add(value);
      }
      currentValues = new Set();
      for (j = 0, len1 = newArray.length; j < len1; j++) {
        value = newArray[j];
        currentValues.add(value);
        if (!existingValues.has(value)) {
          added.push(value);
        }
      }
      for (k = 0, len2 = oldArray.length; k < len2; k++) {
        value = oldArray[k];
        if (!currentValues.has(value)) {
          removed.push(value);
        }
      }
      return {added, removed};
    }
  });

  var allAttributeNames, blockAttributeNames, listAttributeNames, textAttributeNames;

  allAttributeNames = null;

  blockAttributeNames = null;

  textAttributeNames = null;

  listAttributeNames = null;

  Trix$2.extend({
    getAllAttributeNames: function() {
      return allAttributeNames != null ? allAttributeNames : allAttributeNames = Trix$2.getTextAttributeNames().concat(Trix$2.getBlockAttributeNames());
    },
    getBlockConfig: function(attributeName) {
      return Trix$2.config.blockAttributes[attributeName];
    },
    getBlockAttributeNames: function() {
      return blockAttributeNames != null ? blockAttributeNames : blockAttributeNames = Object.keys(Trix$2.config.blockAttributes);
    },
    getTextConfig: function(attributeName) {
      return Trix$2.config.textAttributes[attributeName];
    },
    getTextAttributeNames: function() {
      return textAttributeNames != null ? textAttributeNames : textAttributeNames = Object.keys(Trix$2.config.textAttributes);
    },
    getListAttributeNames: function() {
      var key, listAttribute;
      return listAttributeNames != null ? listAttributeNames : listAttributeNames = (function() {
        var ref, results;
        ref = Trix$2.config.blockAttributes;
        results = [];
        for (key in ref) {
          ({listAttribute} = ref[key]);
          if (listAttribute != null) {
            results.push(listAttribute);
          }
        }
        return results;
      })();
    }
  });

  var html, match, ref$8, ref1, ref2,
    indexOf$a = [].indexOf;

  html = document.documentElement;

  match = (ref$8 = (ref1 = (ref2 = html.matchesSelector) != null ? ref2 : html.webkitMatchesSelector) != null ? ref1 : html.msMatchesSelector) != null ? ref$8 : html.mozMatchesSelector;

  Trix$2.extend({
    handleEvent: function(eventName, {onElement, matchingSelector, withCallback, inPhase, preventDefault, times} = {}) {
      var callback, element, handler, selector, useCapture;
      element = onElement != null ? onElement : html;
      selector = matchingSelector;
      callback = withCallback;
      useCapture = inPhase === "capturing";
      handler = function(event) {
        var target;
        if ((times != null) && --times === 0) {
          handler.destroy();
        }
        target = Trix$2.findClosestElementFromNode(event.target, {
          matchingSelector: selector
        });
        if (target != null) {
          if (withCallback != null) {
            withCallback.call(target, event, target);
          }
          if (preventDefault) {
            return event.preventDefault();
          }
        }
      };
      handler.destroy = function() {
        return element.removeEventListener(eventName, handler, useCapture);
      };
      element.addEventListener(eventName, handler, useCapture);
      return handler;
    },
    handleEventOnce: function(eventName, options = {}) {
      options.times = 1;
      return Trix$2.handleEvent(eventName, options);
    },
    triggerEvent: function(eventName, {onElement, bubbles, cancelable, attributes} = {}) {
      var element, event;
      element = onElement != null ? onElement : html;
      bubbles = bubbles !== false;
      cancelable = cancelable !== false;
      event = document.createEvent("Events");
      event.initEvent(eventName, bubbles, cancelable);
      if (attributes != null) {
        Trix$2.extend.call(event, attributes);
      }
      return element.dispatchEvent(event);
    },
    elementMatchesSelector: function(element, selector) {
      if ((element != null ? element.nodeType : void 0) === 1) {
        return match.call(element, selector);
      }
    },
    findClosestElementFromNode: function(node, {matchingSelector, untilNode} = {}) {
      while (!((node == null) || node.nodeType === Node.ELEMENT_NODE)) {
        node = node.parentNode;
      }
      if (node == null) {
        return;
      }
      if (matchingSelector != null) {
        if (node.closest && (untilNode == null)) {
          return node.closest(matchingSelector);
        } else {
          while (node && node !== untilNode) {
            if (Trix$2.elementMatchesSelector(node, matchingSelector)) {
              return node;
            }
            node = node.parentNode;
          }
        }
      } else {
        return node;
      }
    },
    findInnerElement: function(element) {
      while (element != null ? element.firstElementChild : void 0) {
        element = element.firstElementChild;
      }
      return element;
    },
    innerElementIsActive: function(element) {
      return document.activeElement !== element && Trix$2.elementContainsNode(element, document.activeElement);
    },
    elementContainsNode: function(element, node) {
      if (!(element && node)) {
        return;
      }
      while (node) {
        if (node === element) {
          return true;
        }
        node = node.parentNode;
      }
    },
    findNodeFromContainerAndOffset: function(container, offset) {
      var ref3;
      if (!container) {
        return;
      }
      if (container.nodeType === Node.TEXT_NODE) {
        return container;
      } else if (offset === 0) {
        return (ref3 = container.firstChild) != null ? ref3 : container;
      } else {
        return container.childNodes.item(offset - 1);
      }
    },
    findElementFromContainerAndOffset: function(container, offset) {
      var node;
      node = Trix$2.findNodeFromContainerAndOffset(container, offset);
      return Trix$2.findClosestElementFromNode(node);
    },
    findChildIndexOfNode: function(node) {
      var childIndex;
      if (!(node != null ? node.parentNode : void 0)) {
        return;
      }
      childIndex = 0;
      while (node = node.previousSibling) {
        childIndex++;
      }
      return childIndex;
    },
    removeNode: function(node) {
      var ref3;
      return node != null ? (ref3 = node.parentNode) != null ? ref3.removeChild(node) : void 0 : void 0;
    },
    walkTree: function(tree, {onlyNodesOfType, usingFilter, expandEntityReferences} = {}) {
      var whatToShow;
      whatToShow = (function() {
        switch (onlyNodesOfType) {
          case "element":
            return NodeFilter.SHOW_ELEMENT;
          case "text":
            return NodeFilter.SHOW_TEXT;
          case "comment":
            return NodeFilter.SHOW_COMMENT;
          default:
            return NodeFilter.SHOW_ALL;
        }
      })();
      return document.createTreeWalker(tree, whatToShow, usingFilter != null ? usingFilter : null, expandEntityReferences === true);
    },
    tagName: function(element) {
      var ref3;
      return element != null ? (ref3 = element.tagName) != null ? ref3.toLowerCase() : void 0 : void 0;
    },
    makeElement: function(tagName, options = {}) {
      var childNode, className, element, i, j, key, len, len1, ref3, ref4, ref5, ref6, ref7, value;
      if (typeof tagName === "object") {
        options = tagName;
        ({tagName} = options);
      } else {
        options = {
          attributes: options
        };
      }
      element = document.createElement(tagName);
      if (options.editable != null) {
        if (options.attributes == null) {
          options.attributes = {};
        }
        options.attributes.contenteditable = options.editable;
      }
      if (options.attributes) {
        ref3 = options.attributes;
        for (key in ref3) {
          value = ref3[key];
          element.setAttribute(key, value);
        }
      }
      if (options.style) {
        ref4 = options.style;
        for (key in ref4) {
          value = ref4[key];
          element.style[key] = value;
        }
      }
      if (options.data) {
        ref5 = options.data;
        for (key in ref5) {
          value = ref5[key];
          element.dataset[key] = value;
        }
      }
      if (options.className) {
        ref6 = options.className.split(" ");
        for (i = 0, len = ref6.length; i < len; i++) {
          className = ref6[i];
          element.classList.add(className);
        }
      }
      if (options.textContent) {
        element.textContent = options.textContent;
      }
      if (options.childNodes) {
        ref7 = [].concat(options.childNodes);
        for (j = 0, len1 = ref7.length; j < len1; j++) {
          childNode = ref7[j];
          element.appendChild(childNode);
        }
      }
      return element;
    },
    getBlockTagNames: function() {
      var key, tagName;
      return Trix$2.blockTagNames != null ? Trix$2.blockTagNames : Trix$2.blockTagNames = (function() {
        var ref3, results;
        ref3 = Trix$2.config.blockAttributes;
        results = [];
        for (key in ref3) {
          ({tagName} = ref3[key]);
          if (tagName) {
            results.push(tagName);
          }
        }
        return results;
      })();
    },
    nodeIsBlockContainer: function(node) {
      return Trix$2.nodeIsBlockStartComment(node != null ? node.firstChild : void 0);
    },
    nodeProbablyIsBlockContainer: function(node) {
      var ref3, ref4;
      return (ref3 = Trix$2.tagName(node), indexOf$a.call(Trix$2.getBlockTagNames(), ref3) >= 0) && (ref4 = Trix$2.tagName(node.firstChild), indexOf$a.call(Trix$2.getBlockTagNames(), ref4) < 0);
    },
    nodeIsBlockStart: function(node, {strict} = {
        strict: true
      }) {
      if (strict) {
        return Trix$2.nodeIsBlockStartComment(node);
      } else {
        return Trix$2.nodeIsBlockStartComment(node) || (!Trix$2.nodeIsBlockStartComment(node.firstChild) && Trix$2.nodeProbablyIsBlockContainer(node));
      }
    },
    nodeIsBlockStartComment: function(node) {
      return Trix$2.nodeIsCommentNode(node) && (node != null ? node.data : void 0) === "block";
    },
    nodeIsCommentNode: function(node) {
      return (node != null ? node.nodeType : void 0) === Node.COMMENT_NODE;
    },
    nodeIsCursorTarget: function(node, {name} = {}) {
      if (!node) {
        return;
      }
      if (Trix$2.nodeIsTextNode(node)) {
        if (node.data === Trix$2.ZERO_WIDTH_SPACE) {
          if (name) {
            return node.parentNode.dataset.trixCursorTarget === name;
          } else {
            return true;
          }
        }
      } else {
        return Trix$2.nodeIsCursorTarget(node.firstChild);
      }
    },
    nodeIsAttachmentElement: function(node) {
      return Trix$2.elementMatchesSelector(node, Trix$2.AttachmentView.attachmentSelector);
    },
    nodeIsEmptyTextNode: function(node) {
      return Trix$2.nodeIsTextNode(node) && (node != null ? node.data : void 0) === "";
    },
    nodeIsTextNode: function(node) {
      return (node != null ? node.nodeType : void 0) === Node.TEXT_NODE;
    }
  });

  var copyObject, copyValue, normalizeRange$3, objectsAreEqual$4, rangeValuesAreEqual;

  ({copyObject, objectsAreEqual: objectsAreEqual$4} = Trix$2);

  Trix$2.extend({
    normalizeRange: normalizeRange$3 = function(range) {
      var ref;
      if (range == null) {
        return;
      }
      if (!Array.isArray(range)) {
        range = [range, range];
      }
      return [copyValue(range[0]), copyValue((ref = range[1]) != null ? ref : range[0])];
    },
    rangeIsCollapsed: function(range) {
      var end, start;
      if (range == null) {
        return;
      }
      [start, end] = normalizeRange$3(range);
      return rangeValuesAreEqual(start, end);
    },
    rangesAreEqual: function(leftRange, rightRange) {
      var leftEnd, leftStart, rightEnd, rightStart;
      if (!((leftRange != null) && (rightRange != null))) {
        return;
      }
      [leftStart, leftEnd] = normalizeRange$3(leftRange);
      [rightStart, rightEnd] = normalizeRange$3(rightRange);
      return rangeValuesAreEqual(leftStart, rightStart) && rangeValuesAreEqual(leftEnd, rightEnd);
    }
  });

  copyValue = function(value) {
    if (typeof value === "number") {
      return value;
    } else {
      return copyObject(value);
    }
  };

  rangeValuesAreEqual = function(left, right) {
    if (typeof left === "number") {
      return left === right;
    } else {
      return objectsAreEqual$4(left, right);
    }
  };

  var getCSPNonce, getMetaElement, insertStyleElementForTagName, installDefaultCSSForTagName, registerElement, rewriteFunctionsAsValues, rewriteLifecycleCallbacks;

  Trix$2.registerElement = function(tagName, definition = {}) {
    var defaultCSS, properties;
    tagName = tagName.toLowerCase();
    definition = rewriteLifecycleCallbacks(definition);
    properties = rewriteFunctionsAsValues(definition);
    if (defaultCSS = properties.defaultCSS) {
      delete properties.defaultCSS;
      installDefaultCSSForTagName(defaultCSS, tagName);
    }
    return registerElement(tagName, properties);
  };

  installDefaultCSSForTagName = function(defaultCSS, tagName) {
    var styleElement;
    styleElement = insertStyleElementForTagName(tagName);
    return styleElement.textContent = defaultCSS.replace(/%t/g, tagName);
  };

  insertStyleElementForTagName = function(tagName) {
    var element, nonce;
    element = document.createElement("style");
    element.setAttribute("type", "text/css");
    element.setAttribute("data-tag-name", tagName.toLowerCase());
    if (nonce = getCSPNonce()) {
      element.setAttribute("nonce", nonce);
    }
    document.head.insertBefore(element, document.head.firstChild);
    return element;
  };

  getCSPNonce = function() {
    var element;
    if (element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce")) {
      return element.getAttribute("content");
    }
  };

  getMetaElement = function(name) {
    return document.head.querySelector(`meta[name=${name}]`);
  };

  rewriteFunctionsAsValues = function(definition) {
    var key, object, value;
    object = {};
    for (key in definition) {
      value = definition[key];
      object[key] = typeof value === "function" ? {value} : value;
    }
    return object;
  };

  rewriteLifecycleCallbacks = (function() {
    var extract;
    extract = function(definition) {
      var callbacks, i, key, len, ref;
      callbacks = {};
      ref = ["initialize", "connect", "disconnect"];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        callbacks[key] = definition[key];
        delete definition[key];
      }
      return callbacks;
    };
    if (window.customElements) {
      return function(definition) {
        var connect, disconnect, initialize, original;
        ({initialize, connect, disconnect} = extract(definition));
        // Call `initialize` once in `connectedCallback` if defined
        if (initialize) {
          original = connect;
          connect = function() {
            if (!this.initialized) {
              this.initialized = true;
              initialize.call(this);
            }
            return original != null ? original.call(this) : void 0;
          };
        }
        if (connect) {
          definition.connectedCallback = connect;
        }
        if (disconnect) {
          definition.disconnectedCallback = disconnect;
        }
        return definition;
      };
    } else {
      return function(definition) {
        var connect, disconnect, initialize;
        ({initialize, connect, disconnect} = extract(definition));
        if (initialize) {
          definition.createdCallback = initialize;
        }
        if (connect) {
          definition.attachedCallback = connect;
        }
        if (disconnect) {
          definition.detachedCallback = disconnect;
        }
        return definition;
      };
    }
  })();

  registerElement = (function() {
    if (window.customElements) {
      return function(tagName, properties) {
        var constructor;
        constructor = function() {
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
        var constructor, prototype;
        prototype = Object.create(HTMLElement.prototype, properties);
        constructor = document.registerElement(tagName, {
          prototype: prototype
        });
        Object.defineProperty(prototype, "constructor", {
          value: constructor
        });
        return constructor;
      };
    }
  })();

  var domRangeIsPrivate, nodeIsPrivate;

  Trix$2.extend({
    getDOMSelection: function() {
      var selection;
      selection = window.getSelection();
      if (selection.rangeCount > 0) {
        return selection;
      }
    },
    getDOMRange: function() {
      var domRange, ref;
      if (domRange = (ref = Trix$2.getDOMSelection()) != null ? ref.getRangeAt(0) : void 0) {
        if (!domRangeIsPrivate(domRange)) {
          return domRange;
        }
      }
    },
    setDOMRange: function(domRange) {
      var selection;
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(domRange);
      return Trix$2.selectionChangeObserver.update();
    }
  });

  // In Firefox, clicking certain <input> elements changes the selection to a
  // private element used to draw its UI. Attempting to access properties of those
  // elements throws an error.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=208427
  domRangeIsPrivate = function(domRange) {
    return nodeIsPrivate(domRange.startContainer) || nodeIsPrivate(domRange.endContainer);
  };

  nodeIsPrivate = function(node) {
    return !Object.getPrototypeOf(node);
  };

  var testTransferData;

  testTransferData = {
    "application/x-trix-feature-detection": "test"
  };

  Trix$2.extend({
    dataTransferIsPlainText: function(dataTransfer) {
      var body, html, text;
      text = dataTransfer.getData("text/plain");
      html = dataTransfer.getData("text/html");
      if (text && html) {
        ({body} = new DOMParser().parseFromString(html, "text/html"));
        if (body.textContent === text) {
          return !body.querySelector("*");
        }
      } else {
        return text != null ? text.length : void 0;
      }
    },
    dataTransferIsWritable: function(dataTransfer) {
      var key, value;
      if ((dataTransfer != null ? dataTransfer.setData : void 0) == null) {
        return;
      }
      for (key in testTransferData) {
        value = testTransferData[key];
        if (!(function() {
          try {
            dataTransfer.setData(key, value);
            return dataTransfer.getData(key) === value;
          } catch (error) {}
        })()) {
          return;
        }
      }
      return true;
    },
    keyEventIsKeyboardCommand: (function() {
      if (/Mac|^iP/.test(navigator.platform)) {
        return function(event) {
          return event.metaKey;
        };
      } else {
        return function(event) {
          return event.ctrlKey;
        };
      }
    })()
  });

  Trix$2.extend({
    // https://github.com/mathiasbynens/unicode-2.1.8/blob/master/Bidi_Class/Right_To_Left/regex.js
    RTL_PATTERN: /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/,
    getDirection: (function() {
      var form, input, supportsDirName, supportsDirSelector;
      input = Trix$2.makeElement("input", {
        dir: "auto",
        name: "x",
        dirName: "x.dir"
      });
      form = Trix$2.makeElement("form");
      form.appendChild(input);
      supportsDirName = (function() {
        try {
          return new FormData(form).has(input.dirName);
        } catch (error) {}
      })();
      supportsDirSelector = (function() {
        try {
          return input.matches(":dir(ltr),:dir(rtl)");
        } catch (error) {}
      })();
      if (supportsDirName) {
        return function(string) {
          input.value = string;
          return new FormData(form).get(input.dirName);
        };
      } else if (supportsDirSelector) {
        return function(string) {
          input.value = string;
          if (input.matches(":dir(rtl)")) {
            return "rtl";
          } else {
            return "ltr";
          }
        };
      } else {
        return function(string) {
          var char;
          char = string.trim().charAt(0);
          if (Trix$2.RTL_PATTERN.test(char)) {
            return "rtl";
          } else {
            return "ltr";
          }
        };
      }
    })()
  });

  var arraysAreEqual$3;

  ({arraysAreEqual: arraysAreEqual$3} = Trix$2);

  Trix$2.Hash = (function() {
    var box, copy, merge, object, unbox;

    class Hash extends Trix$2.Object {
      static fromCommonAttributesOfObjects(objects = []) {
        var hash, i, keys, len, object, ref;
        if (!objects.length) {
          return new (this)();
        }
        hash = box(objects[0]);
        keys = hash.getKeys();
        ref = objects.slice(1);
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          keys = hash.getKeysCommonToHash(box(object));
          hash = hash.slice(keys);
        }
        return hash;
      }

      static box(values) {
        return box(values);
      }

      constructor(values = {}) {
        super(...arguments);
        this.values = copy(values);
      }

      add(key, value) {
        return this.merge(object(key, value));
      }

      remove(key) {
        return new Trix$2.Hash(copy(this.values, key));
      }

      get(key) {
        return this.values[key];
      }

      has(key) {
        return key in this.values;
      }

      merge(values) {
        return new Trix$2.Hash(merge(this.values, unbox(values)));
      }

      slice(keys) {
        var i, key, len, values;
        values = {};
        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          if (this.has(key)) {
            values[key] = this.values[key];
          }
        }
        return new Trix$2.Hash(values);
      }

      getKeys() {
        return Object.keys(this.values);
      }

      getKeysCommonToHash(hash) {
        var i, key, len, ref, results;
        hash = box(hash);
        ref = this.getKeys();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          if (this.values[key] === hash.values[key]) {
            results.push(key);
          }
        }
        return results;
      }

      isEqualTo(values) {
        return arraysAreEqual$3(this.toArray(), box(values).toArray());
      }

      isEmpty() {
        return this.getKeys().length === 0;
      }

      toArray() {
        var key, result, value;
        return (this.array != null ? this.array : this.array = ((function() {
          var ref;
          result = [];
          ref = this.values;
          for (key in ref) {
            value = ref[key];
            result.push(key, value);
          }
          return result;
        }).call(this))).slice(0);
      }

      toObject() {
        return copy(this.values);
      }

      toJSON() {
        return this.toObject();
      }

      contentsForInspection() {
        return {
          values: JSON.stringify(this.values)
        };
      }

    };

    object = function(key, value) {
      var result;
      result = {};
      result[key] = value;
      return result;
    };

    merge = function(object, values) {
      var key, result, value;
      result = copy(object);
      for (key in values) {
        value = values[key];
        result[key] = value;
      }
      return result;
    };

    copy = function(object, keyToRemove) {
      var i, key, len, result, sortedKeys;
      result = {};
      sortedKeys = Object.keys(object).sort();
      for (i = 0, len = sortedKeys.length; i < len; i++) {
        key = sortedKeys[i];
        if (key !== keyToRemove) {
          result[key] = object[key];
        }
      }
      return result;
    };

    box = function(object) {
      if (object instanceof Trix$2.Hash) {
        return object;
      } else {
        return new Trix$2.Hash(object);
      }
    };

    unbox = function(object) {
      if (object instanceof Trix$2.Hash) {
        return object.values;
      } else {
        return object;
      }
    };

    return Hash;

  }).call(window);

  Trix$2.ObjectGroup = class ObjectGroup {
    static groupObjects(ungroupedObjects = [], {depth, asTree} = {}) {
      var base, group, i, len, object, objects;
      if (asTree) {
        if (depth == null) {
          depth = 0;
        }
      }
      objects = [];
      for (i = 0, len = ungroupedObjects.length; i < len; i++) {
        object = ungroupedObjects[i];
        if (group) {
          if ((typeof object.canBeGrouped === "function" ? object.canBeGrouped(depth) : void 0) && (typeof (base = group[group.length - 1]).canBeGroupedWith === "function" ? base.canBeGroupedWith(object, depth) : void 0)) {
            group.push(object);
            continue;
          } else {
            objects.push(new this(group, {depth, asTree}));
            group = null;
          }
        }
        if (typeof object.canBeGrouped === "function" ? object.canBeGrouped(depth) : void 0) {
          group = [object];
        } else {
          objects.push(object);
        }
      }
      if (group) {
        objects.push(new this(group, {depth, asTree}));
      }
      return objects;
    }

    constructor(objects1 = [], {depth, asTree}) {
      this.objects = objects1;
      if (asTree) {
        this.depth = depth;
        this.objects = this.constructor.groupObjects(this.objects, {
          asTree,
          depth: this.depth + 1
        });
      }
    }

    getObjects() {
      return this.objects;
    }

    getDepth() {
      return this.depth;
    }

    getCacheKey() {
      var i, keys, len, object, ref;
      keys = ["objectGroup"];
      ref = this.getObjects();
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        keys.push(object.getCacheKey());
      }
      return keys.join("/");
    }

  };

  Trix.ObjectMap = class ObjectMap extends Trix.BasicObject {
    constructor(objects = []) {
      var base, hash, i, len, object;
      super(...arguments);
      this.objects = {};
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        hash = JSON.stringify(object);
        if ((base = this.objects)[hash] == null) {
          base[hash] = object;
        }
      }
    }

    find(object) {
      var hash;
      hash = JSON.stringify(object);
      return this.objects[hash];
    }

  };

  Trix$2.ElementStore = (function() {
    var getKey;

    class ElementStore {
      constructor(elements) {
        this.reset(elements);
      }

      add(element) {
        var key;
        key = getKey(element);
        return this.elements[key] = element;
      }

      remove(element) {
        var key, value;
        key = getKey(element);
        if (value = this.elements[key]) {
          delete this.elements[key];
          return value;
        }
      }

      reset(elements = []) {
        var element, i, len;
        this.elements = {};
        for (i = 0, len = elements.length; i < len; i++) {
          element = elements[i];
          this.add(element);
        }
        return elements;
      }

    };

    getKey = function(element) {
      return element.dataset.trixStoreKey;
    };

    return ElementStore;

  }).call(window);

  Trix$2.Operation = (function() {
    class Operation extends Trix$2.BasicObject {
      isPerforming() {
        return this.performing === true;
      }

      hasPerformed() {
        return this.performed === true;
      }

      hasSucceeded() {
        return this.performed && this.succeeded;
      }

      hasFailed() {
        return this.performed && !this.succeeded;
      }

      getPromise() {
        return this.promise != null ? this.promise : this.promise = new Promise((resolve, reject) => {
          this.performing = true;
          return this.perform((succeeded, result) => {
            this.succeeded = succeeded;
            this.performing = false;
            this.performed = true;
            if (this.succeeded) {
              return resolve(result);
            } else {
              return reject(result);
            }
          });
        });
      }

      perform(callback) {
        return callback(false);
      }

      release() {
        var ref;
        if ((ref = this.promise) != null) {
          if (typeof ref.cancel === "function") {
            ref.cancel();
          }
        }
        this.promise = null;
        this.performing = null;
        this.performed = null;
        return this.succeeded = null;
      }

    };

    Operation.proxyMethod("getPromise().then");

    Operation.proxyMethod("getPromise().catch");

    return Operation;

  }).call(window);

  var hasArrayFrom, hasStringCodePointAt$1, hasStringFromCodePoint, ucs2decode, ucs2encode;

  Trix$2.UTF16String = class UTF16String extends Trix$2.BasicObject {
    static box(value = "") {
      if (value instanceof this) {
        return value;
      } else {
        return this.fromUCS2String(value != null ? value.toString() : void 0);
      }
    }

    static fromUCS2String(ucs2String) {
      return new this(ucs2String, ucs2decode(ucs2String));
    }

    static fromCodepoints(codepoints) {
      return new this(ucs2encode(codepoints), codepoints);
    }

    constructor(ucs2String1, codepoints1) {
      super(...arguments);
      this.ucs2String = ucs2String1;
      this.codepoints = codepoints1;
      this.length = this.codepoints.length;
      this.ucs2Length = this.ucs2String.length;
    }

    offsetToUCS2Offset(offset) {
      return ucs2encode(this.codepoints.slice(0, Math.max(0, offset))).length;
    }

    offsetFromUCS2Offset(ucs2Offset) {
      return ucs2decode(this.ucs2String.slice(0, Math.max(0, ucs2Offset))).length;
    }

    slice() {
      return this.constructor.fromCodepoints(this.codepoints.slice(...arguments));
    }

    charAt(offset) {
      return this.slice(offset, offset + 1);
    }

    isEqualTo(value) {
      return this.constructor.box(value).ucs2String === this.ucs2String;
    }

    toJSON() {
      return this.ucs2String;
    }

    getCacheKey() {
      return this.ucs2String;
    }

    toString() {
      return this.ucs2String;
    }

  };

  hasArrayFrom = (typeof Array.from === "function" ? Array.from("\ud83d\udc7c").length : void 0) === 1;

  hasStringCodePointAt$1 = (typeof " ".codePointAt === "function" ? " ".codePointAt(0) : void 0) != null;

  hasStringFromCodePoint = (typeof String.fromCodePoint === "function" ? String.fromCodePoint(32, 128124) : void 0) === " \ud83d\udc7c";

  // UCS-2 conversion helpers ported from Mathias Bynens' Punycode.js:
  // https://github.com/bestiejs/punycode.js#punycodeucs2

  // Creates an array containing the numeric code points of each Unicode
  // character in the string. While JavaScript uses UCS-2 internally,
  // this function will convert a pair of surrogate halves (each of which
  // UCS-2 exposes as separate characters) into a single code point,
  // matching UTF-16.
  if (hasArrayFrom && hasStringCodePointAt$1) {
    ucs2decode = function(string) {
      return Array.from(string).map(function(char) {
        return char.codePointAt(0);
      });
    };
  } else {
    ucs2decode = function(string) {
      var counter, extra, length, output, value;
      output = [];
      counter = 0;
      length = string.length;
      while (counter < length) {
        value = string.charCodeAt(counter++);
        if ((0xD800 <= value && value <= 0xDBFF) && counter < length) {
          // high surrogate, and there is a next character
          extra = string.charCodeAt(counter++);
          if ((extra & 0xFC00) === 0xDC00) {
            // low surrogate
            value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
          } else {
            // unmatched surrogate; only append this code unit, in case the
            // next code unit is the high surrogate of a surrogate pair
            counter--;
          }
        }
        output.push(value);
      }
      return output;
    };
  }

  // Creates a string based on an array of numeric code points.
  if (hasStringFromCodePoint) {
    ucs2encode = function(array) {
      return String.fromCodePoint(...array);
    };
  } else {
    ucs2encode = function(array) {
      var characters, output, value;
      characters = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = array.length; i < len; i++) {
          value = array[i];
          output = "";
          if (value > 0xFFFF) {
            value -= 0x10000;
            output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
            value = 0xDC00 | value & 0x3FF;
          }
          results.push(output + String.fromCharCode(value));
        }
        return results;
      })();
      return characters.join("");
    };
  }

  Trix$2.config.lang = {
    attachFiles: "Attach Files",
    bold: "Bold",
    bullets: "Bullets",
    byte: "Byte",
    bytes: "Bytes",
    captionPlaceholder: "Add a caption…",
    code: "Code",
    heading1: "Heading",
    indent: "Increase Level",
    italic: "Italic",
    link: "Link",
    numbers: "Numbers",
    outdent: "Decrease Level",
    quote: "Quote",
    redo: "Redo",
    remove: "Remove",
    strike: "Strikethrough",
    undo: "Undo",
    unlink: "Unlink",
    url: "URL",
    urlPlaceholder: "Enter a URL…",
    GB: "GB",
    KB: "KB",
    MB: "MB",
    PB: "PB",
    TB: "TB"
  };

  Trix$2.config.css = {
    attachment: "attachment",
    attachmentCaption: "attachment__caption",
    attachmentCaptionEditor: "attachment__caption-editor",
    attachmentMetadata: "attachment__metadata",
    attachmentMetadataContainer: "attachment__metadata-container",
    attachmentName: "attachment__name",
    attachmentProgress: "attachment__progress",
    attachmentSize: "attachment__size",
    attachmentToolbar: "attachment__toolbar",
    attachmentGallery: "attachment-gallery"
  };

  var attributes;

  Trix$2.config.blockAttributes = attributes = {
    default: {
      tagName: "div",
      parse: false
    },
    quote: {
      tagName: "blockquote",
      nestable: true
    },
    heading1: {
      tagName: "h1",
      terminal: true,
      breakOnReturn: true,
      group: false
    },
    code: {
      tagName: "pre",
      terminal: true,
      text: {
        plaintext: true
      }
    },
    bulletList: {
      tagName: "ul",
      parse: false
    },
    bullet: {
      tagName: "li",
      listAttribute: "bulletList",
      group: false,
      nestable: true,
      test: function(element) {
        return Trix$2.tagName(element.parentNode) === attributes[this.listAttribute].tagName;
      }
    },
    numberList: {
      tagName: "ol",
      parse: false
    },
    number: {
      tagName: "li",
      listAttribute: "numberList",
      group: false,
      nestable: true,
      test: function(element) {
        return Trix$2.tagName(element.parentNode) === attributes[this.listAttribute].tagName;
      }
    },
    attachmentGallery: {
      tagName: "div",
      exclusive: true,
      terminal: true,
      parse: false,
      group: false
    }
  };

  var lang$1, sizes;

  ({lang: lang$1} = Trix$2.config);

  sizes = [lang$1.bytes, lang$1.KB, lang$1.MB, lang$1.GB, lang$1.TB, lang$1.PB];

  Trix$2.config.fileSize = {
    prefix: "IEC",
    precision: 2,
    formatter: function(number) {
      var base, exp, humanSize, string, withoutInsignificantZeros;
      switch (number) {
        case 0:
          return `0 ${lang$1.bytes}`;
        case 1:
          return `1 ${lang$1.byte}`;
        default:
          base = (function() {
            switch (this.prefix) {
              case "SI":
                return 1000;
              case "IEC":
                return 1024;
            }
          }).call(this);
          exp = Math.floor(Math.log(number) / Math.log(base));
          humanSize = number / Math.pow(base, exp);
          string = humanSize.toFixed(this.precision);
          withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "");
          return `${withoutInsignificantZeros} ${sizes[exp]}`;
      }
    }
  };

  Trix$2.config.textAttributes = {
    bold: {
      tagName: "strong",
      inheritable: true,
      parser: function(element) {
        var style;
        style = window.getComputedStyle(element);
        return style["fontWeight"] === "bold" || style["fontWeight"] >= 600;
      }
    },
    italic: {
      tagName: "em",
      inheritable: true,
      parser: function(element) {
        var style;
        style = window.getComputedStyle(element);
        return style["fontStyle"] === "italic";
      }
    },
    href: {
      groupTagName: "a",
      parser: function(element) {
        var attachmentSelector, link, matchingSelector;
        ({attachmentSelector} = Trix$2.AttachmentView);
        matchingSelector = `a:not(${attachmentSelector})`;
        if (link = Trix$2.findClosestElementFromNode(element, {matchingSelector})) {
          return link.getAttribute("href");
        }
      }
    },
    strike: {
      tagName: "del",
      inheritable: true
    },
    frozen: {
      style: {
        "backgroundColor": "highlight"
      }
    }
  };

  var blockCommentPattern, serializedAttributesAttribute, serializedAttributesSelector, unserializableAttributeNames, unserializableElementSelector;

  unserializableElementSelector = "[data-trix-serialize=false]";

  unserializableAttributeNames = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"];

  serializedAttributesAttribute = "data-trix-serialized-attributes";

  serializedAttributesSelector = `[${serializedAttributesAttribute}]`;

  blockCommentPattern = new RegExp("<!--block-->", "g");

  Trix$2.extend({
    serializers: {
      "application/json": function(serializable) {
        var document;
        if (serializable instanceof Trix$2.Document) {
          document = serializable;
        } else if (serializable instanceof HTMLElement) {
          document = Trix$2.Document.fromHTML(serializable.innerHTML);
        } else {
          throw new Error("unserializable object");
        }
        return document.toSerializableDocument().toJSONString();
      },
      "text/html": function(serializable) {
        var attribute, attributes, el, element, i, j, k, l, len, len1, len2, len3, name, ref, ref1, ref2, value;
        if (serializable instanceof Trix$2.Document) {
          element = Trix$2.DocumentView.render(serializable);
        } else if (serializable instanceof HTMLElement) {
          element = serializable.cloneNode(true);
        } else {
          throw new Error("unserializable object");
        }
        ref = element.querySelectorAll(unserializableElementSelector);
        // Remove unserializable elements
        for (i = 0, len = ref.length; i < len; i++) {
          el = ref[i];
          Trix$2.removeNode(el);
        }
  // Remove unserializable attributes
        for (j = 0, len1 = unserializableAttributeNames.length; j < len1; j++) {
          attribute = unserializableAttributeNames[j];
          ref1 = element.querySelectorAll(`[${attribute}]`);
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            el = ref1[k];
            el.removeAttribute(attribute);
          }
        }
        ref2 = element.querySelectorAll(serializedAttributesSelector);
        // Rewrite elements with serialized attribute overrides
        for (l = 0, len3 = ref2.length; l < len3; l++) {
          el = ref2[l];
          try {
            attributes = JSON.parse(el.getAttribute(serializedAttributesAttribute));
            el.removeAttribute(serializedAttributesAttribute);
            for (name in attributes) {
              value = attributes[name];
              el.setAttribute(name, value);
            }
          } catch (error) {}
        }
        return element.innerHTML.replace(blockCommentPattern, "");
      }
    },
    deserializers: {
      "application/json": function(string) {
        return Trix$2.Document.fromJSONString(string);
      },
      "text/html": function(string) {
        return Trix$2.Document.fromHTML(string);
      }
    },
    serializeToContentType: function(serializable, contentType) {
      var serializer;
      if (serializer = Trix$2.serializers[contentType]) {
        return serializer(serializable);
      } else {
        throw new Error(`unknown content type: ${contentType}`);
      }
    },
    deserializeFromContentType: function(string, contentType) {
      var deserializer;
      if (deserializer = Trix$2.deserializers[contentType]) {
        return deserializer(string);
      } else {
        throw new Error(`unknown content type: ${contentType}`);
      }
    }
  });

  Trix$2.config.toolbar = {
    getDefaultHTML: function() {
      var lang;
      ({lang} = Trix$2.config);
      return `<div class="trix-button-row">
  <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">
    <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="${lang.bold}" tabindex="-1">${lang.bold}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="${lang.italic}" tabindex="-1">${lang.italic}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="${lang.strike}" tabindex="-1">${lang.strike}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="${lang.link}" tabindex="-1">${lang.link}</button>
  </span>

  <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">
    <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="${lang.heading1}" tabindex="-1">${lang.heading1}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="${lang.quote}" tabindex="-1">${lang.quote}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="${lang.code}" tabindex="-1">${lang.code}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="${lang.bullets}" tabindex="-1">${lang.bullets}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="${lang.numbers}" tabindex="-1">${lang.numbers}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="${lang.outdent}" tabindex="-1">${lang.outdent}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="${lang.indent}" tabindex="-1">${lang.indent}</button>
  </span>

  <span class="trix-button-group trix-button-group--file-tools" data-trix-button-group="file-tools">
    <button type="button" class="trix-button trix-button--icon trix-button--icon-attach" data-trix-action="attachFiles" title="${lang.attachFiles}" tabindex="-1">${lang.attachFiles}</button>
  </span>

  <span class="trix-button-group-spacer"></span>

  <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">
    <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="${lang.undo}" tabindex="-1">${lang.undo}</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="${lang.redo}" tabindex="-1">${lang.redo}</button>
  </span>
</div>

<div class="trix-dialogs" data-trix-dialogs>
  <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">
    <div class="trix-dialog__link-fields">
      <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="${lang.urlPlaceholder}" aria-label="${lang.url}" required data-trix-input>
      <div class="trix-button-group">
        <input type="button" class="trix-button trix-button--dialog" value="${lang.link}" data-trix-method="setAttribute">
        <input type="button" class="trix-button trix-button--dialog" value="${lang.unlink}" data-trix-method="removeAttribute">
      </div>
    </div>
  </div>
</div>`;
    }
  };

  // Not all changes to a Trix document result in an undo entry being added to
  // the stack. Trix aggregates successive changes into a single undo entry for
  // typing and for attribute changes to the same selected range. The "undo
  // interval" specifies how often, in milliseconds, these aggregate entries are
  // split (or prevents splitting them at all when set to 0).
  Trix$2.config.undoInterval = 5000;

  Trix$2.config.attachments = {
    preview: {
      presentation: "gallery",
      caption: {
        name: true,
        size: true
      }
    },
    file: {
      caption: {
        size: true
      }
    }
  };

  Trix$2.config.keyNames = {
    "8": "backspace",
    "9": "tab",
    "13": "return",
    "27": "escape",
    "37": "left",
    "39": "right",
    "46": "delete",
    "68": "d",
    "72": "h",
    "79": "o"
  };

  Trix$2.config.input = {
    level2Enabled: true,
    getLevel: function() {
      if (this.level2Enabled && Trix$2.browser.supportsInputEvents) {
        return 2;
      } else {
        return 0;
      }
    },
    pickFiles: function(callback) {
      var input;
      input = Trix$2.makeElement("input", {
        type: "file",
        multiple: true,
        hidden: true,
        id: this.fileInputId
      });
      input.addEventListener("change", function() {
        callback(input.files);
        return Trix$2.removeNode(input);
      });
      Trix$2.removeNode(document.getElementById(this.fileInputId));
      document.body.appendChild(input);
      return input.click();
    },
    fileInputId: `trix-file-input-${Date.now().toString(16)}`
  };

  var indexOf$9 = [].indexOf;

  Trix$2.ObjectView = class ObjectView extends Trix$2.BasicObject {
    constructor(object1, options1 = {}) {
      super(...arguments);
      this.object = object1;
      this.options = options1;
      this.childViews = [];
      this.rootView = this;
    }

    getNodes() {
      var i, len, node, ref, results;
      if (this.nodes == null) {
        this.nodes = this.createNodes();
      }
      ref = this.nodes;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        results.push(node.cloneNode(true));
      }
      return results;
    }

    invalidate() {
      var ref;
      this.nodes = null;
      this.childViews = [];
      return (ref = this.parentView) != null ? ref.invalidate() : void 0;
    }

    invalidateViewForObject(object) {
      var ref;
      return (ref = this.findViewForObject(object)) != null ? ref.invalidate() : void 0;
    }

    findOrCreateCachedChildView(viewClass, object, options) {
      var view;
      if (view = this.getCachedViewForObject(object)) {
        this.recordChildView(view);
      } else {
        view = this.createChildView(...arguments);
        this.cacheViewForObject(view, object);
      }
      return view;
    }

    createChildView(viewClass, object, options = {}) {
      var view;
      if (object instanceof Trix$2.ObjectGroup) {
        options.viewClass = viewClass;
        viewClass = Trix$2.ObjectGroupView;
      }
      view = new viewClass(object, options);
      return this.recordChildView(view);
    }

    recordChildView(view) {
      view.parentView = this;
      view.rootView = this.rootView;
      this.childViews.push(view);
      return view;
    }

    getAllChildViews() {
      var childView, i, len, ref, views;
      views = [];
      ref = this.childViews;
      for (i = 0, len = ref.length; i < len; i++) {
        childView = ref[i];
        views.push(childView);
        views = views.concat(childView.getAllChildViews());
      }
      return views;
    }

    findElement() {
      return this.findElementForObject(this.object);
    }

    findElementForObject(object) {
      var id;
      if (id = object != null ? object.id : void 0) {
        return this.rootView.element.querySelector(`[data-trix-id='${id}']`);
      }
    }

    findViewForObject(object) {
      var i, len, ref, view;
      ref = this.getAllChildViews();
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        if (view.object === object) {
          return view;
        }
      }
    }

    getViewCache() {
      if (this.rootView === this) {
        if (this.isViewCachingEnabled()) {
          return this.viewCache != null ? this.viewCache : this.viewCache = {};
        }
      } else {
        return this.rootView.getViewCache();
      }
    }

    isViewCachingEnabled() {
      return this.shouldCacheViews !== false;
    }

    enableViewCaching() {
      return this.shouldCacheViews = true;
    }

    disableViewCaching() {
      return this.shouldCacheViews = false;
    }

    getCachedViewForObject(object) {
      var ref;
      return (ref = this.getViewCache()) != null ? ref[object.getCacheKey()] : void 0;
    }

    cacheViewForObject(view, object) {
      var ref;
      return (ref = this.getViewCache()) != null ? ref[object.getCacheKey()] = view : void 0;
    }

    garbageCollectCachedViews() {
      var cache, key, objectKeys, results, view, views;
      if (cache = this.getViewCache()) {
        views = this.getAllChildViews().concat(this);
        objectKeys = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = views.length; i < len; i++) {
            view = views[i];
            results.push(view.object.getCacheKey());
          }
          return results;
        })();
        results = [];
        for (key in cache) {
          if (indexOf$9.call(objectKeys, key) < 0) {
            results.push(delete cache[key]);
          }
        }
        return results;
      }
    }

  };

  Trix$2.ObjectGroupView = class ObjectGroupView extends Trix$2.ObjectView {
    constructor() {
      super(...arguments);
      this.objectGroup = this.object;
      ({viewClass: this.viewClass} = this.options);
      delete this.options.viewClass;
    }

    getChildViews() {
      var i, len, object, ref;
      if (!this.childViews.length) {
        ref = this.objectGroup.getObjects();
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          this.findOrCreateCachedChildView(this.viewClass, object, this.options);
        }
      }
      return this.childViews;
    }

    createNodes() {
      var element, i, j, len, len1, node, ref, ref1, view;
      element = this.createContainerElement();
      ref = this.getChildViews();
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        ref1 = view.getNodes();
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          node = ref1[j];
          element.appendChild(node);
        }
      }
      return [element];
    }

    createContainerElement(depth = this.objectGroup.getDepth()) {
      return this.getChildViews()[0].createContainerElement(depth);
    }

  };

  var css$2, htmlContainsTagName, makeElement$8;

  ({makeElement: makeElement$8} = Trix$2);

  ({css: css$2} = Trix$2.config);

  Trix$2.AttachmentView = (function() {
    var createCursorTarget;

    class AttachmentView extends Trix$2.ObjectView {
      constructor() {
        super(...arguments);
        this.attachment = this.object;
        this.attachment.uploadProgressDelegate = this;
        this.attachmentPiece = this.options.piece;
      }

      createContentNodes() {
        return [];
      }

      createNodes() {
        var figure, href, i, innerElement, len, node, ref;
        figure = innerElement = makeElement$8({
          tagName: "figure",
          className: this.getClassName(),
          data: this.getData(),
          editable: false
        });
        if (href = this.getHref()) {
          innerElement = makeElement$8({
            tagName: "a",
            editable: false,
            attributes: {
              href,
              tabindex: -1
            }
          });
          figure.appendChild(innerElement);
        }
        if (this.attachment.hasContent()) {
          innerElement.innerHTML = this.attachment.getContent();
        } else {
          ref = this.createContentNodes();
          for (i = 0, len = ref.length; i < len; i++) {
            node = ref[i];
            innerElement.appendChild(node);
          }
        }
        innerElement.appendChild(this.createCaptionElement());
        if (this.attachment.isPending()) {
          this.progressElement = makeElement$8({
            tagName: "progress",
            attributes: {
              class: css$2.attachmentProgress,
              value: this.attachment.getUploadProgress(),
              max: 100
            },
            data: {
              trixMutable: true,
              trixStoreKey: ["progressElement", this.attachment.id].join("/")
            }
          });
          figure.appendChild(this.progressElement);
        }
        return [createCursorTarget("left"), figure, createCursorTarget("right")];
      }

      createCaptionElement() {
        var caption, config, figcaption, name, nameElement, size, sizeElement;
        figcaption = makeElement$8({
          tagName: "figcaption",
          className: css$2.attachmentCaption
        });
        if (caption = this.attachmentPiece.getCaption()) {
          figcaption.classList.add(`${css$2.attachmentCaption}--edited`);
          figcaption.textContent = caption;
        } else {
          config = this.getCaptionConfig();
          if (config.name) {
            name = this.attachment.getFilename();
          }
          if (config.size) {
            size = this.attachment.getFormattedFilesize();
          }
          if (name) {
            nameElement = makeElement$8({
              tagName: "span",
              className: css$2.attachmentName,
              textContent: name
            });
            figcaption.appendChild(nameElement);
          }
          if (size) {
            if (name) {
              figcaption.appendChild(document.createTextNode(" "));
            }
            sizeElement = makeElement$8({
              tagName: "span",
              className: css$2.attachmentSize,
              textContent: size
            });
            figcaption.appendChild(sizeElement);
          }
        }
        return figcaption;
      }

      getClassName() {
        var extension, names;
        names = [css$2.attachment, `${css$2.attachment}--${this.attachment.getType()}`];
        if (extension = this.attachment.getExtension()) {
          names.push(`${css$2.attachment}--${extension}`);
        }
        return names.join(" ");
      }

      getData() {
        var attributes, data;
        data = {
          trixAttachment: JSON.stringify(this.attachment),
          trixContentType: this.attachment.getContentType(),
          trixId: this.attachment.id
        };
        ({attributes} = this.attachmentPiece);
        if (!attributes.isEmpty()) {
          data.trixAttributes = JSON.stringify(attributes);
        }
        if (this.attachment.isPending()) {
          data.trixSerialize = false;
        }
        return data;
      }

      getHref() {
        if (!htmlContainsTagName(this.attachment.getContent(), "a")) {
          return this.attachment.getHref();
        }
      }

      getCaptionConfig() {
        var config, ref, type;
        type = this.attachment.getType();
        config = Trix$2.copyObject((ref = Trix$2.config.attachments[type]) != null ? ref.caption : void 0);
        if (type === "file") {
          config.name = true;
        }
        return config;
      }

      findProgressElement() {
        var ref;
        return (ref = this.findElement()) != null ? ref.querySelector("progress") : void 0;
      }

      // Attachment delegate
      attachmentDidChangeUploadProgress() {
        var ref, value;
        value = this.attachment.getUploadProgress();
        return (ref = this.findProgressElement()) != null ? ref.value = value : void 0;
      }

    };

    AttachmentView.attachmentSelector = "[data-trix-attachment]";

    createCursorTarget = function(name) {
      return makeElement$8({
        tagName: "span",
        textContent: Trix$2.ZERO_WIDTH_SPACE,
        data: {
          trixCursorTarget: name,
          trixSerialize: false
        }
      });
    };

    return AttachmentView;

  }).call(window);

  htmlContainsTagName = function(html, tagName) {
    var div;
    div = makeElement$8("div");
    div.innerHTML = html != null ? html : "";
    return div.querySelector(tagName);
  };

  var makeElement$7;

  ({makeElement: makeElement$7} = Trix$2);

  Trix$2.PreviewableAttachmentView = class PreviewableAttachmentView extends Trix$2.AttachmentView {
    constructor() {
      super(...arguments);
      this.attachment.previewDelegate = this;
    }

    createContentNodes() {
      this.image = makeElement$7({
        tagName: "img",
        attributes: {
          src: ""
        },
        data: {
          trixMutable: true
        }
      });
      this.refresh(this.image);
      return [this.image];
    }

    createCaptionElement() {
      var figcaption;
      figcaption = super.createCaptionElement(...arguments);
      if (!figcaption.textContent) {
        figcaption.setAttribute("data-trix-placeholder", Trix$2.config.lang.captionPlaceholder);
      }
      return figcaption;
    }

    refresh(image) {
      var ref;
      if (image == null) {
        image = (ref = this.findElement()) != null ? ref.querySelector("img") : void 0;
      }
      if (image) {
        return this.updateAttributesForImage(image);
      }
    }

    updateAttributesForImage(image) {
      var height, previewURL, serializedAttributes, storeKey, url, width;
      url = this.attachment.getURL();
      previewURL = this.attachment.getPreviewURL();
      image.src = previewURL || url;
      if (previewURL === url) {
        image.removeAttribute("data-trix-serialized-attributes");
      } else {
        serializedAttributes = JSON.stringify({
          src: url
        });
        image.setAttribute("data-trix-serialized-attributes", serializedAttributes);
      }
      width = this.attachment.getWidth();
      height = this.attachment.getHeight();
      if (width != null) {
        image.width = width;
      }
      if (height != null) {
        image.height = height;
      }
      storeKey = ["imageElement", this.attachment.id, image.src, image.width, image.height].join("/");
      return image.dataset.trixStoreKey = storeKey;
    }

    // Attachment delegate
    attachmentDidChangeAttributes() {
      this.refresh(this.image);
      return this.refresh();
    }

  };

  var findInnerElement, getTextConfig$1, makeElement$6;

  ({makeElement: makeElement$6, findInnerElement, getTextConfig: getTextConfig$1} = Trix$2);

  Trix$2.PieceView = (function() {
    var nbsp;

    class PieceView extends Trix$2.ObjectView {
      constructor() {
        super(...arguments);
        this.piece = this.object;
        this.attributes = this.piece.getAttributes();
        ({textConfig: this.textConfig, context: this.context} = this.options);
        if (this.piece.attachment) {
          this.attachment = this.piece.attachment;
        } else {
          this.string = this.piece.toString();
        }
      }

      createNodes() {
        var element, i, innerElement, len, node, nodes;
        nodes = this.attachment ? this.createAttachmentNodes() : this.createStringNodes();
        if (element = this.createElement()) {
          innerElement = findInnerElement(element);
          for (i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i];
            innerElement.appendChild(node);
          }
          nodes = [element];
        }
        return nodes;
      }

      createAttachmentNodes() {
        var constructor, view;
        constructor = this.attachment.isPreviewable() ? Trix$2.PreviewableAttachmentView : Trix$2.AttachmentView;
        view = this.createChildView(constructor, this.piece.attachment, {piece: this.piece});
        return view.getNodes();
      }

      createStringNodes() {
        var element, i, index, len, length, node, nodes, ref, ref1, substring;
        if ((ref = this.textConfig) != null ? ref.plaintext : void 0) {
          return [document.createTextNode(this.string)];
        } else {
          nodes = [];
          ref1 = this.string.split("\n");
          for (index = i = 0, len = ref1.length; i < len; index = ++i) {
            substring = ref1[index];
            if (index > 0) {
              element = makeElement$6("br");
              nodes.push(element);
            }
            if (length = substring.length) {
              node = document.createTextNode(this.preserveSpaces(substring));
              nodes.push(node);
            }
          }
          return nodes;
        }
      }

      createElement() {
        var config, element, innerElement, key, pendingElement, ref, ref1, styles, value;
        styles = {};
        ref = this.attributes;
        for (key in ref) {
          value = ref[key];
          if (!(config = getTextConfig$1(key))) {
            continue;
          }
          if (config.tagName) {
            pendingElement = makeElement$6(config.tagName);
            if (innerElement) {
              innerElement.appendChild(pendingElement);
              innerElement = pendingElement;
            } else {
              element = innerElement = pendingElement;
            }
          }
          if (config.styleProperty) {
            styles[config.styleProperty] = value;
          }
          if (config.style) {
            ref1 = config.style;
            for (key in ref1) {
              value = ref1[key];
              styles[key] = value;
            }
          }
        }
        if (Object.keys(styles).length) {
          if (element == null) {
            element = makeElement$6("span");
          }
          for (key in styles) {
            value = styles[key];
            element.style[key] = value;
          }
        }
        return element;
      }

      createContainerElement() {
        var attributes, config, key, ref, value;
        ref = this.attributes;
        for (key in ref) {
          value = ref[key];
          if (config = getTextConfig$1(key)) {
            if (config.groupTagName) {
              attributes = {};
              attributes[key] = value;
              return makeElement$6(config.groupTagName, attributes);
            }
          }
        }
      }

      preserveSpaces(string) {
        if (this.context.isLast) {
          string = string.replace(/\ $/, nbsp);
        }
        string = string.replace(/(\S)\ {3}(\S)/g, `$1 ${nbsp} $2`).replace(/\ {2}/g, `${nbsp} `).replace(/\ {2}/g, ` ${nbsp}`);
        if (this.context.isFirst || this.context.followsWhitespace) {
          string = string.replace(/^\ /, nbsp);
        }
        return string;
      }

    };

    nbsp = Trix$2.NON_BREAKING_SPACE;

    return PieceView;

  }).call(window);

  Trix$2.TextView = (function() {
    var endsWithWhitespace;

    class TextView extends Trix$2.ObjectView {
      constructor() {
        super(...arguments);
        this.text = this.object;
        ({textConfig: this.textConfig} = this.options);
      }

      createNodes() {
        var context, i, index, lastIndex, len, nodes, piece, pieces, previousPiece, view;
        nodes = [];
        pieces = Trix$2.ObjectGroup.groupObjects(this.getPieces());
        lastIndex = pieces.length - 1;
        for (index = i = 0, len = pieces.length; i < len; index = ++i) {
          piece = pieces[index];
          context = {};
          if (index === 0) {
            context.isFirst = true;
          }
          if (index === lastIndex) {
            context.isLast = true;
          }
          if (endsWithWhitespace(previousPiece)) {
            context.followsWhitespace = true;
          }
          view = this.findOrCreateCachedChildView(Trix$2.PieceView, piece, {textConfig: this.textConfig, context});
          nodes.push(...view.getNodes());
          previousPiece = piece;
        }
        return nodes;
      }

      getPieces() {
        var i, len, piece, ref, results;
        ref = this.text.getPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          if (!piece.hasAttribute("blockBreak")) {
            results.push(piece);
          }
        }
        return results;
      }

    };

    endsWithWhitespace = function(piece) {
      return /\s$/.test(piece != null ? piece.toString() : void 0);
    };

    return TextView;

  }).call(window);

  var css$1, getBlockConfig$4, makeElement$5;

  ({makeElement: makeElement$5, getBlockConfig: getBlockConfig$4} = Trix$2);

  ({css: css$1} = Trix$2.config);

  Trix$2.BlockView = class BlockView extends Trix$2.ObjectView {
    constructor() {
      super(...arguments);
      this.block = this.object;
      this.attributes = this.block.getAttributes();
    }

    createNodes() {
      var attributes, comment, element, i, len, node, nodes, ref, tagName, textConfig, textView;
      comment = document.createComment("block");
      nodes = [comment];
      if (this.block.isEmpty()) {
        nodes.push(makeElement$5("br"));
      } else {
        textConfig = (ref = getBlockConfig$4(this.block.getLastAttribute())) != null ? ref.text : void 0;
        textView = this.findOrCreateCachedChildView(Trix$2.TextView, this.block.text, {textConfig});
        nodes.push(...textView.getNodes());
        if (this.shouldAddExtraNewlineElement()) {
          nodes.push(makeElement$5("br"));
        }
      }
      if (this.attributes.length) {
        return nodes;
      } else {
        ({tagName} = Trix$2.config.blockAttributes.default);
        if (this.block.isRTL()) {
          attributes = {
            dir: "rtl"
          };
        }
        element = makeElement$5({tagName, attributes});
        for (i = 0, len = nodes.length; i < len; i++) {
          node = nodes[i];
          element.appendChild(node);
        }
        return [element];
      }
    }

    createContainerElement(depth) {
      var attributeName, attributes, className, size, tagName;
      attributeName = this.attributes[depth];
      ({tagName} = getBlockConfig$4(attributeName));
      if (depth === 0 && this.block.isRTL()) {
        attributes = {
          dir: "rtl"
        };
      }
      if (attributeName === "attachmentGallery") {
        size = this.block.getBlockBreakPosition();
        className = `${css$1.attachmentGallery} ${css$1.attachmentGallery}--${size}`;
      }
      return makeElement$5({tagName, className, attributes});
    }

    // A single <br> at the end of a block element has no visual representation
    // so add an extra one.
    shouldAddExtraNewlineElement() {
      return /\n\n$/.test(this.block.toString());
    }

  };

  var defer$2, makeElement$4;

  ({defer: defer$2, makeElement: makeElement$4} = Trix$2);

  Trix$2.DocumentView = (function() {
    var elementsHaveEqualHTML, findStoredElements, ignoreSpaces;

    class DocumentView extends Trix$2.ObjectView {
      static render(document) {
        var element, view;
        element = makeElement$4("div");
        view = new this(document, {element});
        view.render();
        view.sync();
        return element;
      }

      constructor() {
        super(...arguments);
        ({element: this.element} = this.options);
        this.elementStore = new Trix$2.ElementStore();
        this.setDocument(this.object);
      }

      setDocument(document) {
        if (!document.isEqualTo(this.document)) {
          return this.document = this.object = document;
        }
      }

      render() {
        var i, len, node, object, objects, results, view;
        this.childViews = [];
        this.shadowElement = makeElement$4("div");
        if (!this.document.isEmpty()) {
          objects = Trix$2.ObjectGroup.groupObjects(this.document.getBlocks(), {
            asTree: true
          });
          results = [];
          for (i = 0, len = objects.length; i < len; i++) {
            object = objects[i];
            view = this.findOrCreateCachedChildView(Trix$2.BlockView, object);
            results.push((function() {
              var j, len1, ref, results1;
              ref = view.getNodes();
              results1 = [];
              for (j = 0, len1 = ref.length; j < len1; j++) {
                node = ref[j];
                results1.push(this.shadowElement.appendChild(node));
              }
              return results1;
            }).call(this));
          }
          return results;
        }
      }

      isSynced() {
        return elementsHaveEqualHTML(this.shadowElement, this.element);
      }

      sync() {
        var fragment;
        fragment = this.createDocumentFragmentForSync();
        while (this.element.lastChild) {
          this.element.removeChild(this.element.lastChild);
        }
        this.element.appendChild(fragment);
        return this.didSync();
      }

      // Private
      didSync() {
        this.elementStore.reset(findStoredElements(this.element));
        return defer$2(() => {
          return this.garbageCollectCachedViews();
        });
      }

      createDocumentFragmentForSync() {
        var element, fragment, i, j, len, len1, node, ref, ref1, storedElement;
        fragment = document.createDocumentFragment();
        ref = this.shadowElement.childNodes;
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          fragment.appendChild(node.cloneNode(true));
        }
        ref1 = findStoredElements(fragment);
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          element = ref1[j];
          if (storedElement = this.elementStore.remove(element)) {
            element.parentNode.replaceChild(storedElement, element);
          }
        }
        return fragment;
      }

    };

    findStoredElements = function(element) {
      return element.querySelectorAll("[data-trix-store-key]");
    };

    elementsHaveEqualHTML = function(element, otherElement) {
      return ignoreSpaces(element.innerHTML) === ignoreSpaces(otherElement.innerHTML);
    };

    ignoreSpaces = function(html) {
      return html.replace(/&nbsp;/g, " ");
    };

    return DocumentView;

  }).call(window);

  var findClosestElementFromNode$4, nodeIsBlockStartComment$1, nodeIsEmptyTextNode$1, normalizeSpaces$1, ref$7, summarizeStringChange, tagName$5,
    boundMethodCheck$7 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf$8 = [].indexOf,
    slice$2 = [].slice;

  ({findClosestElementFromNode: findClosestElementFromNode$4, nodeIsEmptyTextNode: nodeIsEmptyTextNode$1, nodeIsBlockStartComment: nodeIsBlockStartComment$1, normalizeSpaces: normalizeSpaces$1, summarizeStringChange, tagName: tagName$5} = Trix$2);

  ref$7 = Trix$2.MutationObserver = (function() {
    var getTextForNodes, mutableAttributeName, mutableSelector, options;

    class MutationObserver extends Trix$2.BasicObject {
      constructor(element) {
        super(...arguments);
        this.didMutate = this.didMutate.bind(this);
        this.element = element;
        this.observer = new window.MutationObserver(this.didMutate);
        this.start();
      }

      start() {
        this.reset();
        return this.observer.observe(this.element, options);
      }

      stop() {
        return this.observer.disconnect();
      }

      didMutate(mutations) {
        var ref1;
        boundMethodCheck$7(this, ref$7);
        this.mutations.push(...this.findSignificantMutations(mutations));
        if (this.mutations.length) {
          if ((ref1 = this.delegate) != null) {
            if (typeof ref1.elementDidMutate === "function") {
              ref1.elementDidMutate(this.getMutationSummary());
            }
          }
          return this.reset();
        }
      }

      // Private
      reset() {
        return this.mutations = [];
      }

      findSignificantMutations(mutations) {
        var i, len, mutation, results;
        results = [];
        for (i = 0, len = mutations.length; i < len; i++) {
          mutation = mutations[i];
          if (this.mutationIsSignificant(mutation)) {
            results.push(mutation);
          }
        }
        return results;
      }

      mutationIsSignificant(mutation) {
        var i, len, node, ref1;
        if (this.nodeIsMutable(mutation.target)) {
          return false;
        }
        ref1 = this.nodesModifiedByMutation(mutation);
        for (i = 0, len = ref1.length; i < len; i++) {
          node = ref1[i];
          if (this.nodeIsSignificant(node)) {
            return true;
          }
        }
        return false;
      }

      nodeIsSignificant(node) {
        return node !== this.element && !this.nodeIsMutable(node) && !nodeIsEmptyTextNode$1(node);
      }

      nodeIsMutable(node) {
        return findClosestElementFromNode$4(node, {
          matchingSelector: mutableSelector
        });
      }

      nodesModifiedByMutation(mutation) {
        var nodes;
        nodes = [];
        switch (mutation.type) {
          case "attributes":
            if (mutation.attributeName !== mutableAttributeName) {
              nodes.push(mutation.target);
            }
            break;
          case "characterData":
            // Changes to text nodes should consider the parent element
            nodes.push(mutation.target.parentNode);
            nodes.push(mutation.target);
            break;
          case "childList":
            // Consider each added or removed node
            nodes.push(...mutation.addedNodes);
            nodes.push(...mutation.removedNodes);
        }
        return nodes;
      }

      getMutationSummary() {
        return this.getTextMutationSummary();
      }

      getTextMutationSummary() {
        var added, addition, additions, deleted, deletions, i, len, ref1, summary, textChanges;
        ({additions, deletions} = this.getTextChangesFromCharacterData());
        textChanges = this.getTextChangesFromChildList();
        ref1 = textChanges.additions;
        for (i = 0, len = ref1.length; i < len; i++) {
          addition = ref1[i];
          if (indexOf$8.call(additions, addition) < 0) {
            additions.push(addition);
          }
        }
        deletions.push(...textChanges.deletions);
        summary = {};
        if (added = additions.join("")) {
          summary.textAdded = added;
        }
        if (deleted = deletions.join("")) {
          summary.textDeleted = deleted;
        }
        return summary;
      }

      getMutationsByType(type) {
        var i, len, mutation, ref1, results;
        ref1 = this.mutations;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          mutation = ref1[i];
          if (mutation.type === type) {
            results.push(mutation);
          }
        }
        return results;
      }

      getTextChangesFromChildList() {
        var addedNodes, i, index, len, mutation, ref1, removedNodes, singleBlockCommentRemoved, text, textAdded, textRemoved;
        addedNodes = [];
        removedNodes = [];
        ref1 = this.getMutationsByType("childList");
        for (i = 0, len = ref1.length; i < len; i++) {
          mutation = ref1[i];
          addedNodes.push(...mutation.addedNodes);
          removedNodes.push(...mutation.removedNodes);
        }
        singleBlockCommentRemoved = addedNodes.length === 0 && removedNodes.length === 1 && nodeIsBlockStartComment$1(removedNodes[0]);
        if (singleBlockCommentRemoved) {
          textAdded = [];
          textRemoved = ["\n"];
        } else {
          textAdded = getTextForNodes(addedNodes);
          textRemoved = getTextForNodes(removedNodes);
        }
        return {
          additions: (function() {
            var j, len1, results;
            results = [];
            for (index = j = 0, len1 = textAdded.length; j < len1; index = ++j) {
              text = textAdded[index];
              if (text !== textRemoved[index]) {
                results.push(normalizeSpaces$1(text));
              }
            }
            return results;
          })(),
          deletions: (function() {
            var j, len1, results;
            results = [];
            for (index = j = 0, len1 = textRemoved.length; j < len1; index = ++j) {
              text = textRemoved[index];
              if (text !== textAdded[index]) {
                results.push(normalizeSpaces$1(text));
              }
            }
            return results;
          })()
        };
      }

      getTextChangesFromCharacterData() {
        var added, characterMutations, endMutation, newString, oldString, removed, startMutation;
        characterMutations = this.getMutationsByType("characterData");
        if (characterMutations.length) {
          [startMutation] = characterMutations, [endMutation] = slice$2.call(characterMutations, -1);
          oldString = normalizeSpaces$1(startMutation.oldValue);
          newString = normalizeSpaces$1(endMutation.target.data);
          ({added, removed} = summarizeStringChange(oldString, newString));
        }
        return {
          additions: added ? [added] : [],
          deletions: removed ? [removed] : []
        };
      }

    };

    mutableAttributeName = "data-trix-mutable";

    mutableSelector = `[${mutableAttributeName}]`;

    options = {
      attributes: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true
    };

    getTextForNodes = function(nodes = []) {
      var i, len, node, text;
      text = [];
      for (i = 0, len = nodes.length; i < len; i++) {
        node = nodes[i];
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            text.push(node.data);
            break;
          case Node.ELEMENT_NODE:
            if (tagName$5(node) === "br") {
              text.push("\n");
            } else {
              text.push(...getTextForNodes(node.childNodes));
            }
        }
      }
      return text;
    };

    return MutationObserver;

  }).call(window);

  var getDOMRange$2, ref$6,
    indexOf$7 = [].indexOf,
    boundMethodCheck$6 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({getDOMRange: getDOMRange$2} = Trix$2);

  ref$6 = Trix$2.SelectionChangeObserver = (function() {
    var domRangesAreEqual;

    class SelectionChangeObserver extends Trix$2.BasicObject {
      constructor() {
        super(...arguments);
        this.update = this.update.bind(this);
        // Private
        this.run = this.run.bind(this);
        this.selectionManagers = [];
      }

      start() {
        if (!this.started) {
          this.started = true;
          if ("onselectionchange" in document) {
            return document.addEventListener("selectionchange", this.update, true);
          } else {
            return this.run();
          }
        }
      }

      stop() {
        if (this.started) {
          this.started = false;
          return document.removeEventListener("selectionchange", this.update, true);
        }
      }

      registerSelectionManager(selectionManager) {
        if (indexOf$7.call(this.selectionManagers, selectionManager) < 0) {
          this.selectionManagers.push(selectionManager);
          return this.start();
        }
      }

      unregisterSelectionManager(selectionManager) {
        var s;
        this.selectionManagers = (function() {
          var i, len, ref1, results;
          ref1 = this.selectionManagers;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            s = ref1[i];
            if (s !== selectionManager) {
              results.push(s);
            }
          }
          return results;
        }).call(this);
        if (this.selectionManagers.length === 0) {
          return this.stop();
        }
      }

      notifySelectionManagersOfSelectionChange() {
        var i, len, ref1, results, selectionManager;
        ref1 = this.selectionManagers;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selectionManager = ref1[i];
          results.push(selectionManager.selectionDidChange());
        }
        return results;
      }

      update() {
        var domRange;
        boundMethodCheck$6(this, ref$6);
        domRange = getDOMRange$2();
        if (!domRangesAreEqual(domRange, this.domRange)) {
          this.domRange = domRange;
          return this.notifySelectionManagersOfSelectionChange();
        }
      }

      reset() {
        this.domRange = null;
        return this.update();
      }

      run() {
        boundMethodCheck$6(this, ref$6);
        if (this.started) {
          this.update();
          return requestAnimationFrame(this.run);
        }
      }

    };

    domRangesAreEqual = function(left, right) {
      return (left != null ? left.startContainer : void 0) === (right != null ? right.startContainer : void 0) && (left != null ? left.startOffset : void 0) === (right != null ? right.startOffset : void 0) && (left != null ? left.endContainer : void 0) === (right != null ? right.endContainer : void 0) && (left != null ? left.endOffset : void 0) === (right != null ? right.endOffset : void 0);
    };

    return SelectionChangeObserver;

  }).call(window);

  if (Trix$2.selectionChangeObserver == null) {
    Trix$2.selectionChangeObserver = new Trix$2.SelectionChangeObserver();
  }

  Trix$2.registerElement("trix-toolbar", {
    defaultCSS: `%t {
  display: block;
}

%t {
  white-space: nowrap;
}

%t [data-trix-dialog] {
  display: none;
}

%t [data-trix-dialog][data-trix-active] {
  display: block;
}

%t [data-trix-dialog] [data-trix-validate]:invalid {
  background-color: #ffdddd;
}`,
    // Element lifecycle
    initialize: function() {
      if (this.innerHTML === "") {
        return this.innerHTML = Trix$2.config.toolbar.getDefaultHTML();
      }
    }
  });

  Trix$2.Controller = class Controller extends Trix$2.BasicObject {};

  Trix$2.FileVerificationOperation = class FileVerificationOperation extends Trix$2.Operation {
    constructor(file) {
      super(...arguments);
      this.file = file;
    }

    perform(callback) {
      var reader;
      reader = new FileReader();
      reader.onerror = function() {
        return callback(false);
      };
      reader.onload = () => {
        reader.onerror = null;
        try {
          reader.abort();
        } catch (error) {}
        return callback(true, this.file);
      };
      return reader.readAsArrayBuffer(this.file);
    }

  };

  var handleEvent$5, innerElementIsActive$2;

  ({handleEvent: handleEvent$5, innerElementIsActive: innerElementIsActive$2} = Trix$2);

  Trix$2.InputController = (function() {
    class InputController extends Trix$2.BasicObject {
      constructor(element) {
        var eventName;
        super(...arguments);
        this.element = element;
        this.mutationObserver = new Trix$2.MutationObserver(this.element);
        this.mutationObserver.delegate = this;
        for (eventName in this.events) {
          handleEvent$5(eventName, {
            onElement: this.element,
            withCallback: this.handlerFor(eventName)
          });
        }
      }

      elementDidMutate(mutationSummary) {}

      editorWillSyncDocumentView() {
        return this.mutationObserver.stop();
      }

      editorDidSyncDocumentView() {
        return this.mutationObserver.start();
      }

      requestRender() {
        var ref;
        return (ref = this.delegate) != null ? typeof ref.inputControllerDidRequestRender === "function" ? ref.inputControllerDidRequestRender() : void 0 : void 0;
      }

      requestReparse() {
        var ref;
        if ((ref = this.delegate) != null) {
          if (typeof ref.inputControllerDidRequestReparse === "function") {
            ref.inputControllerDidRequestReparse();
          }
        }
        return this.requestRender();
      }

      attachFiles(files) {
        var file, operations;
        operations = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            results.push(new Trix$2.FileVerificationOperation(file));
          }
          return results;
        })();
        return Promise.all(operations).then((files) => {
          return this.handleInput(function() {
            var ref, ref1;
            if ((ref = this.delegate) != null) {
              ref.inputControllerWillAttachFiles();
            }
            if ((ref1 = this.responder) != null) {
              ref1.insertFiles(files);
            }
            return this.requestRender();
          });
        });
      }

      // Private
      handlerFor(eventName) {
        return (event) => {
          if (!event.defaultPrevented) {
            return this.handleInput(function() {
              if (!innerElementIsActive$2(this.element)) {
                this.eventName = eventName;
                return this.events[eventName].call(this, event);
              }
            });
          }
        };
      }

      handleInput(callback) {
        var ref, ref1;
        try {
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillHandleInput();
          }
          return callback.call(this);
        } finally {
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerDidHandleInput();
          }
        }
      }

      createLinkHTML(href, text) {
        var link;
        link = document.createElement("a");
        link.href = href;
        link.textContent = text != null ? text : href;
        return link.outerHTML;
      }

    };

    InputController.prototype.events = {};

    return InputController;

  }).call(window);

  var CompositionInput, browser$1, dataTransferIsPlainText$1, dataTransferIsWritable, extensionForFile, hasStringCodePointAt, keyEventIsKeyboardCommand$1, keyNames$1, makeElement$3, objectsAreEqual$3, pasteEventIsCrippledSafariHTMLPaste, stringFromKeyEvent, tagName$4,
    indexOf$6 = [].indexOf;

  ({makeElement: makeElement$3, objectsAreEqual: objectsAreEqual$3, tagName: tagName$4, browser: browser$1, keyEventIsKeyboardCommand: keyEventIsKeyboardCommand$1, dataTransferIsWritable, dataTransferIsPlainText: dataTransferIsPlainText$1} = Trix$2);

  ({keyNames: keyNames$1} = Trix$2.config);

  Trix$2.Level0InputController = (function() {
    var pastedFileCount;

    class Level0InputController extends Trix$2.InputController {
      constructor() {
        super(...arguments);
        this.resetInputSummary();
      }

      setInputSummary(summary = {}) {
        var key, value;
        this.inputSummary.eventName = this.eventName;
        for (key in summary) {
          value = summary[key];
          this.inputSummary[key] = value;
        }
        return this.inputSummary;
      }

      resetInputSummary() {
        return this.inputSummary = {};
      }

      reset() {
        this.resetInputSummary();
        return Trix$2.selectionChangeObserver.reset();
      }

      // Mutation observer delegate
      elementDidMutate(mutationSummary) {
        var ref;
        if (this.isComposing()) {
          return (ref = this.delegate) != null ? typeof ref.inputControllerDidAllowUnhandledInput === "function" ? ref.inputControllerDidAllowUnhandledInput() : void 0 : void 0;
        } else {
          return this.handleInput(function() {
            if (this.mutationIsSignificant(mutationSummary)) {
              if (this.mutationIsExpected(mutationSummary)) {
                this.requestRender();
              } else {
                this.requestReparse();
              }
            }
            return this.reset();
          });
        }
      }

      mutationIsExpected({textAdded, textDeleted}) {
        var mutationAdditionMatchesSummary, mutationDeletionMatchesSummary, offset, range, ref, singleUnexpectedNewline, unexpectedNewlineAddition, unexpectedNewlineDeletion;
        if (this.inputSummary.preferDocument) {
          return true;
        }
        mutationAdditionMatchesSummary = textAdded != null ? textAdded === this.inputSummary.textAdded : !this.inputSummary.textAdded;
        mutationDeletionMatchesSummary = textDeleted != null ? this.inputSummary.didDelete : !this.inputSummary.didDelete;
        unexpectedNewlineAddition = (textAdded === "\n" || textAdded === " \n") && !mutationAdditionMatchesSummary;
        unexpectedNewlineDeletion = textDeleted === "\n" && !mutationDeletionMatchesSummary;
        singleUnexpectedNewline = (unexpectedNewlineAddition && !unexpectedNewlineDeletion) || (unexpectedNewlineDeletion && !unexpectedNewlineAddition);
        if (singleUnexpectedNewline) {
          if (range = this.getSelectedRange()) {
            offset = unexpectedNewlineAddition ? textAdded.replace(/\n$/, "").length || -1 : (textAdded != null ? textAdded.length : void 0) || 1;
            if ((ref = this.responder) != null ? ref.positionIsBlockBreak(range[1] + offset) : void 0) {
              return true;
            }
          }
        }
        return mutationAdditionMatchesSummary && mutationDeletionMatchesSummary;
      }

      mutationIsSignificant(mutationSummary) {
        var composedEmptyString, ref, textChanged;
        textChanged = Object.keys(mutationSummary).length > 0;
        composedEmptyString = ((ref = this.compositionInput) != null ? ref.getEndData() : void 0) === "";
        return textChanged || !composedEmptyString;
      }

      // Private
      getCompositionInput() {
        if (this.isComposing()) {
          return this.compositionInput;
        } else {
          return this.compositionInput = new CompositionInput(this);
        }
      }

      isComposing() {
        return (this.compositionInput != null) && !this.compositionInput.isEnded();
      }

      deleteInDirection(direction, event) {
        var ref;
        if (((ref = this.responder) != null ? ref.deleteInDirection(direction) : void 0) === false) {
          if (event) {
            event.preventDefault();
            return this.requestRender();
          }
        } else {
          return this.setInputSummary({
            didDelete: true
          });
        }
      }

      serializeSelectionToDataTransfer(dataTransfer) {
        var document, ref;
        if (!dataTransferIsWritable(dataTransfer)) {
          return;
        }
        document = (ref = this.responder) != null ? ref.getSelectedDocument().toSerializableDocument() : void 0;
        dataTransfer.setData("application/x-trix-document", JSON.stringify(document));
        dataTransfer.setData("text/html", Trix$2.DocumentView.render(document).innerHTML);
        dataTransfer.setData("text/plain", document.toString().replace(/\n$/, ""));
        return true;
      }

      canAcceptDataTransfer(dataTransfer) {
        var i, len, ref, ref1, type, types;
        types = {};
        ref1 = (ref = dataTransfer != null ? dataTransfer.types : void 0) != null ? ref : [];
        for (i = 0, len = ref1.length; i < len; i++) {
          type = ref1[i];
          types[type] = true;
        }
        return types["Files"] || types["application/x-trix-document"] || types["text/html"] || types["text/plain"];
      }

      getPastedHTMLUsingHiddenElement(callback) {
        var element, selectedRange, style;
        selectedRange = this.getSelectedRange();
        style = {
          position: "absolute",
          left: `${window.pageXOffset}px`,
          top: `${window.pageYOffset}px`,
          opacity: 0
        };
        element = makeElement$3({
          style,
          tagName: "div",
          editable: true
        });
        document.body.appendChild(element);
        element.focus();
        return requestAnimationFrame(() => {
          var html;
          html = element.innerHTML;
          Trix$2.removeNode(element);
          this.setSelectedRange(selectedRange);
          return callback(html);
        });
      }

    };

    pastedFileCount = 0;

    // Input handlers
    Level0InputController.prototype.events = {
      keydown: function(event) {
        var character, context, i, keyName, keys, len, modifier, ref, ref1;
        if (!this.isComposing()) {
          this.resetInputSummary();
        }
        this.inputSummary.didInput = true;
        if (keyName = keyNames$1[event.keyCode]) {
          context = this.keys;
          ref = ["ctrl", "alt", "shift", "meta"];
          for (i = 0, len = ref.length; i < len; i++) {
            modifier = ref[i];
            if (!event[`${modifier}Key`]) {
              continue;
            }
            if (modifier === "ctrl") {
              modifier = "control";
            }
            context = context != null ? context[modifier] : void 0;
          }
          if ((context != null ? context[keyName] : void 0) != null) {
            this.setInputSummary({keyName});
            Trix$2.selectionChangeObserver.reset();
            context[keyName].call(this, event);
          }
        }
        if (keyEventIsKeyboardCommand$1(event)) {
          if (character = String.fromCharCode(event.keyCode).toLowerCase()) {
            keys = (function() {
              var j, len1, ref1, results;
              ref1 = ["alt", "shift"];
              results = [];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                modifier = ref1[j];
                if (event[`${modifier}Key`]) {
                  results.push(modifier);
                }
              }
              return results;
            })();
            keys.push(character);
            if ((ref1 = this.delegate) != null ? ref1.inputControllerDidReceiveKeyboardCommand(keys) : void 0) {
              return event.preventDefault();
            }
          }
        }
      },
      keypress: function(event) {
        var ref, ref1, string;
        if (this.inputSummary.eventName != null) {
          return;
        }
        if (event.metaKey) {
          return;
        }
        if (event.ctrlKey && !event.altKey) {
          return;
        }
        if (string = stringFromKeyEvent(event)) {
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          if ((ref1 = this.responder) != null) {
            ref1.insertString(string);
          }
          return this.setInputSummary({
            textAdded: string,
            didDelete: this.selectionIsExpanded()
          });
        }
      },
      textInput: function(event) {
        var data, range, ref, textAdded;
        // Handle autocapitalization
        ({data} = event);
        ({textAdded} = this.inputSummary);
        if (textAdded && textAdded !== data && textAdded.toUpperCase() === data) {
          range = this.getSelectedRange();
          this.setSelectedRange([range[0], range[1] + textAdded.length]);
          if ((ref = this.responder) != null) {
            ref.insertString(data);
          }
          this.setInputSummary({
            textAdded: data
          });
          return this.setSelectedRange(range);
        }
      },
      dragenter: function(event) {
        return event.preventDefault();
      },
      dragstart: function(event) {
        var ref, target;
        target = event.target;
        this.serializeSelectionToDataTransfer(event.dataTransfer);
        this.draggedRange = this.getSelectedRange();
        return (ref = this.delegate) != null ? typeof ref.inputControllerDidStartDrag === "function" ? ref.inputControllerDidStartDrag() : void 0 : void 0;
      },
      dragover: function(event) {
        var draggingPoint, ref;
        if (this.draggedRange || this.canAcceptDataTransfer(event.dataTransfer)) {
          event.preventDefault();
          draggingPoint = {
            x: event.clientX,
            y: event.clientY
          };
          if (!objectsAreEqual$3(draggingPoint, this.draggingPoint)) {
            this.draggingPoint = draggingPoint;
            return (ref = this.delegate) != null ? typeof ref.inputControllerDidReceiveDragOverPoint === "function" ? ref.inputControllerDidReceiveDragOverPoint(this.draggingPoint) : void 0 : void 0;
          }
        }
      },
      dragend: function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          if (typeof ref.inputControllerDidCancelDrag === "function") {
            ref.inputControllerDidCancelDrag();
          }
        }
        this.draggedRange = null;
        return this.draggingPoint = null;
      },
      drop: function(event) {
        var document, documentJSON, files, point, ref, ref1, ref2, ref3, ref4;
        event.preventDefault();
        files = (ref = event.dataTransfer) != null ? ref.files : void 0;
        point = {
          x: event.clientX,
          y: event.clientY
        };
        if ((ref1 = this.responder) != null) {
          ref1.setLocationRangeFromPointRange(point);
        }
        if (files != null ? files.length : void 0) {
          this.attachFiles(files);
        } else if (this.draggedRange) {
          if ((ref2 = this.delegate) != null) {
            ref2.inputControllerWillMoveText();
          }
          if ((ref3 = this.responder) != null) {
            ref3.moveTextFromRange(this.draggedRange);
          }
          this.draggedRange = null;
          this.requestRender();
        } else if (documentJSON = event.dataTransfer.getData("application/x-trix-document")) {
          document = Trix$2.Document.fromJSONString(documentJSON);
          if ((ref4 = this.responder) != null) {
            ref4.insertDocument(document);
          }
          this.requestRender();
        }
        this.draggedRange = null;
        return this.draggingPoint = null;
      },
      cut: function(event) {
        var ref, ref1;
        if ((ref = this.responder) != null ? ref.selectionIsExpanded() : void 0) {
          if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
            event.preventDefault();
          }
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillCutText();
          }
          this.deleteInDirection("backward");
          if (event.defaultPrevented) {
            return this.requestRender();
          }
        }
      },
      copy: function(event) {
        var ref;
        if ((ref = this.responder) != null ? ref.selectionIsExpanded() : void 0) {
          if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
            return event.preventDefault();
          }
        }
      },
      paste: function(event) {
        var clipboard, extension, file, href, html, name, paste, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, string;
        clipboard = (ref = event.clipboardData) != null ? ref : event.testClipboardData;
        paste = {clipboard};
        if ((clipboard == null) || pasteEventIsCrippledSafariHTMLPaste(event)) {
          this.getPastedHTMLUsingHiddenElement((html) => {
            var ref1, ref2, ref3;
            paste.type = "text/html";
            paste.html = html;
            if ((ref1 = this.delegate) != null) {
              ref1.inputControllerWillPaste(paste);
            }
            if ((ref2 = this.responder) != null) {
              ref2.insertHTML(paste.html);
            }
            this.requestRender();
            return (ref3 = this.delegate) != null ? ref3.inputControllerDidPaste(paste) : void 0;
          });
          return;
        }
        if (href = clipboard.getData("URL")) {
          paste.type = "text/html";
          if (name = clipboard.getData("public.url-name")) {
            string = Trix$2.squishBreakableWhitespace(name).trim();
          } else {
            string = href;
          }
          paste.html = this.createLinkHTML(href, string);
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPaste(paste);
          }
          this.setInputSummary({
            textAdded: string,
            didDelete: this.selectionIsExpanded()
          });
          if ((ref2 = this.responder) != null) {
            ref2.insertHTML(paste.html);
          }
          this.requestRender();
          if ((ref3 = this.delegate) != null) {
            ref3.inputControllerDidPaste(paste);
          }
        } else if (dataTransferIsPlainText$1(clipboard)) {
          paste.type = "text/plain";
          paste.string = clipboard.getData("text/plain");
          if ((ref4 = this.delegate) != null) {
            ref4.inputControllerWillPaste(paste);
          }
          this.setInputSummary({
            textAdded: paste.string,
            didDelete: this.selectionIsExpanded()
          });
          if ((ref5 = this.responder) != null) {
            ref5.insertString(paste.string);
          }
          this.requestRender();
          if ((ref6 = this.delegate) != null) {
            ref6.inputControllerDidPaste(paste);
          }
        } else if (html = clipboard.getData("text/html")) {
          paste.type = "text/html";
          paste.html = html;
          if ((ref7 = this.delegate) != null) {
            ref7.inputControllerWillPaste(paste);
          }
          if ((ref8 = this.responder) != null) {
            ref8.insertHTML(paste.html);
          }
          this.requestRender();
          if ((ref9 = this.delegate) != null) {
            ref9.inputControllerDidPaste(paste);
          }
        } else if (indexOf$6.call(clipboard.types, "Files") >= 0) {
          if (file = (ref10 = clipboard.items) != null ? (ref11 = ref10[0]) != null ? typeof ref11.getAsFile === "function" ? ref11.getAsFile() : void 0 : void 0 : void 0) {
            if (!file.name && (extension = extensionForFile(file))) {
              file.name = `pasted-file-${++pastedFileCount}.${extension}`;
            }
            paste.type = "File";
            paste.file = file;
            if ((ref12 = this.delegate) != null) {
              ref12.inputControllerWillAttachFiles();
            }
            if ((ref13 = this.responder) != null) {
              ref13.insertFile(paste.file);
            }
            this.requestRender();
            if ((ref14 = this.delegate) != null) {
              ref14.inputControllerDidPaste(paste);
            }
          }
        }
        return event.preventDefault();
      },
      compositionstart: function(event) {
        return this.getCompositionInput().start(event.data);
      },
      compositionupdate: function(event) {
        return this.getCompositionInput().update(event.data);
      },
      compositionend: function(event) {
        return this.getCompositionInput().end(event.data);
      },
      beforeinput: function(event) {
        return this.inputSummary.didInput = true;
      },
      input: function(event) {
        this.inputSummary.didInput = true;
        return event.stopPropagation();
      }
    };

    Level0InputController.prototype.keys = {
      backspace: function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return this.deleteInDirection("backward", event);
      },
      delete: function(event) {
        var ref;
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return this.deleteInDirection("forward", event);
      },
      return: function(event) {
        var ref, ref1;
        this.setInputSummary({
          preferDocument: true
        });
        if ((ref = this.delegate) != null) {
          ref.inputControllerWillPerformTyping();
        }
        return (ref1 = this.responder) != null ? ref1.insertLineBreak() : void 0;
      },
      tab: function(event) {
        var ref, ref1;
        if ((ref = this.responder) != null ? ref.canIncreaseNestingLevel() : void 0) {
          if ((ref1 = this.responder) != null) {
            ref1.increaseNestingLevel();
          }
          this.requestRender();
          return event.preventDefault();
        }
      },
      left: function(event) {
        var ref;
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault();
          return (ref = this.responder) != null ? ref.moveCursorInDirection("backward") : void 0;
        }
      },
      right: function(event) {
        var ref;
        if (this.selectionIsInCursorTarget()) {
          event.preventDefault();
          return (ref = this.responder) != null ? ref.moveCursorInDirection("forward") : void 0;
        }
      },
      control: {
        d: function(event) {
          var ref;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          return this.deleteInDirection("forward", event);
        },
        h: function(event) {
          var ref;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          return this.deleteInDirection("backward", event);
        },
        o: function(event) {
          var ref, ref1;
          event.preventDefault();
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          if ((ref1 = this.responder) != null) {
            ref1.insertString("\n", {
              updatePosition: false
            });
          }
          return this.requestRender();
        }
      },
      shift: {
        return: function(event) {
          var ref, ref1;
          if ((ref = this.delegate) != null) {
            ref.inputControllerWillPerformTyping();
          }
          if ((ref1 = this.responder) != null) {
            ref1.insertString("\n");
          }
          this.requestRender();
          return event.preventDefault();
        },
        tab: function(event) {
          var ref, ref1;
          if ((ref = this.responder) != null ? ref.canDecreaseNestingLevel() : void 0) {
            if ((ref1 = this.responder) != null) {
              ref1.decreaseNestingLevel();
            }
            this.requestRender();
            return event.preventDefault();
          }
        },
        left: function(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.expandSelectionInDirection("backward");
          }
        },
        right: function(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.expandSelectionInDirection("forward");
          }
        }
      },
      alt: {
        backspace: function(event) {
          var ref;
          this.setInputSummary({
            preferDocument: false
          });
          return (ref = this.delegate) != null ? ref.inputControllerWillPerformTyping() : void 0;
        }
      },
      meta: {
        backspace: function(event) {
          var ref;
          this.setInputSummary({
            preferDocument: false
          });
          return (ref = this.delegate) != null ? ref.inputControllerWillPerformTyping() : void 0;
        }
      }
    };

    Level0InputController.proxyMethod("responder?.getSelectedRange");

    Level0InputController.proxyMethod("responder?.setSelectedRange");

    Level0InputController.proxyMethod("responder?.expandSelectionInDirection");

    Level0InputController.proxyMethod("responder?.selectionIsInCursorTarget");

    Level0InputController.proxyMethod("responder?.selectionIsExpanded");

    return Level0InputController;

  }).call(window);

  extensionForFile = function(file) {
    var ref, ref1;
    return (ref = file.type) != null ? (ref1 = ref.match(/\/(\w+)$/)) != null ? ref1[1] : void 0 : void 0;
  };

  hasStringCodePointAt = (typeof " ".codePointAt === "function" ? " ".codePointAt(0) : void 0) != null;

  stringFromKeyEvent = function(event) {
    var code;
    if (event.key && hasStringCodePointAt && event.key.codePointAt(0) === event.keyCode) {
      return event.key;
    } else {
      if (event.which === null) {
        code = event.keyCode;
      } else if (event.which !== 0 && event.charCode !== 0) {
        code = event.charCode;
      }
      if ((code != null) && keyNames$1[code] !== "escape") {
        return Trix$2.UTF16String.fromCodepoints([code]).toString();
      }
    }
  };

  pasteEventIsCrippledSafariHTMLPaste = function(event) {
    var hasPasteboardFlavor, hasReadableDynamicData, i, isExternalHTMLPaste, isExternalRichTextPaste, len, mightBePasteAndMatchStyle, paste, ref, type;
    if (paste = event.clipboardData) {
      if (indexOf$6.call(paste.types, "text/html") >= 0) {
        ref = paste.types;
        // Answer is yes if there's any possibility of Paste and Match Style in Safari,
        // which is nearly impossible to detect confidently: https://bugs.webkit.org/show_bug.cgi?id=174165
        for (i = 0, len = ref.length; i < len; i++) {
          type = ref[i];
          hasPasteboardFlavor = /^CorePasteboardFlavorType/.test(type);
          hasReadableDynamicData = /^dyn\./.test(type) && paste.getData(type);
          mightBePasteAndMatchStyle = hasPasteboardFlavor || hasReadableDynamicData;
          if (mightBePasteAndMatchStyle) {
            return true;
          }
        }
        return false;
      } else {
        isExternalHTMLPaste = indexOf$6.call(paste.types, "com.apple.webarchive") >= 0;
        isExternalRichTextPaste = indexOf$6.call(paste.types, "com.apple.flat-rtfd") >= 0;
        return isExternalHTMLPaste || isExternalRichTextPaste;
      }
    }
  };

  CompositionInput = (function() {
    class CompositionInput extends Trix$2.BasicObject {
      constructor(inputController) {
        super(...arguments);
        this.inputController = inputController;
        ({responder: this.responder, delegate: this.delegate, inputSummary: this.inputSummary} = this.inputController);
        this.data = {};
      }

      start(data) {
        var ref, ref1;
        this.data.start = data;
        if (this.isSignificant()) {
          if (this.inputSummary.eventName === "keypress" && this.inputSummary.textAdded) {
            if ((ref = this.responder) != null) {
              ref.deleteInDirection("left");
            }
          }
          if (!this.selectionIsExpanded()) {
            this.insertPlaceholder();
            this.requestRender();
          }
          return this.range = (ref1 = this.responder) != null ? ref1.getSelectedRange() : void 0;
        }
      }

      update(data) {
        var range;
        this.data.update = data;
        if (this.isSignificant()) {
          if (range = this.selectPlaceholder()) {
            this.forgetPlaceholder();
            return this.range = range;
          }
        }
      }

      end(data) {
        var ref, ref1, ref2, ref3;
        this.data.end = data;
        if (this.isSignificant()) {
          this.forgetPlaceholder();
          if (this.canApplyToDocument()) {
            this.setInputSummary({
              preferDocument: true,
              didInput: false
            });
            if ((ref = this.delegate) != null) {
              ref.inputControllerWillPerformTyping();
            }
            if ((ref1 = this.responder) != null) {
              ref1.setSelectedRange(this.range);
            }
            if ((ref2 = this.responder) != null) {
              ref2.insertString(this.data.end);
            }
            return (ref3 = this.responder) != null ? ref3.setSelectedRange(this.range[0] + this.data.end.length) : void 0;
          } else if ((this.data.start != null) || (this.data.update != null)) {
            this.requestReparse();
            return this.inputController.reset();
          }
        } else {
          return this.inputController.reset();
        }
      }

      getEndData() {
        return this.data.end;
      }

      isEnded() {
        return this.getEndData() != null;
      }

      isSignificant() {
        if (browser$1.composesExistingText) {
          return this.inputSummary.didInput;
        } else {
          return true;
        }
      }

      // Private
      canApplyToDocument() {
        var ref, ref1;
        return ((ref = this.data.start) != null ? ref.length : void 0) === 0 && ((ref1 = this.data.end) != null ? ref1.length : void 0) > 0 && (this.range != null);
      }

    };

    CompositionInput.proxyMethod("inputController.setInputSummary");

    CompositionInput.proxyMethod("inputController.requestRender");

    CompositionInput.proxyMethod("inputController.requestReparse");

    CompositionInput.proxyMethod("responder?.selectionIsExpanded");

    CompositionInput.proxyMethod("responder?.insertPlaceholder");

    CompositionInput.proxyMethod("responder?.selectPlaceholder");

    CompositionInput.proxyMethod("responder?.forgetPlaceholder");

    return CompositionInput;

  }).call(window);

  var dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual$2, ref$5,
    boundMethodCheck$5 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf$5 = [].indexOf;

  ({dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual: objectsAreEqual$2} = Trix$2);

  ref$5 = Trix$2.Level2InputController = (function() {
    var dragEventHasFiles, keyboardCommandFromKeyEvent, pasteEventHasFilesOnly, pasteEventHasPlainTextOnly, pointFromEvent, staticRangeToRange;

    class Level2InputController extends Trix$2.InputController {
      constructor() {
        super(...arguments);
        this.render = this.render.bind(this);
      }

      elementDidMutate() {
        var ref1;
        if (this.scheduledRender) {
          if (this.composing) {
            return (ref1 = this.delegate) != null ? typeof ref1.inputControllerDidAllowUnhandledInput === "function" ? ref1.inputControllerDidAllowUnhandledInput() : void 0 : void 0;
          }
        } else {
          return this.reparse();
        }
      }

      scheduleRender() {
        return this.scheduledRender != null ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render);
      }

      render() {
        var ref1;
        boundMethodCheck$5(this, ref$5);
        cancelAnimationFrame(this.scheduledRender);
        this.scheduledRender = null;
        if (!this.composing) {
          if ((ref1 = this.delegate) != null) {
            ref1.render();
          }
        }
        if (typeof this.afterRender === "function") {
          this.afterRender();
        }
        return this.afterRender = null;
      }

      reparse() {
        var ref1;
        return (ref1 = this.delegate) != null ? ref1.reparse() : void 0;
      }

      // Responder helpers
      insertString(string = "", options) {
        var ref1;
        if ((ref1 = this.delegate) != null) {
          ref1.inputControllerWillPerformTyping();
        }
        return this.withTargetDOMRange(function() {
          var ref2;
          return (ref2 = this.responder) != null ? ref2.insertString(string, options) : void 0;
        });
      }

      toggleAttributeIfSupported(attributeName) {
        var ref1;
        if (indexOf$5.call(Trix$2.getAllAttributeNames(), attributeName) >= 0) {
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPerformFormatting(attributeName);
          }
          return this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.toggleCurrentAttribute(attributeName) : void 0;
          });
        }
      }

      activateAttributeIfSupported(attributeName, value) {
        var ref1;
        if (indexOf$5.call(Trix$2.getAllAttributeNames(), attributeName) >= 0) {
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPerformFormatting(attributeName);
          }
          return this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.setCurrentAttribute(attributeName, value) : void 0;
          });
        }
      }

      deleteInDirection(direction, {recordUndoEntry} = {
          recordUndoEntry: true
        }) {
        var domRange, perform, ref1;
        if (recordUndoEntry) {
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPerformTyping();
          }
        }
        perform = () => {
          var ref2;
          return (ref2 = this.responder) != null ? ref2.deleteInDirection(direction) : void 0;
        };
        if (domRange = this.getTargetDOMRange({
          minLength: 2
        })) {
          return this.withTargetDOMRange(domRange, perform);
        } else {
          return perform();
        }
      }

      // Selection helpers
      withTargetDOMRange(domRange, fn) {
        var ref1;
        if (typeof domRange === "function") {
          fn = domRange;
          domRange = this.getTargetDOMRange();
        }
        if (domRange) {
          return (ref1 = this.responder) != null ? ref1.withTargetDOMRange(domRange, fn.bind(this)) : void 0;
        } else {
          Trix$2.selectionChangeObserver.reset();
          return fn.call(this);
        }
      }

      getTargetDOMRange({minLength} = {
          minLength: 0
        }) {
        var base, domRange, targetRanges;
        if (targetRanges = typeof (base = this.event).getTargetRanges === "function" ? base.getTargetRanges() : void 0) {
          if (targetRanges.length) {
            domRange = staticRangeToRange(targetRanges[0]);
            if (minLength === 0 || domRange.toString().length >= minLength) {
              return domRange;
            }
          }
        }
      }

      // Event helpers
      withEvent(event, fn) {
        var result;
        this.event = event;
        try {
          result = fn.call(this);
        } finally {
          this.event = null;
        }
        return result;
      }

    };

    Level2InputController.prototype.events = {
      keydown: function(event) {
        var command, handler, name, ref1;
        if (keyEventIsKeyboardCommand(event)) {
          command = keyboardCommandFromKeyEvent(event);
          if ((ref1 = this.delegate) != null ? ref1.inputControllerDidReceiveKeyboardCommand(command) : void 0) {
            return event.preventDefault();
          }
        } else {
          name = event.key;
          if (event.altKey) {
            name += "+Alt";
          }
          if (event.shiftKey) {
            name += "+Shift";
          }
          if (handler = this.keys[name]) {
            return this.withEvent(event, handler);
          }
        }
      },
      // Handle paste event to work around beforeinput.insertFromPaste browser bugs.
      // Safe to remove each condition once fixed upstream.
      paste: function(event) {
        var href, paste, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
        // https://bugs.webkit.org/show_bug.cgi?id=194921
        if (pasteEventHasFilesOnly(event)) {
          event.preventDefault();
          return this.attachFiles(event.clipboardData.files);
        // https://bugs.chromium.org/p/chromium/issues/detail?id=934448
        } else if (pasteEventHasPlainTextOnly(event)) {
          event.preventDefault();
          paste = {
            type: "text/plain",
            string: event.clipboardData.getData("text/plain")
          };
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPaste(paste);
          }
          if ((ref2 = this.responder) != null) {
            ref2.insertString(paste.string);
          }
          this.render();
          return (ref3 = this.delegate) != null ? ref3.inputControllerDidPaste(paste) : void 0;
        // https://bugs.webkit.org/show_bug.cgi?id=196702
        } else if (href = (ref4 = event.clipboardData) != null ? ref4.getData("URL") : void 0) {
          event.preventDefault();
          paste = {
            type: "text/html",
            html: this.createLinkHTML(href)
          };
          if ((ref5 = this.delegate) != null) {
            ref5.inputControllerWillPaste(paste);
          }
          if ((ref6 = this.responder) != null) {
            ref6.insertHTML(paste.html);
          }
          this.render();
          return (ref7 = this.delegate) != null ? ref7.inputControllerDidPaste(paste) : void 0;
        }
      },
      beforeinput: function(event) {
        var handler;
        if (handler = this.inputTypes[event.inputType]) {
          this.withEvent(event, handler);
          return this.scheduleRender();
        }
      },
      input: function(event) {
        return Trix$2.selectionChangeObserver.reset();
      },
      dragstart: function(event) {
        var ref1, ref2;
        if ((ref1 = this.responder) != null ? ref1.selectionContainsAttachments() : void 0) {
          event.dataTransfer.setData("application/x-trix-dragging", true);
          return this.dragging = {
            range: (ref2 = this.responder) != null ? ref2.getSelectedRange() : void 0,
            point: pointFromEvent(event)
          };
        }
      },
      dragenter: function(event) {
        if (dragEventHasFiles(event)) {
          return event.preventDefault();
        }
      },
      dragover: function(event) {
        var point, ref1;
        if (this.dragging) {
          event.preventDefault();
          point = pointFromEvent(event);
          if (!objectsAreEqual$2(point, this.dragging.point)) {
            this.dragging.point = point;
            return (ref1 = this.responder) != null ? ref1.setLocationRangeFromPointRange(point) : void 0;
          }
        } else if (dragEventHasFiles(event)) {
          return event.preventDefault();
        }
      },
      drop: function(event) {
        var point, ref1, ref2, ref3;
        if (this.dragging) {
          event.preventDefault();
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillMoveText();
          }
          if ((ref2 = this.responder) != null) {
            ref2.moveTextFromRange(this.dragging.range);
          }
          this.dragging = null;
          return this.scheduleRender();
        } else if (dragEventHasFiles(event)) {
          event.preventDefault();
          point = pointFromEvent(event);
          if ((ref3 = this.responder) != null) {
            ref3.setLocationRangeFromPointRange(point);
          }
          return this.attachFiles(event.dataTransfer.files);
        }
      },
      dragend: function() {
        var ref1;
        if (this.dragging) {
          if ((ref1 = this.responder) != null) {
            ref1.setSelectedRange(this.dragging.range);
          }
          return this.dragging = null;
        }
      },
      compositionend: function(event) {
        if (this.composing) {
          this.composing = false;
          return this.scheduleRender();
        }
      }
    };

    Level2InputController.prototype.keys = {
      ArrowLeft: function() {
        var ref1, ref2;
        if ((ref1 = this.responder) != null ? ref1.shouldManageMovingCursorInDirection("backward") : void 0) {
          this.event.preventDefault();
          return (ref2 = this.responder) != null ? ref2.moveCursorInDirection("backward") : void 0;
        }
      },
      ArrowRight: function() {
        var ref1, ref2;
        if ((ref1 = this.responder) != null ? ref1.shouldManageMovingCursorInDirection("forward") : void 0) {
          this.event.preventDefault();
          return (ref2 = this.responder) != null ? ref2.moveCursorInDirection("forward") : void 0;
        }
      },
      Backspace: function() {
        var ref1, ref2, ref3;
        if ((ref1 = this.responder) != null ? ref1.shouldManageDeletingInDirection("backward") : void 0) {
          this.event.preventDefault();
          if ((ref2 = this.delegate) != null) {
            ref2.inputControllerWillPerformTyping();
          }
          if ((ref3 = this.responder) != null) {
            ref3.deleteInDirection("backward");
          }
          return this.render();
        }
      },
      Tab: function() {
        var ref1, ref2;
        if ((ref1 = this.responder) != null ? ref1.canIncreaseNestingLevel() : void 0) {
          this.event.preventDefault();
          if ((ref2 = this.responder) != null) {
            ref2.increaseNestingLevel();
          }
          return this.render();
        }
      },
      "Tab+Shift": function() {
        var ref1, ref2;
        if ((ref1 = this.responder) != null ? ref1.canDecreaseNestingLevel() : void 0) {
          this.event.preventDefault();
          if ((ref2 = this.responder) != null) {
            ref2.decreaseNestingLevel();
          }
          return this.render();
        }
      }
    };

    Level2InputController.prototype.inputTypes = {
      deleteByComposition: function() {
        return this.deleteInDirection("backward", {
          recordUndoEntry: false
        });
      },
      deleteByCut: function() {
        return this.deleteInDirection("backward");
      },
      deleteByDrag: function() {
        this.event.preventDefault();
        return this.withTargetDOMRange(function() {
          var ref1;
          return this.deleteByDragRange = (ref1 = this.responder) != null ? ref1.getSelectedRange() : void 0;
        });
      },
      deleteCompositionText: function() {
        return this.deleteInDirection("backward", {
          recordUndoEntry: false
        });
      },
      deleteContent: function() {
        return this.deleteInDirection("backward");
      },
      deleteContentBackward: function() {
        return this.deleteInDirection("backward");
      },
      deleteContentForward: function() {
        return this.deleteInDirection("forward");
      },
      deleteEntireSoftLine: function() {
        return this.deleteInDirection("forward");
      },
      deleteHardLineBackward: function() {
        return this.deleteInDirection("backward");
      },
      deleteHardLineForward: function() {
        return this.deleteInDirection("forward");
      },
      deleteSoftLineBackward: function() {
        return this.deleteInDirection("backward");
      },
      deleteSoftLineForward: function() {
        return this.deleteInDirection("forward");
      },
      deleteWordBackward: function() {
        return this.deleteInDirection("backward");
      },
      deleteWordForward: function() {
        return this.deleteInDirection("forward");
      },
      formatBackColor: function() {
        return this.activateAttributeIfSupported("backgroundColor", this.event.data);
      },
      formatBold: function() {
        return this.toggleAttributeIfSupported("bold");
      },
      formatFontColor: function() {
        return this.activateAttributeIfSupported("color", this.event.data);
      },
      formatFontName: function() {
        return this.activateAttributeIfSupported("font", this.event.data);
      },
      formatIndent: function() {
        var ref1;
        if ((ref1 = this.responder) != null ? ref1.canIncreaseNestingLevel() : void 0) {
          return this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.increaseNestingLevel() : void 0;
          });
        }
      },
      formatItalic: function() {
        return this.toggleAttributeIfSupported("italic");
      },
      formatJustifyCenter: function() {
        return this.toggleAttributeIfSupported("justifyCenter");
      },
      formatJustifyFull: function() {
        return this.toggleAttributeIfSupported("justifyFull");
      },
      formatJustifyLeft: function() {
        return this.toggleAttributeIfSupported("justifyLeft");
      },
      formatJustifyRight: function() {
        return this.toggleAttributeIfSupported("justifyRight");
      },
      formatOutdent: function() {
        var ref1;
        if ((ref1 = this.responder) != null ? ref1.canDecreaseNestingLevel() : void 0) {
          return this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.decreaseNestingLevel() : void 0;
          });
        }
      },
      formatRemove: function() {
        return this.withTargetDOMRange(function() {
          var attributeName, ref1, ref2, results;
          results = [];
          for (attributeName in (ref1 = this.responder) != null ? ref1.getCurrentAttributes() : void 0) {
            results.push((ref2 = this.responder) != null ? ref2.removeCurrentAttribute(attributeName) : void 0);
          }
          return results;
        });
      },
      formatSetBlockTextDirection: function() {
        return this.activateAttributeIfSupported("blockDir", this.event.data);
      },
      formatSetInlineTextDirection: function() {
        return this.activateAttributeIfSupported("textDir", this.event.data);
      },
      formatStrikeThrough: function() {
        return this.toggleAttributeIfSupported("strike");
      },
      formatSubscript: function() {
        return this.toggleAttributeIfSupported("sub");
      },
      formatSuperscript: function() {
        return this.toggleAttributeIfSupported("sup");
      },
      formatUnderline: function() {
        return this.toggleAttributeIfSupported("underline");
      },
      historyRedo: function() {
        var ref1;
        return (ref1 = this.delegate) != null ? ref1.inputControllerWillPerformRedo() : void 0;
      },
      historyUndo: function() {
        var ref1;
        return (ref1 = this.delegate) != null ? ref1.inputControllerWillPerformUndo() : void 0;
      },
      insertCompositionText: function() {
        this.composing = true;
        return this.insertString(this.event.data);
      },
      insertFromComposition: function() {
        this.composing = false;
        return this.insertString(this.event.data);
      },
      insertFromDrop: function() {
        var range, ref1;
        if (range = this.deleteByDragRange) {
          this.deleteByDragRange = null;
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillMoveText();
          }
          return this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.moveTextFromRange(range) : void 0;
          });
        }
      },
      insertFromPaste: function() {
        var dataTransfer, href, html, name, paste, ref1, ref2, ref3, ref4, ref5, string;
        ({dataTransfer} = this.event);
        paste = {dataTransfer};
        if (href = dataTransfer.getData("URL")) {
          this.event.preventDefault();
          paste.type = "text/html";
          if (name = dataTransfer.getData("public.url-name")) {
            string = Trix$2.squishBreakableWhitespace(name).trim();
          } else {
            string = href;
          }
          paste.html = this.createLinkHTML(href, string);
          if ((ref1 = this.delegate) != null) {
            ref1.inputControllerWillPaste(paste);
          }
          this.withTargetDOMRange(function() {
            var ref2;
            return (ref2 = this.responder) != null ? ref2.insertHTML(paste.html) : void 0;
          });
          return this.afterRender = () => {
            var ref2;
            return (ref2 = this.delegate) != null ? ref2.inputControllerDidPaste(paste) : void 0;
          };
        } else if (dataTransferIsPlainText(dataTransfer)) {
          paste.type = "text/plain";
          paste.string = dataTransfer.getData("text/plain");
          if ((ref2 = this.delegate) != null) {
            ref2.inputControllerWillPaste(paste);
          }
          this.withTargetDOMRange(function() {
            var ref3;
            return (ref3 = this.responder) != null ? ref3.insertString(paste.string) : void 0;
          });
          return this.afterRender = () => {
            var ref3;
            return (ref3 = this.delegate) != null ? ref3.inputControllerDidPaste(paste) : void 0;
          };
        } else if (html = dataTransfer.getData("text/html")) {
          this.event.preventDefault();
          paste.type = "text/html";
          paste.html = html;
          if ((ref3 = this.delegate) != null) {
            ref3.inputControllerWillPaste(paste);
          }
          this.withTargetDOMRange(function() {
            var ref4;
            return (ref4 = this.responder) != null ? ref4.insertHTML(paste.html) : void 0;
          });
          return this.afterRender = () => {
            var ref4;
            return (ref4 = this.delegate) != null ? ref4.inputControllerDidPaste(paste) : void 0;
          };
        } else if ((ref4 = dataTransfer.files) != null ? ref4.length : void 0) {
          paste.type = "File";
          paste.file = dataTransfer.files[0];
          if ((ref5 = this.delegate) != null) {
            ref5.inputControllerWillPaste(paste);
          }
          this.withTargetDOMRange(function() {
            var ref6;
            return (ref6 = this.responder) != null ? ref6.insertFile(paste.file) : void 0;
          });
          return this.afterRender = () => {
            var ref6;
            return (ref6 = this.delegate) != null ? ref6.inputControllerDidPaste(paste) : void 0;
          };
        }
      },
      insertFromYank: function() {
        return this.insertString(this.event.data);
      },
      insertLineBreak: function() {
        return this.insertString("\n");
      },
      insertLink: function() {
        return this.activateAttributeIfSupported("href", this.event.data);
      },
      insertOrderedList: function() {
        return this.toggleAttributeIfSupported("number");
      },
      insertParagraph: function() {
        var ref1;
        if ((ref1 = this.delegate) != null) {
          ref1.inputControllerWillPerformTyping();
        }
        return this.withTargetDOMRange(function() {
          var ref2;
          return (ref2 = this.responder) != null ? ref2.insertLineBreak() : void 0;
        });
      },
      insertReplacementText: function() {
        return this.insertString(this.event.dataTransfer.getData("text/plain"), {
          updatePosition: false
        });
      },
      insertText: function() {
        var ref1, ref2;
        return this.insertString((ref1 = this.event.data) != null ? ref1 : (ref2 = this.event.dataTransfer) != null ? ref2.getData("text/plain") : void 0);
      },
      insertTranspose: function() {
        return this.insertString(this.event.data);
      },
      insertUnorderedList: function() {
        return this.toggleAttributeIfSupported("bullet");
      }
    };

    staticRangeToRange = function(staticRange) {
      var range;
      range = document.createRange();
      range.setStart(staticRange.startContainer, staticRange.startOffset);
      range.setEnd(staticRange.endContainer, staticRange.endOffset);
      return range;
    };

    dragEventHasFiles = function(event) {
      var ref1, ref2;
      return indexOf$5.call((ref1 = (ref2 = event.dataTransfer) != null ? ref2.types : void 0) != null ? ref1 : [], "Files") >= 0;
    };

    pasteEventHasFilesOnly = function(event) {
      var clipboard;
      if (clipboard = event.clipboardData) {
        return indexOf$5.call(clipboard.types, "Files") >= 0 && clipboard.types.length === 1 && clipboard.files.length >= 1;
      }
    };

    pasteEventHasPlainTextOnly = function(event) {
      var clipboard;
      if (clipboard = event.clipboardData) {
        return indexOf$5.call(clipboard.types, "text/plain") >= 0 && clipboard.types.length === 1;
      }
    };

    keyboardCommandFromKeyEvent = function(event) {
      var command;
      command = [];
      if (event.altKey) {
        command.push("alt");
      }
      if (event.shiftKey) {
        command.push("shift");
      }
      command.push(event.key);
      return command;
    };

    pointFromEvent = function(event) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    };

    return Level2InputController;

  }).call(window);

  var css, defer$1, handleEvent$4, keyNames, lang, makeElement$2, ref$4, tagName$3,
    boundMethodCheck$4 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({defer: defer$1, handleEvent: handleEvent$4, makeElement: makeElement$2, tagName: tagName$3} = Trix$2);

  ({lang, css, keyNames} = Trix$2.config);

  ref$4 = Trix$2.AttachmentEditorController = (function() {
    var undoable;

    class AttachmentEditorController extends Trix$2.BasicObject {
      constructor(attachmentPiece, element1, container, options = {}) {
        super(...arguments);
        // Event handlers
        this.didClickToolbar = this.didClickToolbar.bind(this);
        this.didClickActionButton = this.didClickActionButton.bind(this);
        this.didKeyDownCaption = this.didKeyDownCaption.bind(this);
        this.didInputCaption = this.didInputCaption.bind(this);
        this.didChangeCaption = this.didChangeCaption.bind(this);
        this.didBlurCaption = this.didBlurCaption.bind(this);
        this.attachmentPiece = attachmentPiece;
        this.element = element1;
        this.container = container;
        this.options = options;
        ({attachment: this.attachment} = this.attachmentPiece);
        if (tagName$3(this.element) === "a") {
          this.element = this.element.firstChild;
        }
        this.install();
      }

      install() {
        this.makeElementMutable();
        this.addToolbar();
        if (this.attachment.isPreviewable()) {
          return this.installCaptionEditor();
        }
      }

      uninstall() {
        var ref1, undo;
        this.savePendingCaption();
        while (undo = this.undos.pop()) {
          undo();
        }
        return (ref1 = this.delegate) != null ? ref1.didUninstallAttachmentEditor(this) : void 0;
      }

      // Private
      savePendingCaption() {
        var caption, ref1, ref2;
        if (this.pendingCaption != null) {
          caption = this.pendingCaption;
          this.pendingCaption = null;
          if (caption) {
            return (ref1 = this.delegate) != null ? typeof ref1.attachmentEditorDidRequestUpdatingAttributesForAttachment === "function" ? ref1.attachmentEditorDidRequestUpdatingAttributesForAttachment({caption}, this.attachment) : void 0 : void 0;
          } else {
            return (ref2 = this.delegate) != null ? typeof ref2.attachmentEditorDidRequestRemovingAttributeForAttachment === "function" ? ref2.attachmentEditorDidRequestRemovingAttributeForAttachment("caption", this.attachment) : void 0 : void 0;
          }
        }
      }

      didClickToolbar(event) {
        boundMethodCheck$4(this, ref$4);
        event.preventDefault();
        return event.stopPropagation();
      }

      didClickActionButton(event) {
        var action, ref1;
        boundMethodCheck$4(this, ref$4);
        action = event.target.getAttribute("data-trix-action");
        switch (action) {
          case "remove":
            return (ref1 = this.delegate) != null ? ref1.attachmentEditorDidRequestRemovalOfAttachment(this.attachment) : void 0;
        }
      }

      didKeyDownCaption(event) {
        var ref1;
        boundMethodCheck$4(this, ref$4);
        if (keyNames[event.keyCode] === "return") {
          event.preventDefault();
          this.savePendingCaption();
          return (ref1 = this.delegate) != null ? typeof ref1.attachmentEditorDidRequestDeselectingAttachment === "function" ? ref1.attachmentEditorDidRequestDeselectingAttachment(this.attachment) : void 0 : void 0;
        }
      }

      didInputCaption(event) {
        boundMethodCheck$4(this, ref$4);
        return this.pendingCaption = event.target.value.replace(/\s/g, " ").trim();
      }

      didChangeCaption(event) {
        boundMethodCheck$4(this, ref$4);
        return this.savePendingCaption();
      }

      didBlurCaption(event) {
        boundMethodCheck$4(this, ref$4);
        return this.savePendingCaption();
      }

    };

    undoable = function(fn) {
      return function() {
        var commands;
        commands = fn.apply(this, arguments);
        commands.do();
        if (this.undos == null) {
          this.undos = [];
        }
        return this.undos.push(commands.undo);
      };
    };

    // Installing and uninstalling
    AttachmentEditorController.prototype.makeElementMutable = undoable(function() {
      return {
        do: () => {
          return this.element.dataset.trixMutable = true;
        },
        undo: () => {
          return delete this.element.dataset.trixMutable;
        }
      };
    });

    AttachmentEditorController.prototype.addToolbar = undoable(function() {
      var element;
      // <div class="#{css.attachmentMetadataContainer}" data-trix-mutable="true">
      //   <div class="trix-button-row">
      //     <span class="trix-button-group trix-button-group--actions">
      //       <button type="button" class="trix-button trix-button--remove" title="#{lang.remove}" data-trix-action="remove">#{lang.remove}</button>
      //     </span>
      //   </div>
      // </div>
      element = makeElement$2({
        tagName: "div",
        className: css.attachmentToolbar,
        data: {
          trixMutable: true
        },
        childNodes: makeElement$2({
          tagName: "div",
          className: "trix-button-row",
          childNodes: makeElement$2({
            tagName: "span",
            className: "trix-button-group trix-button-group--actions",
            childNodes: makeElement$2({
              tagName: "button",
              className: "trix-button trix-button--remove",
              textContent: lang.remove,
              attributes: {
                title: lang.remove
              },
              data: {
                trixAction: "remove"
              }
            })
          })
        })
      });
      if (this.attachment.isPreviewable()) {
        // <div class="#{css.attachmentMetadataContainer}">
        //   <span class="#{css.attachmentMetadata}">
        //     <span class="#{css.attachmentName}" title="#{name}">#{name}</span>
        //     <span class="#{css.attachmentSize}">#{size}</span>
        //   </span>
        // </div>
        element.appendChild(makeElement$2({
          tagName: "div",
          className: css.attachmentMetadataContainer,
          childNodes: makeElement$2({
            tagName: "span",
            className: css.attachmentMetadata,
            childNodes: [
              makeElement$2({
                tagName: "span",
                className: css.attachmentName,
                textContent: this.attachment.getFilename(),
                attributes: {
                  title: this.attachment.getFilename()
                }
              }),
              makeElement$2({
                tagName: "span",
                className: css.attachmentSize,
                textContent: this.attachment.getFormattedFilesize()
              })
            ]
          })
        }));
      }
      handleEvent$4("click", {
        onElement: element,
        withCallback: this.didClickToolbar
      });
      handleEvent$4("click", {
        onElement: element,
        matchingSelector: "[data-trix-action]",
        withCallback: this.didClickActionButton
      });
      return {
        do: () => {
          return this.element.appendChild(element);
        },
        undo: () => {
          return Trix$2.removeNode(element);
        }
      };
    });

    AttachmentEditorController.prototype.installCaptionEditor = undoable(function() {
      var autoresize, editingFigcaption, figcaption, textarea, textareaClone;
      textarea = makeElement$2({
        tagName: "textarea",
        className: css.attachmentCaptionEditor,
        attributes: {
          placeholder: lang.captionPlaceholder
        },
        data: {
          trixMutable: true
        }
      });
      textarea.value = this.attachmentPiece.getCaption();
      textareaClone = textarea.cloneNode();
      textareaClone.classList.add("trix-autoresize-clone");
      textareaClone.tabIndex = -1;
      autoresize = function() {
        textareaClone.value = textarea.value;
        return textarea.style.height = textareaClone.scrollHeight + "px";
      };
      handleEvent$4("input", {
        onElement: textarea,
        withCallback: autoresize
      });
      handleEvent$4("input", {
        onElement: textarea,
        withCallback: this.didInputCaption
      });
      handleEvent$4("keydown", {
        onElement: textarea,
        withCallback: this.didKeyDownCaption
      });
      handleEvent$4("change", {
        onElement: textarea,
        withCallback: this.didChangeCaption
      });
      handleEvent$4("blur", {
        onElement: textarea,
        withCallback: this.didBlurCaption
      });
      figcaption = this.element.querySelector("figcaption");
      editingFigcaption = figcaption.cloneNode();
      return {
        do: () => {
          figcaption.style.display = "none";
          editingFigcaption.appendChild(textarea);
          editingFigcaption.appendChild(textareaClone);
          editingFigcaption.classList.add(`${css.attachmentCaption}--editing`);
          figcaption.parentElement.insertBefore(editingFigcaption, figcaption);
          autoresize();
          if (this.options.editCaption) {
            return defer$1(function() {
              return textarea.focus();
            });
          }
        },
        undo: function() {
          Trix$2.removeNode(editingFigcaption);
          return figcaption.style.display = null;
        }
      };
    });

    return AttachmentEditorController;

  }).call(window);

  var attachmentSelector$1, defer, findClosestElementFromNode$3, handleEvent$3, innerElementIsActive$1, ref$3,
    boundMethodCheck$3 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({findClosestElementFromNode: findClosestElementFromNode$3, handleEvent: handleEvent$3, innerElementIsActive: innerElementIsActive$1, defer} = Trix$2);

  ({attachmentSelector: attachmentSelector$1} = Trix$2.AttachmentView);

  ref$3 = Trix$2.CompositionController = class CompositionController extends Trix$2.BasicObject {
    constructor(element1, composition) {
      super(...arguments);
      this.didFocus = this.didFocus.bind(this);
      this.didBlur = this.didBlur.bind(this);
      this.didClickAttachment = this.didClickAttachment.bind(this);
      this.element = element1;
      this.composition = composition;
      this.documentView = new Trix$2.DocumentView(this.composition.document, {element: this.element});
      handleEvent$3("focus", {
        onElement: this.element,
        withCallback: this.didFocus
      });
      handleEvent$3("blur", {
        onElement: this.element,
        withCallback: this.didBlur
      });
      handleEvent$3("click", {
        onElement: this.element,
        matchingSelector: "a[contenteditable=false]",
        preventDefault: true
      });
      handleEvent$3("mousedown", {
        onElement: this.element,
        matchingSelector: attachmentSelector$1,
        withCallback: this.didClickAttachment
      });
      handleEvent$3("click", {
        onElement: this.element,
        matchingSelector: `a${attachmentSelector$1}`,
        preventDefault: true
      });
    }

    didFocus(event) {
      var perform, ref1, ref2;
      boundMethodCheck$3(this, ref$3);
      perform = () => {
        var ref1;
        if (!this.focused) {
          this.focused = true;
          return (ref1 = this.delegate) != null ? typeof ref1.compositionControllerDidFocus === "function" ? ref1.compositionControllerDidFocus() : void 0 : void 0;
        }
      };
      return (ref1 = (ref2 = this.blurPromise) != null ? ref2.then(perform) : void 0) != null ? ref1 : perform();
    }

    didBlur(event) {
      boundMethodCheck$3(this, ref$3);
      return this.blurPromise = new Promise((resolve) => {
        return defer(() => {
          var ref1;
          if (!innerElementIsActive$1(this.element)) {
            this.focused = null;
            if ((ref1 = this.delegate) != null) {
              if (typeof ref1.compositionControllerDidBlur === "function") {
                ref1.compositionControllerDidBlur();
              }
            }
          }
          this.blurPromise = null;
          return resolve();
        });
      });
    }

    didClickAttachment(event, target) {
      var attachment, editCaption, ref1;
      boundMethodCheck$3(this, ref$3);
      attachment = this.findAttachmentForElement(target);
      editCaption = findClosestElementFromNode$3(event.target, {
        matchingSelector: "figcaption"
      }) != null;
      return (ref1 = this.delegate) != null ? typeof ref1.compositionControllerDidSelectAttachment === "function" ? ref1.compositionControllerDidSelectAttachment(attachment, {editCaption}) : void 0 : void 0;
    }

    getSerializableElement() {
      if (this.isEditingAttachment()) {
        return this.documentView.shadowElement;
      } else {
        return this.element;
      }
    }

    render() {
      var ref1, ref2, ref3;
      if (this.revision !== this.composition.revision) {
        this.documentView.setDocument(this.composition.document);
        this.documentView.render();
        this.revision = this.composition.revision;
      }
      if (this.canSyncDocumentView() && !this.documentView.isSynced()) {
        if ((ref1 = this.delegate) != null) {
          if (typeof ref1.compositionControllerWillSyncDocumentView === "function") {
            ref1.compositionControllerWillSyncDocumentView();
          }
        }
        this.documentView.sync();
        if ((ref2 = this.delegate) != null) {
          if (typeof ref2.compositionControllerDidSyncDocumentView === "function") {
            ref2.compositionControllerDidSyncDocumentView();
          }
        }
      }
      return (ref3 = this.delegate) != null ? typeof ref3.compositionControllerDidRender === "function" ? ref3.compositionControllerDidRender() : void 0 : void 0;
    }

    rerenderViewForObject(object) {
      this.invalidateViewForObject(object);
      return this.render();
    }

    invalidateViewForObject(object) {
      return this.documentView.invalidateViewForObject(object);
    }

    isViewCachingEnabled() {
      return this.documentView.isViewCachingEnabled();
    }

    enableViewCaching() {
      return this.documentView.enableViewCaching();
    }

    disableViewCaching() {
      return this.documentView.disableViewCaching();
    }

    refreshViewCache() {
      return this.documentView.garbageCollectCachedViews();
    }

    // Attachment editor management
    isEditingAttachment() {
      return this.attachmentEditor != null;
    }

    installAttachmentEditorForAttachment(attachment, options) {
      var attachmentPiece, element, ref1;
      if (((ref1 = this.attachmentEditor) != null ? ref1.attachment : void 0) === attachment) {
        return;
      }
      if (!(element = this.documentView.findElementForObject(attachment))) {
        return;
      }
      this.uninstallAttachmentEditor();
      attachmentPiece = this.composition.document.getAttachmentPieceForAttachment(attachment);
      this.attachmentEditor = new Trix$2.AttachmentEditorController(attachmentPiece, element, this.element, options);
      return this.attachmentEditor.delegate = this;
    }

    uninstallAttachmentEditor() {
      var ref1;
      return (ref1 = this.attachmentEditor) != null ? ref1.uninstall() : void 0;
    }

    // Attachment controller delegate
    didUninstallAttachmentEditor() {
      this.attachmentEditor = null;
      return this.render();
    }

    attachmentEditorDidRequestUpdatingAttributesForAttachment(attributes, attachment) {
      var ref1;
      if ((ref1 = this.delegate) != null) {
        if (typeof ref1.compositionControllerWillUpdateAttachment === "function") {
          ref1.compositionControllerWillUpdateAttachment(attachment);
        }
      }
      return this.composition.updateAttributesForAttachment(attributes, attachment);
    }

    attachmentEditorDidRequestRemovingAttributeForAttachment(attribute, attachment) {
      var ref1;
      if ((ref1 = this.delegate) != null) {
        if (typeof ref1.compositionControllerWillUpdateAttachment === "function") {
          ref1.compositionControllerWillUpdateAttachment(attachment);
        }
      }
      return this.composition.removeAttributeForAttachment(attribute, attachment);
    }

    attachmentEditorDidRequestRemovalOfAttachment(attachment) {
      var ref1;
      return (ref1 = this.delegate) != null ? typeof ref1.compositionControllerDidRequestRemovalOfAttachment === "function" ? ref1.compositionControllerDidRequestRemovalOfAttachment(attachment) : void 0 : void 0;
    }

    attachmentEditorDidRequestDeselectingAttachment(attachment) {
      var ref1;
      return (ref1 = this.delegate) != null ? typeof ref1.compositionControllerDidRequestDeselectingAttachment === "function" ? ref1.compositionControllerDidRequestDeselectingAttachment(attachment) : void 0 : void 0;
    }

    // Private
    canSyncDocumentView() {
      return !this.isEditingAttachment();
    }

    findAttachmentForElement(element) {
      return this.composition.document.getAttachmentById(parseInt(element.dataset.trixId, 10));
    }

  };

  var findClosestElementFromNode$2, handleEvent$2, ref$2, triggerEvent$1,
    boundMethodCheck$2 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({handleEvent: handleEvent$2, triggerEvent: triggerEvent$1, findClosestElementFromNode: findClosestElementFromNode$2} = Trix$2);

  ref$2 = Trix$2.ToolbarController = (function() {
    var actionButtonSelector, activeDialogSelector, attributeButtonSelector, dialogButtonSelector, dialogInputSelector, dialogSelector, getActionName, getAttributeName, getDialogName, getInputForDialog, toolbarButtonSelector;

    class ToolbarController extends Trix$2.BasicObject {
      constructor(element1) {
        super(...arguments);
        // Event handlers
        this.didClickActionButton = this.didClickActionButton.bind(this);
        this.didClickAttributeButton = this.didClickAttributeButton.bind(this);
        this.didClickDialogButton = this.didClickDialogButton.bind(this);
        this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this);
        this.element = element1;
        this.attributes = {};
        this.actions = {};
        this.resetDialogInputs();
        handleEvent$2("mousedown", {
          onElement: this.element,
          matchingSelector: actionButtonSelector,
          withCallback: this.didClickActionButton
        });
        handleEvent$2("mousedown", {
          onElement: this.element,
          matchingSelector: attributeButtonSelector,
          withCallback: this.didClickAttributeButton
        });
        handleEvent$2("click", {
          onElement: this.element,
          matchingSelector: toolbarButtonSelector,
          preventDefault: true
        });
        handleEvent$2("click", {
          onElement: this.element,
          matchingSelector: dialogButtonSelector,
          withCallback: this.didClickDialogButton
        });
        handleEvent$2("keydown", {
          onElement: this.element,
          matchingSelector: dialogInputSelector,
          withCallback: this.didKeyDownDialogInput
        });
      }

      didClickActionButton(event, element) {
        var actionName, ref1, ref2;
        boundMethodCheck$2(this, ref$2);
        if ((ref1 = this.delegate) != null) {
          ref1.toolbarDidClickButton();
        }
        event.preventDefault();
        actionName = getActionName(element);
        if (this.getDialog(actionName)) {
          return this.toggleDialog(actionName);
        } else {
          return (ref2 = this.delegate) != null ? ref2.toolbarDidInvokeAction(actionName) : void 0;
        }
      }

      didClickAttributeButton(event, element) {
        var attributeName, ref1, ref2;
        boundMethodCheck$2(this, ref$2);
        if ((ref1 = this.delegate) != null) {
          ref1.toolbarDidClickButton();
        }
        event.preventDefault();
        attributeName = getAttributeName(element);
        if (this.getDialog(attributeName)) {
          this.toggleDialog(attributeName);
        } else {
          if ((ref2 = this.delegate) != null) {
            ref2.toolbarDidToggleAttribute(attributeName);
          }
        }
        return this.refreshAttributeButtons();
      }

      didClickDialogButton(event, element) {
        var dialogElement, method;
        boundMethodCheck$2(this, ref$2);
        dialogElement = findClosestElementFromNode$2(element, {
          matchingSelector: dialogSelector
        });
        method = element.getAttribute("data-trix-method");
        return this[method].call(this, dialogElement);
      }

      didKeyDownDialogInput(event, element) {
        var attribute, dialog;
        boundMethodCheck$2(this, ref$2);
        if (event.keyCode === 13) { // Enter key
          event.preventDefault();
          attribute = element.getAttribute("name");
          dialog = this.getDialog(attribute);
          this.setAttribute(dialog);
        }
        if (event.keyCode === 27) { // Escape key
          event.preventDefault();
          return this.hideDialog();
        }
      }

      // Action buttons
      updateActions(actions) {
        this.actions = actions;
        return this.refreshActionButtons();
      }

      refreshActionButtons() {
        return this.eachActionButton((element, actionName) => {
          return element.disabled = this.actions[actionName] === false;
        });
      }

      eachActionButton(callback) {
        var element, i, len, ref1, results;
        ref1 = this.element.querySelectorAll(actionButtonSelector);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          element = ref1[i];
          results.push(callback(element, getActionName(element)));
        }
        return results;
      }

      // Attribute buttons
      updateAttributes(attributes) {
        this.attributes = attributes;
        return this.refreshAttributeButtons();
      }

      refreshAttributeButtons() {
        return this.eachAttributeButton((element, attributeName) => {
          element.disabled = this.attributes[attributeName] === false;
          if (this.attributes[attributeName] || this.dialogIsVisible(attributeName)) {
            element.setAttribute("data-trix-active", "");
            return element.classList.add("trix-active");
          } else {
            element.removeAttribute("data-trix-active");
            return element.classList.remove("trix-active");
          }
        });
      }

      eachAttributeButton(callback) {
        var element, i, len, ref1, results;
        ref1 = this.element.querySelectorAll(attributeButtonSelector);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          element = ref1[i];
          results.push(callback(element, getAttributeName(element)));
        }
        return results;
      }

      applyKeyboardCommand(keys) {
        var button, buttonKeyString, buttonKeys, i, keyString, len, ref1;
        keyString = JSON.stringify(keys.sort());
        ref1 = this.element.querySelectorAll("[data-trix-key]");
        for (i = 0, len = ref1.length; i < len; i++) {
          button = ref1[i];
          buttonKeys = button.getAttribute("data-trix-key").split("+");
          buttonKeyString = JSON.stringify(buttonKeys.sort());
          if (buttonKeyString === keyString) {
            triggerEvent$1("mousedown", {
              onElement: button
            });
            return true;
          }
        }
        return false;
      }

      // Dialogs
      dialogIsVisible(dialogName) {
        var element;
        if (element = this.getDialog(dialogName)) {
          return element.hasAttribute("data-trix-active");
        }
      }

      toggleDialog(dialogName) {
        if (this.dialogIsVisible(dialogName)) {
          return this.hideDialog();
        } else {
          return this.showDialog(dialogName);
        }
      }

      showDialog(dialogName) {
        var attributeName, disabledInput, element, i, input, len, ref1, ref2, ref3, ref4;
        this.hideDialog();
        if ((ref1 = this.delegate) != null) {
          ref1.toolbarWillShowDialog();
        }
        element = this.getDialog(dialogName);
        element.setAttribute("data-trix-active", "");
        element.classList.add("trix-active");
        ref2 = element.querySelectorAll("input[disabled]");
        for (i = 0, len = ref2.length; i < len; i++) {
          disabledInput = ref2[i];
          disabledInput.removeAttribute("disabled");
        }
        if (attributeName = getAttributeName(element)) {
          if (input = getInputForDialog(element, dialogName)) {
            input.value = (ref3 = this.attributes[attributeName]) != null ? ref3 : "";
            input.select();
          }
        }
        return (ref4 = this.delegate) != null ? ref4.toolbarDidShowDialog(dialogName) : void 0;
      }

      setAttribute(dialogElement) {
        var attributeName, input, ref1;
        attributeName = getAttributeName(dialogElement);
        input = getInputForDialog(dialogElement, attributeName);
        if (input.willValidate && !input.checkValidity()) {
          input.setAttribute("data-trix-validate", "");
          input.classList.add("trix-validate");
          return input.focus();
        } else {
          if ((ref1 = this.delegate) != null) {
            ref1.toolbarDidUpdateAttribute(attributeName, input.value);
          }
          return this.hideDialog();
        }
      }

      removeAttribute(dialogElement) {
        var attributeName, ref1;
        attributeName = getAttributeName(dialogElement);
        if ((ref1 = this.delegate) != null) {
          ref1.toolbarDidRemoveAttribute(attributeName);
        }
        return this.hideDialog();
      }

      hideDialog() {
        var element, ref1;
        if (element = this.element.querySelector(activeDialogSelector)) {
          element.removeAttribute("data-trix-active");
          element.classList.remove("trix-active");
          this.resetDialogInputs();
          return (ref1 = this.delegate) != null ? ref1.toolbarDidHideDialog(getDialogName(element)) : void 0;
        }
      }

      resetDialogInputs() {
        var i, input, len, ref1, results;
        ref1 = this.element.querySelectorAll(dialogInputSelector);
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          input = ref1[i];
          input.setAttribute("disabled", "disabled");
          input.removeAttribute("data-trix-validate");
          results.push(input.classList.remove("trix-validate"));
        }
        return results;
      }

      getDialog(dialogName) {
        return this.element.querySelector(`[data-trix-dialog=${dialogName}]`);
      }

    };

    attributeButtonSelector = "[data-trix-attribute]";

    actionButtonSelector = "[data-trix-action]";

    toolbarButtonSelector = `${attributeButtonSelector}, ${actionButtonSelector}`;

    dialogSelector = "[data-trix-dialog]";

    activeDialogSelector = `${dialogSelector}[data-trix-active]`;

    dialogButtonSelector = `${dialogSelector} [data-trix-method]`;

    dialogInputSelector = `${dialogSelector} [data-trix-input]`;

    getInputForDialog = function(element, attributeName) {
      if (attributeName == null) {
        attributeName = getAttributeName(element);
      }
      return element.querySelector(`[data-trix-input][name='${attributeName}']`);
    };

    // General helpers
    getActionName = function(element) {
      return element.getAttribute("data-trix-action");
    };

    getAttributeName = function(element) {
      var ref1;
      return (ref1 = element.getAttribute("data-trix-attribute")) != null ? ref1 : element.getAttribute("data-trix-dialog-attribute");
    };

    getDialogName = function(element) {
      return element.getAttribute("data-trix-dialog");
    };

    return ToolbarController;

  }).call(window);

  Trix$2.ImagePreloadOperation = class ImagePreloadOperation extends Trix$2.Operation {
    constructor(url) {
      super(...arguments);
      this.url = url;
    }

    perform(callback) {
      var image;
      image = new Image();
      image.onload = () => {
        image.width = this.width = image.naturalWidth;
        image.height = this.height = image.naturalHeight;
        return callback(true, image);
      };
      image.onerror = function() {
        return callback(false);
      };
      return image.src = this.url;
    }

  };

  var ref$1,
    boundMethodCheck$1 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ref$1 = Trix$2.Attachment = (function() {
    class Attachment extends Trix$2.Object {
      static attachmentForFile(file) {
        var attachment, attributes;
        attributes = this.attributesForFile(file);
        attachment = new this(attributes);
        attachment.setFile(file);
        return attachment;
      }

      static attributesForFile(file) {
        return new Trix$2.Hash({
          filename: file.name,
          filesize: file.size,
          contentType: file.type
        });
      }

      static fromJSON(attachmentJSON) {
        return new this(attachmentJSON);
      }

      constructor(attributes = {}) {
        super(...arguments);
        this.releaseFile = this.releaseFile.bind(this);
        this.attributes = Trix$2.Hash.box(attributes);
        this.didChangeAttributes();
      }

      getAttribute(attribute) {
        return this.attributes.get(attribute);
      }

      hasAttribute(attribute) {
        return this.attributes.has(attribute);
      }

      getAttributes() {
        return this.attributes.toObject();
      }

      setAttributes(attributes = {}) {
        var newAttributes, ref1, ref2;
        newAttributes = this.attributes.merge(attributes);
        if (!this.attributes.isEqualTo(newAttributes)) {
          this.attributes = newAttributes;
          this.didChangeAttributes();
          if ((ref1 = this.previewDelegate) != null) {
            if (typeof ref1.attachmentDidChangeAttributes === "function") {
              ref1.attachmentDidChangeAttributes(this);
            }
          }
          return (ref2 = this.delegate) != null ? typeof ref2.attachmentDidChangeAttributes === "function" ? ref2.attachmentDidChangeAttributes(this) : void 0 : void 0;
        }
      }

      didChangeAttributes() {
        if (this.isPreviewable()) {
          return this.preloadURL();
        }
      }

      isPending() {
        return (this.file != null) && !(this.getURL() || this.getHref());
      }

      isPreviewable() {
        if (this.attributes.has("previewable")) {
          return this.attributes.get("previewable");
        } else {
          return this.constructor.previewablePattern.test(this.getContentType());
        }
      }

      getType() {
        if (this.hasContent()) {
          return "content";
        } else if (this.isPreviewable()) {
          return "preview";
        } else {
          return "file";
        }
      }

      getURL() {
        return this.attributes.get("url");
      }

      getHref() {
        return this.attributes.get("href");
      }

      getFilename() {
        var ref1;
        return (ref1 = this.attributes.get("filename")) != null ? ref1 : "";
      }

      getFilesize() {
        return this.attributes.get("filesize");
      }

      getFormattedFilesize() {
        var filesize;
        filesize = this.attributes.get("filesize");
        if (typeof filesize === "number") {
          return Trix$2.config.fileSize.formatter(filesize);
        } else {
          return "";
        }
      }

      getExtension() {
        var ref1;
        return (ref1 = this.getFilename().match(/\.(\w+)$/)) != null ? ref1[1].toLowerCase() : void 0;
      }

      getContentType() {
        return this.attributes.get("contentType");
      }

      hasContent() {
        return this.attributes.has("content");
      }

      getContent() {
        return this.attributes.get("content");
      }

      getWidth() {
        return this.attributes.get("width");
      }

      getHeight() {
        return this.attributes.get("height");
      }

      getFile() {
        return this.file;
      }

      setFile(file1) {
        this.file = file1;
        if (this.isPreviewable()) {
          return this.preloadFile();
        }
      }

      releaseFile() {
        boundMethodCheck$1(this, ref$1);
        this.releasePreloadedFile();
        return this.file = null;
      }

      getUploadProgress() {
        var ref1;
        return (ref1 = this.uploadProgress) != null ? ref1 : 0;
      }

      setUploadProgress(value) {
        var ref1;
        if (this.uploadProgress !== value) {
          this.uploadProgress = value;
          return (ref1 = this.uploadProgressDelegate) != null ? typeof ref1.attachmentDidChangeUploadProgress === "function" ? ref1.attachmentDidChangeUploadProgress(this) : void 0 : void 0;
        }
      }

      toJSON() {
        return this.getAttributes();
      }

      getCacheKey() {
        return [super.getCacheKey(...arguments), this.attributes.getCacheKey(), this.getPreviewURL()].join("/");
      }

      // Previewable
      getPreviewURL() {
        return this.previewURL || this.preloadingURL;
      }

      setPreviewURL(url) {
        var ref1, ref2;
        if (url !== this.getPreviewURL()) {
          this.previewURL = url;
          if ((ref1 = this.previewDelegate) != null) {
            if (typeof ref1.attachmentDidChangeAttributes === "function") {
              ref1.attachmentDidChangeAttributes(this);
            }
          }
          return (ref2 = this.delegate) != null ? typeof ref2.attachmentDidChangePreviewURL === "function" ? ref2.attachmentDidChangePreviewURL(this) : void 0 : void 0;
        }
      }

      preloadURL() {
        return this.preload(this.getURL(), this.releaseFile);
      }

      preloadFile() {
        if (this.file) {
          this.fileObjectURL = URL.createObjectURL(this.file);
          return this.preload(this.fileObjectURL);
        }
      }

      releasePreloadedFile() {
        if (this.fileObjectURL) {
          URL.revokeObjectURL(this.fileObjectURL);
          return this.fileObjectURL = null;
        }
      }

      preload(url, callback) {
        var operation;
        if (url && url !== this.getPreviewURL()) {
          this.preloadingURL = url;
          operation = new Trix$2.ImagePreloadOperation(url);
          return operation.then(({width, height}) => {
            if (!(this.getWidth() && this.getHeight())) {
              this.setAttributes({width, height});
            }
            this.preloadingURL = null;
            this.setPreviewURL(url);
            return typeof callback === "function" ? callback() : void 0;
          }).catch(() => {
            this.preloadingURL = null;
            return typeof callback === "function" ? callback() : void 0;
          });
        }
      }

    };

    Attachment.previewablePattern = /^image(\/(gif|png|jpe?g)|$)/;

    return Attachment;

  }).call(window);

  Trix$2.Piece = (function() {
    class Piece extends Trix$2.Object {
      static registerType(type, constructor) {
        constructor.type = type;
        return this.types[type] = constructor;
      }

      static fromJSON(pieceJSON) {
        var constructor;
        if (constructor = this.types[pieceJSON.type]) {
          return constructor.fromJSON(pieceJSON);
        }
      }

      constructor(value, attributes = {}) {
        super(...arguments);
        this.attributes = Trix$2.Hash.box(attributes);
      }

      copyWithAttributes(attributes) {
        return new this.constructor(this.getValue(), attributes);
      }

      copyWithAdditionalAttributes(attributes) {
        return this.copyWithAttributes(this.attributes.merge(attributes));
      }

      copyWithoutAttribute(attribute) {
        return this.copyWithAttributes(this.attributes.remove(attribute));
      }

      copy() {
        return this.copyWithAttributes(this.attributes);
      }

      getAttribute(attribute) {
        return this.attributes.get(attribute);
      }

      getAttributesHash() {
        return this.attributes;
      }

      getAttributes() {
        return this.attributes.toObject();
      }

      getCommonAttributes() {
        var attributes, keys, piece;
        if (!(piece = pieceList.getPieceAtIndex(0))) {
          return {};
        }
        attributes = piece.attributes;
        keys = attributes.getKeys();
        pieceList.eachPiece(function(piece) {
          keys = attributes.getKeysCommonToHash(piece.attributes);
          return attributes = attributes.slice(keys);
        });
        return attributes.toObject();
      }

      hasAttribute(attribute) {
        return this.attributes.has(attribute);
      }

      hasSameStringValueAsPiece(piece) {
        return (piece != null) && this.toString() === piece.toString();
      }

      hasSameAttributesAsPiece(piece) {
        return (piece != null) && (this.attributes === piece.attributes || this.attributes.isEqualTo(piece.attributes));
      }

      isBlockBreak() {
        return false;
      }

      isEqualTo(piece) {
        return super.isEqualTo(...arguments) || (this.hasSameConstructorAs(piece) && this.hasSameStringValueAsPiece(piece) && this.hasSameAttributesAsPiece(piece));
      }

      isEmpty() {
        return this.length === 0;
      }

      isSerializable() {
        return true;
      }

      toJSON() {
        return {
          type: this.constructor.type,
          attributes: this.getAttributes()
        };
      }

      contentsForInspection() {
        return {
          type: this.constructor.type,
          attributes: this.attributes.inspect()
        };
      }

      // Grouping
      canBeGrouped() {
        return this.hasAttribute("href");
      }

      canBeGroupedWith(piece) {
        return this.getAttribute("href") === piece.getAttribute("href");
      }

      // Splittable
      getLength() {
        return this.length;
      }

      canBeConsolidatedWith(piece) {
        return false;
      }

    };

    Piece.types = {};

    return Piece;

  }).call(window);

  Trix$2.Piece.registerType("attachment", Trix$2.AttachmentPiece = (function() {
    class AttachmentPiece extends Trix$2.Piece {
      static fromJSON(pieceJSON) {
        return new this(Trix$2.Attachment.fromJSON(pieceJSON.attachment), pieceJSON.attributes);
      }

      constructor(attachment) {
        super(...arguments);
        this.attachment = attachment;
        this.length = 1;
        this.ensureAttachmentExclusivelyHasAttribute("href");
        if (!this.attachment.hasContent()) {
          this.removeProhibitedAttributes();
        }
      }

      ensureAttachmentExclusivelyHasAttribute(attribute) {
        if (this.hasAttribute(attribute)) {
          if (!this.attachment.hasAttribute(attribute)) {
            this.attachment.setAttributes(this.attributes.slice(attribute));
          }
          return this.attributes = this.attributes.remove(attribute);
        }
      }

      removeProhibitedAttributes() {
        var attributes;
        attributes = this.attributes.slice(this.constructor.permittedAttributes);
        if (!attributes.isEqualTo(this.attributes)) {
          return this.attributes = attributes;
        }
      }

      getValue() {
        return this.attachment;
      }

      isSerializable() {
        return !this.attachment.isPending();
      }

      getCaption() {
        var ref;
        return (ref = this.attributes.get("caption")) != null ? ref : "";
      }

      isEqualTo(piece) {
        var ref;
        return super.isEqualTo(piece) && this.attachment.id === (piece != null ? (ref = piece.attachment) != null ? ref.id : void 0 : void 0);
      }

      toString() {
        return Trix$2.OBJECT_REPLACEMENT_CHARACTER;
      }

      toJSON() {
        var json;
        json = super.toJSON(...arguments);
        json.attachment = this.attachment;
        return json;
      }

      getCacheKey() {
        return [super.getCacheKey(...arguments), this.attachment.getCacheKey()].join("/");
      }

      toConsole() {
        return JSON.stringify(this.toString());
      }

    };

    AttachmentPiece.permittedAttributes = ["caption", "presentation"];

    return AttachmentPiece;

  }).call(window));

  var normalizeNewlines;

  ({normalizeNewlines} = Trix$2);

  Trix$2.Piece.registerType("string", Trix$2.StringPiece = class StringPiece extends Trix$2.Piece {
    static fromJSON(pieceJSON) {
      return new this(pieceJSON.string, pieceJSON.attributes);
    }

    constructor(string) {
      super(...arguments);
      this.string = normalizeNewlines(string);
      this.length = this.string.length;
    }

    getValue() {
      return this.string;
    }

    toString() {
      return this.string.toString();
    }

    isBlockBreak() {
      return this.toString() === "\n" && this.getAttribute("blockBreak") === true;
    }

    toJSON() {
      var result;
      result = super.toJSON(...arguments);
      result.string = this.string;
      return result;
    }

    // Splittable
    canBeConsolidatedWith(piece) {
      return (piece != null) && this.hasSameConstructorAs(piece) && this.hasSameAttributesAsPiece(piece);
    }

    consolidateWith(piece) {
      return new this.constructor(this.toString() + piece.toString(), this.attributes);
    }

    splitAtOffset(offset) {
      var left, right;
      if (offset === 0) {
        left = null;
        right = this;
      } else if (offset === this.length) {
        left = this;
        right = null;
      } else {
        left = new this.constructor(this.string.slice(0, offset), this.attributes);
        right = new this.constructor(this.string.slice(offset), this.attributes);
      }
      return [left, right];
    }

    toConsole() {
      var string;
      string = this.string;
      if (string.length > 15) {
        string = string.slice(0, 14) + "…";
      }
      return JSON.stringify(string.toString());
    }

  });

  var spliceArray$1;

  ({spliceArray: spliceArray$1} = Trix$2);

  Trix$2.SplittableList = (function() {
    var endOfRange, objectArraysAreEqual, startOfRange;

    class SplittableList extends Trix$2.Object {
      static box(objects) {
        if (objects instanceof this) {
          return objects;
        } else {
          return new this(objects);
        }
      }

      constructor(objects = []) {
        super(...arguments);
        this.objects = objects.slice(0);
        this.length = this.objects.length;
      }

      indexOf(object) {
        return this.objects.indexOf(object);
      }

      splice(...args) {
        return new this.constructor(spliceArray$1(this.objects, ...args));
      }

      eachObject(callback) {
        var i, index, len, object, ref, results;
        ref = this.objects;
        results = [];
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          object = ref[index];
          results.push(callback(object, index));
        }
        return results;
      }

      insertObjectAtIndex(object, index) {
        return this.splice(index, 0, object);
      }

      insertSplittableListAtIndex(splittableList, index) {
        return this.splice(index, 0, ...splittableList.objects);
      }

      insertSplittableListAtPosition(splittableList, position) {
        var index, objects;
        [objects, index] = this.splitObjectAtPosition(position);
        return new this.constructor(objects).insertSplittableListAtIndex(splittableList, index);
      }

      editObjectAtIndex(index, callback) {
        return this.replaceObjectAtIndex(callback(this.objects[index]), index);
      }

      replaceObjectAtIndex(object, index) {
        return this.splice(index, 1, object);
      }

      removeObjectAtIndex(index) {
        return this.splice(index, 1);
      }

      getObjectAtIndex(index) {
        return this.objects[index];
      }

      getSplittableListInRange(range) {
        var leftIndex, objects, rightIndex;
        [objects, leftIndex, rightIndex] = this.splitObjectsAtRange(range);
        return new this.constructor(objects.slice(leftIndex, rightIndex + 1));
      }

      selectSplittableList(test) {
        var object, objects;
        objects = (function() {
          var i, len, ref, results;
          ref = this.objects;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            object = ref[i];
            if (test(object)) {
              results.push(object);
            }
          }
          return results;
        }).call(this);
        return new this.constructor(objects);
      }

      removeObjectsInRange(range) {
        var leftIndex, objects, rightIndex;
        [objects, leftIndex, rightIndex] = this.splitObjectsAtRange(range);
        return new this.constructor(objects).splice(leftIndex, rightIndex - leftIndex + 1);
      }

      transformObjectsInRange(range, transform) {
        var index, leftIndex, object, objects, rightIndex, transformedObjects;
        [objects, leftIndex, rightIndex] = this.splitObjectsAtRange(range);
        transformedObjects = (function() {
          var i, len, results;
          results = [];
          for (index = i = 0, len = objects.length; i < len; index = ++i) {
            object = objects[index];
            if ((leftIndex <= index && index <= rightIndex)) {
              results.push(transform(object));
            } else {
              results.push(object);
            }
          }
          return results;
        })();
        return new this.constructor(transformedObjects);
      }

      splitObjectsAtRange(range) {
        var leftInnerIndex, objects, offset, rightOuterIndex;
        [objects, leftInnerIndex, offset] = this.splitObjectAtPosition(startOfRange(range));
        [objects, rightOuterIndex] = new this.constructor(objects).splitObjectAtPosition(endOfRange(range) + offset);
        return [objects, leftInnerIndex, rightOuterIndex - 1];
      }

      getObjectAtPosition(position) {
        var index, offset;
        ({index, offset} = this.findIndexAndOffsetAtPosition(position));
        return this.objects[index];
      }

      splitObjectAtPosition(position) {
        var index, leftObject, object, objects, offset, rightObject, splitIndex, splitOffset;
        ({index, offset} = this.findIndexAndOffsetAtPosition(position));
        objects = this.objects.slice(0);
        if (index != null) {
          if (offset === 0) {
            splitIndex = index;
            splitOffset = 0;
          } else {
            object = this.getObjectAtIndex(index);
            [leftObject, rightObject] = object.splitAtOffset(offset);
            objects.splice(index, 1, leftObject, rightObject);
            splitIndex = index + 1;
            splitOffset = leftObject.getLength() - offset;
          }
        } else {
          splitIndex = objects.length;
          splitOffset = 0;
        }
        return [objects, splitIndex, splitOffset];
      }

      consolidate() {
        var i, len, object, objects, pendingObject, ref;
        objects = [];
        pendingObject = this.objects[0];
        ref = this.objects.slice(1);
        for (i = 0, len = ref.length; i < len; i++) {
          object = ref[i];
          if (typeof pendingObject.canBeConsolidatedWith === "function" ? pendingObject.canBeConsolidatedWith(object) : void 0) {
            pendingObject = pendingObject.consolidateWith(object);
          } else {
            objects.push(pendingObject);
            pendingObject = object;
          }
        }
        if (pendingObject != null) {
          objects.push(pendingObject);
        }
        return new this.constructor(objects);
      }

      consolidateFromIndexToIndex(startIndex, endIndex) {
        var consolidatedInRange, objects, objectsInRange;
        objects = this.objects.slice(0);
        objectsInRange = objects.slice(startIndex, endIndex + 1);
        consolidatedInRange = new this.constructor(objectsInRange).consolidate().toArray();
        return this.splice(startIndex, objectsInRange.length, ...consolidatedInRange);
      }

      findIndexAndOffsetAtPosition(position) {
        var currentPosition, i, index, len, nextPosition, object, ref;
        currentPosition = 0;
        ref = this.objects;
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          object = ref[index];
          nextPosition = currentPosition + object.getLength();
          if ((currentPosition <= position && position < nextPosition)) {
            return {
              index: index,
              offset: position - currentPosition
            };
          }
          currentPosition = nextPosition;
        }
        return {
          index: null,
          offset: null
        };
      }

      findPositionAtIndexAndOffset(index, offset) {
        var currentIndex, i, len, object, position, ref;
        position = 0;
        ref = this.objects;
        for (currentIndex = i = 0, len = ref.length; i < len; currentIndex = ++i) {
          object = ref[currentIndex];
          if (currentIndex < index) {
            position += object.getLength();
          } else if (currentIndex === index) {
            position += offset;
            break;
          }
        }
        return position;
      }

      getEndPosition() {
        var object, position;
        return this.endPosition != null ? this.endPosition : this.endPosition = ((function() {
          var i, len, ref;
          position = 0;
          ref = this.objects;
          for (i = 0, len = ref.length; i < len; i++) {
            object = ref[i];
            position += object.getLength();
          }
          return position;
        }).call(this));
      }

      toString() {
        return this.objects.join("");
      }

      toArray() {
        return this.objects.slice(0);
      }

      toJSON() {
        return this.toArray();
      }

      isEqualTo(splittableList) {
        return super.isEqualTo(...arguments) || objectArraysAreEqual(this.objects, splittableList != null ? splittableList.objects : void 0);
      }

      contentsForInspection() {
        var object;
        return {
          objects: `[${((function() {
          var i, len, ref, results;
          ref = this.objects;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            object = ref[i];
            results.push(object.inspect());
          }
          return results;
        }).call(this)).join(", ")}]`
        };
      }

    };

    objectArraysAreEqual = function(left, right = []) {
      var i, index, len, object, result;
      if (left.length !== right.length) {
        return false;
      }
      result = true;
      for (index = i = 0, len = left.length; i < len; index = ++i) {
        object = left[index];
        if (result && !object.isEqualTo(right[index])) {
          result = false;
        }
      }
      return result;
    };

    startOfRange = function(range) {
      return range[0];
    };

    endOfRange = function(range) {
      return range[1];
    };

    return SplittableList;

  }).call(window);

  Trix$2.Text = class Text extends Trix$2.Object {
    static textForAttachmentWithAttributes(attachment, attributes) {
      var piece;
      piece = new Trix$2.AttachmentPiece(attachment, attributes);
      return new this([piece]);
    }

    static textForStringWithAttributes(string, attributes) {
      var piece;
      piece = new Trix$2.StringPiece(string, attributes);
      return new this([piece]);
    }

    static fromJSON(textJSON) {
      var pieceJSON, pieces;
      pieces = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = textJSON.length; i < len; i++) {
          pieceJSON = textJSON[i];
          results.push(Trix$2.Piece.fromJSON(pieceJSON));
        }
        return results;
      })();
      return new this(pieces);
    }

    constructor(pieces = []) {
      var piece;
      super(...arguments);
      this.pieceList = new Trix$2.SplittableList((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = pieces.length; i < len; i++) {
          piece = pieces[i];
          if (!piece.isEmpty()) {
            results.push(piece);
          }
        }
        return results;
      })());
    }

    copy() {
      return this.copyWithPieceList(this.pieceList);
    }

    copyWithPieceList(pieceList) {
      return new this.constructor(pieceList.consolidate().toArray());
    }

    copyUsingObjectMap(objectMap) {
      var piece, pieces;
      pieces = (function() {
        var i, len, ref, ref1, results;
        ref = this.getPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push((ref1 = objectMap.find(piece)) != null ? ref1 : piece);
        }
        return results;
      }).call(this);
      return new this.constructor(pieces);
    }

    appendText(text) {
      return this.insertTextAtPosition(text, this.getLength());
    }

    insertTextAtPosition(text, position) {
      return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(text.pieceList, position));
    }

    removeTextAtRange(range) {
      return this.copyWithPieceList(this.pieceList.removeObjectsInRange(range));
    }

    replaceTextAtRange(text, range) {
      return this.removeTextAtRange(range).insertTextAtPosition(text, range[0]);
    }

    moveTextFromRangeToPosition(range, position) {
      var length, text;
      if ((range[0] <= position && position <= range[1])) {
        return;
      }
      text = this.getTextAtRange(range);
      length = text.getLength();
      if (range[0] < position) {
        position -= length;
      }
      return this.removeTextAtRange(range).insertTextAtPosition(text, position);
    }

    addAttributeAtRange(attribute, value, range) {
      var attributes;
      attributes = {};
      attributes[attribute] = value;
      return this.addAttributesAtRange(attributes, range);
    }

    addAttributesAtRange(attributes, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithAdditionalAttributes(attributes);
      }));
    }

    removeAttributeAtRange(attribute, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithoutAttribute(attribute);
      }));
    }

    setAttributesAtRange(attributes, range) {
      return this.copyWithPieceList(this.pieceList.transformObjectsInRange(range, function(piece) {
        return piece.copyWithAttributes(attributes);
      }));
    }

    getAttributesAtPosition(position) {
      var ref, ref1;
      return (ref = (ref1 = this.pieceList.getObjectAtPosition(position)) != null ? ref1.getAttributes() : void 0) != null ? ref : {};
    }

    getCommonAttributes() {
      var objects, piece;
      objects = (function() {
        var i, len, ref, results;
        ref = this.pieceList.toArray();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push(piece.getAttributes());
        }
        return results;
      }).call(this);
      return Trix$2.Hash.fromCommonAttributesOfObjects(objects).toObject();
    }

    getCommonAttributesAtRange(range) {
      var ref;
      return (ref = this.getTextAtRange(range).getCommonAttributes()) != null ? ref : {};
    }

    getExpandedRangeForAttributeAtOffset(attributeName, offset) {
      var left, length, right;
      left = right = offset;
      length = this.getLength();
      while (left > 0 && this.getCommonAttributesAtRange([left - 1, right])[attributeName]) {
        left--;
      }
      while (right < length && this.getCommonAttributesAtRange([offset, right + 1])[attributeName]) {
        right++;
      }
      return [left, right];
    }

    getTextAtRange(range) {
      return this.copyWithPieceList(this.pieceList.getSplittableListInRange(range));
    }

    getStringAtRange(range) {
      return this.pieceList.getSplittableListInRange(range).toString();
    }

    getStringAtPosition(position) {
      return this.getStringAtRange([position, position + 1]);
    }

    startsWithString(string) {
      return this.getStringAtRange([0, string.length]) === string;
    }

    endsWithString(string) {
      var length;
      length = this.getLength();
      return this.getStringAtRange([length - string.length, length]) === string;
    }

    getAttachmentPieces() {
      var i, len, piece, ref, results;
      ref = this.pieceList.toArray();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        piece = ref[i];
        if (piece.attachment != null) {
          results.push(piece);
        }
      }
      return results;
    }

    getAttachments() {
      var i, len, piece, ref, results;
      ref = this.getAttachmentPieces();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        piece = ref[i];
        results.push(piece.attachment);
      }
      return results;
    }

    getAttachmentAndPositionById(attachmentId) {
      var i, len, piece, position, ref, ref1;
      position = 0;
      ref = this.pieceList.toArray();
      for (i = 0, len = ref.length; i < len; i++) {
        piece = ref[i];
        if (((ref1 = piece.attachment) != null ? ref1.id : void 0) === attachmentId) {
          return {
            attachment: piece.attachment,
            position
          };
        }
        position += piece.length;
      }
      return {
        attachment: null,
        position: null
      };
    }

    getAttachmentById(attachmentId) {
      var attachment, position;
      ({attachment, position} = this.getAttachmentAndPositionById(attachmentId));
      return attachment;
    }

    getRangeOfAttachment(attachment) {
      var position;
      ({attachment, position} = this.getAttachmentAndPositionById(attachment.id));
      if (attachment != null) {
        return [position, position + 1];
      }
    }

    updateAttributesForAttachment(attributes, attachment) {
      var range;
      if (range = this.getRangeOfAttachment(attachment)) {
        return this.addAttributesAtRange(attributes, range);
      } else {
        return this;
      }
    }

    getLength() {
      return this.pieceList.getEndPosition();
    }

    isEmpty() {
      return this.getLength() === 0;
    }

    isEqualTo(text) {
      var ref;
      return super.isEqualTo(text) || (text != null ? (ref = text.pieceList) != null ? ref.isEqualTo(this.pieceList) : void 0 : void 0);
    }

    isBlockBreak() {
      return this.getLength() === 1 && this.pieceList.getObjectAtIndex(0).isBlockBreak();
    }

    eachPiece(callback) {
      return this.pieceList.eachObject(callback);
    }

    getPieces() {
      return this.pieceList.toArray();
    }

    getPieceAtPosition(position) {
      return this.pieceList.getObjectAtPosition(position);
    }

    contentsForInspection() {
      return {
        pieceList: this.pieceList.inspect()
      };
    }

    toSerializableText() {
      var pieceList;
      pieceList = this.pieceList.selectSplittableList(function(piece) {
        return piece.isSerializable();
      });
      return this.copyWithPieceList(pieceList);
    }

    toString() {
      return this.pieceList.toString();
    }

    toJSON() {
      return this.pieceList.toJSON();
    }

    toConsole() {
      var piece;
      return JSON.stringify((function() {
        var i, len, ref, results;
        ref = this.pieceList.toArray();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push(JSON.parse(piece.toConsole()));
        }
        return results;
      }).call(this));
    }

    // BIDI
    getDirection() {
      return Trix$2.getDirection(this.toString());
    }

    isRTL() {
      return this.getDirection() === "rtl";
    }

  };

  var arraysAreEqual$2, getBlockAttributeNames, getBlockConfig$3, getListAttributeNames, spliceArray,
    indexOf$4 = [].indexOf,
    splice = [].splice;

  ({arraysAreEqual: arraysAreEqual$2, spliceArray, getBlockConfig: getBlockConfig$3, getBlockAttributeNames, getListAttributeNames} = Trix$2);

  Trix$2.Block = (function() {
    var addBlockBreakToText, applyBlockBreakToText, blockBreakText, expandAttribute, getLastElement, removeLastValue, textEndsInBlockBreak, unmarkBlockBreakPiece, unmarkExistingInnerBlockBreaksInText;

    class Block extends Trix$2.Object {
      static fromJSON(blockJSON) {
        var text;
        text = Trix$2.Text.fromJSON(blockJSON.text);
        return new this(text, blockJSON.attributes);
      }

      constructor(text, attributes) {
        super(...arguments);
        this.text = applyBlockBreakToText(text || new Trix$2.Text());
        this.attributes = attributes || [];
      }

      isEmpty() {
        return this.text.isBlockBreak();
      }

      isEqualTo(block) {
        return super.isEqualTo(block) || (this.text.isEqualTo(block != null ? block.text : void 0) && arraysAreEqual$2(this.attributes, block != null ? block.attributes : void 0));
      }

      copyWithText(text) {
        return new Trix$2.Block(text, this.attributes);
      }

      copyWithoutText() {
        return this.copyWithText(null);
      }

      copyWithAttributes(attributes) {
        return new Trix$2.Block(this.text, attributes);
      }

      copyWithoutAttributes() {
        return this.copyWithAttributes(null);
      }

      copyUsingObjectMap(objectMap) {
        var mappedText;
        if (mappedText = objectMap.find(this.text)) {
          return this.copyWithText(mappedText);
        } else {
          return this.copyWithText(this.text.copyUsingObjectMap(objectMap));
        }
      }

      addAttribute(attribute) {
        var attributes;
        attributes = this.attributes.concat(expandAttribute(attribute));
        return this.copyWithAttributes(attributes);
      }

      removeAttribute(attribute) {
        var attributes, listAttribute;
        ({listAttribute} = getBlockConfig$3(attribute));
        attributes = removeLastValue(removeLastValue(this.attributes, attribute), listAttribute);
        return this.copyWithAttributes(attributes);
      }

      removeLastAttribute() {
        return this.removeAttribute(this.getLastAttribute());
      }

      getLastAttribute() {
        return getLastElement(this.attributes);
      }

      getAttributes() {
        return this.attributes.slice(0);
      }

      getAttributeLevel() {
        return this.attributes.length;
      }

      getAttributeAtLevel(level) {
        return this.attributes[level - 1];
      }

      hasAttribute(attributeName) {
        return indexOf$4.call(this.attributes, attributeName) >= 0;
      }

      hasAttributes() {
        return this.getAttributeLevel() > 0;
      }

      getLastNestableAttribute() {
        return getLastElement(this.getNestableAttributes());
      }

      getNestableAttributes() {
        var attribute, i, len, ref, results;
        ref = this.attributes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          attribute = ref[i];
          if (getBlockConfig$3(attribute).nestable) {
            results.push(attribute);
          }
        }
        return results;
      }

      getNestingLevel() {
        return this.getNestableAttributes().length;
      }

      decreaseNestingLevel() {
        var attribute;
        if (attribute = this.getLastNestableAttribute()) {
          return this.removeAttribute(attribute);
        } else {
          return this;
        }
      }

      increaseNestingLevel() {
        var attribute, attributes, index;
        if (attribute = this.getLastNestableAttribute()) {
          index = this.attributes.lastIndexOf(attribute);
          attributes = spliceArray(this.attributes, index + 1, 0, ...expandAttribute(attribute));
          return this.copyWithAttributes(attributes);
        } else {
          return this;
        }
      }

      getListItemAttributes() {
        var attribute, i, len, ref, results;
        ref = this.attributes;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          attribute = ref[i];
          if (getBlockConfig$3(attribute).listAttribute) {
            results.push(attribute);
          }
        }
        return results;
      }

      isListItem() {
        var ref;
        return (ref = getBlockConfig$3(this.getLastAttribute())) != null ? ref.listAttribute : void 0;
      }

      isTerminalBlock() {
        var ref;
        return (ref = getBlockConfig$3(this.getLastAttribute())) != null ? ref.terminal : void 0;
      }

      breaksOnReturn() {
        var ref;
        return (ref = getBlockConfig$3(this.getLastAttribute())) != null ? ref.breakOnReturn : void 0;
      }

      findLineBreakInDirectionFromPosition(direction, position) {
        var result, string;
        string = this.toString();
        result = (function() {
          switch (direction) {
            case "forward":
              return string.indexOf("\n", position);
            case "backward":
              return string.slice(0, position).lastIndexOf("\n");
          }
        })();
        if (result !== -1) {
          return result;
        }
      }

      contentsForInspection() {
        return {
          text: this.text.inspect(),
          attributes: this.attributes
        };
      }

      toString() {
        return this.text.toString();
      }

      toJSON() {
        return {
          text: this.text,
          attributes: this.attributes
        };
      }

      // BIDI
      getDirection() {
        return this.text.getDirection();
      }

      isRTL() {
        return this.text.isRTL();
      }

      // Splittable
      getLength() {
        return this.text.getLength();
      }

      canBeConsolidatedWith(block) {
        return !this.hasAttributes() && !block.hasAttributes() && this.getDirection() === block.getDirection();
      }

      consolidateWith(block) {
        var newlineText, text;
        newlineText = Trix$2.Text.textForStringWithAttributes("\n");
        text = this.getTextWithoutBlockBreak().appendText(newlineText);
        return this.copyWithText(text.appendText(block.text));
      }

      splitAtOffset(offset) {
        var left, right;
        if (offset === 0) {
          left = null;
          right = this;
        } else if (offset === this.getLength()) {
          left = this;
          right = null;
        } else {
          left = this.copyWithText(this.text.getTextAtRange([0, offset]));
          right = this.copyWithText(this.text.getTextAtRange([offset, this.getLength()]));
        }
        return [left, right];
      }

      getBlockBreakPosition() {
        return this.text.getLength() - 1;
      }

      getTextWithoutBlockBreak() {
        if (textEndsInBlockBreak(this.text)) {
          return this.text.getTextAtRange([0, this.getBlockBreakPosition()]);
        } else {
          return this.text.copy();
        }
      }

      // Grouping
      canBeGrouped(depth) {
        return this.attributes[depth];
      }

      canBeGroupedWith(otherBlock, depth) {
        var attribute, otherAttribute, otherAttributes, ref;
        otherAttributes = otherBlock.getAttributes();
        otherAttribute = otherAttributes[depth];
        attribute = this.attributes[depth];
        return attribute === otherAttribute && !(getBlockConfig$3(attribute).group === false && (ref = otherAttributes[depth + 1], indexOf$4.call(getListAttributeNames(), ref) < 0)) && (this.getDirection() === otherBlock.getDirection() || otherBlock.isEmpty());
      }

    };

    // Block breaks
    applyBlockBreakToText = function(text) {
      text = unmarkExistingInnerBlockBreaksInText(text);
      text = addBlockBreakToText(text);
      return text;
    };

    unmarkExistingInnerBlockBreaksInText = function(text) {
      var innerPieces, lastPiece, modified, piece, ref;
      modified = false;
      ref = text.getPieces(), [...innerPieces] = ref, [lastPiece] = splice.call(innerPieces, -1);
      if (lastPiece == null) {
        return text;
      }
      innerPieces = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = innerPieces.length; i < len; i++) {
          piece = innerPieces[i];
          if (piece.isBlockBreak()) {
            modified = true;
            results.push(unmarkBlockBreakPiece(piece));
          } else {
            results.push(piece);
          }
        }
        return results;
      })();
      if (modified) {
        return new Trix$2.Text([...innerPieces, lastPiece]);
      } else {
        return text;
      }
    };

    blockBreakText = Trix$2.Text.textForStringWithAttributes("\n", {
      blockBreak: true
    });

    addBlockBreakToText = function(text) {
      if (textEndsInBlockBreak(text)) {
        return text;
      } else {
        return text.appendText(blockBreakText);
      }
    };

    textEndsInBlockBreak = function(text) {
      var endText, length;
      length = text.getLength();
      if (length === 0) {
        return false;
      }
      endText = text.getTextAtRange([length - 1, length]);
      return endText.isBlockBreak();
    };

    unmarkBlockBreakPiece = function(piece) {
      return piece.copyWithoutAttribute("blockBreak");
    };

    // Attributes
    expandAttribute = function(attribute) {
      var listAttribute;
      ({listAttribute} = getBlockConfig$3(attribute));
      if (listAttribute != null) {
        return [listAttribute, attribute];
      } else {
        return [attribute];
      }
    };

    // Array helpers
    getLastElement = function(array) {
      return array.slice(-1)[0];
    };

    removeLastValue = function(array, value) {
      var index;
      index = array.lastIndexOf(value);
      if (index === -1) {
        return array;
      } else {
        return spliceArray(array, index, 1);
      }
    };

    return Block;

  }).call(window);

  var nodeIsAttachmentElement$2, tagName$2, walkTree$2,
    indexOf$3 = [].indexOf;

  ({tagName: tagName$2, walkTree: walkTree$2, nodeIsAttachmentElement: nodeIsAttachmentElement$2} = Trix$2);

  Trix$2.HTMLSanitizer = (function() {
    var DEFAULT_ALLOWED_ATTRIBUTES, DEFAULT_FORBIDDEN_ELEMENTS, DEFAULT_FORBIDDEN_PROTOCOLS, createBodyElementForHTML;

    class HTMLSanitizer extends Trix$2.BasicObject {
      static sanitize(html, options) {
        var sanitizer;
        sanitizer = new this(html, options);
        sanitizer.sanitize();
        return sanitizer;
      }

      constructor(html, {allowedAttributes, forbiddenProtocols, forbiddenElements} = {}) {
        super(...arguments);
        this.allowedAttributes = allowedAttributes;
        this.forbiddenProtocols = forbiddenProtocols;
        this.forbiddenElements = forbiddenElements;
        if (this.allowedAttributes == null) {
          this.allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES;
        }
        if (this.forbiddenProtocols == null) {
          this.forbiddenProtocols = DEFAULT_FORBIDDEN_PROTOCOLS;
        }
        if (this.forbiddenElements == null) {
          this.forbiddenElements = DEFAULT_FORBIDDEN_ELEMENTS;
        }
        this.body = createBodyElementForHTML(html);
      }

      sanitize() {
        this.sanitizeElements();
        return this.normalizeListElementNesting();
      }

      getHTML() {
        return this.body.innerHTML;
      }

      getBody() {
        return this.body;
      }

      // Private
      sanitizeElements() {
        var i, len, node, nodesToRemove, walker;
        walker = walkTree$2(this.body);
        nodesToRemove = [];
        while (walker.nextNode()) {
          node = walker.currentNode;
          switch (node.nodeType) {
            case Node.ELEMENT_NODE:
              if (this.elementIsRemovable(node)) {
                nodesToRemove.push(node);
              } else {
                this.sanitizeElement(node);
              }
              break;
            case Node.COMMENT_NODE:
              nodesToRemove.push(node);
          }
        }
        for (i = 0, len = nodesToRemove.length; i < len; i++) {
          node = nodesToRemove[i];
          Trix$2.removeNode(node);
        }
        return this.body;
      }

      sanitizeElement(element) {
        var i, len, name, ref, ref1;
        if (element.hasAttribute("href")) {
          if (ref = element.protocol, indexOf$3.call(this.forbiddenProtocols, ref) >= 0) {
            element.removeAttribute("href");
          }
        }
        ref1 = [...element.attributes];
        for (i = 0, len = ref1.length; i < len; i++) {
          ({name} = ref1[i]);
          if (!(indexOf$3.call(this.allowedAttributes, name) >= 0 || name.indexOf("data-trix") === 0)) {
            element.removeAttribute(name);
          }
        }
        return element;
      }

      normalizeListElementNesting() {
        var i, len, listElement, previousElement, ref;
        ref = [...this.body.querySelectorAll("ul,ol")];
        for (i = 0, len = ref.length; i < len; i++) {
          listElement = ref[i];
          if (previousElement = listElement.previousElementSibling) {
            if (tagName$2(previousElement) === "li") {
              previousElement.appendChild(listElement);
            }
          }
        }
        return this.body;
      }

      elementIsRemovable(element) {
        if ((element != null ? element.nodeType : void 0) !== Node.ELEMENT_NODE) {
          return;
        }
        return this.elementIsForbidden(element) || this.elementIsntSerializable(element);
      }

      elementIsForbidden(element) {
        var ref;
        return ref = tagName$2(element), indexOf$3.call(this.forbiddenElements, ref) >= 0;
      }

      elementIsntSerializable(element) {
        return element.getAttribute("data-trix-serialize") === "false" && !nodeIsAttachmentElement$2(element);
      }

    };

    DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height class".split(" ");

    DEFAULT_FORBIDDEN_PROTOCOLS = "javascript:".split(" ");

    DEFAULT_FORBIDDEN_ELEMENTS = "script iframe".split(" ");

    createBodyElementForHTML = function(html = "") {
      var doc, element, i, len, ref;
      // Remove everything after </html>
      html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>");
      doc = document.implementation.createHTMLDocument("");
      doc.documentElement.innerHTML = html;
      ref = doc.head.querySelectorAll("style");
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        doc.body.appendChild(element);
      }
      return doc.body;
    };

    return HTMLSanitizer;

  }).call(window);

  var arraysAreEqual$1, breakableWhitespacePattern, elementContainsNode$2, findClosestElementFromNode$1, getBlockTagNames, makeElement$1, nodeIsAttachmentElement$1, normalizeSpaces, squishBreakableWhitespace, tagName$1, walkTree$1,
    indexOf$2 = [].indexOf;

  ({arraysAreEqual: arraysAreEqual$1, makeElement: makeElement$1, tagName: tagName$1, getBlockTagNames, walkTree: walkTree$1, findClosestElementFromNode: findClosestElementFromNode$1, elementContainsNode: elementContainsNode$2, nodeIsAttachmentElement: nodeIsAttachmentElement$1, normalizeSpaces, breakableWhitespacePattern, squishBreakableWhitespace} = Trix$2);

  Trix$2.HTMLParser = (function() {
    var blockForAttributes, elementCanDisplayPreformattedText, getBlockElementMargin, getImageDimensions, leftTrimBreakableWhitespace, nodeEndsWithNonWhitespace, nodeFilter, parseTrixDataAttribute, pieceForAttachment, pieceForString, stringEndsWithWhitespace, stringIsAllBreakableWhitespace;

    class HTMLParser extends Trix$2.BasicObject {
      static parse(html, options) {
        var parser;
        parser = new this(html, options);
        parser.parse();
        return parser;
      }

      constructor(html1, {referenceElement} = {}) {
        super(...arguments);
        this.html = html1;
        this.referenceElement = referenceElement;
        this.blocks = [];
        this.blockElements = [];
        this.processedElements = [];
      }

      getDocument() {
        return Trix$2.Document.fromJSON(this.blocks);
      }

      // HTML parsing
      parse() {
        var html, walker;
        try {
          this.createHiddenContainer();
          html = Trix$2.HTMLSanitizer.sanitize(this.html).getHTML();
          this.containerElement.innerHTML = html;
          walker = walkTree$1(this.containerElement, {
            usingFilter: nodeFilter
          });
          while (walker.nextNode()) {
            this.processNode(walker.currentNode);
          }
          return this.translateBlockElementMarginsToNewlines();
        } finally {
          this.removeHiddenContainer();
        }
      }

      createHiddenContainer() {
        if (this.referenceElement) {
          this.containerElement = this.referenceElement.cloneNode(false);
          this.containerElement.removeAttribute("id");
          this.containerElement.setAttribute("data-trix-internal", "");
          this.containerElement.style.display = "none";
          return this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling);
        } else {
          this.containerElement = makeElement$1({
            tagName: "div",
            style: {
              display: "none"
            }
          });
          return document.body.appendChild(this.containerElement);
        }
      }

      removeHiddenContainer() {
        return Trix$2.removeNode(this.containerElement);
      }

      processNode(node) {
        switch (node.nodeType) {
          case Node.TEXT_NODE:
            if (!this.isInsignificantTextNode(node)) {
              this.appendBlockForTextNode(node);
              return this.processTextNode(node);
            }
            break;
          case Node.ELEMENT_NODE:
            this.appendBlockForElement(node);
            return this.processElement(node);
        }
      }

      appendBlockForTextNode(node) {
        var attributes, element, ref;
        element = node.parentNode;
        if (element === this.currentBlockElement && this.isBlockElement(node.previousSibling)) {
          return this.appendStringWithAttributes("\n");
        } else if (element === this.containerElement || this.isBlockElement(element)) {
          attributes = this.getBlockAttributes(element);
          if (!arraysAreEqual$1(attributes, (ref = this.currentBlock) != null ? ref.attributes : void 0)) {
            this.currentBlock = this.appendBlockForAttributesWithElement(attributes, element);
            return this.currentBlockElement = element;
          }
        }
      }

      appendBlockForElement(element) {
        var attributes, currentBlockContainsElement, elementIsBlockElement, parentBlockElement;
        elementIsBlockElement = this.isBlockElement(element);
        currentBlockContainsElement = elementContainsNode$2(this.currentBlockElement, element);
        if (elementIsBlockElement && !this.isBlockElement(element.firstChild)) {
          if (!(this.isInsignificantTextNode(element.firstChild) && this.isBlockElement(element.firstElementChild))) {
            attributes = this.getBlockAttributes(element);
            if (element.firstChild) {
              if (!(currentBlockContainsElement && arraysAreEqual$1(attributes, this.currentBlock.attributes))) {
                this.currentBlock = this.appendBlockForAttributesWithElement(attributes, element);
                return this.currentBlockElement = element;
              } else {
                return this.appendStringWithAttributes("\n");
              }
            }
          }
        } else if (this.currentBlockElement && !currentBlockContainsElement && !elementIsBlockElement) {
          if (parentBlockElement = this.findParentBlockElement(element)) {
            return this.appendBlockForElement(parentBlockElement);
          } else {
            this.currentBlock = this.appendEmptyBlock();
            return this.currentBlockElement = null;
          }
        }
      }

      findParentBlockElement(element) {
        var parentElement;
        ({parentElement} = element);
        while (parentElement && parentElement !== this.containerElement) {
          if (this.isBlockElement(parentElement) && indexOf$2.call(this.blockElements, parentElement) >= 0) {
            return parentElement;
          } else {
            ({parentElement} = parentElement);
          }
        }
        return null;
      }

      processTextNode(node) {
        var ref, string;
        string = node.data;
        if (!elementCanDisplayPreformattedText(node.parentNode)) {
          string = squishBreakableWhitespace(string);
          if (stringEndsWithWhitespace((ref = node.previousSibling) != null ? ref.textContent : void 0)) {
            string = leftTrimBreakableWhitespace(string);
          }
        }
        return this.appendStringWithAttributes(string, this.getTextAttributes(node.parentNode));
      }

      processElement(element) {
        var attributes, key, ref, textAttributes, value;
        if (nodeIsAttachmentElement$1(element)) {
          attributes = parseTrixDataAttribute(element, "attachment");
          if (Object.keys(attributes).length) {
            textAttributes = this.getTextAttributes(element);
            this.appendAttachmentWithAttributes(attributes, textAttributes);
            // We have everything we need so avoid processing inner nodes
            element.innerHTML = "";
          }
          return this.processedElements.push(element);
        } else {
          switch (tagName$1(element)) {
            case "br":
              if (!(this.isExtraBR(element) || this.isBlockElement(element.nextSibling))) {
                this.appendStringWithAttributes("\n", this.getTextAttributes(element));
              }
              return this.processedElements.push(element);
            case "img":
              attributes = {
                url: element.getAttribute("src"),
                contentType: "image"
              };
              ref = getImageDimensions(element);
              for (key in ref) {
                value = ref[key];
                attributes[key] = value;
              }
              this.appendAttachmentWithAttributes(attributes, this.getTextAttributes(element));
              return this.processedElements.push(element);
            case "tr":
              if (element.parentNode.firstChild !== element) {
                return this.appendStringWithAttributes("\n");
              }
              break;
            case "td":
              if (element.parentNode.firstChild !== element) {
                return this.appendStringWithAttributes(" | ");
              }
          }
        }
      }

      // Document construction
      appendBlockForAttributesWithElement(attributes, element) {
        var block;
        this.blockElements.push(element);
        block = blockForAttributes(attributes);
        this.blocks.push(block);
        return block;
      }

      appendEmptyBlock() {
        return this.appendBlockForAttributesWithElement([], null);
      }

      appendStringWithAttributes(string, attributes) {
        return this.appendPiece(pieceForString(string, attributes));
      }

      appendAttachmentWithAttributes(attachment, attributes) {
        return this.appendPiece(pieceForAttachment(attachment, attributes));
      }

      appendPiece(piece) {
        if (this.blocks.length === 0) {
          this.appendEmptyBlock();
        }
        return this.blocks[this.blocks.length - 1].text.push(piece);
      }

      appendStringToTextAtIndex(string, index) {
        var piece, text;
        ({text} = this.blocks[index]);
        piece = text[text.length - 1];
        if ((piece != null ? piece.type : void 0) === "string") {
          return piece.string += string;
        } else {
          return text.push(pieceForString(string));
        }
      }

      prependStringToTextAtIndex(string, index) {
        var piece, text;
        ({text} = this.blocks[index]);
        piece = text[0];
        if ((piece != null ? piece.type : void 0) === "string") {
          return piece.string = string + piece.string;
        } else {
          return text.unshift(pieceForString(string));
        }
      }

      // Attribute parsing
      getTextAttributes(element) {
        var attribute, attributeInheritedFromBlock, attributes, blockElement, config, i, key, len, ref, ref1, ref2, value;
        attributes = {};
        ref = Trix$2.config.textAttributes;
        for (attribute in ref) {
          config = ref[attribute];
          if (config.tagName && findClosestElementFromNode$1(element, {
            matchingSelector: config.tagName,
            untilNode: this.containerElement
          })) {
            attributes[attribute] = true;
          } else if (config.parser) {
            if (value = config.parser(element)) {
              attributeInheritedFromBlock = false;
              ref1 = this.findBlockElementAncestors(element);
              for (i = 0, len = ref1.length; i < len; i++) {
                blockElement = ref1[i];
                if (config.parser(blockElement) === value) {
                  attributeInheritedFromBlock = true;
                  break;
                }
              }
              if (!attributeInheritedFromBlock) {
                attributes[attribute] = value;
              }
            }
          } else if (config.styleProperty) {
            if (value = element.style[config.styleProperty]) {
              attributes[attribute] = value;
            }
          }
        }
        if (nodeIsAttachmentElement$1(element)) {
          ref2 = parseTrixDataAttribute(element, "attributes");
          for (key in ref2) {
            value = ref2[key];
            attributes[key] = value;
          }
        }
        return attributes;
      }

      getBlockAttributes(element) {
        var attribute, attributes, config, ref;
        attributes = [];
        while (element && element !== this.containerElement) {
          ref = Trix$2.config.blockAttributes;
          for (attribute in ref) {
            config = ref[attribute];
            if (config.parse !== false) {
              if (tagName$1(element) === config.tagName) {
                if ((typeof config.test === "function" ? config.test(element) : void 0) || !config.test) {
                  attributes.push(attribute);
                  if (config.listAttribute) {
                    attributes.push(config.listAttribute);
                  }
                }
              }
            }
          }
          element = element.parentNode;
        }
        return attributes.reverse();
      }

      findBlockElementAncestors(element) {
        var ancestors, ref;
        ancestors = [];
        while (element && element !== this.containerElement) {
          if (ref = tagName$1(element), indexOf$2.call(getBlockTagNames(), ref) >= 0) {
            ancestors.push(element);
          }
          element = element.parentNode;
        }
        return ancestors;
      }

      // Element inspection
      isBlockElement(element) {
        var ref;
        if ((element != null ? element.nodeType : void 0) !== Node.ELEMENT_NODE) {
          return;
        }
        if (nodeIsAttachmentElement$1(element)) {
          return;
        }
        if (findClosestElementFromNode$1(element, {
          matchingSelector: "td",
          untilNode: this.containerElement
        })) {
          return;
        }
        return (ref = tagName$1(element), indexOf$2.call(getBlockTagNames(), ref) >= 0) || window.getComputedStyle(element).display === "block";
      }

      isInsignificantTextNode(node) {
        var nextSibling, parentNode, previousSibling;
        if ((node != null ? node.nodeType : void 0) !== Node.TEXT_NODE) {
          return;
        }
        if (!stringIsAllBreakableWhitespace(node.data)) {
          return;
        }
        ({parentNode, previousSibling, nextSibling} = node);
        if (nodeEndsWithNonWhitespace(parentNode.previousSibling) && !this.isBlockElement(parentNode.previousSibling)) {
          return;
        }
        if (elementCanDisplayPreformattedText(parentNode)) {
          return;
        }
        return !previousSibling || this.isBlockElement(previousSibling) || !nextSibling || this.isBlockElement(nextSibling);
      }

      isExtraBR(element) {
        return tagName$1(element) === "br" && this.isBlockElement(element.parentNode) && element.parentNode.lastChild === element;
      }

      // Margin translation
      translateBlockElementMarginsToNewlines() {
        var block, defaultMargin, i, index, len, margin, ref, results;
        defaultMargin = this.getMarginOfDefaultBlockElement();
        ref = this.blocks;
        results = [];
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          block = ref[index];
          if (!(margin = this.getMarginOfBlockElementAtIndex(index))) {
            continue;
          }
          if (margin.top > defaultMargin.top * 2) {
            this.prependStringToTextAtIndex("\n", index);
          }
          if (margin.bottom > defaultMargin.bottom * 2) {
            results.push(this.appendStringToTextAtIndex("\n", index));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }

      getMarginOfBlockElementAtIndex(index) {
        var element, ref;
        if (element = this.blockElements[index]) {
          if (element.textContent) {
            if (!((ref = tagName$1(element), indexOf$2.call(getBlockTagNames(), ref) >= 0) || indexOf$2.call(this.processedElements, element) >= 0)) {
              return getBlockElementMargin(element);
            }
          }
        }
      }

      getMarginOfDefaultBlockElement() {
        var element;
        element = makeElement$1(Trix$2.config.blockAttributes.default.tagName);
        this.containerElement.appendChild(element);
        return getBlockElementMargin(element);
      }

    };

    nodeFilter = function(node) {
      if (tagName$1(node) === "style") {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    pieceForString = function(string, attributes = {}) {
      var type;
      type = "string";
      string = normalizeSpaces(string);
      return {string, attributes, type};
    };

    pieceForAttachment = function(attachment, attributes = {}) {
      var type;
      type = "attachment";
      return {attachment, attributes, type};
    };

    blockForAttributes = function(attributes = {}) {
      var text;
      text = [];
      return {text, attributes};
    };

    parseTrixDataAttribute = function(element, name) {
      try {
        return JSON.parse(element.getAttribute(`data-trix-${name}`));
      } catch (error) {
        return {};
      }
    };

    getImageDimensions = function(element) {
      var dimensions, height, width;
      width = element.getAttribute("width");
      height = element.getAttribute("height");
      dimensions = {};
      if (width) {
        dimensions.width = parseInt(width, 10);
      }
      if (height) {
        dimensions.height = parseInt(height, 10);
      }
      return dimensions;
    };

    elementCanDisplayPreformattedText = function(element) {
      var whiteSpace;
      ({whiteSpace} = window.getComputedStyle(element));
      return whiteSpace === "pre" || whiteSpace === "pre-wrap" || whiteSpace === "pre-line";
    };

    nodeEndsWithNonWhitespace = function(node) {
      return node && !stringEndsWithWhitespace(node.textContent);
    };

    getBlockElementMargin = function(element) {
      var style;
      style = window.getComputedStyle(element);
      if (style.display === "block") {
        return {
          top: parseInt(style.marginTop),
          bottom: parseInt(style.marginBottom)
        };
      }
    };

    // Whitespace
    leftTrimBreakableWhitespace = function(string) {
      return string.replace(RegExp(`^${breakableWhitespacePattern.source}+`), "");
    };

    stringIsAllBreakableWhitespace = function(string) {
      return RegExp(`^${breakableWhitespacePattern.source}*$`).test(string);
    };

    stringEndsWithWhitespace = function(string) {
      return /\s$/.test(string);
    };

    return HTMLParser;

  }).call(window);

  var arraysAreEqual, getBlockConfig$2, normalizeRange$2, rangeIsCollapsed$3,
    slice$1 = [].slice,
    indexOf$1 = [].indexOf;

  ({arraysAreEqual, normalizeRange: normalizeRange$2, rangeIsCollapsed: rangeIsCollapsed$3, getBlockConfig: getBlockConfig$2} = Trix$2);

  Trix$2.Document = (function() {
    var attributesForBlock;

    class Document extends Trix$2.Object {
      static fromJSON(documentJSON) {
        var blockJSON, blocks;
        blocks = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = documentJSON.length; i < len; i++) {
            blockJSON = documentJSON[i];
            results.push(Trix$2.Block.fromJSON(blockJSON));
          }
          return results;
        })();
        return new this(blocks);
      }

      static fromHTML(html, options) {
        return Trix$2.HTMLParser.parse(html, options).getDocument();
      }

      static fromString(string, textAttributes) {
        var text;
        text = Trix$2.Text.textForStringWithAttributes(string, textAttributes);
        return new this([new Trix$2.Block(text)]);
      }

      constructor(blocks = []) {
        super(...arguments);
        if (blocks.length === 0) {
          blocks = [new Trix$2.Block()];
        }
        this.blockList = Trix$2.SplittableList.box(blocks);
      }

      isEmpty() {
        var block;
        return this.blockList.length === 1 && (block = this.getBlockAtIndex(0), block.isEmpty() && !block.hasAttributes());
      }

      copy(options = {}) {
        var blocks;
        blocks = options.consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray();
        return new this.constructor(blocks);
      }

      copyUsingObjectsFromDocument(sourceDocument) {
        var objectMap;
        objectMap = new Trix$2.ObjectMap(sourceDocument.getObjects());
        return this.copyUsingObjectMap(objectMap);
      }

      copyUsingObjectMap(objectMap) {
        var block, blocks, mappedBlock;
        blocks = (function() {
          var i, len, ref, results;
          ref = this.getBlocks();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            block = ref[i];
            if (mappedBlock = objectMap.find(block)) {
              results.push(mappedBlock);
            } else {
              results.push(block.copyUsingObjectMap(objectMap));
            }
          }
          return results;
        }).call(this);
        return new this.constructor(blocks);
      }

      copyWithBaseBlockAttributes(blockAttributes = []) {
        var attributes, block, blocks;
        blocks = (function() {
          var i, len, ref, results;
          ref = this.getBlocks();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            block = ref[i];
            attributes = blockAttributes.concat(block.getAttributes());
            results.push(block.copyWithAttributes(attributes));
          }
          return results;
        }).call(this);
        return new this.constructor(blocks);
      }

      replaceBlock(oldBlock, newBlock) {
        var index;
        index = this.blockList.indexOf(oldBlock);
        if (index === -1) {
          return this;
        }
        return new this.constructor(this.blockList.replaceObjectAtIndex(newBlock, index));
      }

      insertDocumentAtRange(document, range) {
        var block, blockList, index, offset, position, result;
        ({blockList} = document);
        [position] = range = normalizeRange$2(range);
        ({index, offset} = this.locationFromPosition(position));
        result = this;
        block = this.getBlockAtPosition(position);
        if (rangeIsCollapsed$3(range) && block.isEmpty() && !block.hasAttributes()) {
          result = new this.constructor(result.blockList.removeObjectAtIndex(index));
        } else if (block.getBlockBreakPosition() === offset) {
          position++;
        }
        result = result.removeTextAtRange(range);
        return new this.constructor(result.blockList.insertSplittableListAtPosition(blockList, position));
      }

      mergeDocumentAtRange(document, range) {
        var baseBlockAttributes, blockAttributes, blockCount, firstBlock, firstText, formattedDocument, leadingBlockAttributes, position, result, startLocation, startPosition, trailingBlockAttributes;
        [startPosition] = range = normalizeRange$2(range);
        startLocation = this.locationFromPosition(startPosition);
        blockAttributes = this.getBlockAtIndex(startLocation.index).getAttributes();
        baseBlockAttributes = document.getBaseBlockAttributes();
        trailingBlockAttributes = blockAttributes.slice(-baseBlockAttributes.length);
        if (arraysAreEqual(baseBlockAttributes, trailingBlockAttributes)) {
          leadingBlockAttributes = blockAttributes.slice(0, -baseBlockAttributes.length);
          formattedDocument = document.copyWithBaseBlockAttributes(leadingBlockAttributes);
        } else {
          formattedDocument = document.copy({
            consolidateBlocks: true
          }).copyWithBaseBlockAttributes(blockAttributes);
        }
        blockCount = formattedDocument.getBlockCount();
        firstBlock = formattedDocument.getBlockAtIndex(0);
        if (arraysAreEqual(blockAttributes, firstBlock.getAttributes())) {
          firstText = firstBlock.getTextWithoutBlockBreak();
          result = this.insertTextAtRange(firstText, range);
          if (blockCount > 1) {
            formattedDocument = new this.constructor(formattedDocument.getBlocks().slice(1));
            position = startPosition + firstText.getLength();
            result = result.insertDocumentAtRange(formattedDocument, position);
          }
        } else {
          result = this.insertDocumentAtRange(formattedDocument, range);
        }
        return result;
      }

      insertTextAtRange(text, range) {
        var document, index, offset, startPosition;
        [startPosition] = range = normalizeRange$2(range);
        ({index, offset} = this.locationFromPosition(startPosition));
        document = this.removeTextAtRange(range);
        return new this.constructor(document.blockList.editObjectAtIndex(index, function(block) {
          return block.copyWithText(block.text.insertTextAtPosition(text, offset));
        }));
      }

      removeTextAtRange(range) {
        var affectedBlockCount, block, blocks, leftBlock, leftIndex, leftLocation, leftOffset, leftPosition, leftText, removeRightNewline, removingLeftBlock, rightBlock, rightIndex, rightLocation, rightOffset, rightPosition, rightText, text, useRightBlock;
        [leftPosition, rightPosition] = range = normalizeRange$2(range);
        if (rangeIsCollapsed$3(range)) {
          return this;
        }
        [leftLocation, rightLocation] = this.locationRangeFromRange(range);
        leftIndex = leftLocation.index;
        leftOffset = leftLocation.offset;
        leftBlock = this.getBlockAtIndex(leftIndex);
        rightIndex = rightLocation.index;
        rightOffset = rightLocation.offset;
        rightBlock = this.getBlockAtIndex(rightIndex);
        removeRightNewline = rightPosition - leftPosition === 1 && leftBlock.getBlockBreakPosition() === leftOffset && rightBlock.getBlockBreakPosition() !== rightOffset && rightBlock.text.getStringAtPosition(rightOffset) === "\n";
        if (removeRightNewline) {
          blocks = this.blockList.editObjectAtIndex(rightIndex, function(block) {
            return block.copyWithText(block.text.removeTextAtRange([rightOffset, rightOffset + 1]));
          });
        } else {
          leftText = leftBlock.text.getTextAtRange([0, leftOffset]);
          rightText = rightBlock.text.getTextAtRange([rightOffset, rightBlock.getLength()]);
          text = leftText.appendText(rightText);
          removingLeftBlock = leftIndex !== rightIndex && leftOffset === 0;
          useRightBlock = removingLeftBlock && leftBlock.getAttributeLevel() >= rightBlock.getAttributeLevel();
          if (useRightBlock) {
            block = rightBlock.copyWithText(text);
          } else {
            block = leftBlock.copyWithText(text);
          }
          affectedBlockCount = rightIndex + 1 - leftIndex;
          blocks = this.blockList.splice(leftIndex, affectedBlockCount, block);
        }
        return new this.constructor(blocks);
      }

      moveTextFromRangeToPosition(range, position) {
        var blocks, document, endPosition, firstBlock, movingRightward, result, startPosition, text;
        [startPosition, endPosition] = range = normalizeRange$2(range);
        if ((startPosition <= position && position <= endPosition)) {
          return this;
        }
        document = this.getDocumentAtRange(range);
        result = this.removeTextAtRange(range);
        movingRightward = startPosition < position;
        if (movingRightward) {
          position -= document.getLength();
        }
        [firstBlock, ...blocks] = document.getBlocks();
        if (blocks.length === 0) {
          text = firstBlock.getTextWithoutBlockBreak();
          if (movingRightward) {
            position += 1;
          }
        } else {
          text = firstBlock.text;
        }
        result = result.insertTextAtRange(text, position);
        if (blocks.length === 0) {
          return result;
        }
        document = new this.constructor(blocks);
        position += text.getLength();
        return result.insertDocumentAtRange(document, position);
      }

      addAttributeAtRange(attribute, value, range) {
        var blockList;
        blockList = this.blockList;
        this.eachBlockAtRange(range, function(block, textRange, index) {
          return blockList = blockList.editObjectAtIndex(index, function() {
            if (getBlockConfig$2(attribute)) {
              return block.addAttribute(attribute, value);
            } else {
              if (textRange[0] === textRange[1]) {
                return block;
              } else {
                return block.copyWithText(block.text.addAttributeAtRange(attribute, value, textRange));
              }
            }
          });
        });
        return new this.constructor(blockList);
      }

      addAttribute(attribute, value) {
        var blockList;
        blockList = this.blockList;
        this.eachBlock(function(block, index) {
          return blockList = blockList.editObjectAtIndex(index, function() {
            return block.addAttribute(attribute, value);
          });
        });
        return new this.constructor(blockList);
      }

      removeAttributeAtRange(attribute, range) {
        var blockList;
        blockList = this.blockList;
        this.eachBlockAtRange(range, function(block, textRange, index) {
          if (getBlockConfig$2(attribute)) {
            return blockList = blockList.editObjectAtIndex(index, function() {
              return block.removeAttribute(attribute);
            });
          } else if (textRange[0] !== textRange[1]) {
            return blockList = blockList.editObjectAtIndex(index, function() {
              return block.copyWithText(block.text.removeAttributeAtRange(attribute, textRange));
            });
          }
        });
        return new this.constructor(blockList);
      }

      updateAttributesForAttachment(attributes, attachment) {
        var index, range, startPosition, text;
        [startPosition] = range = this.getRangeOfAttachment(attachment);
        ({index} = this.locationFromPosition(startPosition));
        text = this.getTextAtIndex(index);
        return new this.constructor(this.blockList.editObjectAtIndex(index, function(block) {
          return block.copyWithText(text.updateAttributesForAttachment(attributes, attachment));
        }));
      }

      removeAttributeForAttachment(attribute, attachment) {
        var range;
        range = this.getRangeOfAttachment(attachment);
        return this.removeAttributeAtRange(attribute, range);
      }

      insertBlockBreakAtRange(range) {
        var blocks, document, offset, startPosition;
        [startPosition] = range = normalizeRange$2(range);
        ({offset} = this.locationFromPosition(startPosition));
        document = this.removeTextAtRange(range);
        if (offset === 0) {
          blocks = [new Trix$2.Block()];
        }
        return new this.constructor(document.blockList.insertSplittableListAtPosition(new Trix$2.SplittableList(blocks), startPosition));
      }

      applyBlockAttributeAtRange(attributeName, value, range) {
        var config, document;
        ({document, range} = this.expandRangeToLineBreaksAndSplitBlocks(range));
        config = getBlockConfig$2(attributeName);
        if (config.listAttribute) {
          document = document.removeLastListAttributeAtRange(range, {
            exceptAttributeName: attributeName
          });
          ({document, range} = document.convertLineBreaksToBlockBreaksInRange(range));
        } else if (config.exclusive) {
          document = document.removeBlockAttributesAtRange(range);
        } else if (config.terminal) {
          document = document.removeLastTerminalAttributeAtRange(range);
        } else {
          document = document.consolidateBlocksAtRange(range);
        }
        return document.addAttributeAtRange(attributeName, value, range);
      }

      removeLastListAttributeAtRange(range, options = {}) {
        var blockList;
        blockList = this.blockList;
        this.eachBlockAtRange(range, function(block, textRange, index) {
          var lastAttributeName;
          if (!(lastAttributeName = block.getLastAttribute())) {
            return;
          }
          if (!getBlockConfig$2(lastAttributeName).listAttribute) {
            return;
          }
          if (lastAttributeName === options.exceptAttributeName) {
            return;
          }
          return blockList = blockList.editObjectAtIndex(index, function() {
            return block.removeAttribute(lastAttributeName);
          });
        });
        return new this.constructor(blockList);
      }

      removeLastTerminalAttributeAtRange(range) {
        var blockList;
        blockList = this.blockList;
        this.eachBlockAtRange(range, function(block, textRange, index) {
          var lastAttributeName;
          if (!(lastAttributeName = block.getLastAttribute())) {
            return;
          }
          if (!getBlockConfig$2(lastAttributeName).terminal) {
            return;
          }
          return blockList = blockList.editObjectAtIndex(index, function() {
            return block.removeAttribute(lastAttributeName);
          });
        });
        return new this.constructor(blockList);
      }

      removeBlockAttributesAtRange(range) {
        var blockList;
        blockList = this.blockList;
        this.eachBlockAtRange(range, function(block, textRange, index) {
          if (block.hasAttributes()) {
            return blockList = blockList.editObjectAtIndex(index, function() {
              return block.copyWithoutAttributes();
            });
          }
        });
        return new this.constructor(blockList);
      }

      expandRangeToLineBreaksAndSplitBlocks(range) {
        var document, endBlock, endLocation, endPosition, position, startBlock, startLocation, startPosition;
        [startPosition, endPosition] = range = normalizeRange$2(range);
        startLocation = this.locationFromPosition(startPosition);
        endLocation = this.locationFromPosition(endPosition);
        document = this;
        startBlock = document.getBlockAtIndex(startLocation.index);
        if ((startLocation.offset = startBlock.findLineBreakInDirectionFromPosition("backward", startLocation.offset)) != null) {
          position = document.positionFromLocation(startLocation);
          document = document.insertBlockBreakAtRange([position, position + 1]);
          endLocation.index += 1;
          endLocation.offset -= document.getBlockAtIndex(startLocation.index).getLength();
          startLocation.index += 1;
        }
        startLocation.offset = 0;
        if (endLocation.offset === 0 && endLocation.index > startLocation.index) {
          endLocation.index -= 1;
          endLocation.offset = document.getBlockAtIndex(endLocation.index).getBlockBreakPosition();
        } else {
          endBlock = document.getBlockAtIndex(endLocation.index);
          if (endBlock.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) === "\n") {
            endLocation.offset -= 1;
          } else {
            endLocation.offset = endBlock.findLineBreakInDirectionFromPosition("forward", endLocation.offset);
          }
          if (endLocation.offset !== endBlock.getBlockBreakPosition()) {
            position = document.positionFromLocation(endLocation);
            document = document.insertBlockBreakAtRange([position, position + 1]);
          }
        }
        startPosition = document.positionFromLocation(startLocation);
        endPosition = document.positionFromLocation(endLocation);
        range = normalizeRange$2([startPosition, endPosition]);
        return {document, range};
      }

      convertLineBreaksToBlockBreaksInRange(range) {
        var document, position, string;
        [position] = range = normalizeRange$2(range);
        string = this.getStringAtRange(range).slice(0, -1);
        document = this;
        string.replace(/.*?\n/g, function(match) {
          position += match.length;
          return document = document.insertBlockBreakAtRange([position - 1, position]);
        });
        return {document, range};
      }

      consolidateBlocksAtRange(range) {
        var endIndex, endPosition, startIndex, startPosition;
        [startPosition, endPosition] = range = normalizeRange$2(range);
        startIndex = this.locationFromPosition(startPosition).index;
        endIndex = this.locationFromPosition(endPosition).index;
        return new this.constructor(this.blockList.consolidateFromIndexToIndex(startIndex, endIndex));
      }

      getDocumentAtRange(range) {
        var blocks;
        range = normalizeRange$2(range);
        blocks = this.blockList.getSplittableListInRange(range).toArray();
        return new this.constructor(blocks);
      }

      getStringAtRange(range) {
        var endIndex, endPosition, ref;
        ref = range = normalizeRange$2(range), [endPosition] = slice$1.call(ref, -1);
        if (endPosition !== this.getLength()) {
          endIndex = -1;
        }
        return this.getDocumentAtRange(range).toString().slice(0, endIndex);
      }

      getBlockAtIndex(index) {
        return this.blockList.getObjectAtIndex(index);
      }

      getBlockAtPosition(position) {
        var index;
        ({index} = this.locationFromPosition(position));
        return this.getBlockAtIndex(index);
      }

      getTextAtIndex(index) {
        var ref;
        return (ref = this.getBlockAtIndex(index)) != null ? ref.text : void 0;
      }

      getTextAtPosition(position) {
        var index;
        ({index} = this.locationFromPosition(position));
        return this.getTextAtIndex(index);
      }

      getPieceAtPosition(position) {
        var index, offset;
        ({index, offset} = this.locationFromPosition(position));
        return this.getTextAtIndex(index).getPieceAtPosition(offset);
      }

      getCharacterAtPosition(position) {
        var index, offset;
        ({index, offset} = this.locationFromPosition(position));
        return this.getTextAtIndex(index).getStringAtRange([offset, offset + 1]);
      }

      getLength() {
        return this.blockList.getEndPosition();
      }

      getBlocks() {
        return this.blockList.toArray();
      }

      getBlockCount() {
        return this.blockList.length;
      }

      getEditCount() {
        return this.editCount;
      }

      eachBlock(callback) {
        return this.blockList.eachObject(callback);
      }

      eachBlockAtRange(range, callback) {
        var block, endLocation, endPosition, i, index, ref, ref1, results, startLocation, startPosition, textRange;
        [startPosition, endPosition] = range = normalizeRange$2(range);
        startLocation = this.locationFromPosition(startPosition);
        endLocation = this.locationFromPosition(endPosition);
        if (startLocation.index === endLocation.index) {
          block = this.getBlockAtIndex(startLocation.index);
          textRange = [startLocation.offset, endLocation.offset];
          return callback(block, textRange, startLocation.index);
        } else {
          results = [];
          for (index = i = ref = startLocation.index, ref1 = endLocation.index; (ref <= ref1 ? i <= ref1 : i >= ref1); index = ref <= ref1 ? ++i : --i) {
            if (block = this.getBlockAtIndex(index)) {
              textRange = (function() {
                switch (index) {
                  case startLocation.index:
                    return [startLocation.offset, block.text.getLength()];
                  case endLocation.index:
                    return [0, endLocation.offset];
                  default:
                    return [0, block.text.getLength()];
                }
              })();
              results.push(callback(block, textRange, index));
            } else {
              results.push(void 0);
            }
          }
          return results;
        }
      }

      getCommonAttributesAtRange(range) {
        var blockAttributes, startPosition, textAttributes;
        [startPosition] = range = normalizeRange$2(range);
        if (rangeIsCollapsed$3(range)) {
          return this.getCommonAttributesAtPosition(startPosition);
        } else {
          textAttributes = [];
          blockAttributes = [];
          this.eachBlockAtRange(range, function(block, textRange) {
            if (textRange[0] !== textRange[1]) {
              textAttributes.push(block.text.getCommonAttributesAtRange(textRange));
              return blockAttributes.push(attributesForBlock(block));
            }
          });
          return Trix$2.Hash.fromCommonAttributesOfObjects(textAttributes).merge(Trix$2.Hash.fromCommonAttributesOfObjects(blockAttributes)).toObject();
        }
      }

      getCommonAttributesAtPosition(position) {
        var attributes, attributesLeft, block, commonAttributes, index, inheritableAttributes, key, offset, value;
        ({index, offset} = this.locationFromPosition(position));
        block = this.getBlockAtIndex(index);
        if (!block) {
          return {};
        }
        commonAttributes = attributesForBlock(block);
        attributes = block.text.getAttributesAtPosition(offset);
        attributesLeft = block.text.getAttributesAtPosition(offset - 1);
        inheritableAttributes = (function() {
          var ref, results;
          ref = Trix$2.config.textAttributes;
          results = [];
          for (key in ref) {
            value = ref[key];
            if (value.inheritable) {
              results.push(key);
            }
          }
          return results;
        })();
        for (key in attributesLeft) {
          value = attributesLeft[key];
          if (value === attributes[key] || indexOf$1.call(inheritableAttributes, key) >= 0) {
            commonAttributes[key] = value;
          }
        }
        return commonAttributes;
      }

      getRangeOfCommonAttributeAtPosition(attributeName, position) {
        var end, endOffset, index, offset, start, startOffset, text;
        ({index, offset} = this.locationFromPosition(position));
        text = this.getTextAtIndex(index);
        [startOffset, endOffset] = text.getExpandedRangeForAttributeAtOffset(attributeName, offset);
        start = this.positionFromLocation({
          index,
          offset: startOffset
        });
        end = this.positionFromLocation({
          index,
          offset: endOffset
        });
        return normalizeRange$2([start, end]);
      }

      getBaseBlockAttributes() {
        var baseBlockAttributes, blockAttributes, blockIndex, i, index, lastAttributeIndex, ref;
        baseBlockAttributes = this.getBlockAtIndex(0).getAttributes();
        for (blockIndex = i = 1, ref = this.getBlockCount(); (1 <= ref ? i < ref : i > ref); blockIndex = 1 <= ref ? ++i : --i) {
          blockAttributes = this.getBlockAtIndex(blockIndex).getAttributes();
          lastAttributeIndex = Math.min(baseBlockAttributes.length, blockAttributes.length);
          baseBlockAttributes = (function() {
            var j, ref1, results;
            results = [];
            for (index = j = 0, ref1 = lastAttributeIndex; (0 <= ref1 ? j < ref1 : j > ref1); index = 0 <= ref1 ? ++j : --j) {
              if (blockAttributes[index] !== baseBlockAttributes[index]) {
                break;
              }
              results.push(blockAttributes[index]);
            }
            return results;
          })();
        }
        return baseBlockAttributes;
      }

      getAttachmentById(attachmentId) {
        var attachment, i, len, ref;
        ref = this.getAttachments();
        for (i = 0, len = ref.length; i < len; i++) {
          attachment = ref[i];
          if (attachment.id === attachmentId) {
            return attachment;
          }
        }
      }

      getAttachmentPieces() {
        var attachmentPieces;
        attachmentPieces = [];
        this.blockList.eachObject(function({text}) {
          return attachmentPieces = attachmentPieces.concat(text.getAttachmentPieces());
        });
        return attachmentPieces;
      }

      getAttachments() {
        var i, len, piece, ref, results;
        ref = this.getAttachmentPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          results.push(piece.attachment);
        }
        return results;
      }

      getRangeOfAttachment(attachment) {
        var i, index, len, position, ref, text, textRange;
        position = 0;
        ref = this.blockList.toArray();
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          ({text} = ref[index]);
          if (textRange = text.getRangeOfAttachment(attachment)) {
            return normalizeRange$2([position + textRange[0], position + textRange[1]]);
          }
          position += text.getLength();
        }
      }

      getLocationRangeOfAttachment(attachment) {
        var range;
        range = this.getRangeOfAttachment(attachment);
        return this.locationRangeFromRange(range);
      }

      getAttachmentPieceForAttachment(attachment) {
        var i, len, piece, ref;
        ref = this.getAttachmentPieces();
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          if (piece.attachment === attachment) {
            return piece;
          }
        }
      }

      findRangesForBlockAttribute(attributeName) {
        var block, i, len, length, position, ranges, ref;
        position = 0;
        ranges = [];
        ref = this.getBlocks();
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          length = block.getLength();
          if (block.hasAttribute(attributeName)) {
            ranges.push([position, position + length]);
          }
          position += length;
        }
        return ranges;
      }

      findRangesForTextAttribute(attributeName, {withValue} = {}) {
        var i, len, length, match, piece, position, range, ranges, ref;
        position = 0;
        range = [];
        ranges = [];
        match = function(piece) {
          if (withValue != null) {
            return piece.getAttribute(attributeName) === withValue;
          } else {
            return piece.hasAttribute(attributeName);
          }
        };
        ref = this.getPieces();
        for (i = 0, len = ref.length; i < len; i++) {
          piece = ref[i];
          length = piece.getLength();
          if (match(piece)) {
            if (range[1] === position) {
              range[1] = position + length;
            } else {
              ranges.push(range = [position, position + length]);
            }
          }
          position += length;
        }
        return ranges;
      }

      locationFromPosition(position) {
        var blocks, location;
        location = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, position));
        if (location.index != null) {
          return location;
        } else {
          blocks = this.getBlocks();
          return {
            index: blocks.length - 1,
            offset: blocks[blocks.length - 1].getLength()
          };
        }
      }

      positionFromLocation(location) {
        return this.blockList.findPositionAtIndexAndOffset(location.index, location.offset);
      }

      locationRangeFromPosition(position) {
        return normalizeRange$2(this.locationFromPosition(position));
      }

      locationRangeFromRange(range) {
        var endLocation, endPosition, startLocation, startPosition;
        if (!(range = normalizeRange$2(range))) {
          return;
        }
        [startPosition, endPosition] = range;
        startLocation = this.locationFromPosition(startPosition);
        endLocation = this.locationFromPosition(endPosition);
        return normalizeRange$2([startLocation, endLocation]);
      }

      rangeFromLocationRange(locationRange) {
        var leftPosition, rightPosition;
        locationRange = normalizeRange$2(locationRange);
        leftPosition = this.positionFromLocation(locationRange[0]);
        if (!rangeIsCollapsed$3(locationRange)) {
          rightPosition = this.positionFromLocation(locationRange[1]);
        }
        return normalizeRange$2([leftPosition, rightPosition]);
      }

      isEqualTo(document) {
        return this.blockList.isEqualTo(document != null ? document.blockList : void 0);
      }

      getTexts() {
        var block, i, len, ref, results;
        ref = this.getBlocks();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          results.push(block.text);
        }
        return results;
      }

      getPieces() {
        var i, len, pieces, ref, text;
        pieces = [];
        ref = this.getTexts();
        for (i = 0, len = ref.length; i < len; i++) {
          text = ref[i];
          pieces.push(...text.getPieces());
        }
        return pieces;
      }

      getObjects() {
        return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
      }

      toSerializableDocument() {
        var blocks;
        blocks = [];
        this.blockList.eachObject(function(block) {
          return blocks.push(block.copyWithText(block.text.toSerializableText()));
        });
        return new this.constructor(blocks);
      }

      toString() {
        return this.blockList.toString();
      }

      toJSON() {
        return this.blockList.toJSON();
      }

      toConsole() {
        var block;
        return JSON.stringify((function() {
          var i, len, ref, results;
          ref = this.blockList.toArray();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            block = ref[i];
            results.push(JSON.parse(block.text.toConsole()));
          }
          return results;
        }).call(this));
      }

    };

    attributesForBlock = function(block) {
      var attributeName, attributes;
      attributes = {};
      if (attributeName = block.getLastAttribute()) {
        attributes[attributeName] = true;
      }
      return attributes;
    };

    return Document;

  }).call(window);

  Trix$2.LineBreakInsertion = class LineBreakInsertion {
    constructor(composition) {
      this.composition = composition;
      ({document: this.document} = this.composition);
      [this.startPosition, this.endPosition] = this.composition.getSelectedRange();
      this.startLocation = this.document.locationFromPosition(this.startPosition);
      this.endLocation = this.document.locationFromPosition(this.endPosition);
      this.block = this.document.getBlockAtIndex(this.endLocation.index);
      this.breaksOnReturn = this.block.breaksOnReturn();
      this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1);
      this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset);
    }

    shouldInsertBlockBreak() {
      if (this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty()) {
        return this.startLocation.offset !== 0;
      } else {
        return this.breaksOnReturn && this.nextCharacter !== "\n";
      }
    }

    shouldBreakFormattedBlock() {
      return this.block.hasAttributes() && !this.block.isListItem() && ((this.breaksOnReturn && this.nextCharacter === "\n") || this.previousCharacter === "\n");
    }

    shouldDecreaseListLevel() {
      return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty();
    }

    shouldPrependListItem() {
      return this.block.isListItem() && this.startLocation.offset === 0 && !this.block.isEmpty();
    }

    shouldRemoveLastBlockAttribute() {
      return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty();
    }

  };

  var arrayStartsWith, extend, getAllAttributeNames, getBlockConfig$1, getTextConfig, normalizeRange$1, objectsAreEqual$1, rangeIsCollapsed$2, rangesAreEqual$2, summarizeArrayChange;

  ({normalizeRange: normalizeRange$1, rangesAreEqual: rangesAreEqual$2, rangeIsCollapsed: rangeIsCollapsed$2, objectsAreEqual: objectsAreEqual$1, arrayStartsWith, summarizeArrayChange, getAllAttributeNames, getBlockConfig: getBlockConfig$1, getTextConfig, extend} = Trix$2);

  Trix$2.Composition = (function() {
    var placeholder;

    class Composition extends Trix$2.BasicObject {
      constructor() {
        super(...arguments);
        this.document = new Trix$2.Document();
        this.attachments = [];
        this.currentAttributes = {};
        this.revision = 0;
      }

      setDocument(document) {
        var ref;
        if (!document.isEqualTo(this.document)) {
          this.document = document;
          this.refreshAttachments();
          this.revision++;
          return (ref = this.delegate) != null ? typeof ref.compositionDidChangeDocument === "function" ? ref.compositionDidChangeDocument(document) : void 0 : void 0;
        }
      }

      // Snapshots
      getSnapshot() {
        return {
          document: this.document,
          selectedRange: this.getSelectedRange()
        };
      }

      loadSnapshot({document, selectedRange}) {
        var ref, ref1;
        if ((ref = this.delegate) != null) {
          if (typeof ref.compositionWillLoadSnapshot === "function") {
            ref.compositionWillLoadSnapshot();
          }
        }
        this.setDocument(document != null ? document : new Trix$2.Document());
        this.setSelection(selectedRange != null ? selectedRange : [0, 0]);
        return (ref1 = this.delegate) != null ? typeof ref1.compositionDidLoadSnapshot === "function" ? ref1.compositionDidLoadSnapshot() : void 0 : void 0;
      }

      // Responder protocol
      insertText(text, {updatePosition} = {
          updatePosition: true
        }) {
        var endPosition, selectedRange, startPosition;
        selectedRange = this.getSelectedRange();
        this.setDocument(this.document.insertTextAtRange(text, selectedRange));
        startPosition = selectedRange[0];
        endPosition = startPosition + text.getLength();
        if (updatePosition) {
          this.setSelection(endPosition);
        }
        return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
      }

      insertBlock(block = new Trix$2.Block()) {
        var document;
        document = new Trix$2.Document([block]);
        return this.insertDocument(document);
      }

      insertDocument(document = new Trix$2.Document()) {
        var endPosition, selectedRange, startPosition;
        selectedRange = this.getSelectedRange();
        this.setDocument(this.document.insertDocumentAtRange(document, selectedRange));
        startPosition = selectedRange[0];
        endPosition = startPosition + document.getLength();
        this.setSelection(endPosition);
        return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
      }

      insertString(string, options) {
        var attributes, text;
        attributes = this.getCurrentTextAttributes();
        text = Trix$2.Text.textForStringWithAttributes(string, attributes);
        return this.insertText(text, options);
      }

      insertBlockBreak() {
        var endPosition, selectedRange, startPosition;
        selectedRange = this.getSelectedRange();
        this.setDocument(this.document.insertBlockBreakAtRange(selectedRange));
        startPosition = selectedRange[0];
        endPosition = startPosition + 1;
        this.setSelection(endPosition);
        return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
      }

      insertLineBreak() {
        var document, insertion;
        insertion = new Trix$2.LineBreakInsertion(this);
        if (insertion.shouldDecreaseListLevel()) {
          this.decreaseListLevel();
          return this.setSelection(insertion.startPosition);
        } else if (insertion.shouldPrependListItem()) {
          document = new Trix$2.Document([insertion.block.copyWithoutText()]);
          return this.insertDocument(document);
        } else if (insertion.shouldInsertBlockBreak()) {
          return this.insertBlockBreak();
        } else if (insertion.shouldRemoveLastBlockAttribute()) {
          return this.removeLastBlockAttribute();
        } else if (insertion.shouldBreakFormattedBlock()) {
          return this.breakFormattedBlock(insertion);
        } else {
          return this.insertString("\n");
        }
      }

      insertHTML(html) {
        var document, endPosition, selectedRange, startPosition;
        document = Trix$2.Document.fromHTML(html);
        selectedRange = this.getSelectedRange();
        this.setDocument(this.document.mergeDocumentAtRange(document, selectedRange));
        startPosition = selectedRange[0];
        endPosition = startPosition + document.getLength() - 1;
        this.setSelection(endPosition);
        return this.notifyDelegateOfInsertionAtRange([startPosition, endPosition]);
      }

      replaceHTML(html) {
        var document, locationRange, selectedRange;
        document = Trix$2.Document.fromHTML(html).copyUsingObjectsFromDocument(this.document);
        locationRange = this.getLocationRange({
          strict: false
        });
        selectedRange = this.document.rangeFromLocationRange(locationRange);
        this.setDocument(document);
        return this.setSelection(selectedRange);
      }

      insertFile(file) {
        return this.insertFiles([file]);
      }

      insertFiles(files) {
        var attachment, attachments, file, i, len, ref;
        attachments = [];
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          if (!((ref = this.delegate) != null ? ref.compositionShouldAcceptFile(file) : void 0)) {
            continue;
          }
          attachment = Trix$2.Attachment.attachmentForFile(file);
          attachments.push(attachment);
        }
        return this.insertAttachments(attachments);
      }

      insertAttachment(attachment) {
        return this.insertAttachments([attachment]);
      }

      insertAttachments(attachments) {
        var attachment, attachmentText, attributes, i, len, presentation, ref, text, type;
        text = new Trix$2.Text();
        for (i = 0, len = attachments.length; i < len; i++) {
          attachment = attachments[i];
          type = attachment.getType();
          presentation = (ref = Trix$2.config.attachments[type]) != null ? ref.presentation : void 0;
          attributes = this.getCurrentTextAttributes();
          if (presentation) {
            attributes.presentation = presentation;
          }
          attachmentText = Trix$2.Text.textForAttachmentWithAttributes(attachment, attributes);
          text = text.appendText(attachmentText);
        }
        return this.insertText(text);
      }

      shouldManageDeletingInDirection(direction) {
        var locationRange;
        locationRange = this.getLocationRange();
        if (rangeIsCollapsed$2(locationRange)) {
          if (direction === "backward" && locationRange[0].offset === 0) {
            return true;
          }
          if (this.shouldManageMovingCursorInDirection(direction)) {
            return true;
          }
        } else {
          if (locationRange[0].index !== locationRange[1].index) {
            return true;
          }
        }
        return false;
      }

      deleteInDirection(direction, {length} = {}) {
        var attachment, block, deletingIntoPreviousBlock, locationRange, range, selectionIsCollapsed, selectionSpansBlocks;
        locationRange = this.getLocationRange();
        range = this.getSelectedRange();
        selectionIsCollapsed = rangeIsCollapsed$2(range);
        if (selectionIsCollapsed) {
          deletingIntoPreviousBlock = direction === "backward" && locationRange[0].offset === 0;
        } else {
          selectionSpansBlocks = locationRange[0].index !== locationRange[1].index;
        }
        if (deletingIntoPreviousBlock) {
          if (this.canDecreaseBlockAttributeLevel()) {
            block = this.getBlock();
            if (block.isListItem()) {
              this.decreaseListLevel();
            } else {
              this.decreaseBlockAttributeLevel();
            }
            this.setSelection(range[0]);
            if (block.isEmpty()) {
              return false;
            }
          }
        }
        if (selectionIsCollapsed) {
          range = this.getExpandedRangeInDirection(direction, {length});
          if (direction === "backward") {
            attachment = this.getAttachmentAtRange(range);
          }
        }
        if (attachment) {
          this.editAttachment(attachment);
          return false;
        } else {
          this.setDocument(this.document.removeTextAtRange(range));
          this.setSelection(range[0]);
          if (deletingIntoPreviousBlock || selectionSpansBlocks) {
            return false;
          }
        }
      }

      moveTextFromRange(range) {
        var position;
        [position] = this.getSelectedRange();
        this.setDocument(this.document.moveTextFromRangeToPosition(range, position));
        return this.setSelection(position);
      }

      removeAttachment(attachment) {
        var range;
        if (range = this.document.getRangeOfAttachment(attachment)) {
          this.stopEditingAttachment();
          this.setDocument(this.document.removeTextAtRange(range));
          return this.setSelection(range[0]);
        }
      }

      removeLastBlockAttribute() {
        var block, endPosition, startPosition;
        [startPosition, endPosition] = this.getSelectedRange();
        block = this.document.getBlockAtPosition(endPosition);
        this.removeCurrentAttribute(block.getLastAttribute());
        return this.setSelection(startPosition);
      }

      insertPlaceholder() {
        this.placeholderPosition = this.getPosition();
        return this.insertString(placeholder);
      }

      selectPlaceholder() {
        if (this.placeholderPosition != null) {
          this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + placeholder.length]);
          return this.getSelectedRange();
        }
      }

      forgetPlaceholder() {
        return this.placeholderPosition = null;
      }

      // Current attributes
      hasCurrentAttribute(attributeName) {
        var value;
        value = this.currentAttributes[attributeName];
        return (value != null) && value !== false;
      }

      toggleCurrentAttribute(attributeName) {
        var value;
        if (value = !this.currentAttributes[attributeName]) {
          return this.setCurrentAttribute(attributeName, value);
        } else {
          return this.removeCurrentAttribute(attributeName);
        }
      }

      canSetCurrentAttribute(attributeName) {
        if (getBlockConfig$1(attributeName)) {
          return this.canSetCurrentBlockAttribute(attributeName);
        } else {
          return this.canSetCurrentTextAttribute(attributeName);
        }
      }

      canSetCurrentTextAttribute(attributeName) {
        var attachment, document, i, len, ref;
        if (!(document = this.getSelectedDocument())) {
          return;
        }
        ref = document.getAttachments();
        for (i = 0, len = ref.length; i < len; i++) {
          attachment = ref[i];
          if (!attachment.hasContent()) {
            return false;
          }
        }
        return true;
      }

      canSetCurrentBlockAttribute(attributeName) {
        var block;
        if (!(block = this.getBlock())) {
          return;
        }
        return !block.isTerminalBlock();
      }

      setCurrentAttribute(attributeName, value) {
        if (getBlockConfig$1(attributeName)) {
          return this.setBlockAttribute(attributeName, value);
        } else {
          this.setTextAttribute(attributeName, value);
          this.currentAttributes[attributeName] = value;
          return this.notifyDelegateOfCurrentAttributesChange();
        }
      }

      setTextAttribute(attributeName, value) {
        var endPosition, selectedRange, startPosition, text;
        if (!(selectedRange = this.getSelectedRange())) {
          return;
        }
        [startPosition, endPosition] = selectedRange;
        if (startPosition === endPosition) {
          if (attributeName === "href") {
            text = Trix$2.Text.textForStringWithAttributes(value, {
              href: value
            });
            return this.insertText(text);
          }
        } else {
          return this.setDocument(this.document.addAttributeAtRange(attributeName, value, selectedRange));
        }
      }

      setBlockAttribute(attributeName, value) {
        var block, selectedRange;
        if (!(selectedRange = this.getSelectedRange())) {
          return;
        }
        if (this.canSetCurrentAttribute(attributeName)) {
          block = this.getBlock();
          this.setDocument(this.document.applyBlockAttributeAtRange(attributeName, value, selectedRange));
          return this.setSelection(selectedRange);
        }
      }

      removeCurrentAttribute(attributeName) {
        if (getBlockConfig$1(attributeName)) {
          this.removeBlockAttribute(attributeName);
          return this.updateCurrentAttributes();
        } else {
          this.removeTextAttribute(attributeName);
          delete this.currentAttributes[attributeName];
          return this.notifyDelegateOfCurrentAttributesChange();
        }
      }

      removeTextAttribute(attributeName) {
        var selectedRange;
        if (!(selectedRange = this.getSelectedRange())) {
          return;
        }
        return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange));
      }

      removeBlockAttribute(attributeName) {
        var selectedRange;
        if (!(selectedRange = this.getSelectedRange())) {
          return;
        }
        return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange));
      }

      canDecreaseNestingLevel() {
        var ref;
        return ((ref = this.getBlock()) != null ? ref.getNestingLevel() : void 0) > 0;
      }

      canIncreaseNestingLevel() {
        var block, previousBlock, ref;
        if (!(block = this.getBlock())) {
          return;
        }
        if ((ref = getBlockConfig$1(block.getLastNestableAttribute())) != null ? ref.listAttribute : void 0) {
          if (previousBlock = this.getPreviousBlock()) {
            return arrayStartsWith(previousBlock.getListItemAttributes(), block.getListItemAttributes());
          }
        } else {
          return block.getNestingLevel() > 0;
        }
      }

      decreaseNestingLevel() {
        var block;
        if (!(block = this.getBlock())) {
          return;
        }
        return this.setDocument(this.document.replaceBlock(block, block.decreaseNestingLevel()));
      }

      increaseNestingLevel() {
        var block;
        if (!(block = this.getBlock())) {
          return;
        }
        return this.setDocument(this.document.replaceBlock(block, block.increaseNestingLevel()));
      }

      canDecreaseBlockAttributeLevel() {
        var ref;
        return ((ref = this.getBlock()) != null ? ref.getAttributeLevel() : void 0) > 0;
      }

      decreaseBlockAttributeLevel() {
        var attribute, ref;
        if (attribute = (ref = this.getBlock()) != null ? ref.getLastAttribute() : void 0) {
          return this.removeCurrentAttribute(attribute);
        }
      }

      decreaseListLevel() {
        var attributeLevel, block, endIndex, endPosition, index, startPosition;
        [startPosition] = this.getSelectedRange();
        ({index} = this.document.locationFromPosition(startPosition));
        endIndex = index;
        attributeLevel = this.getBlock().getAttributeLevel();
        while (block = this.document.getBlockAtIndex(endIndex + 1)) {
          if (!(block.isListItem() && block.getAttributeLevel() > attributeLevel)) {
            break;
          }
          endIndex++;
        }
        startPosition = this.document.positionFromLocation({
          index: index,
          offset: 0
        });
        endPosition = this.document.positionFromLocation({
          index: endIndex,
          offset: 0
        });
        return this.setDocument(this.document.removeLastListAttributeAtRange([startPosition, endPosition]));
      }

      updateCurrentAttributes() {
        var attributeName, currentAttributes, i, len, ref, selectedRange;
        if (selectedRange = this.getSelectedRange({
          ignoreLock: true
        })) {
          currentAttributes = this.document.getCommonAttributesAtRange(selectedRange);
          ref = getAllAttributeNames();
          for (i = 0, len = ref.length; i < len; i++) {
            attributeName = ref[i];
            if (!currentAttributes[attributeName]) {
              if (!this.canSetCurrentAttribute(attributeName)) {
                currentAttributes[attributeName] = false;
              }
            }
          }
          if (!objectsAreEqual$1(currentAttributes, this.currentAttributes)) {
            this.currentAttributes = currentAttributes;
            return this.notifyDelegateOfCurrentAttributesChange();
          }
        }
      }

      getCurrentAttributes() {
        return extend.call({}, this.currentAttributes);
      }

      getCurrentTextAttributes() {
        var attributes, key, ref, value;
        attributes = {};
        ref = this.currentAttributes;
        for (key in ref) {
          value = ref[key];
          if (value !== false) {
            if (getTextConfig(key)) {
              attributes[key] = value;
            }
          }
        }
        return attributes;
      }

      // Selection freezing
      freezeSelection() {
        return this.setCurrentAttribute("frozen", true);
      }

      thawSelection() {
        return this.removeCurrentAttribute("frozen");
      }

      hasFrozenSelection() {
        return this.hasCurrentAttribute("frozen");
      }

      setSelection(selectedRange) {
        var locationRange, ref;
        locationRange = this.document.locationRangeFromRange(selectedRange);
        return (ref = this.delegate) != null ? ref.compositionDidRequestChangingSelectionToLocationRange(locationRange) : void 0;
      }

      getSelectedRange() {
        var locationRange;
        if (locationRange = this.getLocationRange()) {
          return this.document.rangeFromLocationRange(locationRange);
        }
      }

      setSelectedRange(selectedRange) {
        var locationRange;
        locationRange = this.document.locationRangeFromRange(selectedRange);
        return this.getSelectionManager().setLocationRange(locationRange);
      }

      getPosition() {
        var locationRange;
        if (locationRange = this.getLocationRange()) {
          return this.document.positionFromLocation(locationRange[0]);
        }
      }

      getLocationRange(options) {
        var ref, ref1;
        return (ref = (ref1 = this.targetLocationRange) != null ? ref1 : this.getSelectionManager().getLocationRange(options)) != null ? ref : normalizeRange$1({
          index: 0,
          offset: 0
        });
      }

      withTargetLocationRange(locationRange, fn) {
        var result;
        this.targetLocationRange = locationRange;
        try {
          result = fn();
        } finally {
          this.targetLocationRange = null;
        }
        return result;
      }

      withTargetRange(range, fn) {
        var locationRange;
        locationRange = this.document.locationRangeFromRange(range);
        return this.withTargetLocationRange(locationRange, fn);
      }

      withTargetDOMRange(domRange, fn) {
        var locationRange;
        locationRange = this.createLocationRangeFromDOMRange(domRange, {
          strict: false
        });
        return this.withTargetLocationRange(locationRange, fn);
      }

      getExpandedRangeInDirection(direction, {length} = {}) {
        var endPosition, startPosition;
        [startPosition, endPosition] = this.getSelectedRange();
        if (direction === "backward") {
          if (length) {
            startPosition -= length;
          } else {
            startPosition = this.translateUTF16PositionFromOffset(startPosition, -1);
          }
        } else {
          if (length) {
            endPosition += length;
          } else {
            endPosition = this.translateUTF16PositionFromOffset(endPosition, 1);
          }
        }
        return normalizeRange$1([startPosition, endPosition]);
      }

      shouldManageMovingCursorInDirection(direction) {
        var range;
        if (this.editingAttachment) {
          return true;
        }
        range = this.getExpandedRangeInDirection(direction);
        return this.getAttachmentAtRange(range) != null;
      }

      moveCursorInDirection(direction) {
        var attachment, canEditAttachment, range, selectedRange;
        if (this.editingAttachment) {
          range = this.document.getRangeOfAttachment(this.editingAttachment);
        } else {
          selectedRange = this.getSelectedRange();
          range = this.getExpandedRangeInDirection(direction);
          canEditAttachment = !rangesAreEqual$2(selectedRange, range);
        }
        if (direction === "backward") {
          this.setSelectedRange(range[0]);
        } else {
          this.setSelectedRange(range[1]);
        }
        if (canEditAttachment) {
          if (attachment = this.getAttachmentAtRange(range)) {
            return this.editAttachment(attachment);
          }
        }
      }

      expandSelectionInDirection(direction, {length} = {}) {
        var range;
        range = this.getExpandedRangeInDirection(direction, {length});
        return this.setSelectedRange(range);
      }

      expandSelectionForEditing() {
        if (this.hasCurrentAttribute("href")) {
          return this.expandSelectionAroundCommonAttribute("href");
        }
      }

      expandSelectionAroundCommonAttribute(attributeName) {
        var position, range;
        position = this.getPosition();
        range = this.document.getRangeOfCommonAttributeAtPosition(attributeName, position);
        return this.setSelectedRange(range);
      }

      selectionContainsAttachments() {
        var ref;
        return ((ref = this.getSelectedAttachments()) != null ? ref.length : void 0) > 0;
      }

      selectionIsInCursorTarget() {
        return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
      }

      positionIsCursorTarget(position) {
        var location;
        if (location = this.document.locationFromPosition(position)) {
          return this.locationIsCursorTarget(location);
        }
      }

      positionIsBlockBreak(position) {
        var ref;
        return (ref = this.document.getPieceAtPosition(position)) != null ? ref.isBlockBreak() : void 0;
      }

      getSelectedDocument() {
        var selectedRange;
        if (selectedRange = this.getSelectedRange()) {
          return this.document.getDocumentAtRange(selectedRange);
        }
      }

      getSelectedAttachments() {
        var ref;
        return (ref = this.getSelectedDocument()) != null ? ref.getAttachments() : void 0;
      }

      // Attachments
      getAttachments() {
        return this.attachments.slice(0);
      }

      refreshAttachments() {
        var added, attachment, attachments, i, j, len, len1, ref, ref1, removed, results;
        attachments = this.document.getAttachments();
        ({added, removed} = summarizeArrayChange(this.attachments, attachments));
        this.attachments = attachments;
        for (i = 0, len = removed.length; i < len; i++) {
          attachment = removed[i];
          attachment.delegate = null;
          if ((ref = this.delegate) != null) {
            if (typeof ref.compositionDidRemoveAttachment === "function") {
              ref.compositionDidRemoveAttachment(attachment);
            }
          }
        }
        results = [];
        for (j = 0, len1 = added.length; j < len1; j++) {
          attachment = added[j];
          attachment.delegate = this;
          results.push((ref1 = this.delegate) != null ? typeof ref1.compositionDidAddAttachment === "function" ? ref1.compositionDidAddAttachment(attachment) : void 0 : void 0);
        }
        return results;
      }

      // Attachment delegate
      attachmentDidChangeAttributes(attachment) {
        var ref;
        this.revision++;
        return (ref = this.delegate) != null ? typeof ref.compositionDidEditAttachment === "function" ? ref.compositionDidEditAttachment(attachment) : void 0 : void 0;
      }

      attachmentDidChangePreviewURL(attachment) {
        var ref;
        this.revision++;
        return (ref = this.delegate) != null ? typeof ref.compositionDidChangeAttachmentPreviewURL === "function" ? ref.compositionDidChangeAttachmentPreviewURL(attachment) : void 0 : void 0;
      }

      // Attachment editing
      editAttachment(attachment, options) {
        var ref;
        if (attachment === this.editingAttachment) {
          return;
        }
        this.stopEditingAttachment();
        this.editingAttachment = attachment;
        return (ref = this.delegate) != null ? typeof ref.compositionDidStartEditingAttachment === "function" ? ref.compositionDidStartEditingAttachment(this.editingAttachment, options) : void 0 : void 0;
      }

      stopEditingAttachment() {
        var ref;
        if (!this.editingAttachment) {
          return;
        }
        if ((ref = this.delegate) != null) {
          if (typeof ref.compositionDidStopEditingAttachment === "function") {
            ref.compositionDidStopEditingAttachment(this.editingAttachment);
          }
        }
        return this.editingAttachment = null;
      }

      updateAttributesForAttachment(attributes, attachment) {
        return this.setDocument(this.document.updateAttributesForAttachment(attributes, attachment));
      }

      removeAttributeForAttachment(attribute, attachment) {
        return this.setDocument(this.document.removeAttributeForAttachment(attribute, attachment));
      }

      // Private
      breakFormattedBlock(insertion) {
        var block, document, newDocument, position, range;
        ({document, block} = insertion);
        position = insertion.startPosition;
        range = [position - 1, position];
        if (block.getBlockBreakPosition() === insertion.startLocation.offset) {
          if (block.breaksOnReturn() && insertion.nextCharacter === "\n") {
            position += 1;
          } else {
            document = document.removeTextAtRange(range);
          }
          range = [position, position];
        } else if (insertion.nextCharacter === "\n") {
          if (insertion.previousCharacter === "\n") {
            range = [position - 1, position + 1];
          } else {
            range = [position, position + 1];
            position += 1;
          }
        } else if (insertion.startLocation.offset - 1 !== 0) {
          position += 1;
        }
        newDocument = new Trix$2.Document([block.removeLastAttribute().copyWithoutText()]);
        this.setDocument(document.insertDocumentAtRange(newDocument, range));
        return this.setSelection(position);
      }

      getPreviousBlock() {
        var index, locationRange;
        if (locationRange = this.getLocationRange()) {
          ({index} = locationRange[0]);
          if (index > 0) {
            return this.document.getBlockAtIndex(index - 1);
          }
        }
      }

      getBlock() {
        var locationRange;
        if (locationRange = this.getLocationRange()) {
          return this.document.getBlockAtIndex(locationRange[0].index);
        }
      }

      getAttachmentAtRange(range) {
        var document;
        document = this.document.getDocumentAtRange(range);
        if (document.toString() === `${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`) {
          return document.getAttachments()[0];
        }
      }

      notifyDelegateOfCurrentAttributesChange() {
        var ref;
        return (ref = this.delegate) != null ? typeof ref.compositionDidChangeCurrentAttributes === "function" ? ref.compositionDidChangeCurrentAttributes(this.currentAttributes) : void 0 : void 0;
      }

      notifyDelegateOfInsertionAtRange(range) {
        var ref;
        return (ref = this.delegate) != null ? typeof ref.compositionDidPerformInsertionAtRange === "function" ? ref.compositionDidPerformInsertionAtRange(range) : void 0 : void 0;
      }

      translateUTF16PositionFromOffset(position, offset) {
        var utf16position, utf16string;
        utf16string = this.document.toUTF16String();
        utf16position = utf16string.offsetFromUCS2Offset(position);
        return utf16string.offsetToUCS2Offset(utf16position + offset);
      }

    };

    placeholder = " ";

    // Selection
    Composition.proxyMethod("getSelectionManager().getPointRange");

    Composition.proxyMethod("getSelectionManager().setLocationRangeFromPointRange");

    Composition.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange");

    Composition.proxyMethod("getSelectionManager().locationIsCursorTarget");

    Composition.proxyMethod("getSelectionManager().selectionIsExpanded");

    Composition.proxyMethod("delegate?.getSelectionManager");

    return Composition;

  }).call(window);

  Trix$2.UndoManager = (function() {
    var entryHasDescriptionAndContext;

    class UndoManager extends Trix$2.BasicObject {
      constructor(composition) {
        super(...arguments);
        this.composition = composition;
        this.undoEntries = [];
        this.redoEntries = [];
      }

      recordUndoEntry(description, {context, consolidatable} = {}) {
        var previousEntry, undoEntry;
        previousEntry = this.undoEntries.slice(-1)[0];
        if (!(consolidatable && entryHasDescriptionAndContext(previousEntry, description, context))) {
          undoEntry = this.createEntry({description, context});
          this.undoEntries.push(undoEntry);
          return this.redoEntries = [];
        }
      }

      undo() {
        var redoEntry, undoEntry;
        if (undoEntry = this.undoEntries.pop()) {
          redoEntry = this.createEntry(undoEntry);
          this.redoEntries.push(redoEntry);
          return this.composition.loadSnapshot(undoEntry.snapshot);
        }
      }

      redo() {
        var redoEntry, undoEntry;
        if (redoEntry = this.redoEntries.pop()) {
          undoEntry = this.createEntry(redoEntry);
          this.undoEntries.push(undoEntry);
          return this.composition.loadSnapshot(redoEntry.snapshot);
        }
      }

      canUndo() {
        return this.undoEntries.length > 0;
      }

      canRedo() {
        return this.redoEntries.length > 0;
      }

      // Private
      createEntry({description, context} = {}) {
        return {
          description: description != null ? description.toString() : void 0,
          context: JSON.stringify(context),
          snapshot: this.composition.getSnapshot()
        };
      }

    };

    entryHasDescriptionAndContext = function(entry, description, context) {
      return (entry != null ? entry.description : void 0) === (description != null ? description.toString() : void 0) && (entry != null ? entry.context : void 0) === JSON.stringify(context);
    };

    return UndoManager;

  }).call(window);

  var Filter;

  Trix$2.attachmentGalleryFilter = function(snapshot) {
    var filter;
    filter = new Filter(snapshot);
    filter.perform();
    return filter.getSnapshot();
  };

  Filter = (function() {
    var BLOCK_ATTRIBUTE_NAME, TEXT_ATTRIBUTE_NAME, TEXT_ATTRIBUTE_VALUE;

    class Filter {
      constructor(snapshot) {
        ({document: this.document, selectedRange: this.selectedRange} = snapshot);
      }

      perform() {
        this.removeBlockAttribute();
        return this.applyBlockAttribute();
      }

      getSnapshot() {
        return {document: this.document, selectedRange: this.selectedRange};
      }

      // Private
      removeBlockAttribute() {
        var i, len, range, ref, results;
        ref = this.findRangesOfBlocks();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          range = ref[i];
          results.push(this.document = this.document.removeAttributeAtRange(BLOCK_ATTRIBUTE_NAME, range));
        }
        return results;
      }

      applyBlockAttribute() {
        var i, len, offset, range, ref, results;
        offset = 0;
        ref = this.findRangesOfPieces();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          range = ref[i];
          if (!(range[1] - range[0] > 1)) {
            continue;
          }
          range[0] += offset;
          range[1] += offset;
          if (this.document.getCharacterAtPosition(range[1]) !== "\n") {
            this.document = this.document.insertBlockBreakAtRange(range[1]);
            if (range[1] < this.selectedRange[1]) {
              this.moveSelectedRangeForward();
            }
            range[1]++;
            offset++;
          }
          if (range[0] !== 0) {
            if (this.document.getCharacterAtPosition(range[0] - 1) !== "\n") {
              this.document = this.document.insertBlockBreakAtRange(range[0]);
              if (range[0] < this.selectedRange[0]) {
                this.moveSelectedRangeForward();
              }
              range[0]++;
              offset++;
            }
          }
          results.push(this.document = this.document.applyBlockAttributeAtRange(BLOCK_ATTRIBUTE_NAME, true, range));
        }
        return results;
      }

      findRangesOfBlocks() {
        return this.document.findRangesForBlockAttribute(BLOCK_ATTRIBUTE_NAME);
      }

      findRangesOfPieces() {
        return this.document.findRangesForTextAttribute(TEXT_ATTRIBUTE_NAME, {
          withValue: TEXT_ATTRIBUTE_VALUE
        });
      }

      moveSelectedRangeForward() {
        this.selectedRange[0] += 1;
        return this.selectedRange[1] += 1;
      }

    };

    BLOCK_ATTRIBUTE_NAME = "attachmentGallery";

    TEXT_ATTRIBUTE_NAME = "presentation";

    TEXT_ATTRIBUTE_VALUE = "gallery";

    return Filter;

  }).call(window);

  Trix$2.Editor = (function() {
    var DEFAULT_FILTERS;

    class Editor {
      constructor(composition, selectionManager, element) {
        this.insertFiles = this.insertFiles.bind(this);
        this.composition = composition;
        this.selectionManager = selectionManager;
        this.element = element;
        this.undoManager = new Trix$2.UndoManager(this.composition);
        this.filters = DEFAULT_FILTERS.slice(0);
      }

      loadDocument(document) {
        return this.loadSnapshot({
          document,
          selectedRange: [0, 0]
        });
      }

      loadHTML(html = "") {
        return this.loadDocument(Trix$2.Document.fromHTML(html, {
          referenceElement: this.element
        }));
      }

      loadJSON({document, selectedRange}) {
        document = Trix$2.Document.fromJSON(document);
        return this.loadSnapshot({document, selectedRange});
      }

      loadSnapshot(snapshot) {
        this.undoManager = new Trix$2.UndoManager(this.composition);
        return this.composition.loadSnapshot(snapshot);
      }

      getDocument() {
        return this.composition.document;
      }

      getSelectedDocument() {
        return this.composition.getSelectedDocument();
      }

      getSnapshot() {
        return this.composition.getSnapshot();
      }

      toJSON() {
        return this.getSnapshot();
      }

      // Document manipulation
      deleteInDirection(direction) {
        return this.composition.deleteInDirection(direction);
      }

      insertAttachment(attachment) {
        return this.composition.insertAttachment(attachment);
      }

      insertAttachments(attachments) {
        return this.composition.insertAttachments(attachments);
      }

      insertDocument(document) {
        return this.composition.insertDocument(document);
      }

      insertFile(file) {
        return this.composition.insertFile(file);
      }

      insertFiles(files) {
        return this.composition.insertFiles(files);
      }

      insertHTML(html) {
        return this.composition.insertHTML(html);
      }

      insertString(string) {
        return this.composition.insertString(string);
      }

      insertText(text) {
        return this.composition.insertText(text);
      }

      insertLineBreak() {
        return this.composition.insertLineBreak();
      }

      // Selection
      getSelectedRange() {
        return this.composition.getSelectedRange();
      }

      getPosition() {
        return this.composition.getPosition();
      }

      getClientRectAtPosition(position) {
        var locationRange;
        locationRange = this.getDocument().locationRangeFromRange([position, position + 1]);
        return this.selectionManager.getClientRectAtLocationRange(locationRange);
      }

      expandSelectionInDirection(direction) {
        return this.composition.expandSelectionInDirection(direction);
      }

      moveCursorInDirection(direction) {
        return this.composition.moveCursorInDirection(direction);
      }

      setSelectedRange(selectedRange) {
        return this.composition.setSelectedRange(selectedRange);
      }

      // Attributes
      activateAttribute(name, value = true) {
        return this.composition.setCurrentAttribute(name, value);
      }

      attributeIsActive(name) {
        return this.composition.hasCurrentAttribute(name);
      }

      canActivateAttribute(name) {
        return this.composition.canSetCurrentAttribute(name);
      }

      deactivateAttribute(name) {
        return this.composition.removeCurrentAttribute(name);
      }

      // Nesting level
      canDecreaseNestingLevel() {
        return this.composition.canDecreaseNestingLevel();
      }

      canIncreaseNestingLevel() {
        return this.composition.canIncreaseNestingLevel();
      }

      decreaseNestingLevel() {
        if (this.canDecreaseNestingLevel()) {
          return this.composition.decreaseNestingLevel();
        }
      }

      increaseNestingLevel() {
        if (this.canIncreaseNestingLevel()) {
          return this.composition.increaseNestingLevel();
        }
      }

      // Undo/redo
      canRedo() {
        return this.undoManager.canRedo();
      }

      canUndo() {
        return this.undoManager.canUndo();
      }

      recordUndoEntry(description, {context, consolidatable} = {}) {
        return this.undoManager.recordUndoEntry(description, {context, consolidatable});
      }

      redo() {
        if (this.canRedo()) {
          return this.undoManager.redo();
        }
      }

      undo() {
        if (this.canUndo()) {
          return this.undoManager.undo();
        }
      }

    };

    DEFAULT_FILTERS = [Trix$2.attachmentGalleryFilter];

    return Editor;

  }).call(window);

  Trix.ManagedAttachment = (function() {
    class ManagedAttachment extends Trix.BasicObject {
      constructor(attachmentManager, attachment) {
        super(...arguments);
        this.attachmentManager = attachmentManager;
        this.attachment = attachment;
        ({id: this.id, file: this.file} = this.attachment);
      }

      remove() {
        return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
      }

    };

    ManagedAttachment.proxyMethod("attachment.getAttribute");

    ManagedAttachment.proxyMethod("attachment.hasAttribute");

    ManagedAttachment.proxyMethod("attachment.setAttribute");

    ManagedAttachment.proxyMethod("attachment.getAttributes");

    ManagedAttachment.proxyMethod("attachment.setAttributes");

    ManagedAttachment.proxyMethod("attachment.isPending");

    ManagedAttachment.proxyMethod("attachment.isPreviewable");

    ManagedAttachment.proxyMethod("attachment.getURL");

    ManagedAttachment.proxyMethod("attachment.getHref");

    ManagedAttachment.proxyMethod("attachment.getFilename");

    ManagedAttachment.proxyMethod("attachment.getFilesize");

    ManagedAttachment.proxyMethod("attachment.getFormattedFilesize");

    ManagedAttachment.proxyMethod("attachment.getExtension");

    ManagedAttachment.proxyMethod("attachment.getContentType");

    ManagedAttachment.proxyMethod("attachment.getFile");

    ManagedAttachment.proxyMethod("attachment.setFile");

    ManagedAttachment.proxyMethod("attachment.releaseFile");

    ManagedAttachment.proxyMethod("attachment.getUploadProgress");

    ManagedAttachment.proxyMethod("attachment.setUploadProgress");

    return ManagedAttachment;

  }).call(window);

  Trix$2.AttachmentManager = class AttachmentManager extends Trix$2.BasicObject {
    constructor(attachments = []) {
      var attachment, i, len;
      super(...arguments);
      this.managedAttachments = {};
      for (i = 0, len = attachments.length; i < len; i++) {
        attachment = attachments[i];
        this.manageAttachment(attachment);
      }
    }

    getAttachments() {
      var attachment, id, ref, results;
      ref = this.managedAttachments;
      results = [];
      for (id in ref) {
        attachment = ref[id];
        results.push(attachment);
      }
      return results;
    }

    manageAttachment(attachment) {
      var base, name;
      return (base = this.managedAttachments)[name = attachment.id] != null ? base[name] : base[name] = new Trix$2.ManagedAttachment(this, attachment);
    }

    attachmentIsManaged(attachment) {
      return attachment.id in this.managedAttachments;
    }

    requestRemovalOfAttachment(attachment) {
      var ref;
      if (this.attachmentIsManaged(attachment)) {
        return (ref = this.delegate) != null ? typeof ref.attachmentManagerDidRequestRemovalOfAttachment === "function" ? ref.attachmentManagerDidRequestRemovalOfAttachment(attachment) : void 0 : void 0;
      }
    }

    unmanageAttachment(attachment) {
      var managedAttachment;
      managedAttachment = this.managedAttachments[attachment.id];
      delete this.managedAttachments[attachment.id];
      return managedAttachment;
    }

  };

  var elementContainsNode$1, findChildIndexOfNode, nodeIsAttachmentElement, nodeIsBlockContainer, nodeIsBlockStart, nodeIsBlockStartComment, nodeIsCursorTarget$1, nodeIsEmptyTextNode, nodeIsTextNode, tagName, walkTree;

  ({elementContainsNode: elementContainsNode$1, findChildIndexOfNode, nodeIsBlockStart, nodeIsBlockStartComment, nodeIsBlockContainer, nodeIsCursorTarget: nodeIsCursorTarget$1, nodeIsEmptyTextNode, nodeIsTextNode, nodeIsAttachmentElement, tagName, walkTree} = Trix$2);

  Trix$2.LocationMapper = (function() {
    var acceptSignificantNodes, nodeLength, rejectAttachmentContents, rejectEmptyTextNodes;

    class LocationMapper {
      constructor(element) {
        this.element = element;
      }

      findLocationFromContainerAndOffset(container, offset, {strict} = {
          strict: true
        }) {
        var attachmentElement, childIndex, foundBlock, location, node, walker;
        childIndex = 0;
        foundBlock = false;
        location = {
          index: 0,
          offset: 0
        };
        if (attachmentElement = this.findAttachmentElementParentForNode(container)) {
          container = attachmentElement.parentNode;
          offset = findChildIndexOfNode(attachmentElement);
        }
        walker = walkTree(this.element, {
          usingFilter: rejectAttachmentContents
        });
        while (walker.nextNode()) {
          node = walker.currentNode;
          if (node === container && nodeIsTextNode(container)) {
            if (!nodeIsCursorTarget$1(node)) {
              location.offset += offset;
            }
            break;
          } else {
            if (node.parentNode === container) {
              if (childIndex++ === offset) {
                break;
              }
            } else if (!elementContainsNode$1(container, node)) {
              if (childIndex > 0) {
                break;
              }
            }
            if (nodeIsBlockStart(node, {strict})) {
              if (foundBlock) {
                location.index++;
              }
              location.offset = 0;
              foundBlock = true;
            } else {
              location.offset += nodeLength(node);
            }
          }
        }
        return location;
      }

      findContainerAndOffsetFromLocation(location) {
        var container, node, nodeOffset, offset;
        if (location.index === 0 && location.offset === 0) {
          container = this.element;
          offset = 0;
          while (container.firstChild) {
            container = container.firstChild;
            if (nodeIsBlockContainer(container)) {
              offset = 1;
              break;
            }
          }
          return [container, offset];
        }
        [node, nodeOffset] = this.findNodeAndOffsetFromLocation(location);
        if (!node) {
          return;
        }
        if (nodeIsTextNode(node)) {
          if (nodeLength(node) === 0) {
            container = node.parentNode.parentNode;
            offset = findChildIndexOfNode(node.parentNode);
            if (nodeIsCursorTarget$1(node, {
              name: "right"
            })) {
              offset++;
            }
          } else {
            container = node;
            offset = location.offset - nodeOffset;
          }
        } else {
          container = node.parentNode;
          if (!nodeIsBlockStart(node.previousSibling)) {
            if (!nodeIsBlockContainer(container)) {
              while (node === container.lastChild) {
                node = container;
                container = container.parentNode;
                if (nodeIsBlockContainer(container)) {
                  break;
                }
              }
            }
          }
          offset = findChildIndexOfNode(node);
          if (location.offset !== 0) {
            offset++;
          }
        }
        return [container, offset];
      }

      findNodeAndOffsetFromLocation(location) {
        var currentNode, i, len, length, node, nodeOffset, offset, ref;
        offset = 0;
        ref = this.getSignificantNodesForIndex(location.index);
        for (i = 0, len = ref.length; i < len; i++) {
          currentNode = ref[i];
          length = nodeLength(currentNode);
          if (location.offset <= offset + length) {
            if (nodeIsTextNode(currentNode)) {
              node = currentNode;
              nodeOffset = offset;
              if (location.offset === nodeOffset && nodeIsCursorTarget$1(node)) {
                break;
              }
            } else if (!node) {
              node = currentNode;
              nodeOffset = offset;
            }
          }
          offset += length;
          if (offset > location.offset) {
            break;
          }
        }
        return [node, nodeOffset];
      }

      // Private
      findAttachmentElementParentForNode(node) {
        while (node && node !== this.element) {
          if (nodeIsAttachmentElement(node)) {
            return node;
          }
          node = node.parentNode;
        }
      }

      getSignificantNodesForIndex(index) {
        var blockIndex, node, nodes, recordingNodes, walker;
        nodes = [];
        walker = walkTree(this.element, {
          usingFilter: acceptSignificantNodes
        });
        recordingNodes = false;
        while (walker.nextNode()) {
          node = walker.currentNode;
          if (nodeIsBlockStartComment(node)) {
            if (typeof blockIndex !== "undefined" && blockIndex !== null) {
              blockIndex++;
            } else {
              blockIndex = 0;
            }
            if (blockIndex === index) {
              recordingNodes = true;
            } else if (recordingNodes) {
              break;
            }
          } else if (recordingNodes) {
            nodes.push(node);
          }
        }
        return nodes;
      }

    };

    nodeLength = function(node) {
      var string;
      if (node.nodeType === Node.TEXT_NODE) {
        if (nodeIsCursorTarget$1(node)) {
          return 0;
        } else {
          string = node.textContent;
          return string.length;
        }
      } else if (tagName(node) === "br" || nodeIsAttachmentElement(node)) {
        return 1;
      } else {
        return 0;
      }
    };

    acceptSignificantNodes = function(node) {
      if (rejectEmptyTextNodes(node) === NodeFilter.FILTER_ACCEPT) {
        return rejectAttachmentContents(node);
      } else {
        return NodeFilter.FILTER_REJECT;
      }
    };

    rejectEmptyTextNodes = function(node) {
      if (nodeIsEmptyTextNode(node)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    rejectAttachmentContents = function(node) {
      if (nodeIsAttachmentElement(node.parentNode)) {
        return NodeFilter.FILTER_REJECT;
      } else {
        return NodeFilter.FILTER_ACCEPT;
      }
    };

    return LocationMapper;

  }).call(window);

  var getDOMRange$1, setDOMRange$1,
    slice = [].slice;

  ({getDOMRange: getDOMRange$1, setDOMRange: setDOMRange$1} = Trix$2);

  Trix$2.PointMapper = class PointMapper {
    createDOMRangeFromPoint({x, y}) {
      var domRange, offset, offsetNode, originalDOMRange, textRange;
      if (document.caretPositionFromPoint) {
        ({offsetNode, offset} = document.caretPositionFromPoint(x, y));
        domRange = document.createRange();
        domRange.setStart(offsetNode, offset);
        return domRange;
      } else if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
      } else if (document.body.createTextRange) {
        originalDOMRange = getDOMRange$1();
        try {
          // IE 11 throws "Unspecified error" when using moveToPoint
          // during a drag-and-drop operation.
          textRange = document.body.createTextRange();
          textRange.moveToPoint(x, y);
          textRange.select();
        } catch (error) {}
        domRange = getDOMRange$1();
        setDOMRange$1(originalDOMRange);
        return domRange;
      }
    }

    getClientRectsForDOMRange(domRange) {
      var end, ref, start;
      ref = [...domRange.getClientRects()], [start] = ref, [end] = slice.call(ref, -1);
      return [start, end];
    }

  };

  var elementContainsNode, getDOMRange, getDOMSelection, handleEvent$1, innerElementIsActive, nodeIsCursorTarget, normalizeRange, rangeIsCollapsed$1, rangesAreEqual$1, ref, setDOMRange,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({getDOMSelection, getDOMRange, setDOMRange, elementContainsNode, nodeIsCursorTarget, innerElementIsActive, handleEvent: handleEvent$1, normalizeRange, rangeIsCollapsed: rangeIsCollapsed$1, rangesAreEqual: rangesAreEqual$1} = Trix$2);

  ref = Trix$2.SelectionManager = (function() {
    class SelectionManager extends Trix$2.BasicObject {
      constructor(element) {
        super(...arguments);
        this.didMouseDown = this.didMouseDown.bind(this);
        this.selectionDidChange = this.selectionDidChange.bind(this);
        this.element = element;
        this.locationMapper = new Trix$2.LocationMapper(this.element);
        this.pointMapper = new Trix$2.PointMapper();
        this.lockCount = 0;
        handleEvent$1("mousedown", {
          onElement: this.element,
          withCallback: this.didMouseDown
        });
      }

      getLocationRange(options = {}) {
        var locationRange, ref1;
        return locationRange = options.strict === false ? this.createLocationRangeFromDOMRange(getDOMRange(), {
          strict: false
        }) : options.ignoreLock ? this.currentLocationRange : (ref1 = this.lockedLocationRange) != null ? ref1 : this.currentLocationRange;
      }

      setLocationRange(locationRange) {
        var domRange;
        if (this.lockedLocationRange) {
          return;
        }
        locationRange = normalizeRange(locationRange);
        if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
          setDOMRange(domRange);
          return this.updateCurrentLocationRange(locationRange);
        }
      }

      setLocationRangeFromPointRange(pointRange) {
        var endLocation, startLocation;
        pointRange = normalizeRange(pointRange);
        startLocation = this.getLocationAtPoint(pointRange[0]);
        endLocation = this.getLocationAtPoint(pointRange[1]);
        return this.setLocationRange([startLocation, endLocation]);
      }

      getClientRectAtLocationRange(locationRange) {
        var domRange;
        if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
          return this.getClientRectsForDOMRange(domRange)[1];
        }
      }

      locationIsCursorTarget(location) {
        var node, offset;
        [node, offset] = this.findNodeAndOffsetFromLocation(location);
        return nodeIsCursorTarget(node);
      }

      lock() {
        if (this.lockCount++ === 0) {
          this.updateCurrentLocationRange();
          return this.lockedLocationRange = this.getLocationRange();
        }
      }

      unlock() {
        var lockedLocationRange;
        if (--this.lockCount === 0) {
          lockedLocationRange = this.lockedLocationRange;
          this.lockedLocationRange = null;
          if (lockedLocationRange != null) {
            return this.setLocationRange(lockedLocationRange);
          }
        }
      }

      clearSelection() {
        var ref1;
        return (ref1 = getDOMSelection()) != null ? ref1.removeAllRanges() : void 0;
      }

      selectionIsCollapsed() {
        var ref1;
        return ((ref1 = getDOMRange()) != null ? ref1.collapsed : void 0) === true;
      }

      selectionIsExpanded() {
        return !this.selectionIsCollapsed();
      }

      createLocationRangeFromDOMRange(domRange, options) {
        var end, start;
        if (!((domRange != null) && this.domRangeWithinElement(domRange))) {
          return;
        }
        if (!(start = this.findLocationFromContainerAndOffset(domRange.startContainer, domRange.startOffset, options))) {
          return;
        }
        if (!domRange.collapsed) {
          end = this.findLocationFromContainerAndOffset(domRange.endContainer, domRange.endOffset, options);
        }
        return normalizeRange([start, end]);
      }

      didMouseDown() {
        boundMethodCheck(this, ref);
        return this.pauseTemporarily();
      }

      pauseTemporarily() {
        var eventName, resume, resumeHandlers, resumeTimeout;
        this.paused = true;
        resume = () => {
          var handler, i, len;
          this.paused = false;
          clearTimeout(resumeTimeout);
          for (i = 0, len = resumeHandlers.length; i < len; i++) {
            handler = resumeHandlers[i];
            handler.destroy();
          }
          if (elementContainsNode(document, this.element)) {
            return this.selectionDidChange();
          }
        };
        resumeTimeout = setTimeout(resume, 200);
        return resumeHandlers = (function() {
          var i, len, ref1, results;
          ref1 = ["mousemove", "keydown"];
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            eventName = ref1[i];
            results.push(handleEvent$1(eventName, {
              onElement: document,
              withCallback: resume
            }));
          }
          return results;
        })();
      }

      selectionDidChange() {
        boundMethodCheck(this, ref);
        if (!(this.paused || innerElementIsActive(this.element))) {
          return this.updateCurrentLocationRange();
        }
      }

      updateCurrentLocationRange(locationRange) {
        var ref1;
        if (locationRange != null ? locationRange : locationRange = this.createLocationRangeFromDOMRange(getDOMRange())) {
          if (!rangesAreEqual$1(locationRange, this.currentLocationRange)) {
            this.currentLocationRange = locationRange;
            return (ref1 = this.delegate) != null ? typeof ref1.locationRangeDidChange === "function" ? ref1.locationRangeDidChange(this.currentLocationRange.slice(0)) : void 0 : void 0;
          }
        }
      }

      createDOMRangeFromLocationRange(locationRange) {
        var domRange, rangeEnd, rangeStart, ref1;
        rangeStart = this.findContainerAndOffsetFromLocation(locationRange[0]);
        rangeEnd = rangeIsCollapsed$1(locationRange) ? rangeStart : (ref1 = this.findContainerAndOffsetFromLocation(locationRange[1])) != null ? ref1 : rangeStart;
        if ((rangeStart != null) && (rangeEnd != null)) {
          domRange = document.createRange();
          domRange.setStart(...rangeStart);
          domRange.setEnd(...rangeEnd);
          return domRange;
        }
      }

      getLocationAtPoint(point) {
        var domRange, ref1;
        if (domRange = this.createDOMRangeFromPoint(point)) {
          return (ref1 = this.createLocationRangeFromDOMRange(domRange)) != null ? ref1[0] : void 0;
        }
      }

      domRangeWithinElement(domRange) {
        if (domRange.collapsed) {
          return elementContainsNode(this.element, domRange.startContainer);
        } else {
          return elementContainsNode(this.element, domRange.startContainer) && elementContainsNode(this.element, domRange.endContainer);
        }
      }

    };

    // Private
    SelectionManager.proxyMethod("locationMapper.findLocationFromContainerAndOffset");

    SelectionManager.proxyMethod("locationMapper.findContainerAndOffsetFromLocation");

    SelectionManager.proxyMethod("locationMapper.findNodeAndOffsetFromLocation");

    SelectionManager.proxyMethod("pointMapper.createDOMRangeFromPoint");

    SelectionManager.proxyMethod("pointMapper.getClientRectsForDOMRange");

    return SelectionManager;

  }).call(window);

  var getBlockConfig, objectsAreEqual, rangeIsCollapsed, rangesAreEqual;

  ({rangeIsCollapsed, rangesAreEqual, objectsAreEqual, getBlockConfig} = Trix$2);

  Trix$2.EditorController = (function() {
    var snapshotsAreEqual;

    class EditorController extends Trix$2.Controller {
      constructor({editorElement, document, html}) {
        super(...arguments);
        this.editorElement = editorElement;
        this.selectionManager = new Trix$2.SelectionManager(this.editorElement);
        this.selectionManager.delegate = this;
        this.composition = new Trix$2.Composition();
        this.composition.delegate = this;
        this.attachmentManager = new Trix$2.AttachmentManager(this.composition.getAttachments());
        this.attachmentManager.delegate = this;
        this.inputController = new Trix$2[`Level${Trix$2.config.input.getLevel()}InputController`](this.editorElement);
        this.inputController.delegate = this;
        this.inputController.responder = this.composition;
        this.compositionController = new Trix$2.CompositionController(this.editorElement, this.composition);
        this.compositionController.delegate = this;
        this.toolbarController = new Trix$2.ToolbarController(this.editorElement.toolbarElement);
        this.toolbarController.delegate = this;
        this.editor = new Trix$2.Editor(this.composition, this.selectionManager, this.editorElement);
        if (document != null) {
          this.editor.loadDocument(document);
        } else {
          this.editor.loadHTML(html);
        }
      }

      registerSelectionManager() {
        return Trix$2.selectionChangeObserver.registerSelectionManager(this.selectionManager);
      }

      unregisterSelectionManager() {
        return Trix$2.selectionChangeObserver.unregisterSelectionManager(this.selectionManager);
      }

      render() {
        return this.compositionController.render();
      }

      reparse() {
        return this.composition.replaceHTML(this.editorElement.innerHTML);
      }

      // Composition delegate
      compositionDidChangeDocument(document) {
        this.notifyEditorElement("document-change");
        if (!this.handlingInput) {
          return this.render();
        }
      }

      compositionDidChangeCurrentAttributes(currentAttributes) {
        this.currentAttributes = currentAttributes;
        this.toolbarController.updateAttributes(this.currentAttributes);
        this.updateCurrentActions();
        return this.notifyEditorElement("attributes-change", {
          attributes: this.currentAttributes
        });
      }

      compositionDidPerformInsertionAtRange(range) {
        if (this.pasting) {
          return this.pastedRange = range;
        }
      }

      compositionShouldAcceptFile(file) {
        return this.notifyEditorElement("file-accept", {file});
      }

      compositionDidAddAttachment(attachment) {
        var managedAttachment;
        managedAttachment = this.attachmentManager.manageAttachment(attachment);
        return this.notifyEditorElement("attachment-add", {
          attachment: managedAttachment
        });
      }

      compositionDidEditAttachment(attachment) {
        var managedAttachment;
        this.compositionController.rerenderViewForObject(attachment);
        managedAttachment = this.attachmentManager.manageAttachment(attachment);
        this.notifyEditorElement("attachment-edit", {
          attachment: managedAttachment
        });
        return this.notifyEditorElement("change");
      }

      compositionDidChangeAttachmentPreviewURL(attachment) {
        this.compositionController.invalidateViewForObject(attachment);
        return this.notifyEditorElement("change");
      }

      compositionDidRemoveAttachment(attachment) {
        var managedAttachment;
        managedAttachment = this.attachmentManager.unmanageAttachment(attachment);
        return this.notifyEditorElement("attachment-remove", {
          attachment: managedAttachment
        });
      }

      compositionDidStartEditingAttachment(attachment, options) {
        this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(attachment);
        this.compositionController.installAttachmentEditorForAttachment(attachment, options);
        return this.selectionManager.setLocationRange(this.attachmentLocationRange);
      }

      compositionDidStopEditingAttachment(attachment) {
        this.compositionController.uninstallAttachmentEditor();
        return this.attachmentLocationRange = null;
      }

      compositionDidRequestChangingSelectionToLocationRange(locationRange) {
        if (this.loadingSnapshot && !this.isFocused()) {
          return;
        }
        this.requestedLocationRange = locationRange;
        this.compositionRevisionWhenLocationRangeRequested = this.composition.revision;
        if (!this.handlingInput) {
          return this.render();
        }
      }

      compositionWillLoadSnapshot() {
        return this.loadingSnapshot = true;
      }

      compositionDidLoadSnapshot() {
        this.compositionController.refreshViewCache();
        this.render();
        return this.loadingSnapshot = false;
      }

      getSelectionManager() {
        return this.selectionManager;
      }

      // Attachment manager delegate
      attachmentManagerDidRequestRemovalOfAttachment(attachment) {
        return this.removeAttachment(attachment);
      }

      // Document controller delegate
      compositionControllerWillSyncDocumentView() {
        this.inputController.editorWillSyncDocumentView();
        this.selectionManager.lock();
        return this.selectionManager.clearSelection();
      }

      compositionControllerDidSyncDocumentView() {
        this.inputController.editorDidSyncDocumentView();
        this.selectionManager.unlock();
        this.updateCurrentActions();
        return this.notifyEditorElement("sync");
      }

      compositionControllerDidRender() {
        if (this.requestedLocationRange != null) {
          if (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision) {
            this.selectionManager.setLocationRange(this.requestedLocationRange);
          }
          this.requestedLocationRange = null;
          this.compositionRevisionWhenLocationRangeRequested = null;
        }
        if (this.renderedCompositionRevision !== this.composition.revision) {
          this.runEditorFilters();
          this.composition.updateCurrentAttributes();
          this.notifyEditorElement("render");
        }
        return this.renderedCompositionRevision = this.composition.revision;
      }

      compositionControllerDidFocus() {
        if (this.isFocusedInvisibly()) {
          this.setLocationRange({
            index: 0,
            offset: 0
          });
        }
        this.toolbarController.hideDialog();
        return this.notifyEditorElement("focus");
      }

      compositionControllerDidBlur() {
        return this.notifyEditorElement("blur");
      }

      compositionControllerDidSelectAttachment(attachment, options) {
        this.toolbarController.hideDialog();
        return this.composition.editAttachment(attachment, options);
      }

      compositionControllerDidRequestDeselectingAttachment(attachment) {
        var locationRange, ref;
        locationRange = (ref = this.attachmentLocationRange) != null ? ref : this.composition.document.getLocationRangeOfAttachment(attachment);
        return this.selectionManager.setLocationRange(locationRange[1]);
      }

      compositionControllerWillUpdateAttachment(attachment) {
        return this.editor.recordUndoEntry("Edit Attachment", {
          context: attachment.id,
          consolidatable: true
        });
      }

      compositionControllerDidRequestRemovalOfAttachment(attachment) {
        return this.removeAttachment(attachment);
      }

      // Input controller delegate
      inputControllerWillHandleInput() {
        this.handlingInput = true;
        return this.requestedRender = false;
      }

      inputControllerDidRequestRender() {
        return this.requestedRender = true;
      }

      inputControllerDidHandleInput() {
        this.handlingInput = false;
        if (this.requestedRender) {
          this.requestedRender = false;
          return this.render();
        }
      }

      inputControllerDidAllowUnhandledInput() {
        return this.notifyEditorElement("change");
      }

      inputControllerDidRequestReparse() {
        return this.reparse();
      }

      inputControllerWillPerformTyping() {
        return this.recordTypingUndoEntry();
      }

      inputControllerWillPerformFormatting(attributeName) {
        return this.recordFormattingUndoEntry(attributeName);
      }

      inputControllerWillCutText() {
        return this.editor.recordUndoEntry("Cut");
      }

      inputControllerWillPaste(paste) {
        this.editor.recordUndoEntry("Paste");
        this.pasting = true;
        return this.notifyEditorElement("before-paste", {paste});
      }

      inputControllerDidPaste(paste) {
        paste.range = this.pastedRange;
        this.pastedRange = null;
        this.pasting = null;
        return this.notifyEditorElement("paste", {paste});
      }

      inputControllerWillMoveText() {
        return this.editor.recordUndoEntry("Move");
      }

      inputControllerWillAttachFiles() {
        return this.editor.recordUndoEntry("Drop Files");
      }

      inputControllerWillPerformUndo() {
        return this.editor.undo();
      }

      inputControllerWillPerformRedo() {
        return this.editor.redo();
      }

      inputControllerDidReceiveKeyboardCommand(keys) {
        return this.toolbarController.applyKeyboardCommand(keys);
      }

      inputControllerDidStartDrag() {
        return this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
      }

      inputControllerDidReceiveDragOverPoint(point) {
        return this.selectionManager.setLocationRangeFromPointRange(point);
      }

      inputControllerDidCancelDrag() {
        this.selectionManager.setLocationRange(this.locationRangeBeforeDrag);
        return this.locationRangeBeforeDrag = null;
      }

      // Selection manager delegate
      locationRangeDidChange(locationRange) {
        this.composition.updateCurrentAttributes();
        this.updateCurrentActions();
        if (this.attachmentLocationRange && !rangesAreEqual(this.attachmentLocationRange, locationRange)) {
          this.composition.stopEditingAttachment();
        }
        return this.notifyEditorElement("selection-change");
      }

      // Toolbar controller delegate
      toolbarDidClickButton() {
        if (!this.getLocationRange()) {
          return this.setLocationRange({
            index: 0,
            offset: 0
          });
        }
      }

      toolbarDidInvokeAction(actionName) {
        return this.invokeAction(actionName);
      }

      toolbarDidToggleAttribute(attributeName) {
        this.recordFormattingUndoEntry(attributeName);
        this.composition.toggleCurrentAttribute(attributeName);
        this.render();
        if (!this.selectionFrozen) {
          return this.editorElement.focus();
        }
      }

      toolbarDidUpdateAttribute(attributeName, value) {
        this.recordFormattingUndoEntry(attributeName);
        this.composition.setCurrentAttribute(attributeName, value);
        this.render();
        if (!this.selectionFrozen) {
          return this.editorElement.focus();
        }
      }

      toolbarDidRemoveAttribute(attributeName) {
        this.recordFormattingUndoEntry(attributeName);
        this.composition.removeCurrentAttribute(attributeName);
        this.render();
        if (!this.selectionFrozen) {
          return this.editorElement.focus();
        }
      }

      toolbarWillShowDialog(dialogElement) {
        this.composition.expandSelectionForEditing();
        return this.freezeSelection();
      }

      toolbarDidShowDialog(dialogName) {
        return this.notifyEditorElement("toolbar-dialog-show", {dialogName});
      }

      toolbarDidHideDialog(dialogName) {
        this.thawSelection();
        this.editorElement.focus();
        return this.notifyEditorElement("toolbar-dialog-hide", {dialogName});
      }

      // Selection
      freezeSelection() {
        if (!this.selectionFrozen) {
          this.selectionManager.lock();
          this.composition.freezeSelection();
          this.selectionFrozen = true;
          return this.render();
        }
      }

      thawSelection() {
        if (this.selectionFrozen) {
          this.composition.thawSelection();
          this.selectionManager.unlock();
          this.selectionFrozen = false;
          return this.render();
        }
      }

      canInvokeAction(actionName) {
        var ref, ref1;
        if (this.actionIsExternal(actionName)) {
          return true;
        } else {
          return !!((ref = this.actions[actionName]) != null ? (ref1 = ref.test) != null ? ref1.call(this) : void 0 : void 0);
        }
      }

      invokeAction(actionName) {
        var ref, ref1;
        if (this.actionIsExternal(actionName)) {
          return this.notifyEditorElement("action-invoke", {actionName});
        } else {
          return (ref = this.actions[actionName]) != null ? (ref1 = ref.perform) != null ? ref1.call(this) : void 0 : void 0;
        }
      }

      actionIsExternal(actionName) {
        return /^x-./.test(actionName);
      }

      getCurrentActions() {
        var actionName, result;
        result = {};
        for (actionName in this.actions) {
          result[actionName] = this.canInvokeAction(actionName);
        }
        return result;
      }

      updateCurrentActions() {
        var currentActions;
        currentActions = this.getCurrentActions();
        if (!objectsAreEqual(currentActions, this.currentActions)) {
          this.currentActions = currentActions;
          this.toolbarController.updateActions(this.currentActions);
          return this.notifyEditorElement("actions-change", {
            actions: this.currentActions
          });
        }
      }

      // Editor filters
      runEditorFilters() {
        var document, filter, i, len, ref, ref1, selectedRange, snapshot;
        snapshot = this.composition.getSnapshot();
        ref = this.editor.filters;
        for (i = 0, len = ref.length; i < len; i++) {
          filter = ref[i];
          ({document, selectedRange} = snapshot);
          snapshot = (ref1 = filter.call(this.editor, snapshot)) != null ? ref1 : {};
          if (snapshot.document == null) {
            snapshot.document = document;
          }
          if (snapshot.selectedRange == null) {
            snapshot.selectedRange = selectedRange;
          }
        }
        if (!snapshotsAreEqual(snapshot, this.composition.getSnapshot())) {
          return this.composition.loadSnapshot(snapshot);
        }
      }

      // Private
      updateInputElement() {
        var element, value;
        element = this.compositionController.getSerializableElement();
        value = Trix$2.serializeToContentType(element, "text/html");
        return this.editorElement.setInputElementValue(value);
      }

      notifyEditorElement(message, data) {
        switch (message) {
          case "document-change":
            this.documentChangedSinceLastRender = true;
            break;
          case "render":
            if (this.documentChangedSinceLastRender) {
              this.documentChangedSinceLastRender = false;
              this.notifyEditorElement("change");
            }
            break;
          case "change":
          case "attachment-add":
          case "attachment-edit":
          case "attachment-remove":
            this.updateInputElement();
        }
        return this.editorElement.notify(message, data);
      }

      removeAttachment(attachment) {
        this.editor.recordUndoEntry("Delete Attachment");
        this.composition.removeAttachment(attachment);
        return this.render();
      }

      recordFormattingUndoEntry(attributeName) {
        var blockConfig, locationRange;
        blockConfig = getBlockConfig(attributeName);
        locationRange = this.selectionManager.getLocationRange();
        if (blockConfig || !rangeIsCollapsed(locationRange)) {
          return this.editor.recordUndoEntry("Formatting", {
            context: this.getUndoContext(),
            consolidatable: true
          });
        }
      }

      recordTypingUndoEntry() {
        return this.editor.recordUndoEntry("Typing", {
          context: this.getUndoContext(this.currentAttributes),
          consolidatable: true
        });
      }

      getUndoContext(...context) {
        return [this.getLocationContext(), this.getTimeContext(), ...context];
      }

      getLocationContext() {
        var locationRange;
        locationRange = this.selectionManager.getLocationRange();
        if (rangeIsCollapsed(locationRange)) {
          return locationRange[0].index;
        } else {
          return locationRange;
        }
      }

      getTimeContext() {
        if (Trix$2.config.undoInterval > 0) {
          return Math.floor(new Date().getTime() / Trix$2.config.undoInterval);
        } else {
          return 0;
        }
      }

      isFocused() {
        var ref;
        return this.editorElement === ((ref = this.editorElement.ownerDocument) != null ? ref.activeElement : void 0);
      }

      // Detect "Cursor disappears sporadically" Firefox bug.
      // - https://bugzilla.mozilla.org/show_bug.cgi?id=226301
      isFocusedInvisibly() {
        return this.isFocused() && !this.getLocationRange();
      }

    };

    EditorController.proxyMethod("getSelectionManager().setLocationRange");

    EditorController.proxyMethod("getSelectionManager().getLocationRange");

    // Actions
    EditorController.prototype.actions = {
      undo: {
        test: function() {
          return this.editor.canUndo();
        },
        perform: function() {
          return this.editor.undo();
        }
      },
      redo: {
        test: function() {
          return this.editor.canRedo();
        },
        perform: function() {
          return this.editor.redo();
        }
      },
      link: {
        test: function() {
          return this.editor.canActivateAttribute("href");
        }
      },
      increaseNestingLevel: {
        test: function() {
          return this.editor.canIncreaseNestingLevel();
        },
        perform: function() {
          return this.editor.increaseNestingLevel() && this.render();
        }
      },
      decreaseNestingLevel: {
        test: function() {
          return this.editor.canDecreaseNestingLevel();
        },
        perform: function() {
          return this.editor.decreaseNestingLevel() && this.render();
        }
      },
      attachFiles: {
        test: function() {
          return true;
        },
        perform: function() {
          return Trix$2.config.input.pickFiles(this.editor.insertFiles);
        }
      }
    };

    snapshotsAreEqual = function(a, b) {
      return rangesAreEqual(a.selectedRange, b.selectedRange) && a.document.isEqualTo(b.document);
    };

    return EditorController;

  }).call(window);

  var attachmentSelector, browser, findClosestElementFromNode, handleEvent, handleEventOnce, makeElement, triggerEvent,
    indexOf = [].indexOf;

  ({browser, makeElement, triggerEvent, handleEvent, handleEventOnce, findClosestElementFromNode} = Trix$2);

  ({attachmentSelector} = Trix$2.AttachmentView);

  Trix$2.registerElement("trix-editor", (function() {
    var addAccessibilityRole, autofocus, configureContentEditable, cursorTargetStyles, disableObjectResizing, ensureAriaLabel, id, makeEditable, setDefaultParagraphSeparator;
    id = 0;
    // Contenteditable support helpers
    autofocus = function(element) {
      if (!document.querySelector(":focus")) {
        if (element.hasAttribute("autofocus") && document.querySelector("[autofocus]") === element) {
          return element.focus();
        }
      }
    };
    makeEditable = function(element) {
      if (element.hasAttribute("contenteditable")) {
        return;
      }
      element.setAttribute("contenteditable", "");
      return handleEventOnce("focus", {
        onElement: element,
        withCallback: function() {
          return configureContentEditable(element);
        }
      });
    };
    configureContentEditable = function(element) {
      disableObjectResizing(element);
      return setDefaultParagraphSeparator(element);
    };
    disableObjectResizing = function(element) {
      if (typeof document.queryCommandSupported === "function" ? document.queryCommandSupported("enableObjectResizing") : void 0) {
        document.execCommand("enableObjectResizing", false, false);
        return handleEvent("mscontrolselect", {
          onElement: element,
          preventDefault: true
        });
      }
    };
    setDefaultParagraphSeparator = function(element) {
      var tagName;
      if (typeof document.queryCommandSupported === "function" ? document.queryCommandSupported("DefaultParagraphSeparator") : void 0) {
        ({tagName} = Trix$2.config.blockAttributes.default);
        if (tagName === "div" || tagName === "p") {
          return document.execCommand("DefaultParagraphSeparator", false, tagName);
        }
      }
    };
    // Accessibility helpers
    addAccessibilityRole = function(element) {
      if (element.hasAttribute("role")) {
        return;
      }
      return element.setAttribute("role", "textbox");
    };
    ensureAriaLabel = function(element) {
      var update;
      if (element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")) {
        return;
      }
      (update = function() {
        var label, text, texts;
        texts = (function() {
          var i, len, ref, results;
          ref = element.labels;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            label = ref[i];
            if (!label.contains(element)) {
              results.push(label.textContent);
            }
          }
          return results;
        })();
        if (text = texts.join(" ")) {
          return element.setAttribute("aria-label", text);
        } else {
          return element.removeAttribute("aria-label");
        }
      })();
      return handleEvent("focus", {
        onElement: element,
        withCallback: update
      });
    };
    // Style
    cursorTargetStyles = (function() {
      if (browser.forcesObjectResizing) {
        return {
          display: "inline",
          width: "auto"
        };
      } else {
        return {
          display: "inline-block",
          width: "1px"
        };
      }
    })();
    return {
      defaultCSS: `%t {
  display: block;
}

%t:empty:not(:focus)::before {
  content: attr(placeholder);
  color: graytext;
  cursor: text;
  pointer-events: none;
}

%t a[contenteditable=false] {
  cursor: text;
}

%t img {
  max-width: 100%;
  height: auto;
}

%t ${attachmentSelector} figcaption textarea {
  resize: none;
}

%t ${attachmentSelector} figcaption textarea.trix-autoresize-clone {
  position: absolute;
  left: -9999px;
  max-height: 0px;
}

%t ${attachmentSelector} figcaption[data-trix-placeholder]:empty::before {
  content: attr(data-trix-placeholder);
  color: graytext;
}

%t [data-trix-cursor-target] {
  display: ${cursorTargetStyles.display} !important;
  width: ${cursorTargetStyles.width} !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

%t [data-trix-cursor-target=left] {
  vertical-align: top !important;
  margin-left: -1px !important;
}

%t [data-trix-cursor-target=right] {
  vertical-align: bottom !important;
  margin-right: -1px !important;
}`,
      // Properties
      trixId: {
        get: function() {
          if (this.hasAttribute("trix-id")) {
            return this.getAttribute("trix-id");
          } else {
            this.setAttribute("trix-id", ++id);
            return this.trixId;
          }
        }
      },
      labels: {
        get: function() {
          var label, labels, ref;
          labels = [];
          if (this.id && this.ownerDocument) {
            labels.push(...this.ownerDocument.querySelectorAll(`label[for='${this.id}']`));
          }
          if (label = findClosestElementFromNode(this, {
            matchingSelector: "label"
          })) {
            if ((ref = label.control) === this || ref === null) {
              labels.push(label);
            }
          }
          return labels;
        }
      },
      toolbarElement: {
        get: function() {
          var element, ref, toolbarId;
          if (this.hasAttribute("toolbar")) {
            return (ref = this.ownerDocument) != null ? ref.getElementById(this.getAttribute("toolbar")) : void 0;
          } else if (this.parentNode) {
            toolbarId = `trix-toolbar-${this.trixId}`;
            this.setAttribute("toolbar", toolbarId);
            element = makeElement("trix-toolbar", {
              id: toolbarId
            });
            this.parentNode.insertBefore(element, this);
            return element;
          }
        }
      },
      form: {
        get: function() {
          var ref;
          return (ref = this.inputElement) != null ? ref.form : void 0;
        }
      },
      inputElement: {
        get: function() {
          var element, inputId, ref;
          if (this.hasAttribute("input")) {
            return (ref = this.ownerDocument) != null ? ref.getElementById(this.getAttribute("input")) : void 0;
          } else if (this.parentNode) {
            inputId = `trix-input-${this.trixId}`;
            this.setAttribute("input", inputId);
            element = makeElement("input", {
              type: "hidden",
              id: inputId
            });
            this.parentNode.insertBefore(element, this.nextElementSibling);
            return element;
          }
        }
      },
      editor: {
        get: function() {
          var ref;
          return (ref = this.editorController) != null ? ref.editor : void 0;
        }
      },
      name: {
        get: function() {
          var ref;
          return (ref = this.inputElement) != null ? ref.name : void 0;
        }
      },
      value: {
        get: function() {
          var ref;
          return (ref = this.inputElement) != null ? ref.value : void 0;
        },
        set: function(defaultValue) {
          var ref;
          this.defaultValue = defaultValue;
          return (ref = this.editor) != null ? ref.loadHTML(this.defaultValue) : void 0;
        }
      },
      // Controller delegate methods
      notify: function(message, data) {
        if (this.editorController) {
          return triggerEvent(`trix-${message}`, {
            onElement: this,
            attributes: data
          });
        }
      },
      setInputElementValue: function(value) {
        var ref;
        return (ref = this.inputElement) != null ? ref.value = value : void 0;
      },
      // Element lifecycle
      initialize: function() {
        if (!this.hasAttribute("data-trix-internal")) {
          makeEditable(this);
          addAccessibilityRole(this);
          return ensureAriaLabel(this);
        }
      },
      connect: function() {
        if (!this.hasAttribute("data-trix-internal")) {
          if (!this.editorController) {
            triggerEvent("trix-before-initialize", {
              onElement: this
            });
            this.editorController = new Trix$2.EditorController({
              editorElement: this,
              html: this.defaultValue = this.value
            });
            requestAnimationFrame(() => {
              return triggerEvent("trix-initialize", {
                onElement: this
              });
            });
          }
          this.editorController.registerSelectionManager();
          this.registerResetListener();
          this.registerClickListener();
          return autofocus(this);
        }
      },
      disconnect: function() {
        var ref;
        if ((ref = this.editorController) != null) {
          ref.unregisterSelectionManager();
        }
        this.unregisterResetListener();
        return this.unregisterClickListener();
      },
      // Form support
      registerResetListener: function() {
        this.resetListener = this.resetBubbled.bind(this);
        return window.addEventListener("reset", this.resetListener, false);
      },
      unregisterResetListener: function() {
        return window.removeEventListener("reset", this.resetListener, false);
      },
      registerClickListener: function() {
        this.clickListener = this.clickBubbled.bind(this);
        return window.addEventListener("click", this.clickListener, false);
      },
      unregisterClickListener: function() {
        return window.removeEventListener("click", this.clickListener, false);
      },
      resetBubbled: function(event) {
        if (event.defaultPrevented) {
          return;
        }
        if (event.target !== this.form) {
          return;
        }
        return this.reset();
      },
      clickBubbled: function(event) {
        var label;
        if (event.defaultPrevented) {
          return;
        }
        if (this.contains(event.target)) {
          return;
        }
        if (!(label = findClosestElementFromNode(event.target, {
          matchingSelector: "label"
        }))) {
          return;
        }
        if (indexOf.call(this.labels, label) < 0) {
          return;
        }
        return this.focus();
      },
      reset: function() {
        return this.value = this.defaultValue;
      }
    };
  })());

  return Trix$2;

})));
