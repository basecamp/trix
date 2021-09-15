/*
Trix 2.0.0-alpha
Copyright © 2021 Basecamp, LLC
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var name$2 = "trix";
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
  	name: name$2,
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

  var html, match, ref$a, ref1, ref2,
    indexOf$b = [].indexOf;

  html = document.documentElement;

  match = (ref$a = (ref1 = (ref2 = html.matchesSelector) != null ? ref2 : html.webkitMatchesSelector) != null ? ref1 : html.msMatchesSelector) != null ? ref$a : html.mozMatchesSelector;

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
      return (ref3 = Trix$2.tagName(node), indexOf$b.call(Trix$2.getBlockTagNames(), ref3) >= 0) && (ref4 = Trix$2.tagName(node.firstChild), indexOf$b.call(Trix$2.getBlockTagNames(), ref4) < 0);
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

  var copyObject, copyValue, normalizeRange$5, objectsAreEqual$4, rangeValuesAreEqual;

  ({copyObject, objectsAreEqual: objectsAreEqual$4} = Trix$2);

  Trix$2.extend({
    normalizeRange: normalizeRange$5 = function(range) {
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
      [start, end] = normalizeRange$5(range);
      return rangeValuesAreEqual(start, end);
    },
    rangesAreEqual: function(leftRange, rightRange) {
      var leftEnd, leftStart, rightEnd, rightStart;
      if (!((leftRange != null) && (rightRange != null))) {
        return;
      }
      [leftStart, leftEnd] = normalizeRange$5(leftRange);
      [rightStart, rightEnd] = normalizeRange$5(rightRange);
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

  var indexOf$a = [].indexOf;

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
          if (indexOf$a.call(objectKeys, key) < 0) {
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

  var css$3, htmlContainsTagName, makeElement$8;

  ({makeElement: makeElement$8} = Trix$2);

  ({css: css$3} = Trix$2.config);

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
              class: css$3.attachmentProgress,
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
          className: css$3.attachmentCaption
        });
        if (caption = this.attachmentPiece.getCaption()) {
          figcaption.classList.add(`${css$3.attachmentCaption}--edited`);
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
              className: css$3.attachmentName,
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
              className: css$3.attachmentSize,
              textContent: size
            });
            figcaption.appendChild(sizeElement);
          }
        }
        return figcaption;
      }

      getClassName() {
        var extension, names;
        names = [css$3.attachment, `${css$3.attachment}--${this.attachment.getType()}`];
        if (extension = this.attachment.getExtension()) {
          names.push(`${css$3.attachment}--${extension}`);
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

  var css$2, getBlockConfig$4, makeElement$5;

  ({makeElement: makeElement$5, getBlockConfig: getBlockConfig$4} = Trix$2);

  ({css: css$2} = Trix$2.config);

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
        className = `${css$2.attachmentGallery} ${css$2.attachmentGallery}--${size}`;
      }
      return makeElement$5({tagName, className, attributes});
    }

    // A single <br> at the end of a block element has no visual representation
    // so add an extra one.
    shouldAddExtraNewlineElement() {
      return /\n\n$/.test(this.block.toString());
    }

  };

  var defer$f, makeElement$4;

  ({defer: defer$f, makeElement: makeElement$4} = Trix$2);

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
        return defer$f(() => {
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

  var findClosestElementFromNode$4, nodeIsBlockStartComment$1, nodeIsEmptyTextNode$1, normalizeSpaces$1, ref$9, summarizeStringChange, tagName$5,
    boundMethodCheck$7 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf$9 = [].indexOf,
    slice$2 = [].slice;

  ({findClosestElementFromNode: findClosestElementFromNode$4, nodeIsEmptyTextNode: nodeIsEmptyTextNode$1, nodeIsBlockStartComment: nodeIsBlockStartComment$1, normalizeSpaces: normalizeSpaces$1, summarizeStringChange, tagName: tagName$5} = Trix$2);

  ref$9 = Trix$2.MutationObserver = (function() {
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
        boundMethodCheck$7(this, ref$9);
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
          if (indexOf$9.call(additions, addition) < 0) {
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

  var getDOMRange$2, ref$8,
    indexOf$8 = [].indexOf,
    boundMethodCheck$6 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({getDOMRange: getDOMRange$2} = Trix$2);

  ref$8 = Trix$2.SelectionChangeObserver = (function() {
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
        if (indexOf$8.call(this.selectionManagers, selectionManager) < 0) {
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
        boundMethodCheck$6(this, ref$8);
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
        boundMethodCheck$6(this, ref$8);
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

  var CompositionInput, browser$2, dataTransferIsPlainText$1, dataTransferIsWritable, extensionForFile, hasStringCodePointAt, keyEventIsKeyboardCommand$1, keyNames$1, makeElement$3, objectsAreEqual$3, pasteEventIsCrippledSafariHTMLPaste, stringFromKeyEvent, tagName$4,
    indexOf$7 = [].indexOf;

  ({makeElement: makeElement$3, objectsAreEqual: objectsAreEqual$3, tagName: tagName$4, browser: browser$2, keyEventIsKeyboardCommand: keyEventIsKeyboardCommand$1, dataTransferIsWritable, dataTransferIsPlainText: dataTransferIsPlainText$1} = Trix$2);

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
        } else if (indexOf$7.call(clipboard.types, "Files") >= 0) {
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
      if (indexOf$7.call(paste.types, "text/html") >= 0) {
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
        isExternalHTMLPaste = indexOf$7.call(paste.types, "com.apple.webarchive") >= 0;
        isExternalRichTextPaste = indexOf$7.call(paste.types, "com.apple.flat-rtfd") >= 0;
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
        if (browser$2.composesExistingText) {
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

  var dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual$2, ref$7,
    boundMethodCheck$5 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf$6 = [].indexOf;

  ({dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual: objectsAreEqual$2} = Trix$2);

  ref$7 = Trix$2.Level2InputController = (function() {
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
        boundMethodCheck$5(this, ref$7);
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
        if (indexOf$6.call(Trix$2.getAllAttributeNames(), attributeName) >= 0) {
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
        if (indexOf$6.call(Trix$2.getAllAttributeNames(), attributeName) >= 0) {
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
      return indexOf$6.call((ref1 = (ref2 = event.dataTransfer) != null ? ref2.types : void 0) != null ? ref1 : [], "Files") >= 0;
    };

    pasteEventHasFilesOnly = function(event) {
      var clipboard;
      if (clipboard = event.clipboardData) {
        return indexOf$6.call(clipboard.types, "Files") >= 0 && clipboard.types.length === 1 && clipboard.files.length >= 1;
      }
    };

    pasteEventHasPlainTextOnly = function(event) {
      var clipboard;
      if (clipboard = event.clipboardData) {
        return indexOf$6.call(clipboard.types, "text/plain") >= 0 && clipboard.types.length === 1;
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

  var css$1, defer$e, handleEvent$4, keyNames, lang, makeElement$2, ref$6, tagName$3,
    boundMethodCheck$4 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({defer: defer$e, handleEvent: handleEvent$4, makeElement: makeElement$2, tagName: tagName$3} = Trix$2);

  ({lang, css: css$1, keyNames} = Trix$2.config);

  ref$6 = Trix$2.AttachmentEditorController = (function() {
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
        boundMethodCheck$4(this, ref$6);
        event.preventDefault();
        return event.stopPropagation();
      }

      didClickActionButton(event) {
        var action, ref1;
        boundMethodCheck$4(this, ref$6);
        action = event.target.getAttribute("data-trix-action");
        switch (action) {
          case "remove":
            return (ref1 = this.delegate) != null ? ref1.attachmentEditorDidRequestRemovalOfAttachment(this.attachment) : void 0;
        }
      }

      didKeyDownCaption(event) {
        var ref1;
        boundMethodCheck$4(this, ref$6);
        if (keyNames[event.keyCode] === "return") {
          event.preventDefault();
          this.savePendingCaption();
          return (ref1 = this.delegate) != null ? typeof ref1.attachmentEditorDidRequestDeselectingAttachment === "function" ? ref1.attachmentEditorDidRequestDeselectingAttachment(this.attachment) : void 0 : void 0;
        }
      }

      didInputCaption(event) {
        boundMethodCheck$4(this, ref$6);
        return this.pendingCaption = event.target.value.replace(/\s/g, " ").trim();
      }

      didChangeCaption(event) {
        boundMethodCheck$4(this, ref$6);
        return this.savePendingCaption();
      }

      didBlurCaption(event) {
        boundMethodCheck$4(this, ref$6);
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
        className: css$1.attachmentToolbar,
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
          className: css$1.attachmentMetadataContainer,
          childNodes: makeElement$2({
            tagName: "span",
            className: css$1.attachmentMetadata,
            childNodes: [
              makeElement$2({
                tagName: "span",
                className: css$1.attachmentName,
                textContent: this.attachment.getFilename(),
                attributes: {
                  title: this.attachment.getFilename()
                }
              }),
              makeElement$2({
                tagName: "span",
                className: css$1.attachmentSize,
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
        className: css$1.attachmentCaptionEditor,
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
          editingFigcaption.classList.add(`${css$1.attachmentCaption}--editing`);
          figcaption.parentElement.insertBefore(editingFigcaption, figcaption);
          autoresize();
          if (this.options.editCaption) {
            return defer$e(function() {
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

  var attachmentSelector$1, defer$d, findClosestElementFromNode$3, handleEvent$3, innerElementIsActive$1, ref$5,
    boundMethodCheck$3 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({findClosestElementFromNode: findClosestElementFromNode$3, handleEvent: handleEvent$3, innerElementIsActive: innerElementIsActive$1, defer: defer$d} = Trix$2);

  ({attachmentSelector: attachmentSelector$1} = Trix$2.AttachmentView);

  ref$5 = Trix$2.CompositionController = class CompositionController extends Trix$2.BasicObject {
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
      boundMethodCheck$3(this, ref$5);
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
      boundMethodCheck$3(this, ref$5);
      return this.blurPromise = new Promise((resolve) => {
        return defer$d(() => {
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
      boundMethodCheck$3(this, ref$5);
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

  var findClosestElementFromNode$2, handleEvent$2, ref$4, triggerEvent$b,
    boundMethodCheck$2 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({handleEvent: handleEvent$2, triggerEvent: triggerEvent$b, findClosestElementFromNode: findClosestElementFromNode$2} = Trix$2);

  ref$4 = Trix$2.ToolbarController = (function() {
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
        boundMethodCheck$2(this, ref$4);
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
        boundMethodCheck$2(this, ref$4);
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
        boundMethodCheck$2(this, ref$4);
        dialogElement = findClosestElementFromNode$2(element, {
          matchingSelector: dialogSelector
        });
        method = element.getAttribute("data-trix-method");
        return this[method].call(this, dialogElement);
      }

      didKeyDownDialogInput(event, element) {
        var attribute, dialog;
        boundMethodCheck$2(this, ref$4);
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
            triggerEvent$b("mousedown", {
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

  var ref$3,
    boundMethodCheck$1 = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ref$3 = Trix$2.Attachment = (function() {
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
        boundMethodCheck$1(this, ref$3);
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
    indexOf$5 = [].indexOf,
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
        return indexOf$5.call(this.attributes, attributeName) >= 0;
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
        return attribute === otherAttribute && !(getBlockConfig$3(attribute).group === false && (ref = otherAttributes[depth + 1], indexOf$5.call(getListAttributeNames(), ref) < 0)) && (this.getDirection() === otherBlock.getDirection() || otherBlock.isEmpty());
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
    indexOf$4 = [].indexOf;

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
          if (ref = element.protocol, indexOf$4.call(this.forbiddenProtocols, ref) >= 0) {
            element.removeAttribute("href");
          }
        }
        ref1 = [...element.attributes];
        for (i = 0, len = ref1.length; i < len; i++) {
          ({name} = ref1[i]);
          if (!(indexOf$4.call(this.allowedAttributes, name) >= 0 || name.indexOf("data-trix") === 0)) {
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
        return ref = tagName$2(element), indexOf$4.call(this.forbiddenElements, ref) >= 0;
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
    indexOf$3 = [].indexOf;

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
          if (this.isBlockElement(parentElement) && indexOf$3.call(this.blockElements, parentElement) >= 0) {
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
          if (ref = tagName$1(element), indexOf$3.call(getBlockTagNames(), ref) >= 0) {
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
        return (ref = tagName$1(element), indexOf$3.call(getBlockTagNames(), ref) >= 0) || window.getComputedStyle(element).display === "block";
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
            if (!((ref = tagName$1(element), indexOf$3.call(getBlockTagNames(), ref) >= 0) || indexOf$3.call(this.processedElements, element) >= 0)) {
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

  var arraysAreEqual, getBlockConfig$2, normalizeRange$4, rangeIsCollapsed$4,
    slice$1 = [].slice,
    indexOf$2 = [].indexOf;

  ({arraysAreEqual, normalizeRange: normalizeRange$4, rangeIsCollapsed: rangeIsCollapsed$4, getBlockConfig: getBlockConfig$2} = Trix$2);

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
        [position] = range = normalizeRange$4(range);
        ({index, offset} = this.locationFromPosition(position));
        result = this;
        block = this.getBlockAtPosition(position);
        if (rangeIsCollapsed$4(range) && block.isEmpty() && !block.hasAttributes()) {
          result = new this.constructor(result.blockList.removeObjectAtIndex(index));
        } else if (block.getBlockBreakPosition() === offset) {
          position++;
        }
        result = result.removeTextAtRange(range);
        return new this.constructor(result.blockList.insertSplittableListAtPosition(blockList, position));
      }

      mergeDocumentAtRange(document, range) {
        var baseBlockAttributes, blockAttributes, blockCount, firstBlock, firstText, formattedDocument, leadingBlockAttributes, position, result, startLocation, startPosition, trailingBlockAttributes;
        [startPosition] = range = normalizeRange$4(range);
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
        [startPosition] = range = normalizeRange$4(range);
        ({index, offset} = this.locationFromPosition(startPosition));
        document = this.removeTextAtRange(range);
        return new this.constructor(document.blockList.editObjectAtIndex(index, function(block) {
          return block.copyWithText(block.text.insertTextAtPosition(text, offset));
        }));
      }

      removeTextAtRange(range) {
        var affectedBlockCount, block, blocks, leftBlock, leftIndex, leftLocation, leftOffset, leftPosition, leftText, removeRightNewline, removingLeftBlock, rightBlock, rightIndex, rightLocation, rightOffset, rightPosition, rightText, text, useRightBlock;
        [leftPosition, rightPosition] = range = normalizeRange$4(range);
        if (rangeIsCollapsed$4(range)) {
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
        [startPosition, endPosition] = range = normalizeRange$4(range);
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
        [startPosition] = range = normalizeRange$4(range);
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
        [startPosition, endPosition] = range = normalizeRange$4(range);
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
        range = normalizeRange$4([startPosition, endPosition]);
        return {document, range};
      }

      convertLineBreaksToBlockBreaksInRange(range) {
        var document, position, string;
        [position] = range = normalizeRange$4(range);
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
        [startPosition, endPosition] = range = normalizeRange$4(range);
        startIndex = this.locationFromPosition(startPosition).index;
        endIndex = this.locationFromPosition(endPosition).index;
        return new this.constructor(this.blockList.consolidateFromIndexToIndex(startIndex, endIndex));
      }

      getDocumentAtRange(range) {
        var blocks;
        range = normalizeRange$4(range);
        blocks = this.blockList.getSplittableListInRange(range).toArray();
        return new this.constructor(blocks);
      }

      getStringAtRange(range) {
        var endIndex, endPosition, ref;
        ref = range = normalizeRange$4(range), [endPosition] = slice$1.call(ref, -1);
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
        [startPosition, endPosition] = range = normalizeRange$4(range);
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
        [startPosition] = range = normalizeRange$4(range);
        if (rangeIsCollapsed$4(range)) {
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
          if (value === attributes[key] || indexOf$2.call(inheritableAttributes, key) >= 0) {
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
        return normalizeRange$4([start, end]);
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
            return normalizeRange$4([position + textRange[0], position + textRange[1]]);
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
        return normalizeRange$4(this.locationFromPosition(position));
      }

      locationRangeFromRange(range) {
        var endLocation, endPosition, startLocation, startPosition;
        if (!(range = normalizeRange$4(range))) {
          return;
        }
        [startPosition, endPosition] = range;
        startLocation = this.locationFromPosition(startPosition);
        endLocation = this.locationFromPosition(endPosition);
        return normalizeRange$4([startLocation, endLocation]);
      }

      rangeFromLocationRange(locationRange) {
        var leftPosition, rightPosition;
        locationRange = normalizeRange$4(locationRange);
        leftPosition = this.positionFromLocation(locationRange[0]);
        if (!rangeIsCollapsed$4(locationRange)) {
          rightPosition = this.positionFromLocation(locationRange[1]);
        }
        return normalizeRange$4([leftPosition, rightPosition]);
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

  var arrayStartsWith, extend, getAllAttributeNames, getBlockConfig$1, getTextConfig, normalizeRange$3, objectsAreEqual$1, rangeIsCollapsed$3, rangesAreEqual$3, summarizeArrayChange;

  ({normalizeRange: normalizeRange$3, rangesAreEqual: rangesAreEqual$3, rangeIsCollapsed: rangeIsCollapsed$3, objectsAreEqual: objectsAreEqual$1, arrayStartsWith, summarizeArrayChange, getAllAttributeNames, getBlockConfig: getBlockConfig$1, getTextConfig, extend} = Trix$2);

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
        if (rangeIsCollapsed$3(locationRange)) {
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
        selectionIsCollapsed = rangeIsCollapsed$3(range);
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
        return (ref = (ref1 = this.targetLocationRange) != null ? ref1 : this.getSelectionManager().getLocationRange(options)) != null ? ref : normalizeRange$3({
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
        return normalizeRange$3([startPosition, endPosition]);
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
          canEditAttachment = !rangesAreEqual$3(selectedRange, range);
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

  var elementContainsNode, getDOMRange, getDOMSelection, handleEvent$1, innerElementIsActive, nodeIsCursorTarget, normalizeRange$2, rangeIsCollapsed$2, rangesAreEqual$2, ref$2, setDOMRange,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({getDOMSelection, getDOMRange, setDOMRange, elementContainsNode, nodeIsCursorTarget, innerElementIsActive, handleEvent: handleEvent$1, normalizeRange: normalizeRange$2, rangeIsCollapsed: rangeIsCollapsed$2, rangesAreEqual: rangesAreEqual$2} = Trix$2);

  ref$2 = Trix$2.SelectionManager = (function() {
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
        locationRange = normalizeRange$2(locationRange);
        if (domRange = this.createDOMRangeFromLocationRange(locationRange)) {
          setDOMRange(domRange);
          return this.updateCurrentLocationRange(locationRange);
        }
      }

      setLocationRangeFromPointRange(pointRange) {
        var endLocation, startLocation;
        pointRange = normalizeRange$2(pointRange);
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
        return normalizeRange$2([start, end]);
      }

      didMouseDown() {
        boundMethodCheck(this, ref$2);
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
        boundMethodCheck(this, ref$2);
        if (!(this.paused || innerElementIsActive(this.element))) {
          return this.updateCurrentLocationRange();
        }
      }

      updateCurrentLocationRange(locationRange) {
        var ref1;
        if (locationRange != null ? locationRange : locationRange = this.createLocationRangeFromDOMRange(getDOMRange())) {
          if (!rangesAreEqual$2(locationRange, this.currentLocationRange)) {
            this.currentLocationRange = locationRange;
            return (ref1 = this.delegate) != null ? typeof ref1.locationRangeDidChange === "function" ? ref1.locationRangeDidChange(this.currentLocationRange.slice(0)) : void 0 : void 0;
          }
        }
      }

      createDOMRangeFromLocationRange(locationRange) {
        var domRange, rangeEnd, rangeStart, ref1;
        rangeStart = this.findContainerAndOffsetFromLocation(locationRange[0]);
        rangeEnd = rangeIsCollapsed$2(locationRange) ? rangeStart : (ref1 = this.findContainerAndOffsetFromLocation(locationRange[1])) != null ? ref1 : rangeStart;
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

  var getBlockConfig, objectsAreEqual, rangeIsCollapsed$1, rangesAreEqual$1;

  ({rangeIsCollapsed: rangeIsCollapsed$1, rangesAreEqual: rangesAreEqual$1, objectsAreEqual, getBlockConfig} = Trix$2);

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
        if (this.attachmentLocationRange && !rangesAreEqual$1(this.attachmentLocationRange, locationRange)) {
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
        if (blockConfig || !rangeIsCollapsed$1(locationRange)) {
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
        if (rangeIsCollapsed$1(locationRange)) {
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
      return rangesAreEqual$1(a.selectedRange, b.selectedRange) && a.document.isEqualTo(b.document);
    };

    return EditorController;

  }).call(window);

  var attachmentSelector, browser$1, findClosestElementFromNode, handleEvent, handleEventOnce, makeElement, triggerEvent$a,
    indexOf$1 = [].indexOf;

  ({browser: browser$1, makeElement, triggerEvent: triggerEvent$a, handleEvent, handleEventOnce, findClosestElementFromNode} = Trix$2);

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
      if (browser$1.forcesObjectResizing) {
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
          return triggerEvent$a(`trix-${message}`, {
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
            triggerEvent$a("trix-before-initialize", {
              onElement: this
            });
            this.editorController = new Trix$2.EditorController({
              editorElement: this,
              html: this.defaultValue = this.value
            });
            requestAnimationFrame(() => {
              return triggerEvent$a("trix-initialize", {
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
        if (indexOf$1.call(this.labels, label) < 0) {
          return;
        }
        return this.focus();
      },
      reset: function() {
        return this.value = this.defaultValue;
      }
    };
  })());

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  // Explicitly require this file (not included in the main
  // Trix bundle) to install the following global helpers.
  commonjsGlobal.getEditorElement = function() {
    return document.querySelector("trix-editor");
  };

  commonjsGlobal.getToolbarElement = function() {
    return getEditorElement().toolbarElement;
  };

  commonjsGlobal.getEditorController = function() {
    return getEditorElement().editorController;
  };

  commonjsGlobal.getEditor = function() {
    return getEditorController().editor;
  };

  commonjsGlobal.getComposition = function() {
    return getEditorController().composition;
  };

  commonjsGlobal.getDocument = function() {
    return getComposition().document;
  };

  commonjsGlobal.getSelectionManager = function() {
    return getEditorController().selectionManager;
  };

  var global$1 = {

  };

  var helpers$5, ready, removeNode, setFixtureHTML;

  ({removeNode} = Trix$2);

  Trix$2.TestHelpers = helpers$5 = {
    extend: function(properties) {
      var key, value;
      for (key in properties) {
        value = properties[key];
        this[key] = value;
      }
      return this;
    },
    after: function(delay, callback) {
      return setTimeout(callback, delay);
    },
    defer: function(callback) {
      return helpers$5.after(1, callback);
    }
  };

  setFixtureHTML = function(html, container = "form") {
    var element;
    element = document.getElementById("trix-container");
    if (element != null) {
      removeNode(element);
    }
    element = document.createElement(container);
    element.id = "trix-container";
    element.innerHTML = html;
    return document.body.insertAdjacentElement("afterbegin", element);
  };

  ready = null;

  helpers$5.extend({
    testGroup: function(name, options, callback) {
      var afterEach, beforeEach, container, setup, teardown, template;
      if (callback != null) {
        ({container, template, setup, teardown} = options);
      } else {
        callback = options;
      }
      beforeEach = function() {
        // Ensure window is active on CI so focus and blur events are natively dispatched
        window.focus();
        ready = function(callback) {
          var handler;
          if (template != null) {
            addEventListener("trix-initialize", handler = function({target}) {
              removeEventListener("trix-initialize", handler);
              if (target.hasAttribute("autofocus")) {
                target.editor.setSelectedRange(0);
              }
              return callback(target);
            });
            return setFixtureHTML(JST[`test/test_helpers/fixtures/${template}`](), container);
          } else {
            return callback();
          }
        };
        return typeof setup === "function" ? setup() : void 0;
      };
      afterEach = function() {
        if (template != null) {
          setFixtureHTML("");
        }
        return typeof teardown === "function" ? teardown() : void 0;
      };
      if (callback != null) {
        return QUnit.module(name, function(hooks) {
          hooks.beforeEach(beforeEach);
          hooks.afterEach(afterEach);
          return callback();
        });
      } else {
        return QUnit.module(name, {beforeEach, afterEach});
      }
    },
    test: function(name, callback) {
      return QUnit.test(name, function(assert) {
        var doneAsync;
        doneAsync = assert.async();
        return ready(function(element) {
          var done;
          done = function(expectedDocumentValue) {
            if (element != null) {
              if (expectedDocumentValue) {
                assert.equal(element.editor.getDocument().toString(), expectedDocumentValue);
              }
              return requestAnimationFrame(doneAsync);
            } else {
              return doneAsync();
            }
          };
          if (callback.length === 0) {
            callback();
            return done();
          } else {
            return callback(done);
          }
        });
      });
    },
    testIf: function(condition, ...args) {
      if (condition) {
        return helpers$5.test(...args);
      } else {
        return helpers$5.skip(...args);
      }
    },
    skip: QUnit.skip
  });

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_default_aria_label"] = () => {
    return `<trix-editor id="editor-without-labels"></trix-editor>

<label for="editor-with-aria-label"><span>Label text</span></label>
<trix-editor id="editor-with-aria-label" aria-label="ARIA Label text"></trix-editor>

<span id="aria-labelledby-id">ARIA Labelledby</span>
<label for="editor-with-aria-labelledby"><span>Label text</span></label>
<trix-editor id="editor-with-aria-labelledby" aria-labelledby="aria-labelledby-id"></trix-editor>

<label for="editor-with-labels"><span>Label 1</span></label>
<label for="editor-with-labels"><span>Label 2</span></label>
<label for="editor-with-labels"><span>Label 3</span></label>
<label>
  <span>Label 4</span>
  <trix-editor id="editor-with-labels"></trix-editor>
</label>

<label id="modified-label" for="editor-with-modified-label">Original Value</label>
<trix-editor id="editor-with-modified-label"></trix-editor>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_empty"] = () => {
    return `<trix-editor autofocus placeholder="Say hello..."></trix-editor>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_html"] = () => {
    return `<input id="my_input" type="hidden" value="&lt;div&gt;Hello world&lt;/div&gt;">
<trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>
`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_in_table"] = () => {
    return `<table>
  <tr>
    <td>
      <trix-editor></trix-editor>
    </td>
  </tr>
</table>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_block_styles"] = () => {
    return `<style type="text/css">
  blockquote { font-style: italic; }
  li { font-weight: bold; }
</style>

<trix-editor class="trix-content"></trix-editor>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_bold_styles"] = () => {
    return `<style type="text/css">
  strong { font-weight: 500; }
  span { font-weight: 600; }
  article { font-weight: bold; }
</style>

<trix-editor class="trix-content"></trix-editor>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_image"] = () => {
    return `<trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>
<input id="my_input" type="hidden" value="ab&lt;img src=&quot;${TEST_IMAGE_URL}&quot; width=&quot;10&quot; height=&quot;10&quot;&gt;">`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_labels"] = () => {
    return `<label id="label-1" for="editor"><span>Label 1</span></label>
<label id="label-2">
  Label 2
  <trix-editor id="editor"></trix-editor>
</label>
<label id="label-3" for="editor">Label 3</label>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_styled_content"] = () => {
    return `<style type="text/css">
  .trix-content figure.attachment {
    display: inline-block;
  }
</style>

<trix-editor class="trix-content"></trix-editor>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editor_with_toolbar_and_input"] = () => {
    return `<ul id="my_editor">
  <li><trix-toolbar id="my_toolbar"></trix-toolbar></li>
  <li><trix-editor toolbar="my_toolbar" input="my_input" autofocus placeholder="Say hello..."></trix-editor></li>
  <li><input id="my_input" type="hidden" value="&lt;div&gt;Hello world&lt;/div&gt;"></li>
</ul>`;
  };

  window.JST || (window.JST = {});

  window.JST["test/test_helpers/fixtures/editors_with_forms"] = () => {
    return `<form id="ancestor-form">
  <trix-editor id="editor-with-ancestor-form"></trix-editor>
</form>

<form id="input-form">
  <input type="hidden" id="hidden-input">
</form>
<trix-editor id="editor-with-input-form" input="hidden-input"></trix-editor>

<trix-editor id="editor-with-no-form"></trix-editor>`;
  };

  var blockComment, createCursorTarget$1, createDocument, css, cursorTargetLeft$1, cursorTargetRight$1, removeWhitespace;

  ({css} = Trix.config);

  window.TEST_IMAGE_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";

  createDocument = function(...parts) {
    var blockAttributes, blocks, part, string, text, textAttributes;
    blocks = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = parts.length; i < len; i++) {
        part = parts[i];
        [string, textAttributes, blockAttributes] = part;
        text = Trix.Text.textForStringWithAttributes(string, textAttributes);
        results.push(new Trix.Block(text, blockAttributes));
      }
      return results;
    })();
    return new Trix.Document(blocks);
  };

  Trix.TestHelpers.createCursorTarget = createCursorTarget$1 = function(name) {
    return Trix.makeElement({
      tagName: "span",
      textContent: Trix.ZERO_WIDTH_SPACE,
      data: {
        trixCursorTarget: name,
        trixSerialize: false
      }
    });
  };

  cursorTargetLeft$1 = createCursorTarget$1("left").outerHTML;

  cursorTargetRight$1 = createCursorTarget$1("right").outerHTML;

  blockComment = "<!--block-->";

  removeWhitespace = function(string) {
    return string.replace(/\s/g, "");
  };

  window.fixtures = {
    "bold text": {
      document: createDocument([
        "abc",
        {
          bold: true
        }
      ]),
      html: `<div>${blockComment}<strong>abc</strong></div>`,
      serializedHTML: "<div><strong>abc</strong></div>"
    },
    "bold, italic text": {
      document: createDocument([
        "abc",
        {
          bold: true,
          italic: true
        }
      ]),
      html: `<div>${blockComment}<strong><em>abc</em></strong></div>`
    },
    "text with newline": {
      document: createDocument(["ab\nc"]),
      html: `<div>${blockComment}ab<br>c</div>`
    },
    "text with link": {
      document: createDocument([
        "abc",
        {
          href: "http://example.com"
        }
      ]),
      html: `<div>${blockComment}<a href="http://example.com">abc</a></div>`
    },
    "text with link and formatting": {
      document: createDocument([
        "abc",
        {
          italic: true,
          href: "http://example.com"
        }
      ]),
      html: `<div>${blockComment}<a href="http://example.com"><em>abc</em></a></div>`
    },
    "partially formatted link": {
      document: new Trix.Document([
        new Trix.Block(new Trix.Text([
          new Trix.StringPiece("ab",
          {
            href: "http://example.com"
          }),
          new Trix.StringPiece("c",
          {
            href: "http://example.com",
            italic: true
          })
        ]))
      ]),
      html: `<div>${blockComment}<a href="http://example.com">ab<em>c</em></a></div>`
    },
    "spaces 1": {
      document: createDocument([" a"]),
      html: `<div>${blockComment}&nbsp;a</div>`
    },
    "spaces 2": {
      document: createDocument(["  a"]),
      html: `<div>${blockComment}&nbsp; a</div>`
    },
    "spaces 3": {
      document: createDocument(["   a"]),
      html: `<div>${blockComment}&nbsp; &nbsp;a</div>`
    },
    "spaces 4": {
      document: createDocument([" a "]),
      html: `<div>${blockComment}&nbsp;a&nbsp;</div>`
    },
    "spaces 5": {
      document: createDocument(["a  b"]),
      html: `<div>${blockComment}a&nbsp; b</div>`
    },
    "spaces 6": {
      document: createDocument(["a   b"]),
      html: `<div>${blockComment}a &nbsp; b</div>`
    },
    "spaces 7": {
      document: createDocument(["a    b"]),
      html: `<div>${blockComment}a&nbsp; &nbsp; b</div>`
    },
    "spaces 8": {
      document: createDocument(["a b "]),
      html: `<div>${blockComment}a b&nbsp;</div>`
    },
    "spaces 9": {
      document: createDocument(["a b c"]),
      html: `<div>${blockComment}a b c</div>`
    },
    "spaces 10": {
      document: createDocument(["a "]),
      html: `<div>${blockComment}a&nbsp;</div>`
    },
    "spaces 11": {
      document: createDocument(["a  "]),
      html: `<div>${blockComment}a &nbsp;</div>`
    },
    "spaces and formatting": {
      document: new Trix.Document([
        new Trix.Block(new Trix.Text([
          new Trix.StringPiece(" a "),
          new Trix.StringPiece("b",
          {
            href: "http://b.com"
          }),
          new Trix.StringPiece(" "),
          new Trix.StringPiece("c",
          {
            bold: true
          }),
          new Trix.StringPiece(" d"),
          new Trix.StringPiece(" e ",
          {
            italic: true
          }),
          new Trix.StringPiece(" f  ")
        ]))
      ]),
      html: `<div>${blockComment}&nbsp;a <a href="http://b.com">b</a> <strong>c</strong> d<em> e </em>&nbsp;f &nbsp;</div>`
    },
    "quote formatted block": {
      document: createDocument(["abc", {}, ["quote"]]),
      html: `<blockquote>${blockComment}abc</blockquote>`
    },
    "code formatted block": {
      document: createDocument(["123", {}, ["code"]]),
      html: `<pre>${blockComment}123</pre>`
    },
    "code with newline": {
      document: createDocument(["12\n3", {}, ["code"]]),
      html: `<pre>${blockComment}12\n3</pre>`
    },
    "multiple blocks with block comments in their text": {
      document: createDocument([`a${blockComment}b`, {}, ["quote"]], [`${blockComment}c`, {}, ["code"]]),
      html: `<blockquote>${blockComment}a&lt;!--block--&gt;b</blockquote><pre>${blockComment}&lt;!--block--&gt;c</pre>`,
      serializedHTML: "<blockquote>a&lt;!--block--&gt;b</blockquote><pre>&lt;!--block--&gt;c</pre>"
    },
    "unordered list with one item": {
      document: createDocument(["a", {}, ["bulletList", "bullet"]]),
      html: `<ul><li>${blockComment}a</li></ul>`
    },
    "unordered list with bold text": {
      document: createDocument([
        "a",
        {
          bold: true
        },
        ["bulletList",
        "bullet"]
      ]),
      html: `<ul><li>${blockComment}<strong>a</strong></li></ul>`
    },
    "unordered list with partially formatted text": {
      document: new Trix.Document([
        new Trix.Block(new Trix.Text([
          new Trix.StringPiece("a"),
          new Trix.StringPiece("b",
          {
            italic: true
          })
        ]),
        ["bulletList",
        "bullet"])
      ]),
      html: `<ul><li>${blockComment}a<em>b</em></li></ul>`
    },
    "unordered list with two items": {
      document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["bulletList", "bullet"]]),
      html: `<ul><li>${blockComment}a</li><li>${blockComment}b</li></ul>`
    },
    "unordered list surrounded by unformatted blocks": {
      document: createDocument(["a"], ["b", {}, ["bulletList", "bullet"]], ["c"]),
      html: `<div>${blockComment}a</div><ul><li>${blockComment}b</li></ul><div>${blockComment}c</div>`
    },
    "ordered list": {
      document: createDocument(["a", {}, ["numberList", "number"]]),
      html: `<ol><li>${blockComment}a</li></ol>`
    },
    "ordered list and an unordered list": {
      document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["numberList", "number"]]),
      html: `<ul><li>${blockComment}a</li></ul><ol><li>${blockComment}b</li></ol>`
    },
    "empty block with attributes": {
      document: createDocument(["", {}, ["quote"]]),
      html: `<blockquote>${blockComment}<br></blockquote>`
    },
    "image attachment": (function() {
      var attachment, attribute, attrs, caption, element, figure, i, image, j, len, len1, ref, ref1, serializedFigure, text;
      attrs = {
        url: TEST_IMAGE_URL,
        filename: "example.png",
        filesize: 98203,
        contentType: "image/png",
        width: 1,
        height: 1
      };
      attachment = new Trix.Attachment(attrs);
      text = Trix.Text.textForAttachmentWithAttributes(attachment);
      image = Trix.makeElement("img", {
        src: attrs.url,
        "data-trix-mutable": true,
        width: 1,
        height: 1
      });
      image.dataset.trixStoreKey = ["imageElement", attachment.id, image.src, image.width, image.height].join("/");
      caption = Trix.makeElement({
        tagName: "figcaption",
        className: css.attachmentCaption
      });
      caption.innerHTML = `<span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">95.9 KB</span>`;
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--preview attachment--png",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: "image/png",
          trixId: attachment.id
        }
      });
      figure.setAttribute("contenteditable", false);
      figure.appendChild(image);
      figure.appendChild(caption);
      serializedFigure = figure.cloneNode(true);
      ref = ["data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable"];
      for (i = 0, len = ref.length; i < len; i++) {
        attribute = ref[i];
        serializedFigure.removeAttribute(attribute);
        ref1 = serializedFigure.querySelectorAll(`[${attribute}]`);
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          element = ref1[j];
          element.removeAttribute(attribute);
        }
      }
      return {
        html: `<div>${blockComment}${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        serializedHTML: `<div>${serializedFigure.outerHTML}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "text with newlines and image attachment": (function() {
      var attachment, attachmentText, attribute, attrs, caption, element, figure, i, image, j, len, len1, ref, ref1, serializedFigure, stringText, text;
      stringText = Trix.Text.textForStringWithAttributes("a\nb");
      attrs = {
        url: TEST_IMAGE_URL,
        filename: "example.png",
        filesize: 98203,
        contentType: "image/png",
        width: 1,
        height: 1
      };
      attachment = new Trix.Attachment(attrs);
      attachmentText = Trix.Text.textForAttachmentWithAttributes(attachment);
      image = Trix.makeElement("img", {
        src: attrs.url,
        "data-trix-mutable": true,
        width: 1,
        height: 1
      });
      image.dataset.trixStoreKey = ["imageElement", attachment.id, image.src, image.width, image.height].join("/");
      caption = Trix.makeElement({
        tagName: "figcaption",
        className: css.attachmentCaption
      });
      caption.innerHTML = `<span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">95.9 KB</span>`;
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--preview attachment--png",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: "image/png",
          trixId: attachment.id
        }
      });
      figure.appendChild(image);
      figure.appendChild(caption);
      serializedFigure = figure.cloneNode(true);
      ref = ["data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable"];
      for (i = 0, len = ref.length; i < len; i++) {
        attribute = ref[i];
        serializedFigure.removeAttribute(attribute);
        ref1 = serializedFigure.querySelectorAll(`[${attribute}]`);
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          element = ref1[j];
          element.removeAttribute(attribute);
        }
      }
      text = stringText.appendText(attachmentText);
      return {
        html: `<div>${blockComment}a<br>b${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        serializedHTML: `<div>a<br>b${serializedFigure.outerHTML}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "image attachment with edited caption": (function() {
      var attachment, attrs, caption, figure, image, text, textAttrs;
      attrs = {
        url: TEST_IMAGE_URL,
        filename: "example.png",
        filesize: 123,
        contentType: "image/png",
        width: 1,
        height: 1
      };
      attachment = new Trix.Attachment(attrs);
      textAttrs = {
        caption: "Example"
      };
      text = Trix.Text.textForAttachmentWithAttributes(attachment, textAttrs);
      image = Trix.makeElement("img", {
        src: attrs.url,
        "data-trix-mutable": true,
        width: 1,
        height: 1
      });
      image.dataset.trixStoreKey = ["imageElement", attachment.id, image.src, image.width, image.height].join("/");
      caption = Trix.makeElement({
        tagName: "figcaption",
        className: `${css.attachmentCaption} ${css.attachmentCaption}--edited`,
        textContent: "Example"
      });
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--preview attachment--png",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: "image/png",
          trixId: attachment.id,
          trixAttributes: JSON.stringify(textAttrs)
        }
      });
      figure.appendChild(image);
      figure.appendChild(caption);
      return {
        html: `<div>${blockComment}${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "file attachment": (function() {
      var attachment, attrs, caption, figure, i, len, link, node, ref, text;
      attrs = {
        href: "http://example.com/example.pdf",
        filename: "example.pdf",
        filesize: 34038769,
        contentType: "application/pdf"
      };
      attachment = new Trix.Attachment(attrs);
      text = Trix.Text.textForAttachmentWithAttributes(attachment);
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--file attachment--pdf",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: "application/pdf",
          trixId: attachment.id
        }
      });
      caption = `<figcaption class="${css.attachmentCaption}"><span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">32.46 MB</span></figcaption>`;
      figure.innerHTML = caption;
      link = Trix.makeElement({
        tagName: "a",
        editable: false,
        attributes: {
          href: attrs.href,
          tabindex: -1
        }
      });
      ref = [...figure.childNodes];
      for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        link.appendChild(node);
      }
      figure.appendChild(link);
      return {
        html: `<div>${blockComment}${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "pending file attachment": (function() {
      var attachment, attrs, caption, figure, progress, text;
      attrs = {
        filename: "example.pdf",
        filesize: 34038769,
        contentType: "application/pdf"
      };
      attachment = new Trix.Attachment(attrs);
      attachment.file = {};
      text = Trix.Text.textForAttachmentWithAttributes(attachment);
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--file attachment--pdf",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: "application/pdf",
          trixId: attachment.id,
          trixSerialize: false
        }
      });
      progress = Trix.makeElement({
        tagName: "progress",
        attributes: {
          class: "attachment__progress",
          value: 0,
          max: 100
        },
        data: {
          trixMutable: true,
          trixStoreKey: ["progressElement", attachment.id].join("/")
        }
      });
      caption = `<figcaption class="${css.attachmentCaption}"><span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">32.46 MB</span></figcaption>`;
      figure.innerHTML = caption + progress.outerHTML;
      return {
        html: `<div>${blockComment}${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "content attachment": (function() {
      var attachment, caption, content, contentType, figure, href, text;
      content = `<blockquote class="twitter-tweet" data-cards="hidden"><p>ruby-build 20150413 is out, with definitions for 2.2.2, 2.1.6, and 2.0.0-p645 to address recent security issues: <a href="https://t.co/YEwV6NtRD8">https://t.co/YEwV6NtRD8</a></p>&mdash; Sam Stephenson (@sstephenson) <a href="https://twitter.com/sstephenson/status/587715996783218688">April 13, 2015</a></blockquote>`;
      href = "https://twitter.com/sstephenson/status/587715996783218688";
      contentType = "embed/twitter";
      attachment = new Trix.Attachment({content, contentType, href});
      text = Trix.Text.textForAttachmentWithAttributes(attachment);
      figure = Trix.makeElement({
        tagName: "figure",
        className: "attachment attachment--content",
        editable: false,
        data: {
          trixAttachment: JSON.stringify(attachment),
          trixContentType: contentType,
          trixId: attachment.id
        }
      });
      figure.innerHTML = content;
      caption = Trix.makeElement({
        tagName: "figcaption",
        className: css.attachmentCaption
      });
      figure.appendChild(caption);
      return {
        html: `<div>${blockComment}${cursorTargetLeft$1}${figure.outerHTML}${cursorTargetRight$1}</div>`,
        document: new Trix.Document([new Trix.Block(text)])
      };
    })(),
    "nested quote and code formatted block": {
      document: createDocument(["ab3", {}, ["quote", "code"]]),
      html: `<blockquote><pre>${blockComment}ab3</pre></blockquote>`
    },
    "nested code and quote formatted block": {
      document: createDocument(["ab3", {}, ["code", "quote"]]),
      html: `<pre><blockquote>${blockComment}ab3</blockquote></pre>`
    },
    "nested code blocks in quote": {
      document: createDocument(["a\n", {}, ["quote"]], ["b", {}, ["quote", "code"]], ["\nc\n", {}, ["quote"]], ["d", {}, ["quote", "code"]]),
      html: removeWhitespace(`<blockquote>
  ${blockComment}
  a
  <br>
  <br>
  <pre>
    ${blockComment}
    b
  </pre>
  ${blockComment}
  <br>
  c
  <br>
  <br>
  <pre>
    ${blockComment}
    d
  </pre>
</blockquote>`),
      serializedHTML: removeWhitespace(`<blockquote>
  a
  <br>
  <br>
  <pre>
    b
  </pre>
  <br>
  c
  <br>
  <br>
  <pre>
    d
  </pre>
</blockquote>`)
    },
    "nested code, quote, and list in quote": {
      document: createDocument(["a\n", {}, ["quote"]], ["b", {}, ["quote", "code"]], ["\nc\n", {}, ["quote"]], ["d", {}, ["quote", "quote"]], ["\ne\n", {}, ["quote"]], ["f", {}, ["quote", "bulletList", "bullet"]]),
      html: removeWhitespace(` <blockquote>
  ${blockComment}
  a
  <br>
  <br>
  <pre>
    ${blockComment}
    b
  </pre>
  ${blockComment}
  <br>
  c
  <br>
  <br>
  <blockquote>
    ${blockComment}
    d
  </blockquote>
  ${blockComment}
  <br>
  e
  <br>
  <br>
  <ul>
    <li>
      ${blockComment}
      f
    </li>
  </ul>
</blockquote>`),
      serializedHTML: removeWhitespace(`<blockquote>
  a
  <br>
  <br>
  <pre>
    b
  </pre>
  <br>
  c
  <br>
  <br>
  <blockquote>
    d
  </blockquote>
  <br>
  e
  <br>
  <br>
  <ul>
    <li>
      f
    </li>
  </ul>
</blockquote>`)
    },
    "nested quotes at different nesting levels": {
      document: createDocument(["a", {}, ["quote", "quote", "quote"]], ["b", {}, ["quote", "quote"]], ["c", {}, ["quote"]], ["d", {}, ["quote", "quote"]]),
      html: removeWhitespace(`<blockquote>
  <blockquote>
    <blockquote>
      ${blockComment}
      a
    </blockquote>
    ${blockComment}
    b
  </blockquote>
  ${blockComment}
  c
  <blockquote>
    ${blockComment}
    d
  </blockquote>
</blockquote>`),
      serializedHTML: removeWhitespace(`<blockquote>
  <blockquote>
    <blockquote>
      a
    </blockquote>
    b
  </blockquote>
  c
  <blockquote>
    d
  </blockquote>
</blockquote>`)
    },
    "nested quote and list": {
      document: createDocument(["ab3", {}, ["quote", "bulletList", "bullet"]]),
      html: `<blockquote><ul><li>${blockComment}ab3</li></ul></blockquote>`
    },
    "nested list and quote": {
      document: createDocument(["ab3", {}, ["bulletList", "bullet", "quote"]]),
      html: `<ul><li><blockquote>${blockComment}ab3</blockquote></li></ul>`
    },
    "nested lists and quotes": {
      document: createDocument(["a", {}, ["bulletList", "bullet", "quote"]], ["b", {}, ["bulletList", "bullet", "quote"]]),
      html: `<ul><li><blockquote>${blockComment}a</blockquote></li><li><blockquote>${blockComment}b</blockquote></li></ul>`
    },
    "nested quote and list with two items": {
      document: createDocument(["a", {}, ["quote", "bulletList", "bullet"]], ["b", {}, ["quote", "bulletList", "bullet"]]),
      html: `<blockquote><ul><li>${blockComment}a</li><li>${blockComment}b</li></ul></blockquote>`
    },
    "nested unordered lists": {
      document: createDocument(["a", {}, ["bulletList", "bullet"]], ["b", {}, ["bulletList", "bullet", "bulletList", "bullet"]], ["c", {}, ["bulletList", "bullet", "bulletList", "bullet"]]),
      html: `<ul><li>${blockComment}a<ul><li>${blockComment}b</li><li>${blockComment}c</li></ul></li></ul>`
    },
    "nested lists": {
      document: createDocument(["a", {}, ["numberList", "number"]], ["b", {}, ["numberList", "number", "bulletList", "bullet"]], ["c", {}, ["numberList", "number", "bulletList", "bullet"]]),
      html: `<ol><li>${blockComment}a<ul><li>${blockComment}b</li><li>${blockComment}c</li></ul></li></ol>`
    },
    "blocks beginning with newlines": {
      document: createDocument(["\na", {}, ["quote"]], ["\nb", {}, []], ["\nc", {}, ["quote"]]),
      html: `<blockquote>${blockComment}<br>a</blockquote><div>${blockComment}<br>b</div><blockquote>${blockComment}<br>c</blockquote>`
    },
    "blocks beginning with formatted text": {
      document: createDocument([
        "a",
        {
          bold: true
        },
        ["quote"]
      ], [
        "b",
        {
          italic: true
        },
        []
      ], [
        "c",
        {
          bold: true
        },
        ["quote"]
      ]),
      html: `<blockquote>${blockComment}<strong>a</strong></blockquote><div>${blockComment}<em>b</em></div><blockquote>${blockComment}<strong>c</strong></blockquote>`
    },
    "text with newlines before block": {
      document: createDocument(["a\nb"], ["c", {}, ["quote"]]),
      html: `<div>${blockComment}a<br>b</div><blockquote>${blockComment}c</blockquote>`
    },
    "empty heading block": {
      document: createDocument(["", {}, ["heading1"]]),
      html: `<h1>${blockComment}<br></h1>`
    },
    "two adjacent headings": {
      document: createDocument(["a", {}, ["heading1"]], ["b", {}, ["heading1"]]),
      html: `<h1>${blockComment}a</h1><h1>${blockComment}b</h1>`
    },
    "heading in ordered list": {
      document: createDocument(["a", {}, ["numberList", "number", "heading1"]]),
      html: `<ol><li><h1>${blockComment}a</h1></li></ol>`
    },
    "headings with formatted text": {
      document: createDocument([
        "a",
        {
          bold: true
        },
        ["heading1"]
      ], [
        "b",
        {
          italic: true,
          bold: true
        },
        ["heading1"]
      ]),
      html: `<h1>${blockComment}<strong>a</strong></h1><h1>${blockComment}<strong><em>b</em></strong></h1>`
    },
    "bidrectional text": {
      document: createDocument(["a"], ["ل", {}, ["quote"]], ["b", {}, ["bulletList", "bullet"]], ["ל", {}, ["bulletList", "bullet"]], ["", {}, ["bulletList", "bullet"]], ["cید"], ["\n گ"]),
      html: `<div>${blockComment}a</div><blockquote dir="rtl">${blockComment}ل</blockquote><ul><li>${blockComment}b</li></ul><ul dir="rtl"><li>${blockComment}ל</li><li>${blockComment}<br></li></ul><div>${blockComment}cید</div><div dir="rtl">${blockComment}<br>&nbsp;گ</div>`,
      serializedHTML: `<div>a</div><blockquote dir="rtl">ل</blockquote><ul><li>b</li></ul><ul dir="rtl"><li>ל</li><li><br></li></ul><div>cید</div><div dir="rtl"><br>&nbsp;گ</div>`
    }
  };

  window.eachFixture = (callback) => {
    var details, name, ref, results;
    ref = window.fixtures;
    results = [];
    for (name in ref) {
      details = ref[name];
      results.push(callback(name, details));
    }
    return results;
  };

  var helpers$4, normalizeRange$1, rangesAreEqual;

  ({normalizeRange: normalizeRange$1, rangesAreEqual} = Trix$2);

  helpers$4 = Trix$2.TestHelpers;

  helpers$4.assert = QUnit.assert;

  helpers$4.assert.locationRange = function(start, end) {
    var actualLocationRange, expectedLocationRange;
    expectedLocationRange = normalizeRange$1([start, end]);
    actualLocationRange = getEditorController().getLocationRange();
    return this.deepEqual(actualLocationRange, expectedLocationRange);
  };

  helpers$4.assert.selectedRange = function(range) {
    var actualRange, expectedRange;
    expectedRange = normalizeRange$1(range);
    actualRange = getEditor().getSelectedRange();
    return this.deepEqual(actualRange, expectedRange);
  };

  helpers$4.assert.textAttributes = function(range, attributes) {
    var blocks, document, locationRange, piece, pieces, text, textIndex, textRange;
    document = getDocument().getDocumentAtRange(range);
    blocks = document.getBlocks();
    if (blocks.length !== 1) {
      throw `range ${JSON.stringify(range)} spans more than one block`;
    }
    locationRange = getDocument().locationRangeFromRange(range);
    textIndex = locationRange[0].index;
    textRange = [locationRange[0].offset, locationRange[1].offset];
    text = getDocument().getTextAtIndex(textIndex).getTextAtRange(textRange);
    pieces = text.getPieces();
    if (pieces.length !== 1) {
      throw `range ${JSON.stringify(range)} must only span one piece`;
    }
    piece = pieces[0];
    return this.deepEqual(piece.getAttributes(), attributes);
  };

  helpers$4.assert.blockAttributes = function(range, attributes) {
    var block, blocks, document;
    document = getDocument().getDocumentAtRange(range);
    blocks = document.getBlocks();
    if (blocks.length !== 1) {
      throw `range ${JSON.stringify(range)} spans more than one block`;
    }
    block = blocks[0];
    return this.deepEqual(block.getAttributes(), attributes);
  };

  helpers$4.assert.documentHTMLEqual = function(trixDocument, html) {
    return this.equal(helpers$4.getHTML(trixDocument), html);
  };

  helpers$4.getHTML = function(trixDocument) {
    return Trix$2.DocumentView.render(trixDocument).innerHTML;
  };

  var helpers$3, render;

  helpers$3 = Trix$2.TestHelpers;

  helpers$3.extend({
    insertString: function(string) {
      getComposition().insertString(string);
      return render();
    },
    insertText: function(text) {
      getComposition().insertText(text);
      return render();
    },
    insertDocument: function(document) {
      getComposition().insertDocument(document);
      return render();
    },
    insertFile: function(file) {
      getComposition().insertFile(file);
      return render();
    },
    insertAttachment: function(attachment) {
      getComposition().insertAttachment(attachment);
      return render();
    },
    insertAttachments: function(attachments) {
      getComposition().insertAttachments(attachments);
      return render();
    },
    insertImageAttachment: function(attributes) {
      var attachment;
      attachment = helpers$3.createImageAttachment(attributes);
      return helpers$3.insertAttachment(attachment);
    },
    createImageAttachment: function(attributes) {
      if (attributes == null) {
        attributes = {
          url: TEST_IMAGE_URL,
          width: 10,
          height: 10,
          filename: "image.gif",
          filesize: 35,
          contentType: "image/gif"
        };
      }
      return new Trix$2.Attachment(attributes);
    },
    replaceDocument: function(document) {
      getComposition().setDocument(document);
      return render();
    }
  });

  render = function() {
    return getEditorController().render();
  };

  var capitalize, code$1, deleteInDirection, getElementCoordinates, helpers$2, insertCharacter, isIE, keyCodes$1, name$1, ref$1, simulateKeypress, typeCharacterInElement,
    indexOf = [].indexOf;

  helpers$2 = Trix$2.TestHelpers;

  keyCodes$1 = {};

  ref$1 = Trix$2.config.keyNames;
  for (code$1 in ref$1) {
    name$1 = ref$1[code$1];
    keyCodes$1[name$1] = code$1;
  }

  isIE = /Windows.*Trident/.test(navigator.userAgent);

  helpers$2.extend({
    createEvent: function(type, properties = {}) {
      var event, key, value;
      event = document.createEvent("Events");
      event.initEvent(type, true, true);
      for (key in properties) {
        value = properties[key];
        event[key] = value;
      }
      return event;
    },
    triggerEvent: function(element, type, properties) {
      return element.dispatchEvent(helpers$2.createEvent(type, properties));
    },
    triggerInputEvent: function(element, type, properties = {}) {
      var ranges, selection;
      if (Trix$2.config.input.getLevel() === 2) {
        if (properties.ranges) {
          ranges = properties.ranges;
          delete properties.ranges;
        } else {
          ranges = [];
          selection = window.getSelection();
          if (selection.rangeCount > 0) {
            ranges.push(selection.getRangeAt(0).cloneRange());
          }
        }
        properties.getTargetRanges = function() {
          return ranges;
        };
        return helpers$2.triggerEvent(element, type, properties);
      }
    },
    pasteContent: function(contentType, value, callback) {
      var data, key, testClipboardData;
      if (typeof contentType === "object") {
        data = contentType;
        callback = value;
      } else {
        data = {
          [`${contentType}`]: value
        };
      }
      testClipboardData = {
        getData: function(type) {
          return data[type];
        },
        types: (function() {
          var results;
          results = [];
          for (key in data) {
            results.push(key);
          }
          return results;
        })(),
        items: (function() {
          var results;
          results = [];
          for (key in data) {
            value = data[key];
            results.push(value);
          }
          return results;
        })()
      };
      if (indexOf.call(testClipboardData.types, "Files") >= 0) {
        testClipboardData.files = testClipboardData.items;
      }
      helpers$2.triggerInputEvent(document.activeElement, "beforeinput", {
        inputType: "insertFromPaste",
        dataTransfer: testClipboardData
      });
      helpers$2.triggerEvent(document.activeElement, "paste", {testClipboardData});
      if (callback) {
        return requestAnimationFrame(callback);
      }
    },
    createFile: function(properties = {}) {
      var file, key, value;
      file = {
        getAsFile: function() {
          return {};
        }
      };
      for (key in properties) {
        value = properties[key];
        file[key] = value;
      }
      return file;
    },
    typeCharacters: function(string, callback) {
      var characters, typeNextCharacter;
      if (Array.isArray(string)) {
        characters = string;
      } else {
        characters = string.split("");
      }
      return (typeNextCharacter = function() {
        return helpers$2.defer(function() {
          var character;
          character = characters.shift();
          if (character != null) {
            switch (character) {
              case "\n":
                return helpers$2.pressKey("return", typeNextCharacter);
              case "\b":
                return helpers$2.pressKey("backspace", typeNextCharacter);
              default:
                return typeCharacterInElement(character, document.activeElement, typeNextCharacter);
            }
          } else {
            return callback();
          }
        });
      })();
    },
    pressKey: function(keyName, callback) {
      var element, properties;
      element = document.activeElement;
      code$1 = keyCodes$1[keyName];
      properties = {
        which: code$1,
        keyCode: code$1,
        charCode: 0,
        key: capitalize(keyName)
      };
      if (!helpers$2.triggerEvent(element, "keydown", properties)) {
        return callback();
      }
      return simulateKeypress(keyName, function() {
        return helpers$2.defer(function() {
          helpers$2.triggerEvent(element, "keyup", properties);
          return helpers$2.defer(callback);
        });
      });
    },
    startComposition: function(data, callback) {
      var element, node;
      element = document.activeElement;
      helpers$2.triggerEvent(element, "compositionstart", {
        data: ""
      });
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "insertCompositionText",
        data: data
      });
      helpers$2.triggerEvent(element, "compositionupdate", {
        data: data
      });
      helpers$2.triggerEvent(element, "input");
      node = document.createTextNode(data);
      helpers$2.insertNode(node);
      return helpers$2.selectNode(node, callback);
    },
    updateComposition: function(data, callback) {
      var element, node;
      element = document.activeElement;
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "insertCompositionText",
        data: data
      });
      helpers$2.triggerEvent(element, "compositionupdate", {
        data: data
      });
      helpers$2.triggerEvent(element, "input");
      node = document.createTextNode(data);
      helpers$2.insertNode(node);
      return helpers$2.selectNode(node, callback);
    },
    endComposition: function(data, callback) {
      var element, node;
      element = document.activeElement;
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "insertCompositionText",
        data: data
      });
      helpers$2.triggerEvent(element, "compositionupdate", {
        data: data
      });
      node = document.createTextNode(data);
      helpers$2.insertNode(node);
      helpers$2.selectNode(node);
      return helpers$2.collapseSelection("right", function() {
        helpers$2.triggerEvent(element, "input");
        helpers$2.triggerEvent(element, "compositionend", {
          data: data
        });
        return requestAnimationFrame(callback);
      });
    },
    clickElement: function(element, callback) {
      if (helpers$2.triggerEvent(element, "mousedown")) {
        return helpers$2.defer(function() {
          if (helpers$2.triggerEvent(element, "mouseup")) {
            return helpers$2.defer(function() {
              helpers$2.triggerEvent(element, "click");
              return helpers$2.defer(callback);
            });
          }
        });
      }
    },
    dragToCoordinates: function(coordinates, callback) {
      var clientX, clientY, dataTransfer, domRange, dragstartData, dropData, element, key, value;
      element = document.activeElement;
      // IE only allows writing "text" to DataTransfer
      // https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
      dataTransfer = {
        files: [],
        data: {},
        getData: function(format) {
          if (isIE && format.toLowerCase() !== "text") {
            throw new Error("Invalid argument.");
          } else {
            this.data[format];
            return true;
          }
        },
        setData: function(format, data) {
          if (isIE && format.toLowerCase() !== "text") {
            throw new Error("Unexpected call to method or property access.");
          } else {
            return this.data[format] = data;
          }
        }
      };
      helpers$2.triggerEvent(element, "mousemove");
      dragstartData = {dataTransfer};
      helpers$2.triggerEvent(element, "dragstart", dragstartData);
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "deleteByDrag"
      });
      dropData = {dataTransfer};
      for (key in coordinates) {
        value = coordinates[key];
        dropData[key] = value;
      }
      helpers$2.triggerEvent(element, "drop", dropData);
      ({clientX, clientY} = coordinates);
      domRange = helpers$2.createDOMRangeFromPoint(clientX, clientY);
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "insertFromDrop",
        ranges: [domRange]
      });
      return helpers$2.defer(callback);
    },
    mouseDownOnElementAndMove: function(element, distance, callback) {
      var coordinates, destination, dragSpeed;
      coordinates = getElementCoordinates(element);
      helpers$2.triggerEvent(element, "mousedown", coordinates);
      destination = function(offset) {
        return {
          clientX: coordinates.clientX + offset,
          clientY: coordinates.clientY + offset
        };
      };
      dragSpeed = 20;
      return after(dragSpeed, function() {
        var drag, offset;
        offset = 0;
        return (drag = () => {
          if (++offset <= distance) {
            helpers$2.triggerEvent(element, "mousemove", destination(offset));
            return after(dragSpeed, drag);
          } else {
            helpers$2.triggerEvent(element, "mouseup", destination(distance));
            return after(dragSpeed, callback);
          }
        })();
      });
    }
  });

  typeCharacterInElement = function(character, element, callback) {
    var charCode, keyCode;
    charCode = character.charCodeAt(0);
    keyCode = character.toUpperCase().charCodeAt(0);
    if (!helpers$2.triggerEvent(element, "keydown", {
      keyCode: keyCode,
      charCode: 0
    })) {
      return callback();
    }
    return helpers$2.defer(function() {
      if (!helpers$2.triggerEvent(element, "keypress", {
        keyCode: charCode,
        charCode: charCode
      })) {
        return callback();
      }
      helpers$2.triggerInputEvent(element, "beforeinput", {
        inputType: "insertText",
        data: character
      });
      return insertCharacter(character, function() {
        helpers$2.triggerEvent(element, "input");
        return helpers$2.defer(function() {
          helpers$2.triggerEvent(element, "keyup", {
            keyCode: keyCode,
            charCode: 0
          });
          return callback();
        });
      });
    });
  };

  insertCharacter = function(character, callback) {
    var node;
    node = document.createTextNode(character);
    return helpers$2.insertNode(node, callback);
  };

  simulateKeypress = function(keyName, callback) {
    switch (keyName) {
      case "backspace":
        return deleteInDirection("left", callback);
      case "delete":
        return deleteInDirection("right", callback);
      case "return":
        return helpers$2.defer(function() {
          var node;
          helpers$2.triggerInputEvent(document.activeElement, "beforeinput", {
            inputType: "insertParagraph"
          });
          node = document.createElement("br");
          return helpers$2.insertNode(node, callback);
        });
    }
  };

  deleteInDirection = function(direction, callback) {
    if (helpers$2.selectionIsCollapsed()) {
      getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward");
      return helpers$2.defer(function() {
        var inputType;
        inputType = direction === "left" ? "deleteContentBackward" : "deleteContentForward";
        helpers$2.triggerInputEvent(document.activeElement, "beforeinput", {inputType});
        return helpers$2.defer(function() {
          helpers$2.deleteSelection();
          return callback();
        });
      });
    } else {
      helpers$2.triggerInputEvent(document.activeElement, "beforeinput", {
        inputType: "deleteContentBackward"
      });
      helpers$2.deleteSelection();
      return callback();
    }
  };

  getElementCoordinates = function(element) {
    var rect;
    rect = element.getBoundingClientRect();
    return {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    };
  };

  capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  var rangyCore = createCommonjsModule(function (module, exports) {
  /**
   * Rangy, a cross-browser JavaScript range and selection library
   * https://github.com/timdown/rangy
   *
   * Copyright 2015, Tim Down
   * Licensed under the MIT license.
   * Version: 1.3.0
   * Build date: 10 May 2015
   */

  (function(factory, root) {
      if (typeof undefined == "function" && undefined.amd) {
          // AMD. Register as an anonymous module.
          undefined(factory);
      } else if ('object' != "undefined" && 'object' == "object") {
          // Node/CommonJS style
          module.exports = factory();
      } else {
          // No AMD or CommonJS support so we place Rangy in (probably) the global variable
          root.rangy = factory();
      }
  })(function() {

      var OBJECT = "object", FUNCTION = "function", UNDEFINED = "undefined";

      // Minimal set of properties required for DOM Level 2 Range compliance. Comparison constants such as START_TO_START
      // are omitted because ranges in KHTML do not have them but otherwise work perfectly well. See issue 113.
      var domRangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
          "commonAncestorContainer"];

      // Minimal set of methods required for DOM Level 2 Range compliance
      var domRangeMethods = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore",
          "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents",
          "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"];

      var textRangeProperties = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"];

      // Subset of TextRange's full set of methods that we're interested in
      var textRangeMethods = ["collapse", "compareEndPoints", "duplicate", "moveToElementText", "parentElement", "select",
          "setEndPoint", "getBoundingClientRect"];

      /*----------------------------------------------------------------------------------------------------------------*/

      // Trio of functions taken from Peter Michaux's article:
      // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
      function isHostMethod(o, p) {
          var t = typeof o[p];
          return t == FUNCTION || (!!(t == OBJECT && o[p])) || t == "unknown";
      }

      function isHostObject(o, p) {
          return !!(typeof o[p] == OBJECT && o[p]);
      }

      function isHostProperty(o, p) {
          return typeof o[p] != UNDEFINED;
      }

      // Creates a convenience function to save verbose repeated calls to tests functions
      function createMultiplePropertyTest(testFunc) {
          return function(o, props) {
              var i = props.length;
              while (i--) {
                  if (!testFunc(o, props[i])) {
                      return false;
                  }
              }
              return true;
          };
      }

      // Next trio of functions are a convenience to save verbose repeated calls to previous two functions
      var areHostMethods = createMultiplePropertyTest(isHostMethod);
      var areHostObjects = createMultiplePropertyTest(isHostObject);
      var areHostProperties = createMultiplePropertyTest(isHostProperty);

      function isTextRange(range) {
          return range && areHostMethods(range, textRangeMethods) && areHostProperties(range, textRangeProperties);
      }

      function getBody(doc) {
          return isHostObject(doc, "body") ? doc.body : doc.getElementsByTagName("body")[0];
      }

      var forEach = [].forEach ?
          function(arr, func) {
              arr.forEach(func);
          } :
          function(arr, func) {
              for (var i = 0, len = arr.length; i < len; ++i) {
                  func(arr[i], i);
              }
          };

      var modules = {};

      var isBrowser = (typeof window != UNDEFINED && typeof document != UNDEFINED);

      var util = {
          isHostMethod: isHostMethod,
          isHostObject: isHostObject,
          isHostProperty: isHostProperty,
          areHostMethods: areHostMethods,
          areHostObjects: areHostObjects,
          areHostProperties: areHostProperties,
          isTextRange: isTextRange,
          getBody: getBody,
          forEach: forEach
      };

      var api = {
          version: "1.3.0",
          initialized: false,
          isBrowser: isBrowser,
          supported: true,
          util: util,
          features: {},
          modules: modules,
          config: {
              alertOnFail: false,
              alertOnWarn: false,
              preferTextRange: false,
              autoInitialize: (typeof rangyAutoInitialize == UNDEFINED) ? true : rangyAutoInitialize
          }
      };

      function consoleLog(msg) {
          if (typeof console != UNDEFINED && isHostMethod(console, "log")) {
              console.log(msg);
          }
      }

      function alertOrLog(msg, shouldAlert) {
          if (isBrowser && shouldAlert) {
              alert(msg);
          } else  {
              consoleLog(msg);
          }
      }

      function fail(reason) {
          api.initialized = true;
          api.supported = false;
          alertOrLog("Rangy is not supported in this environment. Reason: " + reason, api.config.alertOnFail);
      }

      api.fail = fail;

      function warn(msg) {
          alertOrLog("Rangy warning: " + msg, api.config.alertOnWarn);
      }

      api.warn = warn;

      // Add utility extend() method
      var extend;
      if ({}.hasOwnProperty) {
          util.extend = extend = function(obj, props, deep) {
              var o, p;
              for (var i in props) {
                  if (props.hasOwnProperty(i)) {
                      o = obj[i];
                      p = props[i];
                      if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
                          extend(o, p, true);
                      }
                      obj[i] = p;
                  }
              }
              // Special case for toString, which does not show up in for...in loops in IE <= 8
              if (props.hasOwnProperty("toString")) {
                  obj.toString = props.toString;
              }
              return obj;
          };

          util.createOptions = function(optionsParam, defaults) {
              var options = {};
              extend(options, defaults);
              if (optionsParam) {
                  extend(options, optionsParam);
              }
              return options;
          };
      } else {
          fail("hasOwnProperty not supported");
      }

      // Test whether we're in a browser and bail out if not
      if (!isBrowser) {
          fail("Rangy can only run in a browser");
      }

      // Test whether Array.prototype.slice can be relied on for NodeLists and use an alternative toArray() if not
      (function() {
          var toArray;

          if (isBrowser) {
              var el = document.createElement("div");
              el.appendChild(document.createElement("span"));
              var slice = [].slice;
              try {
                  if (slice.call(el.childNodes, 0)[0].nodeType == 1) {
                      toArray = function(arrayLike) {
                          return slice.call(arrayLike, 0);
                      };
                  }
              } catch (e) {}
          }

          if (!toArray) {
              toArray = function(arrayLike) {
                  var arr = [];
                  for (var i = 0, len = arrayLike.length; i < len; ++i) {
                      arr[i] = arrayLike[i];
                  }
                  return arr;
              };
          }

          util.toArray = toArray;
      })();

      // Very simple event handler wrapper function that doesn't attempt to solve issues such as "this" handling or
      // normalization of event properties
      var addListener;
      if (isBrowser) {
          if (isHostMethod(document, "addEventListener")) {
              addListener = function(obj, eventType, listener) {
                  obj.addEventListener(eventType, listener, false);
              };
          } else if (isHostMethod(document, "attachEvent")) {
              addListener = function(obj, eventType, listener) {
                  obj.attachEvent("on" + eventType, listener);
              };
          } else {
              fail("Document does not have required addEventListener or attachEvent method");
          }

          util.addListener = addListener;
      }

      var initListeners = [];

      function getErrorDesc(ex) {
          return ex.message || ex.description || String(ex);
      }

      // Initialization
      function init() {
          if (!isBrowser || api.initialized) {
              return;
          }
          var testRange;
          var implementsDomRange = false, implementsTextRange = false;

          // First, perform basic feature tests

          if (isHostMethod(document, "createRange")) {
              testRange = document.createRange();
              if (areHostMethods(testRange, domRangeMethods) && areHostProperties(testRange, domRangeProperties)) {
                  implementsDomRange = true;
              }
          }

          var body = getBody(document);
          if (!body || body.nodeName.toLowerCase() != "body") {
              fail("No body element found");
              return;
          }

          if (body && isHostMethod(body, "createTextRange")) {
              testRange = body.createTextRange();
              if (isTextRange(testRange)) {
                  implementsTextRange = true;
              }
          }

          if (!implementsDomRange && !implementsTextRange) {
              fail("Neither Range nor TextRange are available");
              return;
          }

          api.initialized = true;
          api.features = {
              implementsDomRange: implementsDomRange,
              implementsTextRange: implementsTextRange
          };

          // Initialize modules
          var module, errorMessage;
          for (var moduleName in modules) {
              if ( (module = modules[moduleName]) instanceof Module ) {
                  module.init(module, api);
              }
          }

          // Call init listeners
          for (var i = 0, len = initListeners.length; i < len; ++i) {
              try {
                  initListeners[i](api);
              } catch (ex) {
                  errorMessage = "Rangy init listener threw an exception. Continuing. Detail: " + getErrorDesc(ex);
                  consoleLog(errorMessage);
              }
          }
      }

      function deprecationNotice(deprecated, replacement, module) {
          if (module) {
              deprecated += " in module " + module.name;
          }
          api.warn("DEPRECATED: " + deprecated + " is deprecated. Please use " +
          replacement + " instead.");
      }

      function createAliasForDeprecatedMethod(owner, deprecated, replacement, module) {
          owner[deprecated] = function() {
              deprecationNotice(deprecated, replacement, module);
              return owner[replacement].apply(owner, util.toArray(arguments));
          };
      }

      util.deprecationNotice = deprecationNotice;
      util.createAliasForDeprecatedMethod = createAliasForDeprecatedMethod;

      // Allow external scripts to initialize this library in case it's loaded after the document has loaded
      api.init = init;

      // Execute listener immediately if already initialized
      api.addInitListener = function(listener) {
          if (api.initialized) {
              listener(api);
          } else {
              initListeners.push(listener);
          }
      };

      var shimListeners = [];

      api.addShimListener = function(listener) {
          shimListeners.push(listener);
      };

      function shim(win) {
          win = win || window;
          init();

          // Notify listeners
          for (var i = 0, len = shimListeners.length; i < len; ++i) {
              shimListeners[i](win);
          }
      }

      if (isBrowser) {
          api.shim = api.createMissingNativeApi = shim;
          createAliasForDeprecatedMethod(api, "createMissingNativeApi", "shim");
      }

      function Module(name, dependencies, initializer) {
          this.name = name;
          this.dependencies = dependencies;
          this.initialized = false;
          this.supported = false;
          this.initializer = initializer;
      }

      Module.prototype = {
          init: function() {
              var requiredModuleNames = this.dependencies || [];
              for (var i = 0, len = requiredModuleNames.length, requiredModule, moduleName; i < len; ++i) {
                  moduleName = requiredModuleNames[i];

                  requiredModule = modules[moduleName];
                  if (!requiredModule || !(requiredModule instanceof Module)) {
                      throw new Error("required module '" + moduleName + "' not found");
                  }

                  requiredModule.init();

                  if (!requiredModule.supported) {
                      throw new Error("required module '" + moduleName + "' not supported");
                  }
              }

              // Now run initializer
              this.initializer(this);
          },

          fail: function(reason) {
              this.initialized = true;
              this.supported = false;
              throw new Error(reason);
          },

          warn: function(msg) {
              api.warn("Module " + this.name + ": " + msg);
          },

          deprecationNotice: function(deprecated, replacement) {
              api.warn("DEPRECATED: " + deprecated + " in module " + this.name + " is deprecated. Please use " +
                  replacement + " instead");
          },

          createError: function(msg) {
              return new Error("Error in Rangy " + this.name + " module: " + msg);
          }
      };

      function createModule(name, dependencies, initFunc) {
          var newModule = new Module(name, dependencies, function(module) {
              if (!module.initialized) {
                  module.initialized = true;
                  try {
                      initFunc(api, module);
                      module.supported = true;
                  } catch (ex) {
                      var errorMessage = "Module '" + name + "' failed to load: " + getErrorDesc(ex);
                      consoleLog(errorMessage);
                      if (ex.stack) {
                          consoleLog(ex.stack);
                      }
                  }
              }
          });
          modules[name] = newModule;
          return newModule;
      }

      api.createModule = function(name) {
          // Allow 2 or 3 arguments (second argument is an optional array of dependencies)
          var initFunc, dependencies;
          if (arguments.length == 2) {
              initFunc = arguments[1];
              dependencies = [];
          } else {
              initFunc = arguments[2];
              dependencies = arguments[1];
          }

          var module = createModule(name, dependencies, initFunc);

          // Initialize the module immediately if the core is already initialized
          if (api.initialized && api.supported) {
              module.init();
          }
      };

      api.createCoreModule = function(name, dependencies, initFunc) {
          createModule(name, dependencies, initFunc);
      };

      /*----------------------------------------------------------------------------------------------------------------*/

      // Ensure rangy.rangePrototype and rangy.selectionPrototype are available immediately

      function RangePrototype() {}
      api.RangePrototype = RangePrototype;
      api.rangePrototype = new RangePrototype();

      function SelectionPrototype() {}
      api.selectionPrototype = new SelectionPrototype();

      /*----------------------------------------------------------------------------------------------------------------*/

      // DOM utility methods used by Rangy
      api.createCoreModule("DomUtil", [], function(api, module) {
          var UNDEF = "undefined";
          var util = api.util;
          var getBody = util.getBody;

          // Perform feature tests
          if (!util.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"])) {
              module.fail("document missing a Node creation method");
          }

          if (!util.isHostMethod(document, "getElementsByTagName")) {
              module.fail("document missing getElementsByTagName method");
          }

          var el = document.createElement("div");
          if (!util.areHostMethods(el, ["insertBefore", "appendChild", "cloneNode"] ||
                  !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]))) {
              module.fail("Incomplete Element implementation");
          }

          // innerHTML is required for Range's createContextualFragment method
          if (!util.isHostProperty(el, "innerHTML")) {
              module.fail("Element is missing innerHTML property");
          }

          var textNode = document.createTextNode("test");
          if (!util.areHostMethods(textNode, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"] ||
                  !util.areHostObjects(el, ["previousSibling", "nextSibling", "childNodes", "parentNode"]) ||
                  !util.areHostProperties(textNode, ["data"]))) {
              module.fail("Incomplete Text Node implementation");
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Removed use of indexOf because of a bizarre bug in Opera that is thrown in one of the Acid3 tests. I haven't been
          // able to replicate it outside of the test. The bug is that indexOf returns -1 when called on an Array that
          // contains just the document as a single element and the value searched for is the document.
          var arrayContains = /*Array.prototype.indexOf ?
              function(arr, val) {
                  return arr.indexOf(val) > -1;
              }:*/

              function(arr, val) {
                  var i = arr.length;
                  while (i--) {
                      if (arr[i] === val) {
                          return true;
                      }
                  }
                  return false;
              };

          // Opera 11 puts HTML elements in the null namespace, it seems, and IE 7 has undefined namespaceURI
          function isHtmlNamespace(node) {
              var ns;
              return typeof node.namespaceURI == UNDEF || ((ns = node.namespaceURI) === null || ns == "http://www.w3.org/1999/xhtml");
          }

          function parentElement(node) {
              var parent = node.parentNode;
              return (parent.nodeType == 1) ? parent : null;
          }

          function getNodeIndex(node) {
              var i = 0;
              while( (node = node.previousSibling) ) {
                  ++i;
              }
              return i;
          }

          function getNodeLength(node) {
              switch (node.nodeType) {
                  case 7:
                  case 10:
                      return 0;
                  case 3:
                  case 8:
                      return node.length;
                  default:
                      return node.childNodes.length;
              }
          }

          function getCommonAncestor(node1, node2) {
              var ancestors = [], n;
              for (n = node1; n; n = n.parentNode) {
                  ancestors.push(n);
              }

              for (n = node2; n; n = n.parentNode) {
                  if (arrayContains(ancestors, n)) {
                      return n;
                  }
              }

              return null;
          }

          function isAncestorOf(ancestor, descendant, selfIsAncestor) {
              var n = selfIsAncestor ? descendant : descendant.parentNode;
              while (n) {
                  if (n === ancestor) {
                      return true;
                  } else {
                      n = n.parentNode;
                  }
              }
              return false;
          }

          function isOrIsAncestorOf(ancestor, descendant) {
              return isAncestorOf(ancestor, descendant, true);
          }

          function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
              var p, n = selfIsAncestor ? node : node.parentNode;
              while (n) {
                  p = n.parentNode;
                  if (p === ancestor) {
                      return n;
                  }
                  n = p;
              }
              return null;
          }

          function isCharacterDataNode(node) {
              var t = node.nodeType;
              return t == 3 || t == 4 || t == 8 ; // Text, CDataSection or Comment
          }

          function isTextOrCommentNode(node) {
              if (!node) {
                  return false;
              }
              var t = node.nodeType;
              return t == 3 || t == 8 ; // Text or Comment
          }

          function insertAfter(node, precedingNode) {
              var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
              if (nextNode) {
                  parent.insertBefore(node, nextNode);
              } else {
                  parent.appendChild(node);
              }
              return node;
          }

          // Note that we cannot use splitText() because it is bugridden in IE 9.
          function splitDataNode(node, index, positionsToPreserve) {
              var newNode = node.cloneNode(false);
              newNode.deleteData(0, index);
              node.deleteData(index, node.length - index);
              insertAfter(newNode, node);

              // Preserve positions
              if (positionsToPreserve) {
                  for (var i = 0, position; position = positionsToPreserve[i++]; ) {
                      // Handle case where position was inside the portion of node after the split point
                      if (position.node == node && position.offset > index) {
                          position.node = newNode;
                          position.offset -= index;
                      }
                      // Handle the case where the position is a node offset within node's parent
                      else if (position.node == node.parentNode && position.offset > getNodeIndex(node)) {
                          ++position.offset;
                      }
                  }
              }
              return newNode;
          }

          function getDocument(node) {
              if (node.nodeType == 9) {
                  return node;
              } else if (typeof node.ownerDocument != UNDEF) {
                  return node.ownerDocument;
              } else if (typeof node.document != UNDEF) {
                  return node.document;
              } else if (node.parentNode) {
                  return getDocument(node.parentNode);
              } else {
                  throw module.createError("getDocument: no document found for node");
              }
          }

          function getWindow(node) {
              var doc = getDocument(node);
              if (typeof doc.defaultView != UNDEF) {
                  return doc.defaultView;
              } else if (typeof doc.parentWindow != UNDEF) {
                  return doc.parentWindow;
              } else {
                  throw module.createError("Cannot get a window object for node");
              }
          }

          function getIframeDocument(iframeEl) {
              if (typeof iframeEl.contentDocument != UNDEF) {
                  return iframeEl.contentDocument;
              } else if (typeof iframeEl.contentWindow != UNDEF) {
                  return iframeEl.contentWindow.document;
              } else {
                  throw module.createError("getIframeDocument: No Document object found for iframe element");
              }
          }

          function getIframeWindow(iframeEl) {
              if (typeof iframeEl.contentWindow != UNDEF) {
                  return iframeEl.contentWindow;
              } else if (typeof iframeEl.contentDocument != UNDEF) {
                  return iframeEl.contentDocument.defaultView;
              } else {
                  throw module.createError("getIframeWindow: No Window object found for iframe element");
              }
          }

          // This looks bad. Is it worth it?
          function isWindow(obj) {
              return obj && util.isHostMethod(obj, "setTimeout") && util.isHostObject(obj, "document");
          }

          function getContentDocument(obj, module, methodName) {
              var doc;

              if (!obj) {
                  doc = document;
              }

              // Test if a DOM node has been passed and obtain a document object for it if so
              else if (util.isHostProperty(obj, "nodeType")) {
                  doc = (obj.nodeType == 1 && obj.tagName.toLowerCase() == "iframe") ?
                      getIframeDocument(obj) : getDocument(obj);
              }

              // Test if the doc parameter appears to be a Window object
              else if (isWindow(obj)) {
                  doc = obj.document;
              }

              if (!doc) {
                  throw module.createError(methodName + "(): Parameter must be a Window object or DOM node");
              }

              return doc;
          }

          function getRootContainer(node) {
              var parent;
              while ( (parent = node.parentNode) ) {
                  node = parent;
              }
              return node;
          }

          function comparePoints(nodeA, offsetA, nodeB, offsetB) {
              // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
              var nodeC, root, childA, childB, n;
              if (nodeA == nodeB) {
                  // Case 1: nodes are the same
                  return offsetA === offsetB ? 0 : (offsetA < offsetB) ? -1 : 1;
              } else if ( (nodeC = getClosestAncestorIn(nodeB, nodeA, true)) ) {
                  // Case 2: node C (container B or an ancestor) is a child node of A
                  return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
              } else if ( (nodeC = getClosestAncestorIn(nodeA, nodeB, true)) ) {
                  // Case 3: node C (container A or an ancestor) is a child node of B
                  return getNodeIndex(nodeC) < offsetB  ? -1 : 1;
              } else {
                  root = getCommonAncestor(nodeA, nodeB);
                  if (!root) {
                      throw new Error("comparePoints error: nodes have no common ancestor");
                  }

                  // Case 4: containers are siblings or descendants of siblings
                  childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
                  childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

                  if (childA === childB) {
                      // This shouldn't be possible
                      throw module.createError("comparePoints got to case 4 and childA and childB are the same!");
                  } else {
                      n = root.firstChild;
                      while (n) {
                          if (n === childA) {
                              return -1;
                          } else if (n === childB) {
                              return 1;
                          }
                          n = n.nextSibling;
                      }
                  }
              }
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Test for IE's crash (IE 6/7) or exception (IE >= 8) when a reference to garbage-collected text node is queried
          var crashyTextNodes = false;

          function isBrokenNode(node) {
              var n;
              try {
                  n = node.parentNode;
                  return false;
              } catch (e) {
                  return true;
              }
          }

          (function() {
              var el = document.createElement("b");
              el.innerHTML = "1";
              var textNode = el.firstChild;
              el.innerHTML = "<br />";
              crashyTextNodes = isBrokenNode(textNode);

              api.features.crashyTextNodes = crashyTextNodes;
          })();

          /*----------------------------------------------------------------------------------------------------------------*/

          function inspectNode(node) {
              if (!node) {
                  return "[No node]";
              }
              if (crashyTextNodes && isBrokenNode(node)) {
                  return "[Broken node]";
              }
              if (isCharacterDataNode(node)) {
                  return '"' + node.data + '"';
              }
              if (node.nodeType == 1) {
                  var idAttr = node.id ? ' id="' + node.id + '"' : "";
                  return "<" + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
              }
              return node.nodeName;
          }

          function fragmentFromNodeChildren(node) {
              var fragment = getDocument(node).createDocumentFragment(), child;
              while ( (child = node.firstChild) ) {
                  fragment.appendChild(child);
              }
              return fragment;
          }

          var getComputedStyleProperty;
          if (typeof window.getComputedStyle != UNDEF) {
              getComputedStyleProperty = function(el, propName) {
                  return getWindow(el).getComputedStyle(el, null)[propName];
              };
          } else if (typeof document.documentElement.currentStyle != UNDEF) {
              getComputedStyleProperty = function(el, propName) {
                  return el.currentStyle ? el.currentStyle[propName] : "";
              };
          } else {
              module.fail("No means of obtaining computed style properties found");
          }

          function createTestElement(doc, html, contentEditable) {
              var body = getBody(doc);
              var el = doc.createElement("div");
              el.contentEditable = "" + !!contentEditable;
              if (html) {
                  el.innerHTML = html;
              }

              // Insert the test element at the start of the body to prevent scrolling to the bottom in iOS (issue #292)
              var bodyFirstChild = body.firstChild;
              if (bodyFirstChild) {
                  body.insertBefore(el, bodyFirstChild);
              } else {
                  body.appendChild(el);
              }

              return el;
          }

          function removeNode(node) {
              return node.parentNode.removeChild(node);
          }

          function NodeIterator(root) {
              this.root = root;
              this._next = root;
          }

          NodeIterator.prototype = {
              _current: null,

              hasNext: function() {
                  return !!this._next;
              },

              next: function() {
                  var n = this._current = this._next;
                  var child, next;
                  if (this._current) {
                      child = n.firstChild;
                      if (child) {
                          this._next = child;
                      } else {
                          next = null;
                          while ((n !== this.root) && !(next = n.nextSibling)) {
                              n = n.parentNode;
                          }
                          this._next = next;
                      }
                  }
                  return this._current;
              },

              detach: function() {
                  this._current = this._next = this.root = null;
              }
          };

          function createIterator(root) {
              return new NodeIterator(root);
          }

          function DomPosition(node, offset) {
              this.node = node;
              this.offset = offset;
          }

          DomPosition.prototype = {
              equals: function(pos) {
                  return !!pos && this.node === pos.node && this.offset == pos.offset;
              },

              inspect: function() {
                  return "[DomPosition(" + inspectNode(this.node) + ":" + this.offset + ")]";
              },

              toString: function() {
                  return this.inspect();
              }
          };

          function DOMException(codeName) {
              this.code = this[codeName];
              this.codeName = codeName;
              this.message = "DOMException: " + this.codeName;
          }

          DOMException.prototype = {
              INDEX_SIZE_ERR: 1,
              HIERARCHY_REQUEST_ERR: 3,
              WRONG_DOCUMENT_ERR: 4,
              NO_MODIFICATION_ALLOWED_ERR: 7,
              NOT_FOUND_ERR: 8,
              NOT_SUPPORTED_ERR: 9,
              INVALID_STATE_ERR: 11,
              INVALID_NODE_TYPE_ERR: 24
          };

          DOMException.prototype.toString = function() {
              return this.message;
          };

          api.dom = {
              arrayContains: arrayContains,
              isHtmlNamespace: isHtmlNamespace,
              parentElement: parentElement,
              getNodeIndex: getNodeIndex,
              getNodeLength: getNodeLength,
              getCommonAncestor: getCommonAncestor,
              isAncestorOf: isAncestorOf,
              isOrIsAncestorOf: isOrIsAncestorOf,
              getClosestAncestorIn: getClosestAncestorIn,
              isCharacterDataNode: isCharacterDataNode,
              isTextOrCommentNode: isTextOrCommentNode,
              insertAfter: insertAfter,
              splitDataNode: splitDataNode,
              getDocument: getDocument,
              getWindow: getWindow,
              getIframeWindow: getIframeWindow,
              getIframeDocument: getIframeDocument,
              getBody: getBody,
              isWindow: isWindow,
              getContentDocument: getContentDocument,
              getRootContainer: getRootContainer,
              comparePoints: comparePoints,
              isBrokenNode: isBrokenNode,
              inspectNode: inspectNode,
              getComputedStyleProperty: getComputedStyleProperty,
              createTestElement: createTestElement,
              removeNode: removeNode,
              fragmentFromNodeChildren: fragmentFromNodeChildren,
              createIterator: createIterator,
              DomPosition: DomPosition
          };

          api.DOMException = DOMException;
      });

      /*----------------------------------------------------------------------------------------------------------------*/

      // Pure JavaScript implementation of DOM Range
      api.createCoreModule("DomRange", ["DomUtil"], function(api, module) {
          var dom = api.dom;
          var util = api.util;
          var DomPosition = dom.DomPosition;
          var DOMException = api.DOMException;

          var isCharacterDataNode = dom.isCharacterDataNode;
          var getNodeIndex = dom.getNodeIndex;
          var isOrIsAncestorOf = dom.isOrIsAncestorOf;
          var getDocument = dom.getDocument;
          var comparePoints = dom.comparePoints;
          var splitDataNode = dom.splitDataNode;
          var getClosestAncestorIn = dom.getClosestAncestorIn;
          var getNodeLength = dom.getNodeLength;
          var arrayContains = dom.arrayContains;
          var getRootContainer = dom.getRootContainer;
          var crashyTextNodes = api.features.crashyTextNodes;

          var removeNode = dom.removeNode;

          /*----------------------------------------------------------------------------------------------------------------*/

          // Utility functions

          function isNonTextPartiallySelected(node, range) {
              return (node.nodeType != 3) &&
                     (isOrIsAncestorOf(node, range.startContainer) || isOrIsAncestorOf(node, range.endContainer));
          }

          function getRangeDocument(range) {
              return range.document || getDocument(range.startContainer);
          }

          function getRangeRoot(range) {
              return getRootContainer(range.startContainer);
          }

          function getBoundaryBeforeNode(node) {
              return new DomPosition(node.parentNode, getNodeIndex(node));
          }

          function getBoundaryAfterNode(node) {
              return new DomPosition(node.parentNode, getNodeIndex(node) + 1);
          }

          function insertNodeAtPosition(node, n, o) {
              var firstNodeInserted = node.nodeType == 11 ? node.firstChild : node;
              if (isCharacterDataNode(n)) {
                  if (o == n.length) {
                      dom.insertAfter(node, n);
                  } else {
                      n.parentNode.insertBefore(node, o == 0 ? n : splitDataNode(n, o));
                  }
              } else if (o >= n.childNodes.length) {
                  n.appendChild(node);
              } else {
                  n.insertBefore(node, n.childNodes[o]);
              }
              return firstNodeInserted;
          }

          function rangesIntersect(rangeA, rangeB, touchingIsIntersecting) {
              assertRangeValid(rangeA);
              assertRangeValid(rangeB);

              if (getRangeDocument(rangeB) != getRangeDocument(rangeA)) {
                  throw new DOMException("WRONG_DOCUMENT_ERR");
              }

              var startComparison = comparePoints(rangeA.startContainer, rangeA.startOffset, rangeB.endContainer, rangeB.endOffset),
                  endComparison = comparePoints(rangeA.endContainer, rangeA.endOffset, rangeB.startContainer, rangeB.startOffset);

              return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
          }

          function cloneSubtree(iterator) {
              var partiallySelected;
              for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {
                  partiallySelected = iterator.isPartiallySelectedSubtree();
                  node = node.cloneNode(!partiallySelected);
                  if (partiallySelected) {
                      subIterator = iterator.getSubtreeIterator();
                      node.appendChild(cloneSubtree(subIterator));
                      subIterator.detach();
                  }

                  if (node.nodeType == 10) { // DocumentType
                      throw new DOMException("HIERARCHY_REQUEST_ERR");
                  }
                  frag.appendChild(node);
              }
              return frag;
          }

          function iterateSubtree(rangeIterator, func, iteratorState) {
              var it, n;
              iteratorState = iteratorState || { stop: false };
              for (var node, subRangeIterator; node = rangeIterator.next(); ) {
                  if (rangeIterator.isPartiallySelectedSubtree()) {
                      if (func(node) === false) {
                          iteratorState.stop = true;
                          return;
                      } else {
                          // The node is partially selected by the Range, so we can use a new RangeIterator on the portion of
                          // the node selected by the Range.
                          subRangeIterator = rangeIterator.getSubtreeIterator();
                          iterateSubtree(subRangeIterator, func, iteratorState);
                          subRangeIterator.detach();
                          if (iteratorState.stop) {
                              return;
                          }
                      }
                  } else {
                      // The whole node is selected, so we can use efficient DOM iteration to iterate over the node and its
                      // descendants
                      it = dom.createIterator(node);
                      while ( (n = it.next()) ) {
                          if (func(n) === false) {
                              iteratorState.stop = true;
                              return;
                          }
                      }
                  }
              }
          }

          function deleteSubtree(iterator) {
              var subIterator;
              while (iterator.next()) {
                  if (iterator.isPartiallySelectedSubtree()) {
                      subIterator = iterator.getSubtreeIterator();
                      deleteSubtree(subIterator);
                      subIterator.detach();
                  } else {
                      iterator.remove();
                  }
              }
          }

          function extractSubtree(iterator) {
              for (var node, frag = getRangeDocument(iterator.range).createDocumentFragment(), subIterator; node = iterator.next(); ) {

                  if (iterator.isPartiallySelectedSubtree()) {
                      node = node.cloneNode(false);
                      subIterator = iterator.getSubtreeIterator();
                      node.appendChild(extractSubtree(subIterator));
                      subIterator.detach();
                  } else {
                      iterator.remove();
                  }
                  if (node.nodeType == 10) { // DocumentType
                      throw new DOMException("HIERARCHY_REQUEST_ERR");
                  }
                  frag.appendChild(node);
              }
              return frag;
          }

          function getNodesInRange(range, nodeTypes, filter) {
              var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
              var filterExists = !!filter;
              if (filterNodeTypes) {
                  regex = new RegExp("^(" + nodeTypes.join("|") + ")$");
              }

              var nodes = [];
              iterateSubtree(new RangeIterator(range, false), function(node) {
                  if (filterNodeTypes && !regex.test(node.nodeType)) {
                      return;
                  }
                  if (filterExists && !filter(node)) {
                      return;
                  }
                  // Don't include a boundary container if it is a character data node and the range does not contain any
                  // of its character data. See issue 190.
                  var sc = range.startContainer;
                  if (node == sc && isCharacterDataNode(sc) && range.startOffset == sc.length) {
                      return;
                  }

                  var ec = range.endContainer;
                  if (node == ec && isCharacterDataNode(ec) && range.endOffset == 0) {
                      return;
                  }

                  nodes.push(node);
              });
              return nodes;
          }

          function inspect(range) {
              var name = (typeof range.getName == "undefined") ? "Range" : range.getName();
              return "[" + name + "(" + dom.inspectNode(range.startContainer) + ":" + range.startOffset + ", " +
                      dom.inspectNode(range.endContainer) + ":" + range.endOffset + ")]";
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // RangeIterator code partially borrows from IERange by Tim Ryan (http://github.com/timcameronryan/IERange)

          function RangeIterator(range, clonePartiallySelectedTextNodes) {
              this.range = range;
              this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;


              if (!range.collapsed) {
                  this.sc = range.startContainer;
                  this.so = range.startOffset;
                  this.ec = range.endContainer;
                  this.eo = range.endOffset;
                  var root = range.commonAncestorContainer;

                  if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
                      this.isSingleCharacterDataNode = true;
                      this._first = this._last = this._next = this.sc;
                  } else {
                      this._first = this._next = (this.sc === root && !isCharacterDataNode(this.sc)) ?
                          this.sc.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);
                      this._last = (this.ec === root && !isCharacterDataNode(this.ec)) ?
                          this.ec.childNodes[this.eo - 1] : getClosestAncestorIn(this.ec, root, true);
                  }
              }
          }

          RangeIterator.prototype = {
              _current: null,
              _next: null,
              _first: null,
              _last: null,
              isSingleCharacterDataNode: false,

              reset: function() {
                  this._current = null;
                  this._next = this._first;
              },

              hasNext: function() {
                  return !!this._next;
              },

              next: function() {
                  // Move to next node
                  var current = this._current = this._next;
                  if (current) {
                      this._next = (current !== this._last) ? current.nextSibling : null;

                      // Check for partially selected text nodes
                      if (isCharacterDataNode(current) && this.clonePartiallySelectedTextNodes) {
                          if (current === this.ec) {
                              (current = current.cloneNode(true)).deleteData(this.eo, current.length - this.eo);
                          }
                          if (this._current === this.sc) {
                              (current = current.cloneNode(true)).deleteData(0, this.so);
                          }
                      }
                  }

                  return current;
              },

              remove: function() {
                  var current = this._current, start, end;

                  if (isCharacterDataNode(current) && (current === this.sc || current === this.ec)) {
                      start = (current === this.sc) ? this.so : 0;
                      end = (current === this.ec) ? this.eo : current.length;
                      if (start != end) {
                          current.deleteData(start, end - start);
                      }
                  } else {
                      if (current.parentNode) {
                          removeNode(current);
                      } else {
                      }
                  }
              },

              // Checks if the current node is partially selected
              isPartiallySelectedSubtree: function() {
                  var current = this._current;
                  return isNonTextPartiallySelected(current, this.range);
              },

              getSubtreeIterator: function() {
                  var subRange;
                  if (this.isSingleCharacterDataNode) {
                      subRange = this.range.cloneRange();
                      subRange.collapse(false);
                  } else {
                      subRange = new Range(getRangeDocument(this.range));
                      var current = this._current;
                      var startContainer = current, startOffset = 0, endContainer = current, endOffset = getNodeLength(current);

                      if (isOrIsAncestorOf(current, this.sc)) {
                          startContainer = this.sc;
                          startOffset = this.so;
                      }
                      if (isOrIsAncestorOf(current, this.ec)) {
                          endContainer = this.ec;
                          endOffset = this.eo;
                      }

                      updateBoundaries(subRange, startContainer, startOffset, endContainer, endOffset);
                  }
                  return new RangeIterator(subRange, this.clonePartiallySelectedTextNodes);
              },

              detach: function() {
                  this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null;
              }
          };

          /*----------------------------------------------------------------------------------------------------------------*/

          var beforeAfterNodeTypes = [1, 3, 4, 5, 7, 8, 10];
          var rootContainerNodeTypes = [2, 9, 11];
          var readonlyNodeTypes = [5, 6, 10, 12];
          var insertableNodeTypes = [1, 3, 4, 5, 7, 8, 10, 11];
          var surroundNodeTypes = [1, 3, 4, 5, 7, 8];

          function createAncestorFinder(nodeTypes) {
              return function(node, selfIsAncestor) {
                  var t, n = selfIsAncestor ? node : node.parentNode;
                  while (n) {
                      t = n.nodeType;
                      if (arrayContains(nodeTypes, t)) {
                          return n;
                      }
                      n = n.parentNode;
                  }
                  return null;
              };
          }

          var getDocumentOrFragmentContainer = createAncestorFinder( [9, 11] );
          var getReadonlyAncestor = createAncestorFinder(readonlyNodeTypes);
          var getDocTypeNotationEntityAncestor = createAncestorFinder( [6, 10, 12] );

          function assertNoDocTypeNotationEntityAncestor(node, allowSelf) {
              if (getDocTypeNotationEntityAncestor(node, allowSelf)) {
                  throw new DOMException("INVALID_NODE_TYPE_ERR");
              }
          }

          function assertValidNodeType(node, invalidTypes) {
              if (!arrayContains(invalidTypes, node.nodeType)) {
                  throw new DOMException("INVALID_NODE_TYPE_ERR");
              }
          }

          function assertValidOffset(node, offset) {
              if (offset < 0 || offset > (isCharacterDataNode(node) ? node.length : node.childNodes.length)) {
                  throw new DOMException("INDEX_SIZE_ERR");
              }
          }

          function assertSameDocumentOrFragment(node1, node2) {
              if (getDocumentOrFragmentContainer(node1, true) !== getDocumentOrFragmentContainer(node2, true)) {
                  throw new DOMException("WRONG_DOCUMENT_ERR");
              }
          }

          function assertNodeNotReadOnly(node) {
              if (getReadonlyAncestor(node, true)) {
                  throw new DOMException("NO_MODIFICATION_ALLOWED_ERR");
              }
          }

          function assertNode(node, codeName) {
              if (!node) {
                  throw new DOMException(codeName);
              }
          }

          function isValidOffset(node, offset) {
              return offset <= (isCharacterDataNode(node) ? node.length : node.childNodes.length);
          }

          function isRangeValid(range) {
              return (!!range.startContainer && !!range.endContainer &&
                      !(crashyTextNodes && (dom.isBrokenNode(range.startContainer) || dom.isBrokenNode(range.endContainer))) &&
                      getRootContainer(range.startContainer) == getRootContainer(range.endContainer) &&
                      isValidOffset(range.startContainer, range.startOffset) &&
                      isValidOffset(range.endContainer, range.endOffset));
          }

          function assertRangeValid(range) {
              if (!isRangeValid(range)) {
                  throw new Error("Range error: Range is not valid. This usually happens after DOM mutation. Range: (" + range.inspect() + ")");
              }
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Test the browser's innerHTML support to decide how to implement createContextualFragment
          var styleEl = document.createElement("style");
          var htmlParsingConforms = false;
          try {
              styleEl.innerHTML = "<b>x</b>";
              htmlParsingConforms = (styleEl.firstChild.nodeType == 3); // Opera incorrectly creates an element node
          } catch (e) {
              // IE 6 and 7 throw
          }

          api.features.htmlParsingConforms = htmlParsingConforms;

          var createContextualFragment = htmlParsingConforms ?

              // Implementation as per HTML parsing spec, trusting in the browser's implementation of innerHTML. See
              // discussion and base code for this implementation at issue 67.
              // Spec: http://html5.org/specs/dom-parsing.html#extensions-to-the-range-interface
              // Thanks to Aleks Williams.
              function(fragmentStr) {
                  // "Let node the context object's start's node."
                  var node = this.startContainer;
                  var doc = getDocument(node);

                  // "If the context object's start's node is null, raise an INVALID_STATE_ERR
                  // exception and abort these steps."
                  if (!node) {
                      throw new DOMException("INVALID_STATE_ERR");
                  }

                  // "Let element be as follows, depending on node's interface:"
                  // Document, Document Fragment: null
                  var el = null;

                  // "Element: node"
                  if (node.nodeType == 1) {
                      el = node;

                  // "Text, Comment: node's parentElement"
                  } else if (isCharacterDataNode(node)) {
                      el = dom.parentElement(node);
                  }

                  // "If either element is null or element's ownerDocument is an HTML document
                  // and element's local name is "html" and element's namespace is the HTML
                  // namespace"
                  if (el === null || (
                      el.nodeName == "HTML" &&
                      dom.isHtmlNamespace(getDocument(el).documentElement) &&
                      dom.isHtmlNamespace(el)
                  )) {

                  // "let element be a new Element with "body" as its local name and the HTML
                  // namespace as its namespace.""
                      el = doc.createElement("body");
                  } else {
                      el = el.cloneNode(false);
                  }

                  // "If the node's document is an HTML document: Invoke the HTML fragment parsing algorithm."
                  // "If the node's document is an XML document: Invoke the XML fragment parsing algorithm."
                  // "In either case, the algorithm must be invoked with fragment as the input
                  // and element as the context element."
                  el.innerHTML = fragmentStr;

                  // "If this raises an exception, then abort these steps. Otherwise, let new
                  // children be the nodes returned."

                  // "Let fragment be a new DocumentFragment."
                  // "Append all new children to fragment."
                  // "Return fragment."
                  return dom.fragmentFromNodeChildren(el);
              } :

              // In this case, innerHTML cannot be trusted, so fall back to a simpler, non-conformant implementation that
              // previous versions of Rangy used (with the exception of using a body element rather than a div)
              function(fragmentStr) {
                  var doc = getRangeDocument(this);
                  var el = doc.createElement("body");
                  el.innerHTML = fragmentStr;

                  return dom.fragmentFromNodeChildren(el);
              };

          function splitRangeBoundaries(range, positionsToPreserve) {
              assertRangeValid(range);

              var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
              var startEndSame = (sc === ec);

              if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
                  splitDataNode(ec, eo, positionsToPreserve);
              }

              if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
                  sc = splitDataNode(sc, so, positionsToPreserve);
                  if (startEndSame) {
                      eo -= so;
                      ec = sc;
                  } else if (ec == sc.parentNode && eo >= getNodeIndex(sc)) {
                      eo++;
                  }
                  so = 0;
              }
              range.setStartAndEnd(sc, so, ec, eo);
          }

          function rangeToHtml(range) {
              assertRangeValid(range);
              var container = range.commonAncestorContainer.parentNode.cloneNode(false);
              container.appendChild( range.cloneContents() );
              return container.innerHTML;
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          var rangeProperties = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed",
              "commonAncestorContainer"];

          var s2s = 0, s2e = 1, e2e = 2, e2s = 3;
          var n_b = 0, n_a = 1, n_b_a = 2, n_i = 3;

          util.extend(api.rangePrototype, {
              compareBoundaryPoints: function(how, range) {
                  assertRangeValid(this);
                  assertSameDocumentOrFragment(this.startContainer, range.startContainer);

                  var nodeA, offsetA, nodeB, offsetB;
                  var prefixA = (how == e2s || how == s2s) ? "start" : "end";
                  var prefixB = (how == s2e || how == s2s) ? "start" : "end";
                  nodeA = this[prefixA + "Container"];
                  offsetA = this[prefixA + "Offset"];
                  nodeB = range[prefixB + "Container"];
                  offsetB = range[prefixB + "Offset"];
                  return comparePoints(nodeA, offsetA, nodeB, offsetB);
              },

              insertNode: function(node) {
                  assertRangeValid(this);
                  assertValidNodeType(node, insertableNodeTypes);
                  assertNodeNotReadOnly(this.startContainer);

                  if (isOrIsAncestorOf(node, this.startContainer)) {
                      throw new DOMException("HIERARCHY_REQUEST_ERR");
                  }

                  // No check for whether the container of the start of the Range is of a type that does not allow
                  // children of the type of node: the browser's DOM implementation should do this for us when we attempt
                  // to add the node

                  var firstNodeInserted = insertNodeAtPosition(node, this.startContainer, this.startOffset);
                  this.setStartBefore(firstNodeInserted);
              },

              cloneContents: function() {
                  assertRangeValid(this);

                  var clone, frag;
                  if (this.collapsed) {
                      return getRangeDocument(this).createDocumentFragment();
                  } else {
                      if (this.startContainer === this.endContainer && isCharacterDataNode(this.startContainer)) {
                          clone = this.startContainer.cloneNode(true);
                          clone.data = clone.data.slice(this.startOffset, this.endOffset);
                          frag = getRangeDocument(this).createDocumentFragment();
                          frag.appendChild(clone);
                          return frag;
                      } else {
                          var iterator = new RangeIterator(this, true);
                          clone = cloneSubtree(iterator);
                          iterator.detach();
                      }
                      return clone;
                  }
              },

              canSurroundContents: function() {
                  assertRangeValid(this);
                  assertNodeNotReadOnly(this.startContainer);
                  assertNodeNotReadOnly(this.endContainer);

                  // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                  // no non-text nodes.
                  var iterator = new RangeIterator(this, true);
                  var boundariesInvalid = (iterator._first && (isNonTextPartiallySelected(iterator._first, this)) ||
                          (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                  iterator.detach();
                  return !boundariesInvalid;
              },

              surroundContents: function(node) {
                  assertValidNodeType(node, surroundNodeTypes);

                  if (!this.canSurroundContents()) {
                      throw new DOMException("INVALID_STATE_ERR");
                  }

                  // Extract the contents
                  var content = this.extractContents();

                  // Clear the children of the node
                  if (node.hasChildNodes()) {
                      while (node.lastChild) {
                          node.removeChild(node.lastChild);
                      }
                  }

                  // Insert the new node and add the extracted contents
                  insertNodeAtPosition(node, this.startContainer, this.startOffset);
                  node.appendChild(content);

                  this.selectNode(node);
              },

              cloneRange: function() {
                  assertRangeValid(this);
                  var range = new Range(getRangeDocument(this));
                  var i = rangeProperties.length, prop;
                  while (i--) {
                      prop = rangeProperties[i];
                      range[prop] = this[prop];
                  }
                  return range;
              },

              toString: function() {
                  assertRangeValid(this);
                  var sc = this.startContainer;
                  if (sc === this.endContainer && isCharacterDataNode(sc)) {
                      return (sc.nodeType == 3 || sc.nodeType == 4) ? sc.data.slice(this.startOffset, this.endOffset) : "";
                  } else {
                      var textParts = [], iterator = new RangeIterator(this, true);
                      iterateSubtree(iterator, function(node) {
                          // Accept only text or CDATA nodes, not comments
                          if (node.nodeType == 3 || node.nodeType == 4) {
                              textParts.push(node.data);
                          }
                      });
                      iterator.detach();
                      return textParts.join("");
                  }
              },

              // The methods below are all non-standard. The following batch were introduced by Mozilla but have since
              // been removed from Mozilla.

              compareNode: function(node) {
                  assertRangeValid(this);

                  var parent = node.parentNode;
                  var nodeIndex = getNodeIndex(node);

                  if (!parent) {
                      throw new DOMException("NOT_FOUND_ERR");
                  }

                  var startComparison = this.comparePoint(parent, nodeIndex),
                      endComparison = this.comparePoint(parent, nodeIndex + 1);

                  if (startComparison < 0) { // Node starts before
                      return (endComparison > 0) ? n_b_a : n_b;
                  } else {
                      return (endComparison > 0) ? n_a : n_i;
                  }
              },

              comparePoint: function(node, offset) {
                  assertRangeValid(this);
                  assertNode(node, "HIERARCHY_REQUEST_ERR");
                  assertSameDocumentOrFragment(node, this.startContainer);

                  if (comparePoints(node, offset, this.startContainer, this.startOffset) < 0) {
                      return -1;
                  } else if (comparePoints(node, offset, this.endContainer, this.endOffset) > 0) {
                      return 1;
                  }
                  return 0;
              },

              createContextualFragment: createContextualFragment,

              toHtml: function() {
                  return rangeToHtml(this);
              },

              // touchingIsIntersecting determines whether this method considers a node that borders a range intersects
              // with it (as in WebKit) or not (as in Gecko pre-1.9, and the default)
              intersectsNode: function(node, touchingIsIntersecting) {
                  assertRangeValid(this);
                  if (getRootContainer(node) != getRangeRoot(this)) {
                      return false;
                  }

                  var parent = node.parentNode, offset = getNodeIndex(node);
                  if (!parent) {
                      return true;
                  }

                  var startComparison = comparePoints(parent, offset, this.endContainer, this.endOffset),
                      endComparison = comparePoints(parent, offset + 1, this.startContainer, this.startOffset);

                  return touchingIsIntersecting ? startComparison <= 0 && endComparison >= 0 : startComparison < 0 && endComparison > 0;
              },

              isPointInRange: function(node, offset) {
                  assertRangeValid(this);
                  assertNode(node, "HIERARCHY_REQUEST_ERR");
                  assertSameDocumentOrFragment(node, this.startContainer);

                  return (comparePoints(node, offset, this.startContainer, this.startOffset) >= 0) &&
                         (comparePoints(node, offset, this.endContainer, this.endOffset) <= 0);
              },

              // The methods below are non-standard and invented by me.

              // Sharing a boundary start-to-end or end-to-start does not count as intersection.
              intersectsRange: function(range) {
                  return rangesIntersect(this, range, false);
              },

              // Sharing a boundary start-to-end or end-to-start does count as intersection.
              intersectsOrTouchesRange: function(range) {
                  return rangesIntersect(this, range, true);
              },

              intersection: function(range) {
                  if (this.intersectsRange(range)) {
                      var startComparison = comparePoints(this.startContainer, this.startOffset, range.startContainer, range.startOffset),
                          endComparison = comparePoints(this.endContainer, this.endOffset, range.endContainer, range.endOffset);

                      var intersectionRange = this.cloneRange();
                      if (startComparison == -1) {
                          intersectionRange.setStart(range.startContainer, range.startOffset);
                      }
                      if (endComparison == 1) {
                          intersectionRange.setEnd(range.endContainer, range.endOffset);
                      }
                      return intersectionRange;
                  }
                  return null;
              },

              union: function(range) {
                  if (this.intersectsOrTouchesRange(range)) {
                      var unionRange = this.cloneRange();
                      if (comparePoints(range.startContainer, range.startOffset, this.startContainer, this.startOffset) == -1) {
                          unionRange.setStart(range.startContainer, range.startOffset);
                      }
                      if (comparePoints(range.endContainer, range.endOffset, this.endContainer, this.endOffset) == 1) {
                          unionRange.setEnd(range.endContainer, range.endOffset);
                      }
                      return unionRange;
                  } else {
                      throw new DOMException("Ranges do not intersect");
                  }
              },

              containsNode: function(node, allowPartial) {
                  if (allowPartial) {
                      return this.intersectsNode(node, false);
                  } else {
                      return this.compareNode(node) == n_i;
                  }
              },

              containsNodeContents: function(node) {
                  return this.comparePoint(node, 0) >= 0 && this.comparePoint(node, getNodeLength(node)) <= 0;
              },

              containsRange: function(range) {
                  var intersection = this.intersection(range);
                  return intersection !== null && range.equals(intersection);
              },

              containsNodeText: function(node) {
                  var nodeRange = this.cloneRange();
                  nodeRange.selectNode(node);
                  var textNodes = nodeRange.getNodes([3]);
                  if (textNodes.length > 0) {
                      nodeRange.setStart(textNodes[0], 0);
                      var lastTextNode = textNodes.pop();
                      nodeRange.setEnd(lastTextNode, lastTextNode.length);
                      return this.containsRange(nodeRange);
                  } else {
                      return this.containsNodeContents(node);
                  }
              },

              getNodes: function(nodeTypes, filter) {
                  assertRangeValid(this);
                  return getNodesInRange(this, nodeTypes, filter);
              },

              getDocument: function() {
                  return getRangeDocument(this);
              },

              collapseBefore: function(node) {
                  this.setEndBefore(node);
                  this.collapse(false);
              },

              collapseAfter: function(node) {
                  this.setStartAfter(node);
                  this.collapse(true);
              },

              getBookmark: function(containerNode) {
                  var doc = getRangeDocument(this);
                  var preSelectionRange = api.createRange(doc);
                  containerNode = containerNode || dom.getBody(doc);
                  preSelectionRange.selectNodeContents(containerNode);
                  var range = this.intersection(preSelectionRange);
                  var start = 0, end = 0;
                  if (range) {
                      preSelectionRange.setEnd(range.startContainer, range.startOffset);
                      start = preSelectionRange.toString().length;
                      end = start + range.toString().length;
                  }

                  return {
                      start: start,
                      end: end,
                      containerNode: containerNode
                  };
              },

              moveToBookmark: function(bookmark) {
                  var containerNode = bookmark.containerNode;
                  var charIndex = 0;
                  this.setStart(containerNode, 0);
                  this.collapse(true);
                  var nodeStack = [containerNode], node, foundStart = false, stop = false;
                  var nextCharIndex, i, childNodes;

                  while (!stop && (node = nodeStack.pop())) {
                      if (node.nodeType == 3) {
                          nextCharIndex = charIndex + node.length;
                          if (!foundStart && bookmark.start >= charIndex && bookmark.start <= nextCharIndex) {
                              this.setStart(node, bookmark.start - charIndex);
                              foundStart = true;
                          }
                          if (foundStart && bookmark.end >= charIndex && bookmark.end <= nextCharIndex) {
                              this.setEnd(node, bookmark.end - charIndex);
                              stop = true;
                          }
                          charIndex = nextCharIndex;
                      } else {
                          childNodes = node.childNodes;
                          i = childNodes.length;
                          while (i--) {
                              nodeStack.push(childNodes[i]);
                          }
                      }
                  }
              },

              getName: function() {
                  return "DomRange";
              },

              equals: function(range) {
                  return Range.rangesEqual(this, range);
              },

              isValid: function() {
                  return isRangeValid(this);
              },

              inspect: function() {
                  return inspect(this);
              },

              detach: function() {
                  // In DOM4, detach() is now a no-op.
              }
          });

          function copyComparisonConstantsToObject(obj) {
              obj.START_TO_START = s2s;
              obj.START_TO_END = s2e;
              obj.END_TO_END = e2e;
              obj.END_TO_START = e2s;

              obj.NODE_BEFORE = n_b;
              obj.NODE_AFTER = n_a;
              obj.NODE_BEFORE_AND_AFTER = n_b_a;
              obj.NODE_INSIDE = n_i;
          }

          function copyComparisonConstants(constructor) {
              copyComparisonConstantsToObject(constructor);
              copyComparisonConstantsToObject(constructor.prototype);
          }

          function createRangeContentRemover(remover, boundaryUpdater) {
              return function() {
                  assertRangeValid(this);

                  var sc = this.startContainer, so = this.startOffset, root = this.commonAncestorContainer;

                  var iterator = new RangeIterator(this, true);

                  // Work out where to position the range after content removal
                  var node, boundary;
                  if (sc !== root) {
                      node = getClosestAncestorIn(sc, root, true);
                      boundary = getBoundaryAfterNode(node);
                      sc = boundary.node;
                      so = boundary.offset;
                  }

                  // Check none of the range is read-only
                  iterateSubtree(iterator, assertNodeNotReadOnly);

                  iterator.reset();

                  // Remove the content
                  var returnValue = remover(iterator);
                  iterator.detach();

                  // Move to the new position
                  boundaryUpdater(this, sc, so, sc, so);

                  return returnValue;
              };
          }

          function createPrototypeRange(constructor, boundaryUpdater) {
              function createBeforeAfterNodeSetter(isBefore, isStart) {
                  return function(node) {
                      assertValidNodeType(node, beforeAfterNodeTypes);
                      assertValidNodeType(getRootContainer(node), rootContainerNodeTypes);

                      var boundary = (isBefore ? getBoundaryBeforeNode : getBoundaryAfterNode)(node);
                      (isStart ? setRangeStart : setRangeEnd)(this, boundary.node, boundary.offset);
                  };
              }

              function setRangeStart(range, node, offset) {
                  var ec = range.endContainer, eo = range.endOffset;
                  if (node !== range.startContainer || offset !== range.startOffset) {
                      // Check the root containers of the range and the new boundary, and also check whether the new boundary
                      // is after the current end. In either case, collapse the range to the new position
                      if (getRootContainer(node) != getRootContainer(ec) || comparePoints(node, offset, ec, eo) == 1) {
                          ec = node;
                          eo = offset;
                      }
                      boundaryUpdater(range, node, offset, ec, eo);
                  }
              }

              function setRangeEnd(range, node, offset) {
                  var sc = range.startContainer, so = range.startOffset;
                  if (node !== range.endContainer || offset !== range.endOffset) {
                      // Check the root containers of the range and the new boundary, and also check whether the new boundary
                      // is after the current end. In either case, collapse the range to the new position
                      if (getRootContainer(node) != getRootContainer(sc) || comparePoints(node, offset, sc, so) == -1) {
                          sc = node;
                          so = offset;
                      }
                      boundaryUpdater(range, sc, so, node, offset);
                  }
              }

              // Set up inheritance
              var F = function() {};
              F.prototype = api.rangePrototype;
              constructor.prototype = new F();

              util.extend(constructor.prototype, {
                  setStart: function(node, offset) {
                      assertNoDocTypeNotationEntityAncestor(node, true);
                      assertValidOffset(node, offset);

                      setRangeStart(this, node, offset);
                  },

                  setEnd: function(node, offset) {
                      assertNoDocTypeNotationEntityAncestor(node, true);
                      assertValidOffset(node, offset);

                      setRangeEnd(this, node, offset);
                  },

                  /**
                   * Convenience method to set a range's start and end boundaries. Overloaded as follows:
                   * - Two parameters (node, offset) creates a collapsed range at that position
                   * - Three parameters (node, startOffset, endOffset) creates a range contained with node starting at
                   *   startOffset and ending at endOffset
                   * - Four parameters (startNode, startOffset, endNode, endOffset) creates a range starting at startOffset in
                   *   startNode and ending at endOffset in endNode
                   */
                  setStartAndEnd: function() {
                      var args = arguments;
                      var sc = args[0], so = args[1], ec = sc, eo = so;

                      switch (args.length) {
                          case 3:
                              eo = args[2];
                              break;
                          case 4:
                              ec = args[2];
                              eo = args[3];
                              break;
                      }

                      boundaryUpdater(this, sc, so, ec, eo);
                  },

                  setBoundary: function(node, offset, isStart) {
                      this["set" + (isStart ? "Start" : "End")](node, offset);
                  },

                  setStartBefore: createBeforeAfterNodeSetter(true, true),
                  setStartAfter: createBeforeAfterNodeSetter(false, true),
                  setEndBefore: createBeforeAfterNodeSetter(true, false),
                  setEndAfter: createBeforeAfterNodeSetter(false, false),

                  collapse: function(isStart) {
                      assertRangeValid(this);
                      if (isStart) {
                          boundaryUpdater(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset);
                      } else {
                          boundaryUpdater(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset);
                      }
                  },

                  selectNodeContents: function(node) {
                      assertNoDocTypeNotationEntityAncestor(node, true);

                      boundaryUpdater(this, node, 0, node, getNodeLength(node));
                  },

                  selectNode: function(node) {
                      assertNoDocTypeNotationEntityAncestor(node, false);
                      assertValidNodeType(node, beforeAfterNodeTypes);

                      var start = getBoundaryBeforeNode(node), end = getBoundaryAfterNode(node);
                      boundaryUpdater(this, start.node, start.offset, end.node, end.offset);
                  },

                  extractContents: createRangeContentRemover(extractSubtree, boundaryUpdater),

                  deleteContents: createRangeContentRemover(deleteSubtree, boundaryUpdater),

                  canSurroundContents: function() {
                      assertRangeValid(this);
                      assertNodeNotReadOnly(this.startContainer);
                      assertNodeNotReadOnly(this.endContainer);

                      // Check if the contents can be surrounded. Specifically, this means whether the range partially selects
                      // no non-text nodes.
                      var iterator = new RangeIterator(this, true);
                      var boundariesInvalid = (iterator._first && isNonTextPartiallySelected(iterator._first, this) ||
                              (iterator._last && isNonTextPartiallySelected(iterator._last, this)));
                      iterator.detach();
                      return !boundariesInvalid;
                  },

                  splitBoundaries: function() {
                      splitRangeBoundaries(this);
                  },

                  splitBoundariesPreservingPositions: function(positionsToPreserve) {
                      splitRangeBoundaries(this, positionsToPreserve);
                  },

                  normalizeBoundaries: function() {
                      assertRangeValid(this);

                      var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;

                      var mergeForward = function(node) {
                          var sibling = node.nextSibling;
                          if (sibling && sibling.nodeType == node.nodeType) {
                              ec = node;
                              eo = node.length;
                              node.appendData(sibling.data);
                              removeNode(sibling);
                          }
                      };

                      var mergeBackward = function(node) {
                          var sibling = node.previousSibling;
                          if (sibling && sibling.nodeType == node.nodeType) {
                              sc = node;
                              var nodeLength = node.length;
                              so = sibling.length;
                              node.insertData(0, sibling.data);
                              removeNode(sibling);
                              if (sc == ec) {
                                  eo += so;
                                  ec = sc;
                              } else if (ec == node.parentNode) {
                                  var nodeIndex = getNodeIndex(node);
                                  if (eo == nodeIndex) {
                                      ec = node;
                                      eo = nodeLength;
                                  } else if (eo > nodeIndex) {
                                      eo--;
                                  }
                              }
                          }
                      };

                      var normalizeStart = true;
                      var sibling;

                      if (isCharacterDataNode(ec)) {
                          if (eo == ec.length) {
                              mergeForward(ec);
                          } else if (eo == 0) {
                              sibling = ec.previousSibling;
                              if (sibling && sibling.nodeType == ec.nodeType) {
                                  eo = sibling.length;
                                  if (sc == ec) {
                                      normalizeStart = false;
                                  }
                                  sibling.appendData(ec.data);
                                  removeNode(ec);
                                  ec = sibling;
                              }
                          }
                      } else {
                          if (eo > 0) {
                              var endNode = ec.childNodes[eo - 1];
                              if (endNode && isCharacterDataNode(endNode)) {
                                  mergeForward(endNode);
                              }
                          }
                          normalizeStart = !this.collapsed;
                      }

                      if (normalizeStart) {
                          if (isCharacterDataNode(sc)) {
                              if (so == 0) {
                                  mergeBackward(sc);
                              } else if (so == sc.length) {
                                  sibling = sc.nextSibling;
                                  if (sibling && sibling.nodeType == sc.nodeType) {
                                      if (ec == sibling) {
                                          ec = sc;
                                          eo += sc.length;
                                      }
                                      sc.appendData(sibling.data);
                                      removeNode(sibling);
                                  }
                              }
                          } else {
                              if (so < sc.childNodes.length) {
                                  var startNode = sc.childNodes[so];
                                  if (startNode && isCharacterDataNode(startNode)) {
                                      mergeBackward(startNode);
                                  }
                              }
                          }
                      } else {
                          sc = ec;
                          so = eo;
                      }

                      boundaryUpdater(this, sc, so, ec, eo);
                  },

                  collapseToPoint: function(node, offset) {
                      assertNoDocTypeNotationEntityAncestor(node, true);
                      assertValidOffset(node, offset);
                      this.setStartAndEnd(node, offset);
                  }
              });

              copyComparisonConstants(constructor);
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Updates commonAncestorContainer and collapsed after boundary change
          function updateCollapsedAndCommonAncestor(range) {
              range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
              range.commonAncestorContainer = range.collapsed ?
                  range.startContainer : dom.getCommonAncestor(range.startContainer, range.endContainer);
          }

          function updateBoundaries(range, startContainer, startOffset, endContainer, endOffset) {
              range.startContainer = startContainer;
              range.startOffset = startOffset;
              range.endContainer = endContainer;
              range.endOffset = endOffset;
              range.document = dom.getDocument(startContainer);

              updateCollapsedAndCommonAncestor(range);
          }

          function Range(doc) {
              this.startContainer = doc;
              this.startOffset = 0;
              this.endContainer = doc;
              this.endOffset = 0;
              this.document = doc;
              updateCollapsedAndCommonAncestor(this);
          }

          createPrototypeRange(Range, updateBoundaries);

          util.extend(Range, {
              rangeProperties: rangeProperties,
              RangeIterator: RangeIterator,
              copyComparisonConstants: copyComparisonConstants,
              createPrototypeRange: createPrototypeRange,
              inspect: inspect,
              toHtml: rangeToHtml,
              getRangeDocument: getRangeDocument,
              rangesEqual: function(r1, r2) {
                  return r1.startContainer === r2.startContainer &&
                      r1.startOffset === r2.startOffset &&
                      r1.endContainer === r2.endContainer &&
                      r1.endOffset === r2.endOffset;
              }
          });

          api.DomRange = Range;
      });

      /*----------------------------------------------------------------------------------------------------------------*/

      // Wrappers for the browser's native DOM Range and/or TextRange implementation
      api.createCoreModule("WrappedRange", ["DomRange"], function(api, module) {
          var WrappedRange, WrappedTextRange;
          var dom = api.dom;
          var util = api.util;
          var DomPosition = dom.DomPosition;
          var DomRange = api.DomRange;
          var getBody = dom.getBody;
          var getContentDocument = dom.getContentDocument;
          var isCharacterDataNode = dom.isCharacterDataNode;


          /*----------------------------------------------------------------------------------------------------------------*/

          if (api.features.implementsDomRange) {
              // This is a wrapper around the browser's native DOM Range. It has two aims:
              // - Provide workarounds for specific browser bugs
              // - provide convenient extensions, which are inherited from Rangy's DomRange

              (function() {
                  var rangeProto;
                  var rangeProperties = DomRange.rangeProperties;

                  function updateRangeProperties(range) {
                      var i = rangeProperties.length, prop;
                      while (i--) {
                          prop = rangeProperties[i];
                          range[prop] = range.nativeRange[prop];
                      }
                      // Fix for broken collapsed property in IE 9.
                      range.collapsed = (range.startContainer === range.endContainer && range.startOffset === range.endOffset);
                  }

                  function updateNativeRange(range, startContainer, startOffset, endContainer, endOffset) {
                      var startMoved = (range.startContainer !== startContainer || range.startOffset != startOffset);
                      var endMoved = (range.endContainer !== endContainer || range.endOffset != endOffset);
                      var nativeRangeDifferent = !range.equals(range.nativeRange);

                      // Always set both boundaries for the benefit of IE9 (see issue 35)
                      if (startMoved || endMoved || nativeRangeDifferent) {
                          range.setEnd(endContainer, endOffset);
                          range.setStart(startContainer, startOffset);
                      }
                  }

                  var createBeforeAfterNodeSetter;

                  WrappedRange = function(range) {
                      if (!range) {
                          throw module.createError("WrappedRange: Range must be specified");
                      }
                      this.nativeRange = range;
                      updateRangeProperties(this);
                  };

                  DomRange.createPrototypeRange(WrappedRange, updateNativeRange);

                  rangeProto = WrappedRange.prototype;

                  rangeProto.selectNode = function(node) {
                      this.nativeRange.selectNode(node);
                      updateRangeProperties(this);
                  };

                  rangeProto.cloneContents = function() {
                      return this.nativeRange.cloneContents();
                  };

                  // Due to a long-standing Firefox bug that I have not been able to find a reliable way to detect,
                  // insertNode() is never delegated to the native range.

                  rangeProto.surroundContents = function(node) {
                      this.nativeRange.surroundContents(node);
                      updateRangeProperties(this);
                  };

                  rangeProto.collapse = function(isStart) {
                      this.nativeRange.collapse(isStart);
                      updateRangeProperties(this);
                  };

                  rangeProto.cloneRange = function() {
                      return new WrappedRange(this.nativeRange.cloneRange());
                  };

                  rangeProto.refresh = function() {
                      updateRangeProperties(this);
                  };

                  rangeProto.toString = function() {
                      return this.nativeRange.toString();
                  };

                  // Create test range and node for feature detection

                  var testTextNode = document.createTextNode("test");
                  getBody(document).appendChild(testTextNode);
                  var range = document.createRange();

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Test for Firefox 2 bug that prevents moving the start of a Range to a point after its current end and
                  // correct for it

                  range.setStart(testTextNode, 0);
                  range.setEnd(testTextNode, 0);

                  try {
                      range.setStart(testTextNode, 1);

                      rangeProto.setStart = function(node, offset) {
                          this.nativeRange.setStart(node, offset);
                          updateRangeProperties(this);
                      };

                      rangeProto.setEnd = function(node, offset) {
                          this.nativeRange.setEnd(node, offset);
                          updateRangeProperties(this);
                      };

                      createBeforeAfterNodeSetter = function(name) {
                          return function(node) {
                              this.nativeRange[name](node);
                              updateRangeProperties(this);
                          };
                      };

                  } catch(ex) {

                      rangeProto.setStart = function(node, offset) {
                          try {
                              this.nativeRange.setStart(node, offset);
                          } catch (ex) {
                              this.nativeRange.setEnd(node, offset);
                              this.nativeRange.setStart(node, offset);
                          }
                          updateRangeProperties(this);
                      };

                      rangeProto.setEnd = function(node, offset) {
                          try {
                              this.nativeRange.setEnd(node, offset);
                          } catch (ex) {
                              this.nativeRange.setStart(node, offset);
                              this.nativeRange.setEnd(node, offset);
                          }
                          updateRangeProperties(this);
                      };

                      createBeforeAfterNodeSetter = function(name, oppositeName) {
                          return function(node) {
                              try {
                                  this.nativeRange[name](node);
                              } catch (ex) {
                                  this.nativeRange[oppositeName](node);
                                  this.nativeRange[name](node);
                              }
                              updateRangeProperties(this);
                          };
                      };
                  }

                  rangeProto.setStartBefore = createBeforeAfterNodeSetter("setStartBefore", "setEndBefore");
                  rangeProto.setStartAfter = createBeforeAfterNodeSetter("setStartAfter", "setEndAfter");
                  rangeProto.setEndBefore = createBeforeAfterNodeSetter("setEndBefore", "setStartBefore");
                  rangeProto.setEndAfter = createBeforeAfterNodeSetter("setEndAfter", "setStartAfter");

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Always use DOM4-compliant selectNodeContents implementation: it's simpler and less code than testing
                  // whether the native implementation can be trusted
                  rangeProto.selectNodeContents = function(node) {
                      this.setStartAndEnd(node, 0, dom.getNodeLength(node));
                  };

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Test for and correct WebKit bug that has the behaviour of compareBoundaryPoints round the wrong way for
                  // constants START_TO_END and END_TO_START: https://bugs.webkit.org/show_bug.cgi?id=20738

                  range.selectNodeContents(testTextNode);
                  range.setEnd(testTextNode, 3);

                  var range2 = document.createRange();
                  range2.selectNodeContents(testTextNode);
                  range2.setEnd(testTextNode, 4);
                  range2.setStart(testTextNode, 2);

                  if (range.compareBoundaryPoints(range.START_TO_END, range2) == -1 &&
                          range.compareBoundaryPoints(range.END_TO_START, range2) == 1) {
                      // This is the wrong way round, so correct for it

                      rangeProto.compareBoundaryPoints = function(type, range) {
                          range = range.nativeRange || range;
                          if (type == range.START_TO_END) {
                              type = range.END_TO_START;
                          } else if (type == range.END_TO_START) {
                              type = range.START_TO_END;
                          }
                          return this.nativeRange.compareBoundaryPoints(type, range);
                      };
                  } else {
                      rangeProto.compareBoundaryPoints = function(type, range) {
                          return this.nativeRange.compareBoundaryPoints(type, range.nativeRange || range);
                      };
                  }

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Test for IE deleteContents() and extractContents() bug and correct it. See issue 107.

                  var el = document.createElement("div");
                  el.innerHTML = "123";
                  var textNode = el.firstChild;
                  var body = getBody(document);
                  body.appendChild(el);

                  range.setStart(textNode, 1);
                  range.setEnd(textNode, 2);
                  range.deleteContents();

                  if (textNode.data == "13") {
                      // Behaviour is correct per DOM4 Range so wrap the browser's implementation of deleteContents() and
                      // extractContents()
                      rangeProto.deleteContents = function() {
                          this.nativeRange.deleteContents();
                          updateRangeProperties(this);
                      };

                      rangeProto.extractContents = function() {
                          var frag = this.nativeRange.extractContents();
                          updateRangeProperties(this);
                          return frag;
                      };
                  } else {
                  }

                  body.removeChild(el);
                  body = null;

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Test for existence of createContextualFragment and delegate to it if it exists
                  if (util.isHostMethod(range, "createContextualFragment")) {
                      rangeProto.createContextualFragment = function(fragmentStr) {
                          return this.nativeRange.createContextualFragment(fragmentStr);
                      };
                  }

                  /*--------------------------------------------------------------------------------------------------------*/

                  // Clean up
                  getBody(document).removeChild(testTextNode);

                  rangeProto.getName = function() {
                      return "WrappedRange";
                  };

                  api.WrappedRange = WrappedRange;

                  api.createNativeRange = function(doc) {
                      doc = getContentDocument(doc, module, "createNativeRange");
                      return doc.createRange();
                  };
              })();
          }

          if (api.features.implementsTextRange) {
              /*
              This is a workaround for a bug where IE returns the wrong container element from the TextRange's parentElement()
              method. For example, in the following (where pipes denote the selection boundaries):

              <ul id="ul"><li id="a">| a </li><li id="b"> b |</li></ul>

              var range = document.selection.createRange();
              alert(range.parentElement().id); // Should alert "ul" but alerts "b"

              This method returns the common ancestor node of the following:
              - the parentElement() of the textRange
              - the parentElement() of the textRange after calling collapse(true)
              - the parentElement() of the textRange after calling collapse(false)
              */
              var getTextRangeContainerElement = function(textRange) {
                  var parentEl = textRange.parentElement();
                  var range = textRange.duplicate();
                  range.collapse(true);
                  var startEl = range.parentElement();
                  range = textRange.duplicate();
                  range.collapse(false);
                  var endEl = range.parentElement();
                  var startEndContainer = (startEl == endEl) ? startEl : dom.getCommonAncestor(startEl, endEl);

                  return startEndContainer == parentEl ? startEndContainer : dom.getCommonAncestor(parentEl, startEndContainer);
              };

              var textRangeIsCollapsed = function(textRange) {
                  return textRange.compareEndPoints("StartToEnd", textRange) == 0;
              };

              // Gets the boundary of a TextRange expressed as a node and an offset within that node. This function started
              // out as an improved version of code found in Tim Cameron Ryan's IERange (http://code.google.com/p/ierange/)
              // but has grown, fixing problems with line breaks in preformatted text, adding workaround for IE TextRange
              // bugs, handling for inputs and images, plus optimizations.
              var getTextRangeBoundaryPosition = function(textRange, wholeRangeContainerElement, isStart, isCollapsed, startInfo) {
                  var workingRange = textRange.duplicate();
                  workingRange.collapse(isStart);
                  var containerElement = workingRange.parentElement();

                  // Sometimes collapsing a TextRange that's at the start of a text node can move it into the previous node, so
                  // check for that
                  if (!dom.isOrIsAncestorOf(wholeRangeContainerElement, containerElement)) {
                      containerElement = wholeRangeContainerElement;
                  }


                  // Deal with nodes that cannot "contain rich HTML markup". In practice, this means form inputs, images and
                  // similar. See http://msdn.microsoft.com/en-us/library/aa703950%28VS.85%29.aspx
                  if (!containerElement.canHaveHTML) {
                      var pos = new DomPosition(containerElement.parentNode, dom.getNodeIndex(containerElement));
                      return {
                          boundaryPosition: pos,
                          nodeInfo: {
                              nodeIndex: pos.offset,
                              containerElement: pos.node
                          }
                      };
                  }

                  var workingNode = dom.getDocument(containerElement).createElement("span");

                  // Workaround for HTML5 Shiv's insane violation of document.createElement(). See Rangy issue 104 and HTML5
                  // Shiv issue 64: https://github.com/aFarkas/html5shiv/issues/64
                  if (workingNode.parentNode) {
                      dom.removeNode(workingNode);
                  }

                  var comparison, workingComparisonType = isStart ? "StartToStart" : "StartToEnd";
                  var previousNode, nextNode, boundaryPosition, boundaryNode;
                  var start = (startInfo && startInfo.containerElement == containerElement) ? startInfo.nodeIndex : 0;
                  var childNodeCount = containerElement.childNodes.length;
                  var end = childNodeCount;

                  // Check end first. Code within the loop assumes that the endth child node of the container is definitely
                  // after the range boundary.
                  var nodeIndex = end;

                  while (true) {
                      if (nodeIndex == childNodeCount) {
                          containerElement.appendChild(workingNode);
                      } else {
                          containerElement.insertBefore(workingNode, containerElement.childNodes[nodeIndex]);
                      }
                      workingRange.moveToElementText(workingNode);
                      comparison = workingRange.compareEndPoints(workingComparisonType, textRange);
                      if (comparison == 0 || start == end) {
                          break;
                      } else if (comparison == -1) {
                          if (end == start + 1) {
                              // We know the endth child node is after the range boundary, so we must be done.
                              break;
                          } else {
                              start = nodeIndex;
                          }
                      } else {
                          end = (end == start + 1) ? start : nodeIndex;
                      }
                      nodeIndex = Math.floor((start + end) / 2);
                      containerElement.removeChild(workingNode);
                  }


                  // We've now reached or gone past the boundary of the text range we're interested in
                  // so have identified the node we want
                  boundaryNode = workingNode.nextSibling;

                  if (comparison == -1 && boundaryNode && isCharacterDataNode(boundaryNode)) {
                      // This is a character data node (text, comment, cdata). The working range is collapsed at the start of
                      // the node containing the text range's boundary, so we move the end of the working range to the
                      // boundary point and measure the length of its text to get the boundary's offset within the node.
                      workingRange.setEndPoint(isStart ? "EndToStart" : "EndToEnd", textRange);

                      var offset;

                      if (/[\r\n]/.test(boundaryNode.data)) {
                          /*
                          For the particular case of a boundary within a text node containing rendered line breaks (within a
                          <pre> element, for example), we need a slightly complicated approach to get the boundary's offset in
                          IE. The facts:

                          - Each line break is represented as \r in the text node's data/nodeValue properties
                          - Each line break is represented as \r\n in the TextRange's 'text' property
                          - The 'text' property of the TextRange does not contain trailing line breaks

                          To get round the problem presented by the final fact above, we can use the fact that TextRange's
                          moveStart() and moveEnd() methods return the actual number of characters moved, which is not
                          necessarily the same as the number of characters it was instructed to move. The simplest approach is
                          to use this to store the characters moved when moving both the start and end of the range to the
                          start of the document body and subtracting the start offset from the end offset (the
                          "move-negative-gazillion" method). However, this is extremely slow when the document is large and
                          the range is near the end of it. Clearly doing the mirror image (i.e. moving the range boundaries to
                          the end of the document) has the same problem.

                          Another approach that works is to use moveStart() to move the start boundary of the range up to the
                          end boundary one character at a time and incrementing a counter with the value returned by the
                          moveStart() call. However, the check for whether the start boundary has reached the end boundary is
                          expensive, so this method is slow (although unlike "move-negative-gazillion" is largely unaffected
                          by the location of the range within the document).

                          The approach used below is a hybrid of the two methods above. It uses the fact that a string
                          containing the TextRange's 'text' property with each \r\n converted to a single \r character cannot
                          be longer than the text of the TextRange, so the start of the range is moved that length initially
                          and then a character at a time to make up for any trailing line breaks not contained in the 'text'
                          property. This has good performance in most situations compared to the previous two methods.
                          */
                          var tempRange = workingRange.duplicate();
                          var rangeLength = tempRange.text.replace(/\r\n/g, "\r").length;

                          offset = tempRange.moveStart("character", rangeLength);
                          while ( (comparison = tempRange.compareEndPoints("StartToEnd", tempRange)) == -1) {
                              offset++;
                              tempRange.moveStart("character", 1);
                          }
                      } else {
                          offset = workingRange.text.length;
                      }
                      boundaryPosition = new DomPosition(boundaryNode, offset);
                  } else {

                      // If the boundary immediately follows a character data node and this is the end boundary, we should favour
                      // a position within that, and likewise for a start boundary preceding a character data node
                      previousNode = (isCollapsed || !isStart) && workingNode.previousSibling;
                      nextNode = (isCollapsed || isStart) && workingNode.nextSibling;
                      if (nextNode && isCharacterDataNode(nextNode)) {
                          boundaryPosition = new DomPosition(nextNode, 0);
                      } else if (previousNode && isCharacterDataNode(previousNode)) {
                          boundaryPosition = new DomPosition(previousNode, previousNode.data.length);
                      } else {
                          boundaryPosition = new DomPosition(containerElement, dom.getNodeIndex(workingNode));
                      }
                  }

                  // Clean up
                  dom.removeNode(workingNode);

                  return {
                      boundaryPosition: boundaryPosition,
                      nodeInfo: {
                          nodeIndex: nodeIndex,
                          containerElement: containerElement
                      }
                  };
              };

              // Returns a TextRange representing the boundary of a TextRange expressed as a node and an offset within that
              // node. This function started out as an optimized version of code found in Tim Cameron Ryan's IERange
              // (http://code.google.com/p/ierange/)
              var createBoundaryTextRange = function(boundaryPosition, isStart) {
                  var boundaryNode, boundaryParent, boundaryOffset = boundaryPosition.offset;
                  var doc = dom.getDocument(boundaryPosition.node);
                  var workingNode, childNodes, workingRange = getBody(doc).createTextRange();
                  var nodeIsDataNode = isCharacterDataNode(boundaryPosition.node);

                  if (nodeIsDataNode) {
                      boundaryNode = boundaryPosition.node;
                      boundaryParent = boundaryNode.parentNode;
                  } else {
                      childNodes = boundaryPosition.node.childNodes;
                      boundaryNode = (boundaryOffset < childNodes.length) ? childNodes[boundaryOffset] : null;
                      boundaryParent = boundaryPosition.node;
                  }

                  // Position the range immediately before the node containing the boundary
                  workingNode = doc.createElement("span");

                  // Making the working element non-empty element persuades IE to consider the TextRange boundary to be within
                  // the element rather than immediately before or after it
                  workingNode.innerHTML = "&#feff;";

                  // insertBefore is supposed to work like appendChild if the second parameter is null. However, a bug report
                  // for IERange suggests that it can crash the browser: http://code.google.com/p/ierange/issues/detail?id=12
                  if (boundaryNode) {
                      boundaryParent.insertBefore(workingNode, boundaryNode);
                  } else {
                      boundaryParent.appendChild(workingNode);
                  }

                  workingRange.moveToElementText(workingNode);
                  workingRange.collapse(!isStart);

                  // Clean up
                  boundaryParent.removeChild(workingNode);

                  // Move the working range to the text offset, if required
                  if (nodeIsDataNode) {
                      workingRange[isStart ? "moveStart" : "moveEnd"]("character", boundaryOffset);
                  }

                  return workingRange;
              };

              /*------------------------------------------------------------------------------------------------------------*/

              // This is a wrapper around a TextRange, providing full DOM Range functionality using rangy's DomRange as a
              // prototype

              WrappedTextRange = function(textRange) {
                  this.textRange = textRange;
                  this.refresh();
              };

              WrappedTextRange.prototype = new DomRange(document);

              WrappedTextRange.prototype.refresh = function() {
                  var start, end, startBoundary;

                  // TextRange's parentElement() method cannot be trusted. getTextRangeContainerElement() works around that.
                  var rangeContainerElement = getTextRangeContainerElement(this.textRange);

                  if (textRangeIsCollapsed(this.textRange)) {
                      end = start = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true,
                          true).boundaryPosition;
                  } else {
                      startBoundary = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, true, false);
                      start = startBoundary.boundaryPosition;

                      // An optimization used here is that if the start and end boundaries have the same parent element, the
                      // search scope for the end boundary can be limited to exclude the portion of the element that precedes
                      // the start boundary
                      end = getTextRangeBoundaryPosition(this.textRange, rangeContainerElement, false, false,
                          startBoundary.nodeInfo).boundaryPosition;
                  }

                  this.setStart(start.node, start.offset);
                  this.setEnd(end.node, end.offset);
              };

              WrappedTextRange.prototype.getName = function() {
                  return "WrappedTextRange";
              };

              DomRange.copyComparisonConstants(WrappedTextRange);

              var rangeToTextRange = function(range) {
                  if (range.collapsed) {
                      return createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                  } else {
                      var startRange = createBoundaryTextRange(new DomPosition(range.startContainer, range.startOffset), true);
                      var endRange = createBoundaryTextRange(new DomPosition(range.endContainer, range.endOffset), false);
                      var textRange = getBody( DomRange.getRangeDocument(range) ).createTextRange();
                      textRange.setEndPoint("StartToStart", startRange);
                      textRange.setEndPoint("EndToEnd", endRange);
                      return textRange;
                  }
              };

              WrappedTextRange.rangeToTextRange = rangeToTextRange;

              WrappedTextRange.prototype.toTextRange = function() {
                  return rangeToTextRange(this);
              };

              api.WrappedTextRange = WrappedTextRange;

              // IE 9 and above have both implementations and Rangy makes both available. The next few lines sets which
              // implementation to use by default.
              if (!api.features.implementsDomRange || api.config.preferTextRange) {
                  // Add WrappedTextRange as the Range property of the global object to allow expression like Range.END_TO_END to work
                  var globalObj = (function(f) { return f("return this;")(); })(Function);
                  if (typeof globalObj.Range == "undefined") {
                      globalObj.Range = WrappedTextRange;
                  }

                  api.createNativeRange = function(doc) {
                      doc = getContentDocument(doc, module, "createNativeRange");
                      return getBody(doc).createTextRange();
                  };

                  api.WrappedRange = WrappedTextRange;
              }
          }

          api.createRange = function(doc) {
              doc = getContentDocument(doc, module, "createRange");
              return new api.WrappedRange(api.createNativeRange(doc));
          };

          api.createRangyRange = function(doc) {
              doc = getContentDocument(doc, module, "createRangyRange");
              return new DomRange(doc);
          };

          util.createAliasForDeprecatedMethod(api, "createIframeRange", "createRange");
          util.createAliasForDeprecatedMethod(api, "createIframeRangyRange", "createRangyRange");

          api.addShimListener(function(win) {
              var doc = win.document;
              if (typeof doc.createRange == "undefined") {
                  doc.createRange = function() {
                      return api.createRange(doc);
                  };
              }
              doc = win = null;
          });
      });

      /*----------------------------------------------------------------------------------------------------------------*/

      // This module creates a selection object wrapper that conforms as closely as possible to the Selection specification
      // in the HTML Editing spec (http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
      api.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(api, module) {
          api.config.checkSelectionRanges = true;

          var BOOLEAN = "boolean";
          var NUMBER = "number";
          var dom = api.dom;
          var util = api.util;
          var isHostMethod = util.isHostMethod;
          var DomRange = api.DomRange;
          var WrappedRange = api.WrappedRange;
          var DOMException = api.DOMException;
          var DomPosition = dom.DomPosition;
          var getNativeSelection;
          var selectionIsCollapsed;
          var features = api.features;
          var CONTROL = "Control";
          var getDocument = dom.getDocument;
          var getBody = dom.getBody;
          var rangesEqual = DomRange.rangesEqual;


          // Utility function to support direction parameters in the API that may be a string ("backward", "backwards",
          // "forward" or "forwards") or a Boolean (true for backwards).
          function isDirectionBackward(dir) {
              return (typeof dir == "string") ? /^backward(s)?$/i.test(dir) : !!dir;
          }

          function getWindow(win, methodName) {
              if (!win) {
                  return window;
              } else if (dom.isWindow(win)) {
                  return win;
              } else if (win instanceof WrappedSelection) {
                  return win.win;
              } else {
                  var doc = dom.getContentDocument(win, module, methodName);
                  return dom.getWindow(doc);
              }
          }

          function getWinSelection(winParam) {
              return getWindow(winParam, "getWinSelection").getSelection();
          }

          function getDocSelection(winParam) {
              return getWindow(winParam, "getDocSelection").document.selection;
          }

          function winSelectionIsBackward(sel) {
              var backward = false;
              if (sel.anchorNode) {
                  backward = (dom.comparePoints(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset) == 1);
              }
              return backward;
          }

          // Test for the Range/TextRange and Selection features required
          // Test for ability to retrieve selection
          var implementsWinGetSelection = isHostMethod(window, "getSelection"),
              implementsDocSelection = util.isHostObject(document, "selection");

          features.implementsWinGetSelection = implementsWinGetSelection;
          features.implementsDocSelection = implementsDocSelection;

          var useDocumentSelection = implementsDocSelection && (!implementsWinGetSelection || api.config.preferTextRange);

          if (useDocumentSelection) {
              getNativeSelection = getDocSelection;
              api.isSelectionValid = function(winParam) {
                  var doc = getWindow(winParam, "isSelectionValid").document, nativeSel = doc.selection;

                  // Check whether the selection TextRange is actually contained within the correct document
                  return (nativeSel.type != "None" || getDocument(nativeSel.createRange().parentElement()) == doc);
              };
          } else if (implementsWinGetSelection) {
              getNativeSelection = getWinSelection;
              api.isSelectionValid = function() {
                  return true;
              };
          } else {
              module.fail("Neither document.selection or window.getSelection() detected.");
              return false;
          }

          api.getNativeSelection = getNativeSelection;

          var testSelection = getNativeSelection();

          // In Firefox, the selection is null in an iframe with display: none. See issue #138.
          if (!testSelection) {
              module.fail("Native selection was null (possibly issue 138?)");
              return false;
          }

          var testRange = api.createNativeRange(document);
          var body = getBody(document);

          // Obtaining a range from a selection
          var selectionHasAnchorAndFocus = util.areHostProperties(testSelection,
              ["anchorNode", "focusNode", "anchorOffset", "focusOffset"]);

          features.selectionHasAnchorAndFocus = selectionHasAnchorAndFocus;

          // Test for existence of native selection extend() method
          var selectionHasExtend = isHostMethod(testSelection, "extend");
          features.selectionHasExtend = selectionHasExtend;

          // Test if rangeCount exists
          var selectionHasRangeCount = (typeof testSelection.rangeCount == NUMBER);
          features.selectionHasRangeCount = selectionHasRangeCount;

          var selectionSupportsMultipleRanges = false;
          var collapsedNonEditableSelectionsSupported = true;

          var addRangeBackwardToNative = selectionHasExtend ?
              function(nativeSelection, range) {
                  var doc = DomRange.getRangeDocument(range);
                  var endRange = api.createRange(doc);
                  endRange.collapseToPoint(range.endContainer, range.endOffset);
                  nativeSelection.addRange(getNativeRange(endRange));
                  nativeSelection.extend(range.startContainer, range.startOffset);
              } : null;

          if (util.areHostMethods(testSelection, ["addRange", "getRangeAt", "removeAllRanges"]) &&
                  typeof testSelection.rangeCount == NUMBER && features.implementsDomRange) {

              (function() {
                  // Previously an iframe was used but this caused problems in some circumstances in IE, so tests are
                  // performed on the current document's selection. See issue 109.

                  // Note also that if a selection previously existed, it is wiped and later restored by these tests. This
                  // will result in the selection direction begin reversed if the original selection was backwards and the
                  // browser does not support setting backwards selections (Internet Explorer, I'm looking at you).
                  var sel = window.getSelection();
                  if (sel) {
                      // Store the current selection
                      var originalSelectionRangeCount = sel.rangeCount;
                      var selectionHasMultipleRanges = (originalSelectionRangeCount > 1);
                      var originalSelectionRanges = [];
                      var originalSelectionBackward = winSelectionIsBackward(sel);
                      for (var i = 0; i < originalSelectionRangeCount; ++i) {
                          originalSelectionRanges[i] = sel.getRangeAt(i);
                      }

                      // Create some test elements
                      var testEl = dom.createTestElement(document, "", false);
                      var textNode = testEl.appendChild( document.createTextNode("\u00a0\u00a0\u00a0") );

                      // Test whether the native selection will allow a collapsed selection within a non-editable element
                      var r1 = document.createRange();

                      r1.setStart(textNode, 1);
                      r1.collapse(true);
                      sel.removeAllRanges();
                      sel.addRange(r1);
                      collapsedNonEditableSelectionsSupported = (sel.rangeCount == 1);
                      sel.removeAllRanges();

                      // Test whether the native selection is capable of supporting multiple ranges.
                      if (!selectionHasMultipleRanges) {
                          // Doing the original feature test here in Chrome 36 (and presumably later versions) prints a
                          // console error of "Discontiguous selection is not supported." that cannot be suppressed. There's
                          // nothing we can do about this while retaining the feature test so we have to resort to a browser
                          // sniff. I'm not happy about it. See
                          // https://code.google.com/p/chromium/issues/detail?id=399791
                          var chromeMatch = window.navigator.appVersion.match(/Chrome\/(.*?) /);
                          if (chromeMatch && parseInt(chromeMatch[1]) >= 36) {
                              selectionSupportsMultipleRanges = false;
                          } else {
                              var r2 = r1.cloneRange();
                              r1.setStart(textNode, 0);
                              r2.setEnd(textNode, 3);
                              r2.setStart(textNode, 2);
                              sel.addRange(r1);
                              sel.addRange(r2);
                              selectionSupportsMultipleRanges = (sel.rangeCount == 2);
                          }
                      }

                      // Clean up
                      dom.removeNode(testEl);
                      sel.removeAllRanges();

                      for (i = 0; i < originalSelectionRangeCount; ++i) {
                          if (i == 0 && originalSelectionBackward) {
                              if (addRangeBackwardToNative) {
                                  addRangeBackwardToNative(sel, originalSelectionRanges[i]);
                              } else {
                                  api.warn("Rangy initialization: original selection was backwards but selection has been restored forwards because the browser does not support Selection.extend");
                                  sel.addRange(originalSelectionRanges[i]);
                              }
                          } else {
                              sel.addRange(originalSelectionRanges[i]);
                          }
                      }
                  }
              })();
          }

          features.selectionSupportsMultipleRanges = selectionSupportsMultipleRanges;
          features.collapsedNonEditableSelectionsSupported = collapsedNonEditableSelectionsSupported;

          // ControlRanges
          var implementsControlRange = false, testControlRange;

          if (body && isHostMethod(body, "createControlRange")) {
              testControlRange = body.createControlRange();
              if (util.areHostProperties(testControlRange, ["item", "add"])) {
                  implementsControlRange = true;
              }
          }
          features.implementsControlRange = implementsControlRange;

          // Selection collapsedness
          if (selectionHasAnchorAndFocus) {
              selectionIsCollapsed = function(sel) {
                  return sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset;
              };
          } else {
              selectionIsCollapsed = function(sel) {
                  return sel.rangeCount ? sel.getRangeAt(sel.rangeCount - 1).collapsed : false;
              };
          }

          function updateAnchorAndFocusFromRange(sel, range, backward) {
              var anchorPrefix = backward ? "end" : "start", focusPrefix = backward ? "start" : "end";
              sel.anchorNode = range[anchorPrefix + "Container"];
              sel.anchorOffset = range[anchorPrefix + "Offset"];
              sel.focusNode = range[focusPrefix + "Container"];
              sel.focusOffset = range[focusPrefix + "Offset"];
          }

          function updateAnchorAndFocusFromNativeSelection(sel) {
              var nativeSel = sel.nativeSelection;
              sel.anchorNode = nativeSel.anchorNode;
              sel.anchorOffset = nativeSel.anchorOffset;
              sel.focusNode = nativeSel.focusNode;
              sel.focusOffset = nativeSel.focusOffset;
          }

          function updateEmptySelection(sel) {
              sel.anchorNode = sel.focusNode = null;
              sel.anchorOffset = sel.focusOffset = 0;
              sel.rangeCount = 0;
              sel.isCollapsed = true;
              sel._ranges.length = 0;
          }

          function getNativeRange(range) {
              var nativeRange;
              if (range instanceof DomRange) {
                  nativeRange = api.createNativeRange(range.getDocument());
                  nativeRange.setEnd(range.endContainer, range.endOffset);
                  nativeRange.setStart(range.startContainer, range.startOffset);
              } else if (range instanceof WrappedRange) {
                  nativeRange = range.nativeRange;
              } else if (features.implementsDomRange && (range instanceof dom.getWindow(range.startContainer).Range)) {
                  nativeRange = range;
              }
              return nativeRange;
          }

          function rangeContainsSingleElement(rangeNodes) {
              if (!rangeNodes.length || rangeNodes[0].nodeType != 1) {
                  return false;
              }
              for (var i = 1, len = rangeNodes.length; i < len; ++i) {
                  if (!dom.isAncestorOf(rangeNodes[0], rangeNodes[i])) {
                      return false;
                  }
              }
              return true;
          }

          function getSingleElementFromRange(range) {
              var nodes = range.getNodes();
              if (!rangeContainsSingleElement(nodes)) {
                  throw module.createError("getSingleElementFromRange: range " + range.inspect() + " did not consist of a single element");
              }
              return nodes[0];
          }

          // Simple, quick test which only needs to distinguish between a TextRange and a ControlRange
          function isTextRange(range) {
              return !!range && typeof range.text != "undefined";
          }

          function updateFromTextRange(sel, range) {
              // Create a Range from the selected TextRange
              var wrappedRange = new WrappedRange(range);
              sel._ranges = [wrappedRange];

              updateAnchorAndFocusFromRange(sel, wrappedRange, false);
              sel.rangeCount = 1;
              sel.isCollapsed = wrappedRange.collapsed;
          }

          function updateControlSelection(sel) {
              // Update the wrapped selection based on what's now in the native selection
              sel._ranges.length = 0;
              if (sel.docSelection.type == "None") {
                  updateEmptySelection(sel);
              } else {
                  var controlRange = sel.docSelection.createRange();
                  if (isTextRange(controlRange)) {
                      // This case (where the selection type is "Control" and calling createRange() on the selection returns
                      // a TextRange) can happen in IE 9. It happens, for example, when all elements in the selected
                      // ControlRange have been removed from the ControlRange and removed from the document.
                      updateFromTextRange(sel, controlRange);
                  } else {
                      sel.rangeCount = controlRange.length;
                      var range, doc = getDocument(controlRange.item(0));
                      for (var i = 0; i < sel.rangeCount; ++i) {
                          range = api.createRange(doc);
                          range.selectNode(controlRange.item(i));
                          sel._ranges.push(range);
                      }
                      sel.isCollapsed = sel.rangeCount == 1 && sel._ranges[0].collapsed;
                      updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], false);
                  }
              }
          }

          function addRangeToControlSelection(sel, range) {
              var controlRange = sel.docSelection.createRange();
              var rangeElement = getSingleElementFromRange(range);

              // Create a new ControlRange containing all the elements in the selected ControlRange plus the element
              // contained by the supplied range
              var doc = getDocument(controlRange.item(0));
              var newControlRange = getBody(doc).createControlRange();
              for (var i = 0, len = controlRange.length; i < len; ++i) {
                  newControlRange.add(controlRange.item(i));
              }
              try {
                  newControlRange.add(rangeElement);
              } catch (ex) {
                  throw module.createError("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
              }
              newControlRange.select();

              // Update the wrapped selection based on what's now in the native selection
              updateControlSelection(sel);
          }

          var getSelectionRangeAt;

          if (isHostMethod(testSelection, "getRangeAt")) {
              // try/catch is present because getRangeAt() must have thrown an error in some browser and some situation.
              // Unfortunately, I didn't write a comment about the specifics and am now scared to take it out. Let that be a
              // lesson to us all, especially me.
              getSelectionRangeAt = function(sel, index) {
                  try {
                      return sel.getRangeAt(index);
                  } catch (ex) {
                      return null;
                  }
              };
          } else if (selectionHasAnchorAndFocus) {
              getSelectionRangeAt = function(sel) {
                  var doc = getDocument(sel.anchorNode);
                  var range = api.createRange(doc);
                  range.setStartAndEnd(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);

                  // Handle the case when the selection was selected backwards (from the end to the start in the
                  // document)
                  if (range.collapsed !== this.isCollapsed) {
                      range.setStartAndEnd(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset);
                  }

                  return range;
              };
          }

          function WrappedSelection(selection, docSelection, win) {
              this.nativeSelection = selection;
              this.docSelection = docSelection;
              this._ranges = [];
              this.win = win;
              this.refresh();
          }

          WrappedSelection.prototype = api.selectionPrototype;

          function deleteProperties(sel) {
              sel.win = sel.anchorNode = sel.focusNode = sel._ranges = null;
              sel.rangeCount = sel.anchorOffset = sel.focusOffset = 0;
              sel.detached = true;
          }

          var cachedRangySelections = [];

          function actOnCachedSelection(win, action) {
              var i = cachedRangySelections.length, cached, sel;
              while (i--) {
                  cached = cachedRangySelections[i];
                  sel = cached.selection;
                  if (action == "deleteAll") {
                      deleteProperties(sel);
                  } else if (cached.win == win) {
                      if (action == "delete") {
                          cachedRangySelections.splice(i, 1);
                          return true;
                      } else {
                          return sel;
                      }
                  }
              }
              if (action == "deleteAll") {
                  cachedRangySelections.length = 0;
              }
              return null;
          }

          var getSelection = function(win) {
              // Check if the parameter is a Rangy Selection object
              if (win && win instanceof WrappedSelection) {
                  win.refresh();
                  return win;
              }

              win = getWindow(win, "getNativeSelection");

              var sel = actOnCachedSelection(win);
              var nativeSel = getNativeSelection(win), docSel = implementsDocSelection ? getDocSelection(win) : null;
              if (sel) {
                  sel.nativeSelection = nativeSel;
                  sel.docSelection = docSel;
                  sel.refresh();
              } else {
                  sel = new WrappedSelection(nativeSel, docSel, win);
                  cachedRangySelections.push( { win: win, selection: sel } );
              }
              return sel;
          };

          api.getSelection = getSelection;

          util.createAliasForDeprecatedMethod(api, "getIframeSelection", "getSelection");

          var selProto = WrappedSelection.prototype;

          function createControlSelection(sel, ranges) {
              // Ensure that the selection becomes of type "Control"
              var doc = getDocument(ranges[0].startContainer);
              var controlRange = getBody(doc).createControlRange();
              for (var i = 0, el, len = ranges.length; i < len; ++i) {
                  el = getSingleElementFromRange(ranges[i]);
                  try {
                      controlRange.add(el);
                  } catch (ex) {
                      throw module.createError("setRanges(): Element within one of the specified Ranges could not be added to control selection (does it have layout?)");
                  }
              }
              controlRange.select();

              // Update the wrapped selection based on what's now in the native selection
              updateControlSelection(sel);
          }

          // Selecting a range
          if (!useDocumentSelection && selectionHasAnchorAndFocus && util.areHostMethods(testSelection, ["removeAllRanges", "addRange"])) {
              selProto.removeAllRanges = function() {
                  this.nativeSelection.removeAllRanges();
                  updateEmptySelection(this);
              };

              var addRangeBackward = function(sel, range) {
                  addRangeBackwardToNative(sel.nativeSelection, range);
                  sel.refresh();
              };

              if (selectionHasRangeCount) {
                  selProto.addRange = function(range, direction) {
                      if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                          addRangeToControlSelection(this, range);
                      } else {
                          if (isDirectionBackward(direction) && selectionHasExtend) {
                              addRangeBackward(this, range);
                          } else {
                              var previousRangeCount;
                              if (selectionSupportsMultipleRanges) {
                                  previousRangeCount = this.rangeCount;
                              } else {
                                  this.removeAllRanges();
                                  previousRangeCount = 0;
                              }
                              // Clone the native range so that changing the selected range does not affect the selection.
                              // This is contrary to the spec but is the only way to achieve consistency between browsers. See
                              // issue 80.
                              var clonedNativeRange = getNativeRange(range).cloneRange();
                              try {
                                  this.nativeSelection.addRange(clonedNativeRange);
                              } catch (ex) {
                              }

                              // Check whether adding the range was successful
                              this.rangeCount = this.nativeSelection.rangeCount;

                              if (this.rangeCount == previousRangeCount + 1) {
                                  // The range was added successfully

                                  // Check whether the range that we added to the selection is reflected in the last range extracted from
                                  // the selection
                                  if (api.config.checkSelectionRanges) {
                                      var nativeRange = getSelectionRangeAt(this.nativeSelection, this.rangeCount - 1);
                                      if (nativeRange && !rangesEqual(nativeRange, range)) {
                                          // Happens in WebKit with, for example, a selection placed at the start of a text node
                                          range = new WrappedRange(nativeRange);
                                      }
                                  }
                                  this._ranges[this.rangeCount - 1] = range;
                                  updateAnchorAndFocusFromRange(this, range, selectionIsBackward(this.nativeSelection));
                                  this.isCollapsed = selectionIsCollapsed(this);
                              } else {
                                  // The range was not added successfully. The simplest thing is to refresh
                                  this.refresh();
                              }
                          }
                      }
                  };
              } else {
                  selProto.addRange = function(range, direction) {
                      if (isDirectionBackward(direction) && selectionHasExtend) {
                          addRangeBackward(this, range);
                      } else {
                          this.nativeSelection.addRange(getNativeRange(range));
                          this.refresh();
                      }
                  };
              }

              selProto.setRanges = function(ranges) {
                  if (implementsControlRange && implementsDocSelection && ranges.length > 1) {
                      createControlSelection(this, ranges);
                  } else {
                      this.removeAllRanges();
                      for (var i = 0, len = ranges.length; i < len; ++i) {
                          this.addRange(ranges[i]);
                      }
                  }
              };
          } else if (isHostMethod(testSelection, "empty") && isHostMethod(testRange, "select") &&
                     implementsControlRange && useDocumentSelection) {

              selProto.removeAllRanges = function() {
                  // Added try/catch as fix for issue #21
                  try {
                      this.docSelection.empty();

                      // Check for empty() not working (issue #24)
                      if (this.docSelection.type != "None") {
                          // Work around failure to empty a control selection by instead selecting a TextRange and then
                          // calling empty()
                          var doc;
                          if (this.anchorNode) {
                              doc = getDocument(this.anchorNode);
                          } else if (this.docSelection.type == CONTROL) {
                              var controlRange = this.docSelection.createRange();
                              if (controlRange.length) {
                                  doc = getDocument( controlRange.item(0) );
                              }
                          }
                          if (doc) {
                              var textRange = getBody(doc).createTextRange();
                              textRange.select();
                              this.docSelection.empty();
                          }
                      }
                  } catch(ex) {}
                  updateEmptySelection(this);
              };

              selProto.addRange = function(range) {
                  if (this.docSelection.type == CONTROL) {
                      addRangeToControlSelection(this, range);
                  } else {
                      api.WrappedTextRange.rangeToTextRange(range).select();
                      this._ranges[0] = range;
                      this.rangeCount = 1;
                      this.isCollapsed = this._ranges[0].collapsed;
                      updateAnchorAndFocusFromRange(this, range, false);
                  }
              };

              selProto.setRanges = function(ranges) {
                  this.removeAllRanges();
                  var rangeCount = ranges.length;
                  if (rangeCount > 1) {
                      createControlSelection(this, ranges);
                  } else if (rangeCount) {
                      this.addRange(ranges[0]);
                  }
              };
          } else {
              module.fail("No means of selecting a Range or TextRange was found");
              return false;
          }

          selProto.getRangeAt = function(index) {
              if (index < 0 || index >= this.rangeCount) {
                  throw new DOMException("INDEX_SIZE_ERR");
              } else {
                  // Clone the range to preserve selection-range independence. See issue 80.
                  return this._ranges[index].cloneRange();
              }
          };

          var refreshSelection;

          if (useDocumentSelection) {
              refreshSelection = function(sel) {
                  var range;
                  if (api.isSelectionValid(sel.win)) {
                      range = sel.docSelection.createRange();
                  } else {
                      range = getBody(sel.win.document).createTextRange();
                      range.collapse(true);
                  }

                  if (sel.docSelection.type == CONTROL) {
                      updateControlSelection(sel);
                  } else if (isTextRange(range)) {
                      updateFromTextRange(sel, range);
                  } else {
                      updateEmptySelection(sel);
                  }
              };
          } else if (isHostMethod(testSelection, "getRangeAt") && typeof testSelection.rangeCount == NUMBER) {
              refreshSelection = function(sel) {
                  if (implementsControlRange && implementsDocSelection && sel.docSelection.type == CONTROL) {
                      updateControlSelection(sel);
                  } else {
                      sel._ranges.length = sel.rangeCount = sel.nativeSelection.rangeCount;
                      if (sel.rangeCount) {
                          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                              sel._ranges[i] = new api.WrappedRange(sel.nativeSelection.getRangeAt(i));
                          }
                          updateAnchorAndFocusFromRange(sel, sel._ranges[sel.rangeCount - 1], selectionIsBackward(sel.nativeSelection));
                          sel.isCollapsed = selectionIsCollapsed(sel);
                      } else {
                          updateEmptySelection(sel);
                      }
                  }
              };
          } else if (selectionHasAnchorAndFocus && typeof testSelection.isCollapsed == BOOLEAN && typeof testRange.collapsed == BOOLEAN && features.implementsDomRange) {
              refreshSelection = function(sel) {
                  var range, nativeSel = sel.nativeSelection;
                  if (nativeSel.anchorNode) {
                      range = getSelectionRangeAt(nativeSel, 0);
                      sel._ranges = [range];
                      sel.rangeCount = 1;
                      updateAnchorAndFocusFromNativeSelection(sel);
                      sel.isCollapsed = selectionIsCollapsed(sel);
                  } else {
                      updateEmptySelection(sel);
                  }
              };
          } else {
              module.fail("No means of obtaining a Range or TextRange from the user's selection was found");
              return false;
          }

          selProto.refresh = function(checkForChanges) {
              var oldRanges = checkForChanges ? this._ranges.slice(0) : null;
              var oldAnchorNode = this.anchorNode, oldAnchorOffset = this.anchorOffset;

              refreshSelection(this);
              if (checkForChanges) {
                  // Check the range count first
                  var i = oldRanges.length;
                  if (i != this._ranges.length) {
                      return true;
                  }

                  // Now check the direction. Checking the anchor position is the same is enough since we're checking all the
                  // ranges after this
                  if (this.anchorNode != oldAnchorNode || this.anchorOffset != oldAnchorOffset) {
                      return true;
                  }

                  // Finally, compare each range in turn
                  while (i--) {
                      if (!rangesEqual(oldRanges[i], this._ranges[i])) {
                          return true;
                      }
                  }
                  return false;
              }
          };

          // Removal of a single range
          var removeRangeManually = function(sel, range) {
              var ranges = sel.getAllRanges();
              sel.removeAllRanges();
              for (var i = 0, len = ranges.length; i < len; ++i) {
                  if (!rangesEqual(range, ranges[i])) {
                      sel.addRange(ranges[i]);
                  }
              }
              if (!sel.rangeCount) {
                  updateEmptySelection(sel);
              }
          };

          if (implementsControlRange && implementsDocSelection) {
              selProto.removeRange = function(range) {
                  if (this.docSelection.type == CONTROL) {
                      var controlRange = this.docSelection.createRange();
                      var rangeElement = getSingleElementFromRange(range);

                      // Create a new ControlRange containing all the elements in the selected ControlRange minus the
                      // element contained by the supplied range
                      var doc = getDocument(controlRange.item(0));
                      var newControlRange = getBody(doc).createControlRange();
                      var el, removed = false;
                      for (var i = 0, len = controlRange.length; i < len; ++i) {
                          el = controlRange.item(i);
                          if (el !== rangeElement || removed) {
                              newControlRange.add(controlRange.item(i));
                          } else {
                              removed = true;
                          }
                      }
                      newControlRange.select();

                      // Update the wrapped selection based on what's now in the native selection
                      updateControlSelection(this);
                  } else {
                      removeRangeManually(this, range);
                  }
              };
          } else {
              selProto.removeRange = function(range) {
                  removeRangeManually(this, range);
              };
          }

          // Detecting if a selection is backward
          var selectionIsBackward;
          if (!useDocumentSelection && selectionHasAnchorAndFocus && features.implementsDomRange) {
              selectionIsBackward = winSelectionIsBackward;

              selProto.isBackward = function() {
                  return selectionIsBackward(this);
              };
          } else {
              selectionIsBackward = selProto.isBackward = function() {
                  return false;
              };
          }

          // Create an alias for backwards compatibility. From 1.3, everything is "backward" rather than "backwards"
          selProto.isBackwards = selProto.isBackward;

          // Selection stringifier
          // This is conformant to the old HTML5 selections draft spec but differs from WebKit and Mozilla's implementation.
          // The current spec does not yet define this method.
          selProto.toString = function() {
              var rangeTexts = [];
              for (var i = 0, len = this.rangeCount; i < len; ++i) {
                  rangeTexts[i] = "" + this._ranges[i];
              }
              return rangeTexts.join("");
          };

          function assertNodeInSameDocument(sel, node) {
              if (sel.win.document != getDocument(node)) {
                  throw new DOMException("WRONG_DOCUMENT_ERR");
              }
          }

          // No current browser conforms fully to the spec for this method, so Rangy's own method is always used
          selProto.collapse = function(node, offset) {
              assertNodeInSameDocument(this, node);
              var range = api.createRange(node);
              range.collapseToPoint(node, offset);
              this.setSingleRange(range);
              this.isCollapsed = true;
          };

          selProto.collapseToStart = function() {
              if (this.rangeCount) {
                  var range = this._ranges[0];
                  this.collapse(range.startContainer, range.startOffset);
              } else {
                  throw new DOMException("INVALID_STATE_ERR");
              }
          };

          selProto.collapseToEnd = function() {
              if (this.rangeCount) {
                  var range = this._ranges[this.rangeCount - 1];
                  this.collapse(range.endContainer, range.endOffset);
              } else {
                  throw new DOMException("INVALID_STATE_ERR");
              }
          };

          // The spec is very specific on how selectAllChildren should be implemented and not all browsers implement it as
          // specified so the native implementation is never used by Rangy.
          selProto.selectAllChildren = function(node) {
              assertNodeInSameDocument(this, node);
              var range = api.createRange(node);
              range.selectNodeContents(node);
              this.setSingleRange(range);
          };

          selProto.deleteFromDocument = function() {
              // Sepcial behaviour required for IE's control selections
              if (implementsControlRange && implementsDocSelection && this.docSelection.type == CONTROL) {
                  var controlRange = this.docSelection.createRange();
                  var element;
                  while (controlRange.length) {
                      element = controlRange.item(0);
                      controlRange.remove(element);
                      dom.removeNode(element);
                  }
                  this.refresh();
              } else if (this.rangeCount) {
                  var ranges = this.getAllRanges();
                  if (ranges.length) {
                      this.removeAllRanges();
                      for (var i = 0, len = ranges.length; i < len; ++i) {
                          ranges[i].deleteContents();
                      }
                      // The spec says nothing about what the selection should contain after calling deleteContents on each
                      // range. Firefox moves the selection to where the final selected range was, so we emulate that
                      this.addRange(ranges[len - 1]);
                  }
              }
          };

          // The following are non-standard extensions
          selProto.eachRange = function(func, returnValue) {
              for (var i = 0, len = this._ranges.length; i < len; ++i) {
                  if ( func( this.getRangeAt(i) ) ) {
                      return returnValue;
                  }
              }
          };

          selProto.getAllRanges = function() {
              var ranges = [];
              this.eachRange(function(range) {
                  ranges.push(range);
              });
              return ranges;
          };

          selProto.setSingleRange = function(range, direction) {
              this.removeAllRanges();
              this.addRange(range, direction);
          };

          selProto.callMethodOnEachRange = function(methodName, params) {
              var results = [];
              this.eachRange( function(range) {
                  results.push( range[methodName].apply(range, params || []) );
              } );
              return results;
          };

          function createStartOrEndSetter(isStart) {
              return function(node, offset) {
                  var range;
                  if (this.rangeCount) {
                      range = this.getRangeAt(0);
                      range["set" + (isStart ? "Start" : "End")](node, offset);
                  } else {
                      range = api.createRange(this.win.document);
                      range.setStartAndEnd(node, offset);
                  }
                  this.setSingleRange(range, this.isBackward());
              };
          }

          selProto.setStart = createStartOrEndSetter(true);
          selProto.setEnd = createStartOrEndSetter(false);

          // Add select() method to Range prototype. Any existing selection will be removed.
          api.rangePrototype.select = function(direction) {
              getSelection( this.getDocument() ).setSingleRange(this, direction);
          };

          selProto.changeEachRange = function(func) {
              var ranges = [];
              var backward = this.isBackward();

              this.eachRange(function(range) {
                  func(range);
                  ranges.push(range);
              });

              this.removeAllRanges();
              if (backward && ranges.length == 1) {
                  this.addRange(ranges[0], "backward");
              } else {
                  this.setRanges(ranges);
              }
          };

          selProto.containsNode = function(node, allowPartial) {
              return this.eachRange( function(range) {
                  return range.containsNode(node, allowPartial);
              }, true ) || false;
          };

          selProto.getBookmark = function(containerNode) {
              return {
                  backward: this.isBackward(),
                  rangeBookmarks: this.callMethodOnEachRange("getBookmark", [containerNode])
              };
          };

          selProto.moveToBookmark = function(bookmark) {
              var selRanges = [];
              for (var i = 0, rangeBookmark, range; rangeBookmark = bookmark.rangeBookmarks[i++]; ) {
                  range = api.createRange(this.win);
                  range.moveToBookmark(rangeBookmark);
                  selRanges.push(range);
              }
              if (bookmark.backward) {
                  this.setSingleRange(selRanges[0], "backward");
              } else {
                  this.setRanges(selRanges);
              }
          };

          selProto.saveRanges = function() {
              return {
                  backward: this.isBackward(),
                  ranges: this.callMethodOnEachRange("cloneRange")
              };
          };

          selProto.restoreRanges = function(selRanges) {
              this.removeAllRanges();
              for (var i = 0, range; range = selRanges.ranges[i]; ++i) {
                  this.addRange(range, (selRanges.backward && i == 0));
              }
          };

          selProto.toHtml = function() {
              var rangeHtmls = [];
              this.eachRange(function(range) {
                  rangeHtmls.push( DomRange.toHtml(range) );
              });
              return rangeHtmls.join("");
          };

          if (features.implementsTextRange) {
              selProto.getNativeTextRange = function() {
                  var sel, textRange;
                  if ( (sel = this.docSelection) ) {
                      var range = sel.createRange();
                      if (isTextRange(range)) {
                          return range;
                      } else {
                          throw module.createError("getNativeTextRange: selection is a control selection");
                      }
                  } else if (this.rangeCount > 0) {
                      return api.WrappedTextRange.rangeToTextRange( this.getRangeAt(0) );
                  } else {
                      throw module.createError("getNativeTextRange: selection contains no range");
                  }
              };
          }

          function inspect(sel) {
              var rangeInspects = [];
              var anchor = new DomPosition(sel.anchorNode, sel.anchorOffset);
              var focus = new DomPosition(sel.focusNode, sel.focusOffset);
              var name = (typeof sel.getName == "function") ? sel.getName() : "Selection";

              if (typeof sel.rangeCount != "undefined") {
                  for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                      rangeInspects[i] = DomRange.inspect(sel.getRangeAt(i));
                  }
              }
              return "[" + name + "(Ranges: " + rangeInspects.join(", ") +
                      ")(anchor: " + anchor.inspect() + ", focus: " + focus.inspect() + "]";
          }

          selProto.getName = function() {
              return "WrappedSelection";
          };

          selProto.inspect = function() {
              return inspect(this);
          };

          selProto.detach = function() {
              actOnCachedSelection(this.win, "delete");
              deleteProperties(this);
          };

          WrappedSelection.detachAll = function() {
              actOnCachedSelection(null, "deleteAll");
          };

          WrappedSelection.inspect = inspect;
          WrappedSelection.isDirectionBackward = isDirectionBackward;

          api.Selection = WrappedSelection;

          api.selectionPrototype = selProto;

          api.addShimListener(function(win) {
              if (typeof win.getSelection == "undefined") {
                  win.getSelection = function() {
                      return getSelection(win);
                  };
              }
              win = null;
          });
      });
      

      /*----------------------------------------------------------------------------------------------------------------*/

      // Wait for document to load before initializing
      var docReady = false;

      var loadHandler = function(e) {
          if (!docReady) {
              docReady = true;
              if (!api.initialized && api.config.autoInitialize) {
                  init();
              }
          }
      };

      if (isBrowser) {
          // Test whether the document has already been loaded and initialize immediately if so
          if (document.readyState == "complete") {
              loadHandler();
          } else {
              if (isHostMethod(document, "addEventListener")) {
                  document.addEventListener("DOMContentLoaded", loadHandler, false);
              }

              // Add a fallback in case the DOMContentLoaded event isn't supported
              addListener(window, "load", loadHandler);
          }
      }

      return api;
  }, commonjsGlobal);
  });

  var rangyTextrange = createCommonjsModule(function (module, exports) {
  /**
   * Text range module for Rangy.
   * Text-based manipulation and searching of ranges and selections.
   *
   * Features
   *
   * - Ability to move range boundaries by character or word offsets
   * - Customizable word tokenizer
   * - Ignores text nodes inside <script> or <style> elements or those hidden by CSS display and visibility properties
   * - Range findText method to search for text or regex within the page or within a range. Flags for whole words and case
   *   sensitivity
   * - Selection and range save/restore as text offsets within a node
   * - Methods to return visible text within a range or selection
   * - innerText method for elements
   *
   * References
   *
   * https://www.w3.org/Bugs/Public/show_bug.cgi?id=13145
   * http://aryeh.name/spec/innertext/innertext.html
   * http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html
   *
   * Part of Rangy, a cross-browser JavaScript range and selection library
   * https://github.com/timdown/rangy
   *
   * Depends on Rangy core.
   *
   * Copyright 2015, Tim Down
   * Licensed under the MIT license.
   * Version: 1.3.0
   * Build date: 10 May 2015
   */

  /**
   * Problem: handling of trailing spaces before line breaks is handled inconsistently between browsers.
   *
   * First, a <br>: this is relatively simple. For the following HTML:
   *
   * 1 <br>2
   *
   * - IE and WebKit render the space, include it in the selection (i.e. when the content is selected and pasted into a
   *   textarea, the space is present) and allow the caret to be placed after it.
   * - Firefox does not acknowledge the space in the selection but it is possible to place the caret after it.
   * - Opera does not render the space but has two separate caret positions on either side of the space (left and right
   *   arrow keys show this) and includes the space in the selection.
   *
   * The other case is the line break or breaks implied by block elements. For the following HTML:
   *
   * <p>1 </p><p>2<p>
   *
   * - WebKit does not acknowledge the space in any way
   * - Firefox, IE and Opera as per <br>
   *
   * One more case is trailing spaces before line breaks in elements with white-space: pre-line. For the following HTML:
   *
   * <p style="white-space: pre-line">1
   * 2</p>
   *
   * - Firefox and WebKit include the space in caret positions
   * - IE does not support pre-line up to and including version 9
   * - Opera ignores the space
   * - Trailing space only renders if there is a non-collapsed character in the line
   *
   * Problem is whether Rangy should ever acknowledge the space and if so, when. Another problem is whether this can be
   * feature-tested
   */
  (function(factory, root) {
      if (typeof undefined == "function" && undefined.amd) {
          // AMD. Register as an anonymous module with a dependency on Rangy.
          undefined(["./rangy-core"], factory);
      } else if ('object' != "undefined" && 'object' == "object") {
          // Node/CommonJS style
          module.exports = factory( rangyCore );
      } else {
          // No AMD or CommonJS support so we use the rangy property of root (probably the global variable)
          factory(root.rangy);
      }
  })(function(rangy) {
      rangy.createModule("TextRange", ["WrappedSelection"], function(api, module) {
          var UNDEF = "undefined";
          var CHARACTER = "character", WORD = "word";
          var dom = api.dom, util = api.util;
          var extend = util.extend;
          var createOptions = util.createOptions;
          var getBody = dom.getBody;


          var spacesRegex = /^[ \t\f\r\n]+$/;
          var spacesMinusLineBreaksRegex = /^[ \t\f\r]+$/;
          var allWhiteSpaceRegex = /^[\t-\r \u0085\u00A0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]+$/;
          var nonLineBreakWhiteSpaceRegex = /^[\t \u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000]+$/;
          var lineBreakRegex = /^[\n-\r\u0085\u2028\u2029]$/;

          var defaultLanguage = "en";

          var isDirectionBackward = api.Selection.isDirectionBackward;

          // Properties representing whether trailing spaces inside blocks are completely collapsed (as they are in WebKit,
          // but not other browsers). Also test whether trailing spaces before <br> elements are collapsed.
          var trailingSpaceInBlockCollapses = false;
          var trailingSpaceBeforeBrCollapses = false;
          var trailingSpaceBeforeBlockCollapses = false;
          var trailingSpaceBeforeLineBreakInPreLineCollapses = true;

          (function() {
              var el = dom.createTestElement(document, "<p>1 </p><p></p>", true);
              var p = el.firstChild;
              var sel = api.getSelection();
              sel.collapse(p.lastChild, 2);
              sel.setStart(p.firstChild, 0);
              trailingSpaceInBlockCollapses = ("" + sel).length == 1;

              el.innerHTML = "1 <br />";
              sel.collapse(el, 2);
              sel.setStart(el.firstChild, 0);
              trailingSpaceBeforeBrCollapses = ("" + sel).length == 1;

              el.innerHTML = "1 <p>1</p>";
              sel.collapse(el, 2);
              sel.setStart(el.firstChild, 0);
              trailingSpaceBeforeBlockCollapses = ("" + sel).length == 1;

              dom.removeNode(el);
              sel.removeAllRanges();
          })();

          /*----------------------------------------------------------------------------------------------------------------*/

          // This function must create word and non-word tokens for the whole of the text supplied to it
          function defaultTokenizer(chars, wordOptions) {
              var word = chars.join(""), result, tokenRanges = [];

              function createTokenRange(start, end, isWord) {
                  tokenRanges.push( { start: start, end: end, isWord: isWord } );
              }

              // Match words and mark characters
              var lastWordEnd = 0, wordStart, wordEnd;
              while ( (result = wordOptions.wordRegex.exec(word)) ) {
                  wordStart = result.index;
                  wordEnd = wordStart + result[0].length;

                  // Create token for non-word characters preceding this word
                  if (wordStart > lastWordEnd) {
                      createTokenRange(lastWordEnd, wordStart, false);
                  }

                  // Get trailing space characters for word
                  if (wordOptions.includeTrailingSpace) {
                      while ( nonLineBreakWhiteSpaceRegex.test(chars[wordEnd]) ) {
                          ++wordEnd;
                      }
                  }
                  createTokenRange(wordStart, wordEnd, true);
                  lastWordEnd = wordEnd;
              }

              // Create token for trailing non-word characters, if any exist
              if (lastWordEnd < chars.length) {
                  createTokenRange(lastWordEnd, chars.length, false);
              }

              return tokenRanges;
          }

          function convertCharRangeToToken(chars, tokenRange) {
              var tokenChars = chars.slice(tokenRange.start, tokenRange.end);
              var token = {
                  isWord: tokenRange.isWord,
                  chars: tokenChars,
                  toString: function() {
                      return tokenChars.join("");
                  }
              };
              for (var i = 0, len = tokenChars.length; i < len; ++i) {
                  tokenChars[i].token = token;
              }
              return token;
          }

          function tokenize(chars, wordOptions, tokenizer) {
              var tokenRanges = tokenizer(chars, wordOptions);
              var tokens = [];
              for (var i = 0, tokenRange; tokenRange = tokenRanges[i++]; ) {
                  tokens.push( convertCharRangeToToken(chars, tokenRange) );
              }
              return tokens;
          }

          var defaultCharacterOptions = {
              includeBlockContentTrailingSpace: true,
              includeSpaceBeforeBr: true,
              includeSpaceBeforeBlock: true,
              includePreLineTrailingSpace: true,
              ignoreCharacters: ""
          };

          function normalizeIgnoredCharacters(ignoredCharacters) {
              // Check if character is ignored
              var ignoredChars = ignoredCharacters || "";

              // Normalize ignored characters into a string consisting of characters in ascending order of character code
              var ignoredCharsArray = (typeof ignoredChars == "string") ? ignoredChars.split("") : ignoredChars;
              ignoredCharsArray.sort(function(char1, char2) {
                  return char1.charCodeAt(0) - char2.charCodeAt(0);
              });

              /// Convert back to a string and remove duplicates
              return ignoredCharsArray.join("").replace(/(.)\1+/g, "$1");
          }

          var defaultCaretCharacterOptions = {
              includeBlockContentTrailingSpace: !trailingSpaceBeforeLineBreakInPreLineCollapses,
              includeSpaceBeforeBr: !trailingSpaceBeforeBrCollapses,
              includeSpaceBeforeBlock: !trailingSpaceBeforeBlockCollapses,
              includePreLineTrailingSpace: true
          };

          var defaultWordOptions = {
              "en": {
                  wordRegex: /[a-z0-9]+('[a-z0-9]+)*/gi,
                  includeTrailingSpace: false,
                  tokenizer: defaultTokenizer
              }
          };

          var defaultFindOptions = {
              caseSensitive: false,
              withinRange: null,
              wholeWordsOnly: false,
              wrap: false,
              direction: "forward",
              wordOptions: null,
              characterOptions: null
          };

          var defaultMoveOptions = {
              wordOptions: null,
              characterOptions: null
          };

          var defaultExpandOptions = {
              wordOptions: null,
              characterOptions: null,
              trim: false,
              trimStart: true,
              trimEnd: true
          };

          var defaultWordIteratorOptions = {
              wordOptions: null,
              characterOptions: null,
              direction: "forward"
          };

          function createWordOptions(options) {
              var lang, defaults;
              if (!options) {
                  return defaultWordOptions[defaultLanguage];
              } else {
                  lang = options.language || defaultLanguage;
                  defaults = {};
                  extend(defaults, defaultWordOptions[lang] || defaultWordOptions[defaultLanguage]);
                  extend(defaults, options);
                  return defaults;
              }
          }

          function createNestedOptions(optionsParam, defaults) {
              var options = createOptions(optionsParam, defaults);
              if (defaults.hasOwnProperty("wordOptions")) {
                  options.wordOptions = createWordOptions(options.wordOptions);
              }
              if (defaults.hasOwnProperty("characterOptions")) {
                  options.characterOptions = createOptions(options.characterOptions, defaultCharacterOptions);
              }
              return options;
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          /* DOM utility functions */
          var getComputedStyleProperty = dom.getComputedStyleProperty;

          // Create cachable versions of DOM functions

          // Test for old IE's incorrect display properties
          var tableCssDisplayBlock;
          (function() {
              var table = document.createElement("table");
              var body = getBody(document);
              body.appendChild(table);
              tableCssDisplayBlock = (getComputedStyleProperty(table, "display") == "block");
              body.removeChild(table);
          })();

          var defaultDisplayValueForTag = {
              table: "table",
              caption: "table-caption",
              colgroup: "table-column-group",
              col: "table-column",
              thead: "table-header-group",
              tbody: "table-row-group",
              tfoot: "table-footer-group",
              tr: "table-row",
              td: "table-cell",
              th: "table-cell"
          };

          // Corrects IE's "block" value for table-related elements
          function getComputedDisplay(el, win) {
              var display = getComputedStyleProperty(el, "display", win);
              var tagName = el.tagName.toLowerCase();
              return (display == "block" &&
                      tableCssDisplayBlock &&
                      defaultDisplayValueForTag.hasOwnProperty(tagName)) ?
                  defaultDisplayValueForTag[tagName] : display;
          }

          function isHidden(node) {
              var ancestors = getAncestorsAndSelf(node);
              for (var i = 0, len = ancestors.length; i < len; ++i) {
                  if (ancestors[i].nodeType == 1 && getComputedDisplay(ancestors[i]) == "none") {
                      return true;
                  }
              }

              return false;
          }

          function isVisibilityHiddenTextNode(textNode) {
              var el;
              return textNode.nodeType == 3 &&
                  (el = textNode.parentNode) &&
                  getComputedStyleProperty(el, "visibility") == "hidden";
          }

          /*----------------------------------------------------------------------------------------------------------------*/

      
          // "A block node is either an Element whose "display" property does not have
          // resolved value "inline" or "inline-block" or "inline-table" or "none", or a
          // Document, or a DocumentFragment."
          function isBlockNode(node) {
              return node &&
                  ((node.nodeType == 1 && !/^(inline(-block|-table)?|none)$/.test(getComputedDisplay(node))) ||
                  node.nodeType == 9 || node.nodeType == 11);
          }

          function getLastDescendantOrSelf(node) {
              var lastChild = node.lastChild;
              return lastChild ? getLastDescendantOrSelf(lastChild) : node;
          }

          function containsPositions(node) {
              return dom.isCharacterDataNode(node) ||
                  !/^(area|base|basefont|br|col|frame|hr|img|input|isindex|link|meta|param)$/i.test(node.nodeName);
          }

          function getAncestors(node) {
              var ancestors = [];
              while (node.parentNode) {
                  ancestors.unshift(node.parentNode);
                  node = node.parentNode;
              }
              return ancestors;
          }

          function getAncestorsAndSelf(node) {
              return getAncestors(node).concat([node]);
          }

          function nextNodeDescendants(node) {
              while (node && !node.nextSibling) {
                  node = node.parentNode;
              }
              if (!node) {
                  return null;
              }
              return node.nextSibling;
          }

          function nextNode(node, excludeChildren) {
              if (!excludeChildren && node.hasChildNodes()) {
                  return node.firstChild;
              }
              return nextNodeDescendants(node);
          }

          function previousNode(node) {
              var previous = node.previousSibling;
              if (previous) {
                  node = previous;
                  while (node.hasChildNodes()) {
                      node = node.lastChild;
                  }
                  return node;
              }
              var parent = node.parentNode;
              if (parent && parent.nodeType == 1) {
                  return parent;
              }
              return null;
          }

          // Adpated from Aryeh's code.
          // "A whitespace node is either a Text node whose data is the empty string; or
          // a Text node whose data consists only of one or more tabs (0x0009), line
          // feeds (0x000A), carriage returns (0x000D), and/or spaces (0x0020), and whose
          // parent is an Element whose resolved value for "white-space" is "normal" or
          // "nowrap"; or a Text node whose data consists only of one or more tabs
          // (0x0009), carriage returns (0x000D), and/or spaces (0x0020), and whose
          // parent is an Element whose resolved value for "white-space" is "pre-line"."
          function isWhitespaceNode(node) {
              if (!node || node.nodeType != 3) {
                  return false;
              }
              var text = node.data;
              if (text === "") {
                  return true;
              }
              var parent = node.parentNode;
              if (!parent || parent.nodeType != 1) {
                  return false;
              }
              var computedWhiteSpace = getComputedStyleProperty(node.parentNode, "whiteSpace");

              return (/^[\t\n\r ]+$/.test(text) && /^(normal|nowrap)$/.test(computedWhiteSpace)) ||
                  (/^[\t\r ]+$/.test(text) && computedWhiteSpace == "pre-line");
          }

          // Adpated from Aryeh's code.
          // "node is a collapsed whitespace node if the following algorithm returns
          // true:"
          function isCollapsedWhitespaceNode(node) {
              // "If node's data is the empty string, return true."
              if (node.data === "") {
                  return true;
              }

              // "If node is not a whitespace node, return false."
              if (!isWhitespaceNode(node)) {
                  return false;
              }

              // "Let ancestor be node's parent."
              var ancestor = node.parentNode;

              // "If ancestor is null, return true."
              if (!ancestor) {
                  return true;
              }

              // "If the "display" property of some ancestor of node has resolved value "none", return true."
              if (isHidden(node)) {
                  return true;
              }

              return false;
          }

          function isCollapsedNode(node) {
              var type = node.nodeType;
              return type == 7 /* PROCESSING_INSTRUCTION */ ||
                  type == 8 /* COMMENT */ ||
                  isHidden(node) ||
                  /^(script|style)$/i.test(node.nodeName) ||
                  isVisibilityHiddenTextNode(node) ||
                  isCollapsedWhitespaceNode(node);
          }

          function isIgnoredNode(node, win) {
              var type = node.nodeType;
              return type == 7 /* PROCESSING_INSTRUCTION */ ||
                  type == 8 /* COMMENT */ ||
                  (type == 1 && getComputedDisplay(node, win) == "none");
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Possibly overengineered caching system to prevent repeated DOM calls slowing everything down

          function Cache() {
              this.store = {};
          }

          Cache.prototype = {
              get: function(key) {
                  return this.store.hasOwnProperty(key) ? this.store[key] : null;
              },

              set: function(key, value) {
                  return this.store[key] = value;
              }
          };

          var cachedCount = 0, uncachedCount = 0;

          function createCachingGetter(methodName, func, objProperty) {
              return function(args) {
                  var cache = this.cache;
                  if (cache.hasOwnProperty(methodName)) {
                      cachedCount++;
                      return cache[methodName];
                  } else {
                      uncachedCount++;
                      var value = func.call(this, objProperty ? this[objProperty] : this, args);
                      cache[methodName] = value;
                      return value;
                  }
              };
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          function NodeWrapper(node, session) {
              this.node = node;
              this.session = session;
              this.cache = new Cache();
              this.positions = new Cache();
          }

          var nodeProto = {
              getPosition: function(offset) {
                  var positions = this.positions;
                  return positions.get(offset) || positions.set(offset, new Position(this, offset));
              },

              toString: function() {
                  return "[NodeWrapper(" + dom.inspectNode(this.node) + ")]";
              }
          };

          NodeWrapper.prototype = nodeProto;

          var EMPTY = "EMPTY",
              NON_SPACE = "NON_SPACE",
              UNCOLLAPSIBLE_SPACE = "UNCOLLAPSIBLE_SPACE",
              COLLAPSIBLE_SPACE = "COLLAPSIBLE_SPACE",
              TRAILING_SPACE_BEFORE_BLOCK = "TRAILING_SPACE_BEFORE_BLOCK",
              TRAILING_SPACE_IN_BLOCK = "TRAILING_SPACE_IN_BLOCK",
              TRAILING_SPACE_BEFORE_BR = "TRAILING_SPACE_BEFORE_BR",
              PRE_LINE_TRAILING_SPACE_BEFORE_LINE_BREAK = "PRE_LINE_TRAILING_SPACE_BEFORE_LINE_BREAK",
              TRAILING_LINE_BREAK_AFTER_BR = "TRAILING_LINE_BREAK_AFTER_BR",
              INCLUDED_TRAILING_LINE_BREAK_AFTER_BR = "INCLUDED_TRAILING_LINE_BREAK_AFTER_BR";

          extend(nodeProto, {
              isCharacterDataNode: createCachingGetter("isCharacterDataNode", dom.isCharacterDataNode, "node"),
              getNodeIndex: createCachingGetter("nodeIndex", dom.getNodeIndex, "node"),
              getLength: createCachingGetter("nodeLength", dom.getNodeLength, "node"),
              containsPositions: createCachingGetter("containsPositions", containsPositions, "node"),
              isWhitespace: createCachingGetter("isWhitespace", isWhitespaceNode, "node"),
              isCollapsedWhitespace: createCachingGetter("isCollapsedWhitespace", isCollapsedWhitespaceNode, "node"),
              getComputedDisplay: createCachingGetter("computedDisplay", getComputedDisplay, "node"),
              isCollapsed: createCachingGetter("collapsed", isCollapsedNode, "node"),
              isIgnored: createCachingGetter("ignored", isIgnoredNode, "node"),
              next: createCachingGetter("nextPos", nextNode, "node"),
              previous: createCachingGetter("previous", previousNode, "node"),

              getTextNodeInfo: createCachingGetter("textNodeInfo", function(textNode) {
                  var spaceRegex = null, collapseSpaces = false;
                  var cssWhitespace = getComputedStyleProperty(textNode.parentNode, "whiteSpace");
                  var preLine = (cssWhitespace == "pre-line");
                  if (preLine) {
                      spaceRegex = spacesMinusLineBreaksRegex;
                      collapseSpaces = true;
                  } else if (cssWhitespace == "normal" || cssWhitespace == "nowrap") {
                      spaceRegex = spacesRegex;
                      collapseSpaces = true;
                  }

                  return {
                      node: textNode,
                      text: textNode.data,
                      spaceRegex: spaceRegex,
                      collapseSpaces: collapseSpaces,
                      preLine: preLine
                  };
              }, "node"),

              hasInnerText: createCachingGetter("hasInnerText", function(el, backward) {
                  var session = this.session;
                  var posAfterEl = session.getPosition(el.parentNode, this.getNodeIndex() + 1);
                  var firstPosInEl = session.getPosition(el, 0);

                  var pos = backward ? posAfterEl : firstPosInEl;
                  var endPos = backward ? firstPosInEl : posAfterEl;

                  /*
                   <body><p>X  </p><p>Y</p></body>

                   Positions:

                   body:0:""
                   p:0:""
                   text:0:""
                   text:1:"X"
                   text:2:TRAILING_SPACE_IN_BLOCK
                   text:3:COLLAPSED_SPACE
                   p:1:""
                   body:1:"\n"
                   p:0:""
                   text:0:""
                   text:1:"Y"

                   A character is a TRAILING_SPACE_IN_BLOCK iff:

                   - There is no uncollapsed character after it within the visible containing block element

                   A character is a TRAILING_SPACE_BEFORE_BR iff:

                   - There is no uncollapsed character after it preceding a <br> element

                   An element has inner text iff

                   - It is not hidden
                   - It contains an uncollapsed character

                   All trailing spaces (pre-line, before <br>, end of block) require definite non-empty characters to render.
                   */

                  while (pos !== endPos) {
                      pos.prepopulateChar();
                      if (pos.isDefinitelyNonEmpty()) {
                          return true;
                      }
                      pos = backward ? pos.previousVisible() : pos.nextVisible();
                  }

                  return false;
              }, "node"),

              isRenderedBlock: createCachingGetter("isRenderedBlock", function(el) {
                  // Ensure that a block element containing a <br> is considered to have inner text
                  var brs = el.getElementsByTagName("br");
                  for (var i = 0, len = brs.length; i < len; ++i) {
                      if (!isCollapsedNode(brs[i])) {
                          return true;
                      }
                  }
                  return this.hasInnerText();
              }, "node"),

              getTrailingSpace: createCachingGetter("trailingSpace", function(el) {
                  if (el.tagName.toLowerCase() == "br") {
                      return "";
                  } else {
                      switch (this.getComputedDisplay()) {
                          case "inline":
                              var child = el.lastChild;
                              while (child) {
                                  if (!isIgnoredNode(child)) {
                                      return (child.nodeType == 1) ? this.session.getNodeWrapper(child).getTrailingSpace() : "";
                                  }
                                  child = child.previousSibling;
                              }
                              break;
                          case "inline-block":
                          case "inline-table":
                          case "none":
                          case "table-column":
                          case "table-column-group":
                              break;
                          case "table-cell":
                              return "\t";
                          default:
                              return this.isRenderedBlock(true) ? "\n" : "";
                      }
                  }
                  return "";
              }, "node"),

              getLeadingSpace: createCachingGetter("leadingSpace", function(el) {
                  switch (this.getComputedDisplay()) {
                      case "inline":
                      case "inline-block":
                      case "inline-table":
                      case "none":
                      case "table-column":
                      case "table-column-group":
                      case "table-cell":
                          break;
                      default:
                          return this.isRenderedBlock(false) ? "\n" : "";
                  }
                  return "";
              }, "node")
          });

          /*----------------------------------------------------------------------------------------------------------------*/

          function Position(nodeWrapper, offset) {
              this.offset = offset;
              this.nodeWrapper = nodeWrapper;
              this.node = nodeWrapper.node;
              this.session = nodeWrapper.session;
              this.cache = new Cache();
          }

          function inspectPosition() {
              return "[Position(" + dom.inspectNode(this.node) + ":" + this.offset + ")]";
          }

          var positionProto = {
              character: "",
              characterType: EMPTY,
              isBr: false,

              /*
              This method:
              - Fully populates positions that have characters that can be determined independently of any other characters.
              - Populates most types of space positions with a provisional character. The character is finalized later.
               */
              prepopulateChar: function() {
                  var pos = this;
                  if (!pos.prepopulatedChar) {
                      var node = pos.node, offset = pos.offset;
                      var visibleChar = "", charType = EMPTY;
                      var finalizedChar = false;
                      if (offset > 0) {
                          if (node.nodeType == 3) {
                              var text = node.data;
                              var textChar = text.charAt(offset - 1);

                              var nodeInfo = pos.nodeWrapper.getTextNodeInfo();
                              var spaceRegex = nodeInfo.spaceRegex;
                              if (nodeInfo.collapseSpaces) {
                                  if (spaceRegex.test(textChar)) {
                                      // "If the character at position is from set, append a single space (U+0020) to newdata and advance
                                      // position until the character at position is not from set."

                                      // We also need to check for the case where we're in a pre-line and we have a space preceding a
                                      // line break, because such spaces are collapsed in some browsers
                                      if (offset > 1 && spaceRegex.test(text.charAt(offset - 2))) {
                                      } else if (nodeInfo.preLine && text.charAt(offset) === "\n") {
                                          visibleChar = " ";
                                          charType = PRE_LINE_TRAILING_SPACE_BEFORE_LINE_BREAK;
                                      } else {
                                          visibleChar = " ";
                                          //pos.checkForFollowingLineBreak = true;
                                          charType = COLLAPSIBLE_SPACE;
                                      }
                                  } else {
                                      visibleChar = textChar;
                                      charType = NON_SPACE;
                                      finalizedChar = true;
                                  }
                              } else {
                                  visibleChar = textChar;
                                  charType = UNCOLLAPSIBLE_SPACE;
                                  finalizedChar = true;
                              }
                          } else {
                              var nodePassed = node.childNodes[offset - 1];
                              if (nodePassed && nodePassed.nodeType == 1 && !isCollapsedNode(nodePassed)) {
                                  if (nodePassed.tagName.toLowerCase() == "br") {
                                      visibleChar = "\n";
                                      pos.isBr = true;
                                      charType = COLLAPSIBLE_SPACE;
                                      finalizedChar = false;
                                  } else {
                                      pos.checkForTrailingSpace = true;
                                  }
                              }

                              // Check the leading space of the next node for the case when a block element follows an inline
                              // element or text node. In that case, there is an implied line break between the two nodes.
                              if (!visibleChar) {
                                  var nextNode = node.childNodes[offset];
                                  if (nextNode && nextNode.nodeType == 1 && !isCollapsedNode(nextNode)) {
                                      pos.checkForLeadingSpace = true;
                                  }
                              }
                          }
                      }

                      pos.prepopulatedChar = true;
                      pos.character = visibleChar;
                      pos.characterType = charType;
                      pos.isCharInvariant = finalizedChar;
                  }
              },

              isDefinitelyNonEmpty: function() {
                  var charType = this.characterType;
                  return charType == NON_SPACE || charType == UNCOLLAPSIBLE_SPACE;
              },

              // Resolve leading and trailing spaces, which may involve prepopulating other positions
              resolveLeadingAndTrailingSpaces: function() {
                  if (!this.prepopulatedChar) {
                      this.prepopulateChar();
                  }
                  if (this.checkForTrailingSpace) {
                      var trailingSpace = this.session.getNodeWrapper(this.node.childNodes[this.offset - 1]).getTrailingSpace();
                      if (trailingSpace) {
                          this.isTrailingSpace = true;
                          this.character = trailingSpace;
                          this.characterType = COLLAPSIBLE_SPACE;
                      }
                      this.checkForTrailingSpace = false;
                  }
                  if (this.checkForLeadingSpace) {
                      var leadingSpace = this.session.getNodeWrapper(this.node.childNodes[this.offset]).getLeadingSpace();
                      if (leadingSpace) {
                          this.isLeadingSpace = true;
                          this.character = leadingSpace;
                          this.characterType = COLLAPSIBLE_SPACE;
                      }
                      this.checkForLeadingSpace = false;
                  }
              },

              getPrecedingUncollapsedPosition: function(characterOptions) {
                  var pos = this, character;
                  while ( (pos = pos.previousVisible()) ) {
                      character = pos.getCharacter(characterOptions);
                      if (character !== "") {
                          return pos;
                      }
                  }

                  return null;
              },

              getCharacter: function(characterOptions) {
                  this.resolveLeadingAndTrailingSpaces();

                  var thisChar = this.character, returnChar;

                  // Check if character is ignored
                  var ignoredChars = normalizeIgnoredCharacters(characterOptions.ignoreCharacters);
                  var isIgnoredCharacter = (thisChar !== "" && ignoredChars.indexOf(thisChar) > -1);

                  // Check if this position's  character is invariant (i.e. not dependent on character options) and return it
                  // if so
                  if (this.isCharInvariant) {
                      returnChar = isIgnoredCharacter ? "" : thisChar;
                      return returnChar;
                  }

                  var cacheKey = ["character", characterOptions.includeSpaceBeforeBr, characterOptions.includeBlockContentTrailingSpace, characterOptions.includePreLineTrailingSpace, ignoredChars].join("_");
                  var cachedChar = this.cache.get(cacheKey);
                  if (cachedChar !== null) {
                      return cachedChar;
                  }

                  // We need to actually get the character now
                  var character = "";
                  var collapsible = (this.characterType == COLLAPSIBLE_SPACE);

                  var nextPos, previousPos;
                  var gotPreviousPos = false;
                  var pos = this;

                  function getPreviousPos() {
                      if (!gotPreviousPos) {
                          previousPos = pos.getPrecedingUncollapsedPosition(characterOptions);
                          gotPreviousPos = true;
                      }
                      return previousPos;
                  }

                  // Disallow a collapsible space that is followed by a line break or is the last character
                  if (collapsible) {
                      // Allow a trailing space that we've previously determined should be included
                      if (this.type == INCLUDED_TRAILING_LINE_BREAK_AFTER_BR) {
                          character = "\n";
                      }
                      // Disallow a collapsible space that follows a trailing space or line break, or is the first character,
                      // or follows a collapsible included space
                      else if (thisChar == " " &&
                              (!getPreviousPos() || previousPos.isTrailingSpace || previousPos.character == "\n" || (previousPos.character == " " && previousPos.characterType == COLLAPSIBLE_SPACE))) {
                      }
                      // Allow a leading line break unless it follows a line break
                      else if (thisChar == "\n" && this.isLeadingSpace) {
                          if (getPreviousPos() && previousPos.character != "\n") {
                              character = "\n";
                          } else {
                          }
                      } else {
                          nextPos = this.nextUncollapsed();
                          if (nextPos) {
                              if (nextPos.isBr) {
                                  this.type = TRAILING_SPACE_BEFORE_BR;
                              } else if (nextPos.isTrailingSpace && nextPos.character == "\n") {
                                  this.type = TRAILING_SPACE_IN_BLOCK;
                              } else if (nextPos.isLeadingSpace && nextPos.character == "\n") {
                                  this.type = TRAILING_SPACE_BEFORE_BLOCK;
                              }

                              if (nextPos.character == "\n") {
                                  if (this.type == TRAILING_SPACE_BEFORE_BR && !characterOptions.includeSpaceBeforeBr) {
                                  } else if (this.type == TRAILING_SPACE_BEFORE_BLOCK && !characterOptions.includeSpaceBeforeBlock) {
                                  } else if (this.type == TRAILING_SPACE_IN_BLOCK && nextPos.isTrailingSpace && !characterOptions.includeBlockContentTrailingSpace) {
                                  } else if (this.type == PRE_LINE_TRAILING_SPACE_BEFORE_LINE_BREAK && nextPos.type == NON_SPACE && !characterOptions.includePreLineTrailingSpace) {
                                  } else if (thisChar == "\n") {
                                      if (nextPos.isTrailingSpace) {
                                          if (this.isTrailingSpace) {
                                          } else if (this.isBr) {
                                              nextPos.type = TRAILING_LINE_BREAK_AFTER_BR;

                                              if (getPreviousPos() && previousPos.isLeadingSpace && !previousPos.isTrailingSpace && previousPos.character == "\n") {
                                                  nextPos.character = "";
                                              } else {
                                                  nextPos.type = INCLUDED_TRAILING_LINE_BREAK_AFTER_BR;
                                              }
                                          }
                                      } else {
                                          character = "\n";
                                      }
                                  } else if (thisChar == " ") {
                                      character = " ";
                                  } else {
                                  }
                              } else {
                                  character = thisChar;
                              }
                          } else {
                          }
                      }
                  }

                  if (ignoredChars.indexOf(character) > -1) {
                      character = "";
                  }


                  this.cache.set(cacheKey, character);

                  return character;
              },

              equals: function(pos) {
                  return !!pos && this.node === pos.node && this.offset === pos.offset;
              },

              inspect: inspectPosition,

              toString: function() {
                  return this.character;
              }
          };

          Position.prototype = positionProto;

          extend(positionProto, {
              next: createCachingGetter("nextPos", function(pos) {
                  var nodeWrapper = pos.nodeWrapper, node = pos.node, offset = pos.offset, session = nodeWrapper.session;
                  if (!node) {
                      return null;
                  }
                  var nextNode, nextOffset, child;
                  if (offset == nodeWrapper.getLength()) {
                      // Move onto the next node
                      nextNode = node.parentNode;
                      nextOffset = nextNode ? nodeWrapper.getNodeIndex() + 1 : 0;
                  } else {
                      if (nodeWrapper.isCharacterDataNode()) {
                          nextNode = node;
                          nextOffset = offset + 1;
                      } else {
                          child = node.childNodes[offset];
                          // Go into the children next, if children there are
                          if (session.getNodeWrapper(child).containsPositions()) {
                              nextNode = child;
                              nextOffset = 0;
                          } else {
                              nextNode = node;
                              nextOffset = offset + 1;
                          }
                      }
                  }

                  return nextNode ? session.getPosition(nextNode, nextOffset) : null;
              }),

              previous: createCachingGetter("previous", function(pos) {
                  var nodeWrapper = pos.nodeWrapper, node = pos.node, offset = pos.offset, session = nodeWrapper.session;
                  var previousNode, previousOffset, child;
                  if (offset == 0) {
                      previousNode = node.parentNode;
                      previousOffset = previousNode ? nodeWrapper.getNodeIndex() : 0;
                  } else {
                      if (nodeWrapper.isCharacterDataNode()) {
                          previousNode = node;
                          previousOffset = offset - 1;
                      } else {
                          child = node.childNodes[offset - 1];
                          // Go into the children next, if children there are
                          if (session.getNodeWrapper(child).containsPositions()) {
                              previousNode = child;
                              previousOffset = dom.getNodeLength(child);
                          } else {
                              previousNode = node;
                              previousOffset = offset - 1;
                          }
                      }
                  }
                  return previousNode ? session.getPosition(previousNode, previousOffset) : null;
              }),

              /*
               Next and previous position moving functions that filter out

               - Hidden (CSS visibility/display) elements
               - Script and style elements
               */
              nextVisible: createCachingGetter("nextVisible", function(pos) {
                  var next = pos.next();
                  if (!next) {
                      return null;
                  }
                  var nodeWrapper = next.nodeWrapper, node = next.node;
                  var newPos = next;
                  if (nodeWrapper.isCollapsed()) {
                      // We're skipping this node and all its descendants
                      newPos = nodeWrapper.session.getPosition(node.parentNode, nodeWrapper.getNodeIndex() + 1);
                  }
                  return newPos;
              }),

              nextUncollapsed: createCachingGetter("nextUncollapsed", function(pos) {
                  var nextPos = pos;
                  while ( (nextPos = nextPos.nextVisible()) ) {
                      nextPos.resolveLeadingAndTrailingSpaces();
                      if (nextPos.character !== "") {
                          return nextPos;
                      }
                  }
                  return null;
              }),

              previousVisible: createCachingGetter("previousVisible", function(pos) {
                  var previous = pos.previous();
                  if (!previous) {
                      return null;
                  }
                  var nodeWrapper = previous.nodeWrapper, node = previous.node;
                  var newPos = previous;
                  if (nodeWrapper.isCollapsed()) {
                      // We're skipping this node and all its descendants
                      newPos = nodeWrapper.session.getPosition(node.parentNode, nodeWrapper.getNodeIndex());
                  }
                  return newPos;
              })
          });

          /*----------------------------------------------------------------------------------------------------------------*/

          var currentSession = null;

          var Session = (function() {
              function createWrapperCache(nodeProperty) {
                  var cache = new Cache();

                  return {
                      get: function(node) {
                          var wrappersByProperty = cache.get(node[nodeProperty]);
                          if (wrappersByProperty) {
                              for (var i = 0, wrapper; wrapper = wrappersByProperty[i++]; ) {
                                  if (wrapper.node === node) {
                                      return wrapper;
                                  }
                              }
                          }
                          return null;
                      },

                      set: function(nodeWrapper) {
                          var property = nodeWrapper.node[nodeProperty];
                          var wrappersByProperty = cache.get(property) || cache.set(property, []);
                          wrappersByProperty.push(nodeWrapper);
                      }
                  };
              }

              var uniqueIDSupported = util.isHostProperty(document.documentElement, "uniqueID");

              function Session() {
                  this.initCaches();
              }

              Session.prototype = {
                  initCaches: function() {
                      this.elementCache = uniqueIDSupported ? (function() {
                          var elementsCache = new Cache();

                          return {
                              get: function(el) {
                                  return elementsCache.get(el.uniqueID);
                              },

                              set: function(elWrapper) {
                                  elementsCache.set(elWrapper.node.uniqueID, elWrapper);
                              }
                          };
                      })() : createWrapperCache("tagName");

                      // Store text nodes keyed by data, although we may need to truncate this
                      this.textNodeCache = createWrapperCache("data");
                      this.otherNodeCache = createWrapperCache("nodeName");
                  },

                  getNodeWrapper: function(node) {
                      var wrapperCache;
                      switch (node.nodeType) {
                          case 1:
                              wrapperCache = this.elementCache;
                              break;
                          case 3:
                              wrapperCache = this.textNodeCache;
                              break;
                          default:
                              wrapperCache = this.otherNodeCache;
                              break;
                      }

                      var wrapper = wrapperCache.get(node);
                      if (!wrapper) {
                          wrapper = new NodeWrapper(node, this);
                          wrapperCache.set(wrapper);
                      }
                      return wrapper;
                  },

                  getPosition: function(node, offset) {
                      return this.getNodeWrapper(node).getPosition(offset);
                  },

                  getRangeBoundaryPosition: function(range, isStart) {
                      var prefix = isStart ? "start" : "end";
                      return this.getPosition(range[prefix + "Container"], range[prefix + "Offset"]);
                  },

                  detach: function() {
                      this.elementCache = this.textNodeCache = this.otherNodeCache = null;
                  }
              };

              return Session;
          })();

          /*----------------------------------------------------------------------------------------------------------------*/

          function startSession() {
              endSession();
              return (currentSession = new Session());
          }

          function getSession() {
              return currentSession || startSession();
          }

          function endSession() {
              if (currentSession) {
                  currentSession.detach();
              }
              currentSession = null;
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Extensions to the rangy.dom utility object

          extend(dom, {
              nextNode: nextNode,
              previousNode: previousNode
          });

          /*----------------------------------------------------------------------------------------------------------------*/

          function createCharacterIterator(startPos, backward, endPos, characterOptions) {

              // Adjust the end position to ensure that it is actually reached
              if (endPos) {
                  if (backward) {
                      if (isCollapsedNode(endPos.node)) {
                          endPos = startPos.previousVisible();
                      }
                  } else {
                      if (isCollapsedNode(endPos.node)) {
                          endPos = endPos.nextVisible();
                      }
                  }
              }

              var pos = startPos, finished = false;

              function next() {
                  var charPos = null;
                  if (backward) {
                      charPos = pos;
                      if (!finished) {
                          pos = pos.previousVisible();
                          finished = !pos || (endPos && pos.equals(endPos));
                      }
                  } else {
                      if (!finished) {
                          charPos = pos = pos.nextVisible();
                          finished = !pos || (endPos && pos.equals(endPos));
                      }
                  }
                  if (finished) {
                      pos = null;
                  }
                  return charPos;
              }

              var previousTextPos, returnPreviousTextPos = false;

              return {
                  next: function() {
                      if (returnPreviousTextPos) {
                          returnPreviousTextPos = false;
                          return previousTextPos;
                      } else {
                          var pos, character;
                          while ( (pos = next()) ) {
                              character = pos.getCharacter(characterOptions);
                              if (character) {
                                  previousTextPos = pos;
                                  return pos;
                              }
                          }
                          return null;
                      }
                  },

                  rewind: function() {
                      if (previousTextPos) {
                          returnPreviousTextPos = true;
                      } else {
                          throw module.createError("createCharacterIterator: cannot rewind. Only one position can be rewound.");
                      }
                  },

                  dispose: function() {
                      startPos = endPos = null;
                  }
              };
          }

          var arrayIndexOf = Array.prototype.indexOf ?
              function(arr, val) {
                  return arr.indexOf(val);
              } :
              function(arr, val) {
                  for (var i = 0, len = arr.length; i < len; ++i) {
                      if (arr[i] === val) {
                          return i;
                      }
                  }
                  return -1;
              };

          // Provides a pair of iterators over text positions, tokenized. Transparently requests more text when next()
          // is called and there is no more tokenized text
          function createTokenizedTextProvider(pos, characterOptions, wordOptions) {
              var forwardIterator = createCharacterIterator(pos, false, null, characterOptions);
              var backwardIterator = createCharacterIterator(pos, true, null, characterOptions);
              var tokenizer = wordOptions.tokenizer;

              // Consumes a word and the whitespace beyond it
              function consumeWord(forward) {
                  var pos, textChar;
                  var newChars = [], it = forward ? forwardIterator : backwardIterator;

                  var passedWordBoundary = false, insideWord = false;

                  while ( (pos = it.next()) ) {
                      textChar = pos.character;


                      if (allWhiteSpaceRegex.test(textChar)) {
                          if (insideWord) {
                              insideWord = false;
                              passedWordBoundary = true;
                          }
                      } else {
                          if (passedWordBoundary) {
                              it.rewind();
                              break;
                          } else {
                              insideWord = true;
                          }
                      }
                      newChars.push(pos);
                  }


                  return newChars;
              }

              // Get initial word surrounding initial position and tokenize it
              var forwardChars = consumeWord(true);
              var backwardChars = consumeWord(false).reverse();
              var tokens = tokenize(backwardChars.concat(forwardChars), wordOptions, tokenizer);

              // Create initial token buffers
              var forwardTokensBuffer = forwardChars.length ?
                  tokens.slice(arrayIndexOf(tokens, forwardChars[0].token)) : [];

              var backwardTokensBuffer = backwardChars.length ?
                  tokens.slice(0, arrayIndexOf(tokens, backwardChars.pop().token) + 1) : [];

              function inspectBuffer(buffer) {
                  var textPositions = ["[" + buffer.length + "]"];
                  for (var i = 0; i < buffer.length; ++i) {
                      textPositions.push("(word: " + buffer[i] + ", is word: " + buffer[i].isWord + ")");
                  }
                  return textPositions;
              }


              return {
                  nextEndToken: function() {
                      var lastToken, forwardChars;

                      // If we're down to the last token, consume character chunks until we have a word or run out of
                      // characters to consume
                      while ( forwardTokensBuffer.length == 1 &&
                          !(lastToken = forwardTokensBuffer[0]).isWord &&
                          (forwardChars = consumeWord(true)).length > 0) {

                          // Merge trailing non-word into next word and tokenize
                          forwardTokensBuffer = tokenize(lastToken.chars.concat(forwardChars), wordOptions, tokenizer);
                      }

                      return forwardTokensBuffer.shift();
                  },

                  previousStartToken: function() {
                      var lastToken, backwardChars;

                      // If we're down to the last token, consume character chunks until we have a word or run out of
                      // characters to consume
                      while ( backwardTokensBuffer.length == 1 &&
                          !(lastToken = backwardTokensBuffer[0]).isWord &&
                          (backwardChars = consumeWord(false)).length > 0) {

                          // Merge leading non-word into next word and tokenize
                          backwardTokensBuffer = tokenize(backwardChars.reverse().concat(lastToken.chars), wordOptions, tokenizer);
                      }

                      return backwardTokensBuffer.pop();
                  },

                  dispose: function() {
                      forwardIterator.dispose();
                      backwardIterator.dispose();
                      forwardTokensBuffer = backwardTokensBuffer = null;
                  }
              };
          }

          function movePositionBy(pos, unit, count, characterOptions, wordOptions) {
              var unitsMoved = 0, currentPos, newPos = pos, charIterator, nextPos, absCount = Math.abs(count), token;
              if (count !== 0) {
                  var backward = (count < 0);

                  switch (unit) {
                      case CHARACTER:
                          charIterator = createCharacterIterator(pos, backward, null, characterOptions);
                          while ( (currentPos = charIterator.next()) && unitsMoved < absCount ) {
                              ++unitsMoved;
                              newPos = currentPos;
                          }
                          nextPos = currentPos;
                          charIterator.dispose();
                          break;
                      case WORD:
                          var tokenizedTextProvider = createTokenizedTextProvider(pos, characterOptions, wordOptions);
                          var next = backward ? tokenizedTextProvider.previousStartToken : tokenizedTextProvider.nextEndToken;

                          while ( (token = next()) && unitsMoved < absCount ) {
                              if (token.isWord) {
                                  ++unitsMoved;
                                  newPos = backward ? token.chars[0] : token.chars[token.chars.length - 1];
                              }
                          }
                          break;
                      default:
                          throw new Error("movePositionBy: unit '" + unit + "' not implemented");
                  }

                  // Perform any necessary position tweaks
                  if (backward) {
                      newPos = newPos.previousVisible();
                      unitsMoved = -unitsMoved;
                  } else if (newPos && newPos.isLeadingSpace && !newPos.isTrailingSpace) {
                      // Tweak the position for the case of a leading space. The problem is that an uncollapsed leading space
                      // before a block element (for example, the line break between "1" and "2" in the following HTML:
                      // "1<p>2</p>") is considered to be attached to the position immediately before the block element, which
                      // corresponds with a different selection position in most browsers from the one we want (i.e. at the
                      // start of the contents of the block element). We get round this by advancing the position returned to
                      // the last possible equivalent visible position.
                      if (unit == WORD) {
                          charIterator = createCharacterIterator(pos, false, null, characterOptions);
                          nextPos = charIterator.next();
                          charIterator.dispose();
                      }
                      if (nextPos) {
                          newPos = nextPos.previousVisible();
                      }
                  }
              }


              return {
                  position: newPos,
                  unitsMoved: unitsMoved
              };
          }

          function createRangeCharacterIterator(session, range, characterOptions, backward) {
              var rangeStart = session.getRangeBoundaryPosition(range, true);
              var rangeEnd = session.getRangeBoundaryPosition(range, false);
              var itStart = backward ? rangeEnd : rangeStart;
              var itEnd = backward ? rangeStart : rangeEnd;

              return createCharacterIterator(itStart, !!backward, itEnd, characterOptions);
          }

          function getRangeCharacters(session, range, characterOptions) {

              var chars = [], it = createRangeCharacterIterator(session, range, characterOptions), pos;
              while ( (pos = it.next()) ) {
                  chars.push(pos);
              }

              it.dispose();
              return chars;
          }

          function isWholeWord(startPos, endPos, wordOptions) {
              var range = api.createRange(startPos.node);
              range.setStartAndEnd(startPos.node, startPos.offset, endPos.node, endPos.offset);
              return !range.expand("word", { wordOptions: wordOptions });
          }

          function findTextFromPosition(initialPos, searchTerm, isRegex, searchScopeRange, findOptions) {
              var backward = isDirectionBackward(findOptions.direction);
              var it = createCharacterIterator(
                  initialPos,
                  backward,
                  initialPos.session.getRangeBoundaryPosition(searchScopeRange, backward),
                  findOptions.characterOptions
              );
              var text = "", chars = [], pos, currentChar, matchStartIndex, matchEndIndex;
              var result, insideRegexMatch;
              var returnValue = null;

              function handleMatch(startIndex, endIndex) {
                  var startPos = chars[startIndex].previousVisible();
                  var endPos = chars[endIndex - 1];
                  var valid = (!findOptions.wholeWordsOnly || isWholeWord(startPos, endPos, findOptions.wordOptions));

                  return {
                      startPos: startPos,
                      endPos: endPos,
                      valid: valid
                  };
              }

              while ( (pos = it.next()) ) {
                  currentChar = pos.character;
                  if (!isRegex && !findOptions.caseSensitive) {
                      currentChar = currentChar.toLowerCase();
                  }

                  if (backward) {
                      chars.unshift(pos);
                      text = currentChar + text;
                  } else {
                      chars.push(pos);
                      text += currentChar;
                  }

                  if (isRegex) {
                      result = searchTerm.exec(text);
                      if (result) {
                          matchStartIndex = result.index;
                          matchEndIndex = matchStartIndex + result[0].length;
                          if (insideRegexMatch) {
                              // Check whether the match is now over
                              if ((!backward && matchEndIndex < text.length) || (backward && matchStartIndex > 0)) {
                                  returnValue = handleMatch(matchStartIndex, matchEndIndex);
                                  break;
                              }
                          } else {
                              insideRegexMatch = true;
                          }
                      }
                  } else if ( (matchStartIndex = text.indexOf(searchTerm)) != -1 ) {
                      returnValue = handleMatch(matchStartIndex, matchStartIndex + searchTerm.length);
                      break;
                  }
              }

              // Check whether regex match extends to the end of the range
              if (insideRegexMatch) {
                  returnValue = handleMatch(matchStartIndex, matchEndIndex);
              }
              it.dispose();

              return returnValue;
          }

          function createEntryPointFunction(func) {
              return function() {
                  var sessionRunning = !!currentSession;
                  var session = getSession();
                  var args = [session].concat( util.toArray(arguments) );
                  var returnValue = func.apply(this, args);
                  if (!sessionRunning) {
                      endSession();
                  }
                  return returnValue;
              };
          }

          /*----------------------------------------------------------------------------------------------------------------*/

          // Extensions to the Rangy Range object

          function createRangeBoundaryMover(isStart, collapse) {
              /*
               Unit can be "character" or "word"
               Options:

               - includeTrailingSpace
               - wordRegex
               - tokenizer
               - collapseSpaceBeforeLineBreak
               */
              return createEntryPointFunction(
                  function(session, unit, count, moveOptions) {
                      if (typeof count == UNDEF) {
                          count = unit;
                          unit = CHARACTER;
                      }
                      moveOptions = createNestedOptions(moveOptions, defaultMoveOptions);

                      var boundaryIsStart = isStart;
                      if (collapse) {
                          boundaryIsStart = (count >= 0);
                          this.collapse(!boundaryIsStart);
                      }
                      var moveResult = movePositionBy(session.getRangeBoundaryPosition(this, boundaryIsStart), unit, count, moveOptions.characterOptions, moveOptions.wordOptions);
                      var newPos = moveResult.position;
                      this[boundaryIsStart ? "setStart" : "setEnd"](newPos.node, newPos.offset);
                      return moveResult.unitsMoved;
                  }
              );
          }

          function createRangeTrimmer(isStart) {
              return createEntryPointFunction(
                  function(session, characterOptions) {
                      characterOptions = createOptions(characterOptions, defaultCharacterOptions);
                      var pos;
                      var it = createRangeCharacterIterator(session, this, characterOptions, !isStart);
                      var trimCharCount = 0;
                      while ( (pos = it.next()) && allWhiteSpaceRegex.test(pos.character) ) {
                          ++trimCharCount;
                      }
                      it.dispose();
                      var trimmed = (trimCharCount > 0);
                      if (trimmed) {
                          this[isStart ? "moveStart" : "moveEnd"](
                              "character",
                              isStart ? trimCharCount : -trimCharCount,
                              { characterOptions: characterOptions }
                          );
                      }
                      return trimmed;
                  }
              );
          }

          extend(api.rangePrototype, {
              moveStart: createRangeBoundaryMover(true, false),

              moveEnd: createRangeBoundaryMover(false, false),

              move: createRangeBoundaryMover(true, true),

              trimStart: createRangeTrimmer(true),

              trimEnd: createRangeTrimmer(false),

              trim: createEntryPointFunction(
                  function(session, characterOptions) {
                      var startTrimmed = this.trimStart(characterOptions), endTrimmed = this.trimEnd(characterOptions);
                      return startTrimmed || endTrimmed;
                  }
              ),

              expand: createEntryPointFunction(
                  function(session, unit, expandOptions) {
                      var moved = false;
                      expandOptions = createNestedOptions(expandOptions, defaultExpandOptions);
                      var characterOptions = expandOptions.characterOptions;
                      if (!unit) {
                          unit = CHARACTER;
                      }
                      if (unit == WORD) {
                          var wordOptions = expandOptions.wordOptions;
                          var startPos = session.getRangeBoundaryPosition(this, true);
                          var endPos = session.getRangeBoundaryPosition(this, false);

                          var startTokenizedTextProvider = createTokenizedTextProvider(startPos, characterOptions, wordOptions);
                          var startToken = startTokenizedTextProvider.nextEndToken();
                          var newStartPos = startToken.chars[0].previousVisible();
                          var endToken, newEndPos;

                          if (this.collapsed) {
                              endToken = startToken;
                          } else {
                              var endTokenizedTextProvider = createTokenizedTextProvider(endPos, characterOptions, wordOptions);
                              endToken = endTokenizedTextProvider.previousStartToken();
                          }
                          newEndPos = endToken.chars[endToken.chars.length - 1];

                          if (!newStartPos.equals(startPos)) {
                              this.setStart(newStartPos.node, newStartPos.offset);
                              moved = true;
                          }
                          if (newEndPos && !newEndPos.equals(endPos)) {
                              this.setEnd(newEndPos.node, newEndPos.offset);
                              moved = true;
                          }

                          if (expandOptions.trim) {
                              if (expandOptions.trimStart) {
                                  moved = this.trimStart(characterOptions) || moved;
                              }
                              if (expandOptions.trimEnd) {
                                  moved = this.trimEnd(characterOptions) || moved;
                              }
                          }

                          return moved;
                      } else {
                          return this.moveEnd(CHARACTER, 1, expandOptions);
                      }
                  }
              ),

              text: createEntryPointFunction(
                  function(session, characterOptions) {
                      return this.collapsed ?
                          "" : getRangeCharacters(session, this, createOptions(characterOptions, defaultCharacterOptions)).join("");
                  }
              ),

              selectCharacters: createEntryPointFunction(
                  function(session, containerNode, startIndex, endIndex, characterOptions) {
                      var moveOptions = { characterOptions: characterOptions };
                      if (!containerNode) {
                          containerNode = getBody( this.getDocument() );
                      }
                      this.selectNodeContents(containerNode);
                      this.collapse(true);
                      this.moveStart("character", startIndex, moveOptions);
                      this.collapse(true);
                      this.moveEnd("character", endIndex - startIndex, moveOptions);
                  }
              ),

              // Character indexes are relative to the start of node
              toCharacterRange: createEntryPointFunction(
                  function(session, containerNode, characterOptions) {
                      if (!containerNode) {
                          containerNode = getBody( this.getDocument() );
                      }
                      var parent = containerNode.parentNode, nodeIndex = dom.getNodeIndex(containerNode);
                      var rangeStartsBeforeNode = (dom.comparePoints(this.startContainer, this.endContainer, parent, nodeIndex) == -1);
                      var rangeBetween = this.cloneRange();
                      var startIndex, endIndex;
                      if (rangeStartsBeforeNode) {
                          rangeBetween.setStartAndEnd(this.startContainer, this.startOffset, parent, nodeIndex);
                          startIndex = -rangeBetween.text(characterOptions).length;
                      } else {
                          rangeBetween.setStartAndEnd(parent, nodeIndex, this.startContainer, this.startOffset);
                          startIndex = rangeBetween.text(characterOptions).length;
                      }
                      endIndex = startIndex + this.text(characterOptions).length;

                      return {
                          start: startIndex,
                          end: endIndex
                      };
                  }
              ),

              findText: createEntryPointFunction(
                  function(session, searchTermParam, findOptions) {
                      // Set up options
                      findOptions = createNestedOptions(findOptions, defaultFindOptions);

                      // Create word options if we're matching whole words only
                      if (findOptions.wholeWordsOnly) {
                          // We don't ever want trailing spaces for search results
                          findOptions.wordOptions.includeTrailingSpace = false;
                      }

                      var backward = isDirectionBackward(findOptions.direction);

                      // Create a range representing the search scope if none was provided
                      var searchScopeRange = findOptions.withinRange;
                      if (!searchScopeRange) {
                          searchScopeRange = api.createRange();
                          searchScopeRange.selectNodeContents(this.getDocument());
                      }

                      // Examine and prepare the search term
                      var searchTerm = searchTermParam, isRegex = false;
                      if (typeof searchTerm == "string") {
                          if (!findOptions.caseSensitive) {
                              searchTerm = searchTerm.toLowerCase();
                          }
                      } else {
                          isRegex = true;
                      }

                      var initialPos = session.getRangeBoundaryPosition(this, !backward);

                      // Adjust initial position if it lies outside the search scope
                      var comparison = searchScopeRange.comparePoint(initialPos.node, initialPos.offset);

                      if (comparison === -1) {
                          initialPos = session.getRangeBoundaryPosition(searchScopeRange, true);
                      } else if (comparison === 1) {
                          initialPos = session.getRangeBoundaryPosition(searchScopeRange, false);
                      }

                      var pos = initialPos;
                      var wrappedAround = false;

                      // Try to find a match and ignore invalid ones
                      var findResult;
                      while (true) {
                          findResult = findTextFromPosition(pos, searchTerm, isRegex, searchScopeRange, findOptions);

                          if (findResult) {
                              if (findResult.valid) {
                                  this.setStartAndEnd(findResult.startPos.node, findResult.startPos.offset, findResult.endPos.node, findResult.endPos.offset);
                                  return true;
                              } else {
                                  // We've found a match that is not a whole word, so we carry on searching from the point immediately
                                  // after the match
                                  pos = backward ? findResult.startPos : findResult.endPos;
                              }
                          } else if (findOptions.wrap && !wrappedAround) {
                              // No result found but we're wrapping around and limiting the scope to the unsearched part of the range
                              searchScopeRange = searchScopeRange.cloneRange();
                              pos = session.getRangeBoundaryPosition(searchScopeRange, !backward);
                              searchScopeRange.setBoundary(initialPos.node, initialPos.offset, backward);
                              wrappedAround = true;
                          } else {
                              // Nothing found and we can't wrap around, so we're done
                              return false;
                          }
                      }
                  }
              ),

              pasteHtml: function(html) {
                  this.deleteContents();
                  if (html) {
                      var frag = this.createContextualFragment(html);
                      var lastChild = frag.lastChild;
                      this.insertNode(frag);
                      this.collapseAfter(lastChild);
                  }
              }
          });

          /*----------------------------------------------------------------------------------------------------------------*/

          // Extensions to the Rangy Selection object

          function createSelectionTrimmer(methodName) {
              return createEntryPointFunction(
                  function(session, characterOptions) {
                      var trimmed = false;
                      this.changeEachRange(function(range) {
                          trimmed = range[methodName](characterOptions) || trimmed;
                      });
                      return trimmed;
                  }
              );
          }

          extend(api.selectionPrototype, {
              expand: createEntryPointFunction(
                  function(session, unit, expandOptions) {
                      this.changeEachRange(function(range) {
                          range.expand(unit, expandOptions);
                      });
                  }
              ),

              move: createEntryPointFunction(
                  function(session, unit, count, options) {
                      var unitsMoved = 0;
                      if (this.focusNode) {
                          this.collapse(this.focusNode, this.focusOffset);
                          var range = this.getRangeAt(0);
                          if (!options) {
                              options = {};
                          }
                          options.characterOptions = createOptions(options.characterOptions, defaultCaretCharacterOptions);
                          unitsMoved = range.move(unit, count, options);
                          this.setSingleRange(range);
                      }
                      return unitsMoved;
                  }
              ),

              trimStart: createSelectionTrimmer("trimStart"),
              trimEnd: createSelectionTrimmer("trimEnd"),
              trim: createSelectionTrimmer("trim"),

              selectCharacters: createEntryPointFunction(
                  function(session, containerNode, startIndex, endIndex, direction, characterOptions) {
                      var range = api.createRange(containerNode);
                      range.selectCharacters(containerNode, startIndex, endIndex, characterOptions);
                      this.setSingleRange(range, direction);
                  }
              ),

              saveCharacterRanges: createEntryPointFunction(
                  function(session, containerNode, characterOptions) {
                      var ranges = this.getAllRanges(), rangeCount = ranges.length;
                      var rangeInfos = [];

                      var backward = rangeCount == 1 && this.isBackward();

                      for (var i = 0, len = ranges.length; i < len; ++i) {
                          rangeInfos[i] = {
                              characterRange: ranges[i].toCharacterRange(containerNode, characterOptions),
                              backward: backward,
                              characterOptions: characterOptions
                          };
                      }

                      return rangeInfos;
                  }
              ),

              restoreCharacterRanges: createEntryPointFunction(
                  function(session, containerNode, saved) {
                      this.removeAllRanges();
                      for (var i = 0, len = saved.length, range, rangeInfo, characterRange; i < len; ++i) {
                          rangeInfo = saved[i];
                          characterRange = rangeInfo.characterRange;
                          range = api.createRange(containerNode);
                          range.selectCharacters(containerNode, characterRange.start, characterRange.end, rangeInfo.characterOptions);
                          this.addRange(range, rangeInfo.backward);
                      }
                  }
              ),

              text: createEntryPointFunction(
                  function(session, characterOptions) {
                      var rangeTexts = [];
                      for (var i = 0, len = this.rangeCount; i < len; ++i) {
                          rangeTexts[i] = this.getRangeAt(i).text(characterOptions);
                      }
                      return rangeTexts.join("");
                  }
              )
          });

          /*----------------------------------------------------------------------------------------------------------------*/

          // Extensions to the core rangy object

          api.innerText = function(el, characterOptions) {
              var range = api.createRange(el);
              range.selectNodeContents(el);
              var text = range.text(characterOptions);
              return text;
          };

          api.createWordIterator = function(startNode, startOffset, iteratorOptions) {
              var session = getSession();
              iteratorOptions = createNestedOptions(iteratorOptions, defaultWordIteratorOptions);
              var startPos = session.getPosition(startNode, startOffset);
              var tokenizedTextProvider = createTokenizedTextProvider(startPos, iteratorOptions.characterOptions, iteratorOptions.wordOptions);
              var backward = isDirectionBackward(iteratorOptions.direction);

              return {
                  next: function() {
                      return backward ? tokenizedTextProvider.previousStartToken() : tokenizedTextProvider.nextEndToken();
                  },

                  dispose: function() {
                      tokenizedTextProvider.dispose();
                      this.next = function() {};
                  }
              };
          };

          /*----------------------------------------------------------------------------------------------------------------*/

          api.noMutation = function(func) {
              var session = getSession();
              func(session);
              endSession();
          };

          api.noMutation.createEntryPointFunction = createEntryPointFunction;

          api.textRange = {
              isBlockNode: isBlockNode,
              isCollapsedWhitespaceNode: isCollapsedWhitespaceNode,

              createPosition: createEntryPointFunction(
                  function(session, node, offset) {
                      return session.getPosition(node, offset);
                  }
              )
          };
      });
      
      return rangy;
  }, commonjsGlobal);
  });

  var code, getCursorCoordinates, helpers$1, keyCodes, keys, name, ref;

  window.rangy = rangyCore;

  helpers$1 = Trix$2.TestHelpers;

  keyCodes = {};

  ref = Trix$2.config.keyNames;
  for (code in ref) {
    name = ref[code];
    keyCodes[name] = code;
  }

  keys = {
    left: "ArrowLeft",
    right: "ArrowRight"
  };

  helpers$1.extend({
    moveCursor: function(options, callback) {
      var direction, move, times;
      if (typeof options === "string") {
        direction = options;
      } else {
        direction = options.direction;
        times = options.times;
      }
      if (times == null) {
        times = 1;
      }
      return (move = function() {
        return helpers$1.defer(function() {
          var selection;
          if (helpers$1.triggerEvent(document.activeElement, "keydown", {
            keyCode: keyCodes[direction],
            key: keys[direction]
          })) {
            selection = rangyCore.getSelection();
            selection.move("character", direction === "right" ? 1 : -1);
            Trix$2.selectionChangeObserver.update();
          }
          if (--times === 0) {
            return helpers$1.defer(function() {
              return callback(getCursorCoordinates());
            });
          } else {
            return move();
          }
        });
      })();
    },
    expandSelection: function(options, callback) {
      return helpers$1.defer(function() {
        var direction, expand, times;
        if (typeof options === "string") {
          direction = options;
        } else {
          direction = options.direction;
          times = options.times;
        }
        if (times == null) {
          times = 1;
        }
        return (expand = function() {
          return helpers$1.defer(function() {
            if (helpers$1.triggerEvent(document.activeElement, "keydown", {
              keyCode: keyCodes[direction],
              key: keys[direction],
              shiftKey: true
            })) {
              getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward");
            }
            if (--times === 0) {
              return helpers$1.defer(callback);
            } else {
              return expand();
            }
          });
        })();
      });
    },
    collapseSelection: function(direction, callback) {
      var selection;
      selection = rangyCore.getSelection();
      if (direction === "left") {
        selection.collapseToStart();
      } else {
        selection.collapseToEnd();
      }
      Trix$2.selectionChangeObserver.update();
      return helpers$1.defer(callback);
    },
    selectAll: function(callback) {
      rangyCore.getSelection().selectAllChildren(document.activeElement);
      Trix$2.selectionChangeObserver.update();
      return helpers$1.defer(callback);
    },
    deleteSelection: function() {
      var selection;
      selection = rangyCore.getSelection();
      selection.getRangeAt(0).deleteContents();
      return Trix$2.selectionChangeObserver.update();
    },
    selectionIsCollapsed: function() {
      return rangyCore.getSelection().isCollapsed;
    },
    insertNode: function(node, callback) {
      var range, selection;
      selection = rangyCore.getSelection();
      range = selection.getRangeAt(0);
      range.splitBoundaries();
      range.insertNode(node);
      range.setStartAfter(node);
      range.deleteContents();
      selection.setSingleRange(range);
      Trix$2.selectionChangeObserver.update();
      if (callback) {
        return requestAnimationFrame(callback);
      }
    },
    selectNode: function(node, callback) {
      var selection;
      selection = rangyCore.getSelection();
      selection.selectAllChildren(node);
      Trix$2.selectionChangeObserver.update();
      return typeof callback === "function" ? callback() : void 0;
    },
    createDOMRangeFromPoint: function(x, y) {
      var domRange, offset, offsetNode;
      if (document.caretPositionFromPoint) {
        ({offsetNode, offset} = document.caretPositionFromPoint(x, y));
        domRange = document.createRange();
        domRange.setStart(offsetNode, offset);
        return domRange;
      } else if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
      }
    }
  });

  getCursorCoordinates = function() {
    var rect;
    if (rect = window.getSelection().getRangeAt(0).getClientRects()[0]) {
      return {
        clientX: rect.left,
        clientY: rect.top + rect.height / 2
      };
    }
  };

  var normalizeRange, rangeIsCollapsed;

  ({normalizeRange, rangeIsCollapsed} = Trix$2);

  Trix$2.TestCompositionDelegate = class TestCompositionDelegate {
    compositionDidRequestChangingSelectionToLocationRange() {
      return this.getSelectionManager().setLocationRange(...arguments);
    }

    getSelectionManager() {
      return this.selectionManager != null ? this.selectionManager : this.selectionManager = new Trix$2.TestSelectionManager();
    }

  };

  Trix$2.TestSelectionManager = class TestSelectionManager {
    constructor() {
      this.setLocationRange({
        index: 0,
        offset: 0
      });
    }

    getLocationRange() {
      return this.locationRange;
    }

    setLocationRange(locationRange) {
      return this.locationRange = normalizeRange(locationRange);
    }

    preserveSelection(block) {
      var locationRange;
      locationRange = this.getLocationRange();
      block();
      return this.locationRange = locationRange;
    }

    setLocationRangeFromPoint(point) {}

    locationIsCursorTarget() {
      return false;
    }

    selectionIsExpanded() {
      return !rangeIsCollapsed(this.getLocationRange());
    }

  };

  var getToolbarButton, getToolbarDialog, helpers;

  helpers = Trix$2.TestHelpers;

  helpers.extend({
    clickToolbarButton: function(selector, callback) {
      var button;
      Trix$2.selectionChangeObserver.update();
      button = getToolbarButton(selector);
      helpers.triggerEvent(button, "mousedown");
      return helpers.defer(callback);
    },
    typeToolbarKeyCommand: function(selector, callback) {
      var button, keyCode, trixKey;
      button = getToolbarButton(selector);
      if (({trixKey} = button.dataset)) {
        keyCode = trixKey.toUpperCase().charCodeAt(0);
        helpers.triggerEvent(getEditorElement(), "keydown", {
          keyCode,
          charCode: 0,
          metaKey: true,
          ctrlKey: true
        });
      }
      return helpers.defer(callback);
    },
    clickToolbarDialogButton: function({method}, callback) {
      var button;
      button = getToolbarElement().querySelector(`[data-trix-dialog] [data-trix-method='${method}']`);
      helpers.triggerEvent(button, "click");
      return helpers.defer(callback);
    },
    isToolbarButtonActive: function(selector) {
      var button;
      button = getToolbarButton(selector);
      return button.hasAttribute("data-trix-active") && button.classList.contains("trix-active");
    },
    isToolbarButtonDisabled: function(selector) {
      return getToolbarButton(selector).disabled;
    },
    typeInToolbarDialog: function(string, {attribute}, callback) {
      var button, dialog, input;
      dialog = getToolbarDialog({attribute});
      input = dialog.querySelector(`[data-trix-input][name='${attribute}']`);
      button = dialog.querySelector("[data-trix-method='setAttribute']");
      input.value = string;
      helpers.triggerEvent(button, "click");
      return helpers.defer(callback);
    },
    isToolbarDialogActive: function(selector) {
      var dialog;
      dialog = getToolbarDialog(selector);
      return dialog.hasAttribute("data-trix-active") && dialog.classList.contains("trix-active");
    }
  });

  getToolbarButton = function({attribute, action}) {
    return getToolbarElement().querySelector(`[data-trix-attribute='${attribute}'], [data-trix-action='${action}']`);
  };

  getToolbarDialog = function({attribute, action}) {
    return getToolbarElement().querySelector(`[data-trix-dialog='${attribute}']`);
  };

  var key, value;

  for (key in QUnit) {
    value = QUnit[key];
    if (window[key] === value) {
      // Remove QUnit's globals
      delete window[key];
    }
  }

  var assert$u, test$v, testGroup$v;

  ({assert: assert$u, test: test$v, testGroup: testGroup$v} = Trix$2.TestHelpers);

  testGroup$v("Trix.Attachment", function() {
    var contentType, createAttachment, i, j, len, len1, nonPreviewableTypes, previewableTypes;
    previewableTypes = "image image/gif image/png image/jpg".split(" ");
    nonPreviewableTypes = "image/tiff application/foo".split(" ");
    createAttachment = function(attributes) {
      return new Trix$2.Attachment(attributes);
    };
    for (i = 0, len = previewableTypes.length; i < len; i++) {
      contentType = previewableTypes[i];
      (function(contentType) {
        return test$v(`${contentType} content type is previewable`, function() {
          return assert$u.ok(createAttachment({contentType}).isPreviewable());
        });
      })(contentType);
    }
    for (j = 0, len1 = nonPreviewableTypes.length; j < len1; j++) {
      contentType = nonPreviewableTypes[j];
      (function(contentType) {
        return test$v(`${contentType} content type is NOT previewable`, function() {
          return assert$u.notOk(createAttachment({contentType}).isPreviewable());
        });
      })(contentType);
    }
    return test$v("'previewable' attribute determines previewability", function() {
      var attrs;
      attrs = {
        previewable: true,
        contentType: nonPreviewableTypes[0]
      };
      assert$u.ok(createAttachment(attrs).isPreviewable());
      attrs = {
        previewable: false,
        contentType: previewableTypes[0]
      };
      return assert$u.notOk(createAttachment(attrs).isPreviewable());
    });
  });

  var assert$t, test$u, testGroup$u;

  ({assert: assert$t, test: test$u, testGroup: testGroup$u} = Trix$2.TestHelpers);

  testGroup$u("Trix.Block", function() {
    test$u("consolidating blocks creates text with one blockBreak piece", function() {
      var blockA, blockB, consolidatedBlock, pieces;
      blockA = new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"));
      blockB = new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"));
      consolidatedBlock = blockA.consolidateWith(blockB);
      pieces = consolidatedBlock.text.getPieces();
      assert$t.equal(pieces.length, 2, JSON.stringify(pieces));
      assert$t.deepEqual(pieces[0].getAttributes(), {});
      assert$t.deepEqual(pieces[1].getAttributes(), {
        blockBreak: true
      });
      return assert$t.equal(consolidatedBlock.toString(), "a\nb\n");
    });
    return test$u("consolidating empty blocks creates text with one blockBreak piece", function() {
      var consolidatedBlock, pieces;
      consolidatedBlock = new Trix$2.Block().consolidateWith(new Trix$2.Block());
      pieces = consolidatedBlock.text.getPieces();
      assert$t.equal(pieces.length, 2, JSON.stringify(pieces));
      assert$t.deepEqual(pieces[0].getAttributes(), {});
      assert$t.deepEqual(pieces[1].getAttributes(), {
        blockBreak: true
      });
      return assert$t.equal(consolidatedBlock.toString(), "\n\n");
    });
  });

  var assert$s, composition, setup, test$t, testGroup$t;

  ({assert: assert$s, test: test$t, testGroup: testGroup$t} = Trix$2.TestHelpers);

  composition = null;

  setup = function() {
    composition = new Trix$2.Composition();
    return composition.delegate = new Trix$2.TestCompositionDelegate();
  };

  testGroup$t("Trix.Composition", {setup}, function() {
    return test$t("deleteInDirection respects UTF-16 character boundaries", function() {
      composition.insertString("abc😭");
      composition.deleteInDirection("backward");
      composition.insertString("d");
      return assert$s.equal(composition.document.toString(), "abcd\n");
    });
  });

  var assert$r, test$s, testGroup$s;

  ({assert: assert$r, test: test$s, testGroup: testGroup$s} = Trix$2.TestHelpers);

  testGroup$s("Trix.Document", function() {
    var createDocumentWithAttachment;
    createDocumentWithAttachment = function(attachment) {
      var text;
      text = Trix$2.Text.textForAttachmentWithAttributes(attachment);
      return new Trix$2.Document([new Trix$2.Block(text)]);
    };
    test$s("documents with different attachments are not equal", function() {
      var a, b;
      a = createDocumentWithAttachment(new Trix$2.Attachment({
        url: "a"
      }));
      b = createDocumentWithAttachment(new Trix$2.Attachment({
        url: "b"
      }));
      return assert$r.notOk(a.isEqualTo(b));
    });
    test$s("getStringAtRange does not leak trailing block breaks", function() {
      var document;
      document = Trix$2.Document.fromString("Hey");
      assert$r.equal(document.getStringAtRange([0, 0]), "");
      assert$r.equal(document.getStringAtRange([0, 1]), "H");
      assert$r.equal(document.getStringAtRange([0, 2]), "He");
      assert$r.equal(document.getStringAtRange([0, 3]), "Hey");
      return assert$r.equal(document.getStringAtRange([0, 4]), "Hey\n");
    });
    test$s("findRangesForTextAttribute", function() {
      var document;
      document = Trix$2.Document.fromHTML(`<div>Hello <strong>world, <em>this</em> is</strong> a <strong>test</strong>.<br></div>`);
      assert$r.deepEqual(document.findRangesForTextAttribute("bold"), [[6, 20], [23, 27]]);
      assert$r.deepEqual(document.findRangesForTextAttribute("italic"), [[13, 17]]);
      return assert$r.deepEqual(document.findRangesForTextAttribute("href"), []);
    });
    return test$s("findRangesForTextAttribute withValue", function() {
      var document;
      document = Trix$2.Document.fromHTML(`<div>Hello <a href="http://google.com/">world, <em>this</em> is</a> a <a href="http://basecamp.com/">test</a>.<br></div>`);
      assert$r.deepEqual(document.findRangesForTextAttribute("href"), [[6, 20], [23, 27]]);
      assert$r.deepEqual(document.findRangesForTextAttribute("href", {
        withValue: "http://google.com/"
      }), [[6, 20]]);
      assert$r.deepEqual(document.findRangesForTextAttribute("href", {
        withValue: "http://basecamp.com/"
      }), [[23, 27]]);
      return assert$r.deepEqual(document.findRangesForTextAttribute("href", {
        withValue: "http://amazon.com/"
      }), []);
    });
  });

  var assert$q, test$r, testGroup$r;

  ({assert: assert$q, test: test$r, testGroup: testGroup$r} = Trix$2.TestHelpers);

  testGroup$r("Trix.DocumentView", function() {
    return eachFixture(function(name, details) {
      return test$r(name, function() {
        return assert$q.documentHTMLEqual(details.document, details.html);
      });
    });
  });

  var after$6, assert$p, createCursorTarget, cursorTargetLeft, cursorTargetRight, getHTML, getOrigin, test$q, testGroup$q, withTextAttributeConfig;

  ({after: after$6, assert: assert$p, createCursorTarget, getHTML, test: test$q, testGroup: testGroup$q} = Trix$2.TestHelpers);

  cursorTargetLeft = createCursorTarget("left").outerHTML;

  cursorTargetRight = createCursorTarget("right").outerHTML;

  testGroup$q("Trix.HTMLParser", function() {
    eachFixture(function(name, {html, serializedHTML, document}) {
      return test$q(name, function() {
        var parsedDocument;
        parsedDocument = Trix$2.HTMLParser.parse(html).getDocument();
        return assert$p.documentHTMLEqual(parsedDocument.copyUsingObjectsFromDocument(document), html);
      });
    });
    eachFixture(function(name, {html, serializedHTML, document}) {
      if (serializedHTML != null) {
        return test$q(`${name} (serialized)`, function() {
          var parsedDocument;
          parsedDocument = Trix$2.HTMLParser.parse(serializedHTML).getDocument();
          return assert$p.documentHTMLEqual(parsedDocument.copyUsingObjectsFromDocument(document), html);
        });
      }
    });
    testGroup$q("nested line breaks", function() {
      var cases, expectedHTML, html, results;
      cases = {
        "<div>a<div>b</div>c</div>": "<div><!--block-->a<br>b<br>c</div>",
        "<div>a<div><div><div>b</div></div></div>c</div>": "<div><!--block-->a<br>b<br>c</div>",
        "<blockquote>a<div>b</div>c</blockquote>": "<blockquote><!--block-->a<br>b<br>c</blockquote>"
      };
  // TODO:
  // "<div><div>a</div><div>b</div>c</div>": "<div><!--block-->a<br>b<br>c</div>"
  // "<blockquote><div>a</div><div>b</div><div>c</div></blockquote>": "<blockquote><!--block-->a<br>b<br>c</blockquote>"
  // "<blockquote><div>a<br></div><div><br></div><div>b<br></div></blockquote>": "<blockquote><!--block-->a<br><br>b</blockquote>"
      results = [];
      for (html in cases) {
        expectedHTML = cases[html];
        results.push((function(html, expectedHTML) {
          return test$q(html, function() {
            return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
          });
        })(html, expectedHTML));
      }
      return results;
    });
    test$q("parses absolute image URLs", function() {
      var finalHTML, html, pattern, src;
      src = `${getOrigin()}/test_helpers/fixtures/logo.png`;
      pattern = RegExp(`src="${src}"`);
      html = `<img src="${src}">`;
      finalHTML = getHTML(Trix$2.HTMLParser.parse(html).getDocument());
      return assert$p.ok(pattern.test(finalHTML), `${pattern} not found in ${JSON.stringify(finalHTML)}`);
    });
    test$q("parses relative image URLs", function() {
      var finalHTML, html, pattern, src;
      src = "/test_helpers/fixtures/logo.png";
      pattern = RegExp(`src="${src}"`);
      html = `<img src="${src}">`;
      finalHTML = getHTML(Trix$2.HTMLParser.parse(html).getDocument());
      return assert$p.ok(pattern.test(finalHTML), `${pattern} not found in ${JSON.stringify(finalHTML)}`);
    });
    test$q("parses unfamiliar html", function() {
      var expectedHTML, html;
      html = `<meta charset="UTF-8"><span style="font-style: italic">abc</span><span>d</span><section style="margin:0"><blink>123</blink><a href="http://example.com">45<b>6</b></a>x<br />y</section><p style="margin:0">9</p>`;
      expectedHTML = `<div><!--block--><em>abc</em>d</div><div><!--block-->123<a href="http://example.com">45<strong>6</strong></a>x<br>y</div><div><!--block-->9</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores leading whitespace before <meta> tag", function() {
      var expectedHTML, html;
      html = ` \n <meta charset="UTF-8"><pre>abc</pre>`;
      expectedHTML = `<pre><!--block-->abc</pre>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores content after </html>", function() {
      var expectedHTML, html;
      html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<meta name=ProgId content=Word.Document>
</head>

<body lang=EN-US link=blue vlink="#954F72" style='tab-interval:.5in'>
<!--StartFragment--><span lang=EN style='font-size:12.0pt;font-family:
"Arial",sans-serif;mso-fareast-font-family:"Times New Roman";mso-ansi-language:
EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA'>abc</span><!--EndFragment-->
</body>

</html>
TAxelFCg��K��`;
      expectedHTML = `<div><!--block-->abc</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses incorrectly nested list html", function() {
      var expectedHTML, html;
      html = `<ul><li>a</li><ul><li>b</li><ol><li>1</li><li>2</li><ol></ul></ul>`;
      expectedHTML = `<ul><li><!--block-->a<ul><li><!--block-->b<ol><li><!--block-->1</li><li><!--block-->2</li></ol></li></ul></li></ul>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores whitespace between block elements", function() {
      var expectedHTML, html;
      html = `<div>a</div> \n <div>b</div>     <article>c</article>  \n\n <section>d</section> `;
      expectedHTML = `<div><!--block-->a</div><div><!--block-->b</div><div><!--block-->c</div><div><!--block-->d</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ingores whitespace between nested block elements", function() {
      var expectedHTML, html;
      html = `<ul> <li>a</li> \n  <li>b</li>  </ul><div>  <div> \n <blockquote>c</blockquote>\n </div>  \n</div>`;
      expectedHTML = `<ul><li><!--block-->a</li><li><!--block-->b</li></ul><blockquote><!--block-->c</blockquote>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores inline whitespace that can't be displayed", function() {
      var expectedHTML, html;
      html = ` a  \n b    <span>c\n</span><span>d  \ne </span> f <span style="white-space: pre">  g\n\n h  </span>`;
      expectedHTML = `<div><!--block-->a b c d e f &nbsp; g<br><br>&nbsp;h &nbsp;</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses significant whitespace in empty inline elements", function() {
      var expectedHTML, html;
      html = `a<span style='mso-spacerun:yes'> </span>b<span style='mso-spacerun:yes'>  </span>c`;
      expectedHTML = `<div><!--block-->a b c</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses block elements with leading breakable whitespace", function() {
      var expectedHTML, html;
      html = `<blockquote> <span>a</span> <blockquote>\n <strong>b</strong> <pre> <span>c</span></pre></blockquote></blockquote>`;
      expectedHTML = `<blockquote><!--block-->a<blockquote><!--block--><strong>b</strong><pre><!--block--> c</pre></blockquote></blockquote>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses block elements with leading non-breaking whitespace", function() {
      var expectedHTML, html;
      html = `<blockquote>&nbsp;<span>a</span></blockquote>`;
      expectedHTML = `<blockquote><!--block-->&nbsp;a</blockquote>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("converts newlines to spaces", function() {
      var expectedHTML, html;
      html = "<div>a\nb \nc \n d \n\ne</div><pre>1\n2</pre>";
      expectedHTML = `<div><!--block-->a b c d e</div><pre><!--block-->1\n2</pre>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses entire HTML document", function() {
      var expectedHTML, html;
      html = `<html><head><style>.bold {font-weight: bold}</style></head><body><span class="bold">abc</span></body></html>`;
      expectedHTML = `<div><!--block--><strong>abc</strong></div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses inline element following block element", function() {
      var expectedHTML, html;
      html = `<blockquote>abc</blockquote><strong>123</strong>`;
      expectedHTML = `<blockquote><!--block-->abc</blockquote><div><!--block--><strong>123</strong></div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses text nodes following block elements", function() {
      var expectedHTML, html;
      html = `<ul><li>a</li></ul>b<blockquote>c</blockquote>d`;
      expectedHTML = `<ul><li><!--block-->a</li></ul><div><!--block-->b</div><blockquote><!--block-->c</blockquote><div><!--block-->d</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses whitespace-only text nodes without a containing block element", function() {
      var expectedHTML, html;
      html = `a <strong>b</strong> <em>c</em>`;
      expectedHTML = `<div><!--block-->a <strong>b</strong> <em>c</em></div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses spaces around cursor targets", function() {
      var expectedHTML, html;
      html = `<div>a ${cursorTargetLeft}<span>b</span>${cursorTargetRight} c</div>`;
      expectedHTML = `<div><!--block-->a b c</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses spanned text elements that don't have a parser function", function() {
      var expectedHTML, html;
      assert$p.notOk(Trix$2.config.textAttributes.strike.parser);
      html = `<del>a <strong>b</strong></del>`;
      expectedHTML = `<div><!--block--><del>a </del><strong><del>b</del></strong></div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("translates tables into plain text", function() {
      var expectedHTML, html;
      html = `<table><tr><td>a</td><td>b</td></tr><tr><td>1</td><td><p>2</p></td></tr><table>`;
      expectedHTML = `<div><!--block-->a | b<br>1 | 2</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("translates block element margins to newlines", function() {
      var document, expectedHTML, html;
      html = `<p style="margin: 0 0 1em 0">a</p><p style="margin: 0">b</p><article style="margin: 1em 0 0 0">c</article>`;
      expectedHTML = `<div><!--block-->a<br><br></div><div><!--block-->b</div><div><!--block--><br>c</div>`;
      document = Trix$2.HTMLParser.parse(html).getDocument();
      return assert$p.documentHTMLEqual(document, expectedHTML);
    });
    test$q("skips translating empty block element margins to newlines", function() {
      var document, expectedHTML, html;
      html = `<p style="margin: 0 0 1em 0">a</p><p style="margin: 0 0 1em 0"><span></span></p><p style="margin: 0">b</p>`;
      expectedHTML = `<div><!--block-->a<br><br></div><div><!--block--><br></div><div><!--block-->b</div>`;
      document = Trix$2.HTMLParser.parse(html).getDocument();
      return assert$p.documentHTMLEqual(document, expectedHTML);
    });
    test$q("ignores text nodes in script elements", function() {
      var expectedHTML, html;
      html = `<div>a<script>alert("b")</script></div>`;
      expectedHTML = `<div><!--block-->a</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores iframe elements", function() {
      var expectedHTML, html;
      html = `<div>a<iframe src="data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk7PC9zY3JpcHQ+">b</iframe></div>`;
      expectedHTML = `<div><!--block-->a</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("sanitizes unsafe html", function(done) {
      window.unsanitized = [];
      Trix$2.HTMLParser.parse(`<img onload="window.unsanitized.push('img.onload');" src="${TEST_IMAGE_URL}">
<img onerror="window.unsanitized.push('img.onerror');" src="data:image/gif;base64,TOTALLYBOGUS">
<script>
  window.unsanitized.push('script tag');
</script>`);
      return after$6(20, function() {
        assert$p.deepEqual(window.unsanitized, []);
        delete window.unsanitized;
        return done();
      });
    });
    test$q("forbids href attributes with javascript: protocol", function() {
      var expectedHTML, html;
      html = `<a href="javascript:alert()">a</a> <a href=" javascript: alert()">b</a> <a href="JavaScript:alert()">c</a>`;
      expectedHTML = `<div><!--block-->a b c</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("ignores attachment elements with malformed JSON", function() {
      var expectedHTML, html;
      html = `<div>a</div><div data-trix-attachment data-trix-attributes></div><div data-trix-attachment="" data-trix-attributes=""></div><div data-trix-attachment="{&quot;x:}" data-trix-attributes="{&quot;x:}"></div><div>b</div>`;
      expectedHTML = `<div><!--block-->a</div><div><!--block--><br></div><div><!--block-->b</div>`;
      return assert$p.documentHTMLEqual(Trix$2.HTMLParser.parse(html).getDocument(), expectedHTML);
    });
    test$q("parses attachment caption from large html string", function(done) {
      var attachmentPiece, html, i, j, k, n;
      html = fixtures["image attachment with edited caption"].html;
      for (i = j = 1; j <= 30; i = ++j) {
        html += fixtures["image attachment"].html;
      }
      for (n = k = 1; k <= 3; n = ++k) {
        attachmentPiece = Trix$2.HTMLParser.parse(html).getDocument().getAttachmentPieces()[0];
        assert$p.equal(attachmentPiece.getCaption(), "Example");
      }
      return done();
    });
    test$q("parses foreground color when configured", function() {
      var config;
      config = {
        foregroundColor: {
          styleProperty: "color"
        }
      };
      return withTextAttributeConfig(config, function() {
        var document, expectedHTML, html;
        html = `<span style="color: rgb(60, 179, 113);">green</span>`;
        expectedHTML = `<div><!--block--><span style="color: rgb(60, 179, 113);">green</span></div>`;
        document = Trix$2.HTMLParser.parse(html).getDocument();
        return assert$p.documentHTMLEqual(document, expectedHTML);
      });
    });
    test$q("parses background color when configured", function() {
      var config;
      config = {
        backgroundColor: {
          styleProperty: "backgroundColor"
        }
      };
      return withTextAttributeConfig(config, function() {
        var document, expectedHTML, html;
        html = `<span style="background-color: yellow;">on yellow</span>`;
        expectedHTML = `<div><!--block--><span style="background-color: yellow;">on yellow</span></div>`;
        document = Trix$2.HTMLParser.parse(html).getDocument();
        return assert$p.documentHTMLEqual(document, expectedHTML);
      });
    });
    test$q("parses configured foreground color on formatted text", function() {
      var config;
      config = {
        foregroundColor: {
          styleProperty: "color"
        }
      };
      return withTextAttributeConfig(config, function() {
        var document, expectedHTML, html;
        html = `<strong style="color: rgb(60, 179, 113);">GREEN</strong>`;
        expectedHTML = `<div><!--block--><strong style="color: rgb(60, 179, 113);">GREEN</strong></div>`;
        document = Trix$2.HTMLParser.parse(html).getDocument();
        return assert$p.documentHTMLEqual(document, expectedHTML);
      });
    });
    return test$q("parses foreground color using configured parser function", function() {
      var config;
      config = {
        foregroundColor: {
          styleProperty: "color",
          parser: function(element) {
            var color;
            ({color} = element.style);
            if (color === "rgb(60, 179, 113)") {
              return color;
            }
          }
        }
      };
      return withTextAttributeConfig(config, function() {
        var document, expectedHTML, html;
        html = `<span style="color: rgb(60, 179, 113);">green</span><span style="color: yellow;">not yellow</span>`;
        expectedHTML = `<div><!--block--><span style="color: rgb(60, 179, 113);">green</span>not yellow</div>`;
        document = Trix$2.HTMLParser.parse(html).getDocument();
        return assert$p.documentHTMLEqual(document, expectedHTML);
      });
    });
  });

  withTextAttributeConfig = function(config = {}, fn) {
    var key, originalConfig, textAttributes, value;
    ({textAttributes} = Trix$2.config);
    originalConfig = {};
    for (key in config) {
      value = config[key];
      originalConfig[key] = textAttributes[key];
      textAttributes[key] = value;
    }
    try {
      return fn();
    } finally {
      for (key in originalConfig) {
        value = originalConfig[key];
        if (value) {
          textAttributes[key] = value;
        } else {
          delete textAttributes[key];
        }
      }
    }
  };

  getOrigin = function() {
    var hostname, port, protocol;
    ({protocol, hostname, port} = window.location);
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  };

  var assert$o, describe, document$1, element$1, findContainer, format, mapper, setDocument, test$p, testGroup$p;

  ({assert: assert$o, test: test$p, testGroup: testGroup$p} = Trix$2.TestHelpers);

  testGroup$p("Trix.LocationMapper", function() {
    test$p("findLocationFromContainerAndOffset", function() {
      var actualLocation, assertion, assertions, container, expectedLocation, i, len, offset, path, results;
      setDocument([
        {
          // <trix-editor>
          // 0 <div>
          //     0 <!--block-->
          //     1 <strong>
          //         0 a
          //         1 <br>
          //       </strong>
          //     2 <br>
          //   </div>
          // 1 <blockquote>
          //     0 <!--block-->
          //     1 b😭cd
          //     2 <span data-trix-cursor-target>
          //         0 (zero-width space)
          //       </span>
          //     3 <a href="data:image/png," data-trix-attachment="" ...>
          //         0 <figure ...>...</figure>
          //       </a>
          //     4 <span data-trix-cursor-target>
          //         0 (zero-width space)
          //       </span>
          //     5 e
          //   </blockquote>
          // </trix-editor>
          "text": [
            {
              "type": "string",
              "attributes": {
                "bold": true
              },
              "string": "a\n"
            },
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": []
        },
        {
          "text": [
            {
              "type": "string",
              "attributes": {},
              "string": "b😭cd"
            },
            {
              "type": "attachment",
              "attributes": {},
              "attachment": {
                "contentType": "image/png",
                "filename": "x.png",
                "filesize": 0,
                "height": 13,
                "href": TEST_IMAGE_URL,
                "identifier": "1",
                "url": TEST_IMAGE_URL,
                "width": 15
              }
            },
            {
              "type": "string",
              "attributes": {},
              "string": "e"
            },
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": ["quote"]
        }
      ]);
      assertions = [
        {
          location: [0,
        0],
          container: [],
          offset: 0
        },
        {
          location: [0,
        0],
          container: [0],
          offset: 0
        },
        {
          location: [0,
        0],
          container: [0],
          offset: 1
        },
        {
          location: [0,
        0],
          container: [0,
        1],
          offset: 0
        },
        {
          location: [0,
        0],
          container: [0,
        1,
        0],
          offset: 0
        },
        {
          location: [0,
        1],
          container: [0,
        1,
        0],
          offset: 1
        },
        {
          location: [0,
        1],
          container: [0,
        1],
          offset: 1
        },
        {
          location: [0,
        2],
          container: [0,
        1],
          offset: 2
        },
        {
          location: [0,
        2],
          container: [0],
          offset: 2
        },
        {
          location: [0,
        3],
          container: [],
          offset: 1
        },
        {
          location: [0,
        3],
          container: [1],
          offset: 0
        },
        {
          location: [1,
        0],
          container: [1],
          offset: 1
        },
        {
          location: [1,
        0],
          container: [1,
        1],
          offset: 0
        },
        {
          location: [1,
        1],
          container: [1,
        1],
          offset: 1
        },
        {
          location: [1,
        2],
          container: [1,
        1],
          offset: 2
        },
        {
          location: [1,
        3],
          container: [1,
        1],
          offset: 3
        },
        {
          location: [1,
        4],
          container: [1,
        1],
          offset: 4
        },
        {
          location: [1,
        5],
          container: [1,
        1],
          offset: 5
        },
        {
          location: [1,
        6],
          container: [1,
        1],
          offset: 6
        },
        {
          location: [1,
        5],
          container: [1],
          offset: 2
        },
        {
          location: [1,
        5],
          container: [1,
        2],
          offset: 0
        },
        {
          location: [1,
        5],
          container: [1,
        2],
          offset: 1
        },
        {
          location: [1,
        5],
          container: [1],
          offset: 3
        },
        {
          location: [1,
        5],
          container: [1,
        3],
          offset: 0
        },
        {
          location: [1,
        5],
          container: [1,
        3],
          offset: 1
        },
        {
          location: [1,
        6],
          container: [1],
          offset: 4
        },
        {
          location: [1,
        6],
          container: [1,
        4],
          offset: 0
        },
        {
          location: [1,
        6],
          container: [1,
        4],
          offset: 1
        },
        {
          location: [1,
        6],
          container: [1],
          offset: 5
        },
        {
          location: [1,
        6],
          container: [1,
        5],
          offset: 0
        },
        {
          location: [1,
        7],
          container: [1,
        5],
          offset: 1
        },
        {
          location: [1,
        7],
          container: [],
          offset: 2
        }
      ];
      results = [];
      for (i = 0, len = assertions.length; i < len; i++) {
        assertion = assertions[i];
        path = assertion.container;
        container = findContainer(path);
        offset = assertion.offset;
        expectedLocation = {
          index: assertion.location[0],
          offset: assertion.location[1]
        };
        actualLocation = mapper.findLocationFromContainerAndOffset(container, offset);
        results.push(assert$o.equal(format(actualLocation), format(expectedLocation), `${describe(container)} at [${path.join(", ")}], offset ${offset} = ${format(expectedLocation)}`));
      }
      return results;
    });
    test$p("findContainerAndOffsetFromLocation: (0/0)", function() {
      var container, location, offset;
      setDocument([
        {
          // <trix-editor>
          // 0 <ul>
          //     0 <li>
          //         0 <!--block-->
          //         1 <br>
          //       </li>
          //   </ul>
          // </trix-editor>
          "text": [
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": ["bulletList",
        "bullet"]
        }
      ]);
      location = {
        index: 0,
        offset: 0
      };
      container = findContainer([0, 0]);
      offset = 1;
      return assert$o.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [container, offset]);
    });
    test$p("findContainerAndOffsetFromLocation after newline in formatted text", function() {
      var container, location, offset;
      setDocument([
        {
          // <trix-editor>
          // 0 <div>
          //     0 <!--block-->
          //     0 <strong>
          //         0 a
          //         1 <br>
          //       </strong>
          //   </div>
          // </trix-editor>
          "text": [
            {
              "type": "string",
              "attributes": {
                "bold": true
              },
              "string": "a\n"
            },
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": []
        }
      ]);
      location = {
        index: 0,
        offset: 2
      };
      container = findContainer([0]);
      offset = 2;
      return assert$o.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [container, offset]);
    });
    return test$p("findContainerAndOffsetFromLocation after nested block", function() {
      var container, location, offset;
      setDocument([
        {
          // <trix-editor>
          //   <blockquote>
          //     <ul>
          //       <li>
          //         <!--block-->
          //         a
          //       </li>
          //     </ul>
          //     <!--block-->
          //     <br>
          //   </blockquote>
          // </trix-editor>
          "text": [
            {
              "type": "string",
              "attributes": {},
              "string": "a"
            },
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": ["quote",
        "bulletList",
        "bullet"]
        },
        {
          "text": [
            {
              "type": "string",
              "attributes": {
                "blockBreak": true
              },
              "string": "\n"
            }
          ],
          "attributes": ["quote"]
        }
      ]);
      location = {
        index: 1,
        offset: 0
      };
      container = findContainer([0]);
      offset = 2;
      return assert$o.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [container, offset]);
    });
  });

  // ---
  document$1 = null;

  element$1 = null;

  mapper = null;

  setDocument = function(json) {
    document$1 = Trix$2.Document.fromJSON(json);
    element$1 = Trix$2.DocumentView.render(document$1);
    return mapper = new Trix$2.LocationMapper(element$1);
  };

  findContainer = function(path) {
    var el, i, index, len;
    el = element$1;
    for (i = 0, len = path.length; i < len; i++) {
      index = path[i];
      el = el.childNodes[index];
    }
    return el;
  };

  format = function({index, offset}) {
    return `${index}/${offset}`;
  };

  describe = function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return `text node ${JSON.stringify(node.textContent)}`;
    } else {
      return `container <${node.tagName.toLowerCase()}>`;
    }
  };

  var assert$n, defer$c, element, install, observer, observerTest, summaries, test$o, testGroup$o, uninstall;

  ({assert: assert$n, defer: defer$c, test: test$o, testGroup: testGroup$o} = Trix$2.TestHelpers);

  observer = null;

  element = null;

  summaries = [];

  install = function(html) {
    element = document.createElement("div");
    if (html) {
      element.innerHTML = html;
    }
    observer = new Trix$2.MutationObserver(element);
    return observer.delegate = {
      elementDidMutate: function(summary) {
        return summaries.push(summary);
      }
    };
  };

  uninstall = function() {
    if (observer != null) {
      observer.stop();
    }
    observer = null;
    element = null;
    return summaries = [];
  };

  observerTest = function(name, options = {}, callback) {
    return test$o(name, function(done) {
      install(options.html);
      return callback(function() {
        uninstall();
        return done();
      });
    });
  };

  testGroup$o("Trix.MutationObserver", function() {
    observerTest("add character", {
      html: "a"
    }, function(done) {
      element.firstChild.data += "b";
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textAdded: "b"
        });
        return done();
      });
    });
    observerTest("remove character", {
      html: "ab"
    }, function(done) {
      element.firstChild.data = "a";
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textDeleted: "b"
        });
        return done();
      });
    });
    observerTest("replace character", {
      html: "ab"
    }, function(done) {
      element.firstChild.data = "ac";
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textAdded: "c",
          textDeleted: "b"
        });
        return done();
      });
    });
    observerTest("add <br>", {
      html: "a"
    }, function(done) {
      element.appendChild(document.createElement("br"));
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textAdded: "\n"
        });
        return done();
      });
    });
    observerTest("remove <br>", {
      html: "a<br>"
    }, function(done) {
      element.removeChild(element.lastChild);
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textDeleted: "\n"
        });
        return done();
      });
    });
    observerTest("remove block comment", {
      html: "<div><!--block-->a</div>"
    }, function(done) {
      element.firstChild.removeChild(element.firstChild.firstChild);
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textDeleted: "\n"
        });
        return done();
      });
    });
    observerTest("remove formatted element", {
      html: "a<strong>b</strong>"
    }, function(done) {
      element.removeChild(element.lastChild);
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textDeleted: "b"
        });
        return done();
      });
    });
    return observerTest("remove nested formatted elements", {
      html: "a<strong>b<em>c</em></strong>"
    }, function(done) {
      element.removeChild(element.lastChild);
      return defer$c(function() {
        assert$n.equal(summaries.length, 1);
        assert$n.deepEqual(summaries[0], {
          textDeleted: "bc"
        });
        return done();
      });
    });
  });

  var assert$m, test$n, testGroup$n;

  ({assert: assert$m, test: test$n, testGroup: testGroup$n} = Trix$2.TestHelpers);

  testGroup$n("Trix.serializeToContentType", function() {
    return eachFixture(function(name, details) {
      if (details.serializedHTML) {
        return test$n(name, function() {
          return assert$m.equal(Trix$2.serializeToContentType(details.document, "text/html"), details.serializedHTML);
        });
      }
    });
  });

  var assert$l, test$m, testGroup$m;

  ({assert: assert$l, test: test$m, testGroup: testGroup$m} = Trix$2.TestHelpers);

  testGroup$m("Trix.summarizeStringChange", function() {
    var assertions, details, name, results;
    assertions = {
      "no change": {
        oldString: "abc",
        newString: "abc",
        change: {
          added: "",
          removed: ""
        }
      },
      "adding a character": {
        oldString: "",
        newString: "a",
        change: {
          added: "a",
          removed: ""
        }
      },
      "appending a character": {
        oldString: "ab",
        newString: "abc",
        change: {
          added: "c",
          removed: ""
        }
      },
      "appending a multibyte character": {
        oldString: "a💩",
        newString: "a💩💩",
        change: {
          added: "💩",
          removed: ""
        }
      },
      "prepending a character": {
        oldString: "bc",
        newString: "abc",
        change: {
          added: "a",
          removed: ""
        }
      },
      "inserting a character": {
        oldString: "ac",
        newString: "abc",
        change: {
          added: "b",
          removed: ""
        }
      },
      "inserting a string": {
        oldString: "ac",
        newString: "aZZZc",
        change: {
          added: "ZZZ",
          removed: ""
        }
      },
      "replacing a character": {
        oldString: "abc",
        newString: "aZc",
        change: {
          added: "Z",
          removed: "b"
        }
      },
      "replacing a character with a string": {
        oldString: "abc",
        newString: "aXYc",
        change: {
          added: "XY",
          removed: "b"
        }
      },
      "replacing a string with a character": {
        oldString: "abcde",
        newString: "aXe",
        change: {
          added: "X",
          removed: "bcd"
        }
      },
      "replacing a string with a string": {
        oldString: "abcde",
        newString: "aBCDe",
        change: {
          added: "BCD",
          removed: "bcd"
        }
      },
      "removing a character": {
        oldString: "abc",
        newString: "ac",
        change: {
          added: "",
          removed: "b"
        }
      }
    };
    results = [];
    for (name in assertions) {
      details = assertions[name];
      results.push((function({oldString, newString, change}) {
        return test$m(name, function() {
          return assert$l.deepEqual(Trix$2.summarizeStringChange(oldString, newString), change);
        });
      })(details));
    }
    return results;
  });

  var assert$k, test$l, testGroup$l;

  ({assert: assert$k, test: test$l, testGroup: testGroup$l} = Trix$2.TestHelpers);

  testGroup$l("Trix.Text", function() {
    return testGroup$l("#removeTextAtRange", function() {
      test$l("removes text with range in single piece", function() {
        var pieces, text;
        text = new Trix$2.Text([new Trix$2.StringPiece("abc")]);
        pieces = text.removeTextAtRange([0, 1]).getPieces();
        assert$k.equal(pieces.length, 1);
        assert$k.equal(pieces[0].toString(), "bc");
        return assert$k.deepEqual(pieces[0].getAttributes(), {});
      });
      return test$l("removes text with range spanning pieces", function() {
        var pieces, text;
        text = new Trix$2.Text([
          new Trix$2.StringPiece("abc"),
          new Trix$2.StringPiece("123",
          {
            bold: true
          })
        ]);
        pieces = text.removeTextAtRange([2, 4]).getPieces();
        assert$k.equal(pieces.length, 2);
        assert$k.equal(pieces[0].toString(), "ab");
        assert$k.deepEqual(pieces[0].getAttributes(), {});
        assert$k.equal(pieces[1].toString(), "23");
        return assert$k.deepEqual(pieces[1].getAttributes(), {
          bold: true
        });
      });
    });
  });

  var assert$j, test$k, testGroup$k, triggerEvent$9;

  ({assert: assert$j, test: test$k, testGroup: testGroup$k, triggerEvent: triggerEvent$9} = Trix$2.TestHelpers);

  testGroup$k("Accessibility attributes", {
    template: "editor_default_aria_label"
  }, function() {
    test$k("sets the role to textbox", function() {
      var editor;
      editor = document.getElementById("editor-without-labels");
      return assert$j.equal(editor.getAttribute("role"), "textbox");
    });
    test$k("does not set aria-label when the element has no <label> elements", function() {
      var editor;
      editor = document.getElementById("editor-without-labels");
      return assert$j.equal(editor.hasAttribute("aria-label"), false);
    });
    test$k("does not override aria-label when the element declares it", function() {
      var editor;
      editor = document.getElementById("editor-with-aria-label");
      return assert$j.equal(editor.getAttribute("aria-label"), "ARIA Label text");
    });
    test$k("does not set aria-label when the element declares aria-labelledby", function() {
      var editor;
      editor = document.getElementById("editor-with-aria-labelledby");
      assert$j.equal(editor.hasAttribute("aria-label"), false);
      return assert$j.equal(editor.getAttribute("aria-labelledby"), "aria-labelledby-id");
    });
    test$k("assigns aria-label to the text of the element's <label> elements", function() {
      var editor;
      editor = document.getElementById("editor-with-labels");
      return assert$j.equal(editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3");
    });
    return test$k("updates the aria-label on focus", function() {
      var editor, label;
      editor = document.getElementById("editor-with-modified-label");
      label = document.getElementById("modified-label");
      label.innerHTML = "<span>New Value</span>";
      triggerEvent$9(editor, "focus");
      return assert$j.equal(editor.getAttribute("aria-label"), "New Value");
    });
  });

  var assert$i, getCaptionElement, insertImageAttachment$1, test$j, testGroup$j, withPreviewCaptionConfig;

  ({assert: assert$i, insertImageAttachment: insertImageAttachment$1, test: test$j, testGroup: testGroup$j} = Trix$2.TestHelpers);

  testGroup$j("Attachment captions", {
    template: "editor_empty"
  }, function() {
    test$j("default caption includes file name and size", function() {
      var element;
      insertImageAttachment$1();
      element = getCaptionElement();
      assert$i.notOk(element.hasAttribute("data-trix-placeholder"));
      return assert$i.equal(element.textContent, "image.gif 35 Bytes");
    });
    test$j("caption excludes file name when configured", function() {
      return withPreviewCaptionConfig({
        name: false,
        size: true
      }, function() {
        var element;
        insertImageAttachment$1();
        element = getCaptionElement();
        assert$i.notOk(element.hasAttribute("data-trix-placeholder"));
        return assert$i.equal(element.textContent, "35 Bytes");
      });
    });
    test$j("caption excludes file size when configured", function() {
      return withPreviewCaptionConfig({
        name: true,
        size: false
      }, function() {
        var element;
        insertImageAttachment$1();
        element = getCaptionElement();
        assert$i.notOk(element.hasAttribute("data-trix-placeholder"));
        return assert$i.equal(element.textContent, "image.gif");
      });
    });
    return test$j("caption is empty when configured", function() {
      return withPreviewCaptionConfig({
        name: false,
        size: false
      }, function() {
        var element;
        insertImageAttachment$1();
        element = getCaptionElement();
        assert$i.ok(element.hasAttribute("data-trix-placeholder"));
        assert$i.equal(element.getAttribute("data-trix-placeholder"), Trix$2.config.lang.captionPlaceholder);
        return assert$i.equal(element.textContent, "");
      });
    });
  });

  withPreviewCaptionConfig = function(config = {}, fn) {
    var caption;
    ({caption} = Trix$2.config.attachments.preview);
    Trix$2.config.attachments.preview.caption = config;
    try {
      return fn();
    } finally {
      Trix$2.config.attachments.preview.caption = caption;
    }
  };

  getCaptionElement = function() {
    return getEditorElement().querySelector("figcaption");
  };

  var ORC, assert$h, clickToolbarButton$c, createImageAttachment, createImageAttachments, defer$b, insertAttachments, moveCursor$b, pressKey$8, test$i, testGroup$i, typeCharacters$e;

  ({assert: assert$h, clickToolbarButton: clickToolbarButton$c, createImageAttachment, defer: defer$b, insertAttachments, moveCursor: moveCursor$b, pressKey: pressKey$8, test: test$i, testGroup: testGroup$i, typeCharacters: typeCharacters$e} = Trix$2.TestHelpers);

  ORC = Trix$2.OBJECT_REPLACEMENT_CHARACTER;

  testGroup$i("Attachment galleries", {
    template: "editor_empty"
  }, function() {
    test$i("inserting more than one image attachment creates a gallery block", function(expectDocument) {
      insertAttachments(createImageAttachments(2));
      assert$h.blockAttributes([0, 2], ["attachmentGallery"]);
      return expectDocument(`${ORC}${ORC}\n`);
    });
    test$i("gallery formatting is removed from blocks containing less than two image attachments", function(expectDocument) {
      insertAttachments(createImageAttachments(2));
      assert$h.blockAttributes([0, 2], ["attachmentGallery"]);
      getEditor().setSelectedRange([1, 2]);
      return pressKey$8("backspace", function() {
        return requestAnimationFrame(function() {
          assert$h.blockAttributes([0, 2], []);
          return expectDocument(`${ORC}\n`);
        });
      });
    });
    test$i("typing in an attachment gallery block splits it", function(expectDocument) {
      insertAttachments(createImageAttachments(4));
      getEditor().setSelectedRange(2);
      return typeCharacters$e("a", function() {
        return requestAnimationFrame(function() {
          assert$h.blockAttributes([0, 2], ["attachmentGallery"]);
          assert$h.blockAttributes([3, 4], []);
          assert$h.blockAttributes([5, 7], ["attachmentGallery"]);
          return expectDocument(`${ORC}${ORC}\na\n${ORC}${ORC}\n`);
        });
      });
    });
    return test$i("inserting a gallery in a formatted block", function(expectDocument) {
      return clickToolbarButton$c({
        attribute: "quote"
      }, function() {
        return typeCharacters$e("abc", function() {
          insertAttachments(createImageAttachments(2));
          return requestAnimationFrame(function() {
            assert$h.blockAttributes([0, 3], ["quote"]);
            assert$h.blockAttributes([4, 6], ["attachmentGallery"]);
            return expectDocument(`abc\n${ORC}${ORC}\n`);
          });
        });
      });
    });
  });

  createImageAttachments = function(num = 1) {
    var attachments;
    attachments = [];
    while (attachments.length < num) {
      attachments.push(createImageAttachment());
    }
    return attachments;
  };

  var after$5, assert$g, clickElement$2, clickToolbarButton$b, createFile$4, defer$a, dragToCoordinates$1, findElement, getFigure, moveCursor$a, pressKey$7, test$h, testGroup$h, triggerEvent$8, typeCharacters$d;

  ({after: after$5, assert: assert$g, clickElement: clickElement$2, clickToolbarButton: clickToolbarButton$b, createFile: createFile$4, defer: defer$a, dragToCoordinates: dragToCoordinates$1, moveCursor: moveCursor$a, pressKey: pressKey$7, test: test$h, testGroup: testGroup$h, triggerEvent: triggerEvent$8, typeCharacters: typeCharacters$d} = Trix$2.TestHelpers);

  testGroup$h("Attachments", {
    template: "editor_with_image"
  }, function() {
    test$h("moving an image by drag and drop", function(expectDocument) {
      return typeCharacters$d("!", function() {
        return moveCursor$a({
          direction: "right",
          times: 1
        }, function(coordinates) {
          var img;
          img = document.activeElement.querySelector("img");
          triggerEvent$8(img, "mousedown");
          return defer$a(function() {
            return dragToCoordinates$1(coordinates, function() {
              return expectDocument(`!a${Trix$2.OBJECT_REPLACEMENT_CHARACTER}b\n`);
            });
          });
        });
      });
    });
    test$h("removing an image", function(expectDocument) {
      return after$5(20, function() {
        return clickElement$2(getFigure(), function() {
          var closeButton;
          closeButton = getFigure().querySelector("[data-trix-action=remove]");
          return clickElement$2(closeButton, function() {
            return expectDocument("ab\n");
          });
        });
      });
    });
    test$h("editing an image caption", function(expectDocument) {
      return after$5(20, function() {
        return clickElement$2(findElement("figure"), function() {
          return clickElement$2(findElement("figcaption"), function() {
            return defer$a(function() {
              var textarea;
              textarea = findElement("textarea");
              assert$g.ok(textarea);
              textarea.focus();
              textarea.value = "my";
              triggerEvent$8(textarea, "input");
              return defer$a(function() {
                textarea.value = "";
                return defer$a(function() {
                  textarea.value = "my caption";
                  triggerEvent$8(textarea, "input");
                  return pressKey$7("return", function() {
                    assert$g.notOk(findElement("textarea"));
                    assert$g.textAttributes([2, 3], {
                      caption: "my caption"
                    });
                    assert$g.locationRange({
                      index: 0,
                      offset: 3
                    });
                    return expectDocument(`ab${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
                  });
                });
              });
            });
          });
        });
      });
    });
    test$h("editing an attachment caption with no filename", function(done) {
      return after$5(20, function() {
        var captionElement;
        captionElement = findElement("figcaption");
        assert$g.ok(captionElement.clientHeight > 0);
        assert$g.equal(captionElement.getAttribute("data-trix-placeholder"), Trix$2.config.lang.captionPlaceholder);
        return clickElement$2(findElement("figure"), function() {
          captionElement = findElement("figcaption");
          assert$g.ok(captionElement.clientHeight > 0);
          assert$g.equal(captionElement.getAttribute("data-trix-placeholder"), Trix$2.config.lang.captionPlaceholder);
          return done();
        });
      });
    });
    test$h("updating an attachment's href attribute while editing its caption", function(expectDocument) {
      var attachment;
      attachment = getEditorController().attachmentManager.getAttachments()[0];
      return after$5(20, function() {
        return clickElement$2(findElement("figure"), function() {
          return clickElement$2(findElement("figcaption"), function() {
            return defer$a(function() {
              var textarea;
              textarea = findElement("textarea");
              assert$g.ok(textarea);
              textarea.focus();
              textarea.value = "my caption";
              triggerEvent$8(textarea, "input");
              attachment.setAttributes({
                href: "https://example.com"
              });
              return defer$a(function() {
                textarea = findElement("textarea");
                assert$g.ok(document.activeElement === textarea);
                assert$g.equal(textarea.value, "my caption");
                return pressKey$7("return", function() {
                  assert$g.notOk(findElement("textarea"));
                  assert$g.textAttributes([2, 3], {
                    caption: "my caption"
                  });
                  assert$g.locationRange({
                    index: 0,
                    offset: 3
                  });
                  return expectDocument(`ab${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
                });
              });
            });
          });
        });
      });
    });
    return testGroup$h("File insertion", {
      template: "editor_empty"
    }, function() {
      test$h("inserting a file in a formatted block", function(expectDocument) {
        return clickToolbarButton$b({
          attribute: "bullet"
        }, function() {
          return clickToolbarButton$b({
            attribute: "bold"
          }, function() {
            getComposition().insertFile(createFile$4());
            assert$g.blockAttributes([0, 1], ["bulletList", "bullet"]);
            assert$g.textAttributes([0, 1], {});
            return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
          });
        });
      });
      return test$h("inserting a files in a formatted block", function(expectDocument) {
        return clickToolbarButton$b({
          attribute: "quote"
        }, function() {
          return clickToolbarButton$b({
            attribute: "italic"
          }, function() {
            getComposition().insertFiles([createFile$4(), createFile$4()]);
            assert$g.blockAttributes([0, 2], ["quote"]);
            assert$g.textAttributes([0, 1], {});
            assert$g.textAttributes([1, 2], {});
            return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
          });
        });
      });
    });
  });

  getFigure = function() {
    return findElement("figure");
  };

  findElement = function(selector) {
    return getEditorElement().querySelector(selector);
  };

  var assert$f, defer$9, dragToCoordinates, expandSelection$5, insertNode$3, moveCursor$9, pressKey$6, selectAll$2, test$g, testGroup$g, testIf$8, triggerEvent$7, typeCharacters$c;

  ({assert: assert$f, defer: defer$9, dragToCoordinates, expandSelection: expandSelection$5, insertNode: insertNode$3, moveCursor: moveCursor$9, pressKey: pressKey$6, selectAll: selectAll$2, test: test$g, testIf: testIf$8, testGroup: testGroup$g, triggerEvent: triggerEvent$7, typeCharacters: typeCharacters$c} = Trix$2.TestHelpers);

  testGroup$g("Basic input", {
    template: "editor_empty"
  }, function() {
    test$g("typing", function(expectDocument) {
      return typeCharacters$c("abc", function() {
        return expectDocument("abc\n");
      });
    });
    test$g("backspacing", function(expectDocument) {
      return typeCharacters$c("abc\b", function() {
        assert$f.locationRange({
          index: 0,
          offset: 2
        });
        return expectDocument("ab\n");
      });
    });
    test$g("pressing delete", function(expectDocument) {
      return typeCharacters$c("ab", function() {
        return moveCursor$9("left", function() {
          return pressKey$6("delete", function() {
            return expectDocument("a\n");
          });
        });
      });
    });
    test$g("pressing return", function(expectDocument) {
      return typeCharacters$c("ab", function() {
        return pressKey$6("return", function() {
          return typeCharacters$c("c", function() {
            return expectDocument("ab\nc\n");
          });
        });
      });
    });
    test$g("pressing escape in Safari", function(expectDocument) {
      return typeCharacters$c("a", function() {
        if (triggerEvent$7(document.activeElement, "keydown", {
          charCode: 0,
          keyCode: 27,
          which: 27,
          key: "Escape",
          code: "Escape"
        })) {
          triggerEvent$7(document.activeElement, "keypress", {
            charCode: 27,
            keyCode: 27,
            which: 27,
            key: "Escape",
            code: "Escape"
          });
        }
        return defer$9(function() {
          return expectDocument("a\n");
        });
      });
    });
    test$g("pressing escape in Firefox", function(expectDocument) {
      return typeCharacters$c("a", function() {
        if (triggerEvent$7(document.activeElement, "keydown", {
          charCode: 0,
          keyCode: 27,
          which: 27,
          key: "Escape",
          code: "Escape"
        })) {
          triggerEvent$7(document.activeElement, "keypress", {
            charCode: 0,
            keyCode: 27,
            which: 0,
            key: "Escape",
            code: "Escape"
          });
        }
        return defer$9(function() {
          return expectDocument("a\n");
        });
      });
    });
    test$g("pressing escape in Chrome", function(expectDocument) {
      return typeCharacters$c("a", function() {
        triggerEvent$7(document.activeElement, "keydown", {
          charCode: 0,
          keyCode: 27,
          which: 27,
          key: "Escape",
          code: "Escape"
        });
        return defer$9(function() {
          return expectDocument("a\n");
        });
      });
    });
    test$g("cursor left", function(expectDocument) {
      return typeCharacters$c("ac", function() {
        return moveCursor$9("left", function() {
          return typeCharacters$c("b", function() {
            return expectDocument("abc\n");
          });
        });
      });
    });
    test$g("replace entire document", function(expectDocument) {
      return typeCharacters$c("abc", function() {
        return selectAll$2(function() {
          return typeCharacters$c("d", function() {
            return expectDocument("d\n");
          });
        });
      });
    });
    test$g("remove entire document", function(expectDocument) {
      return typeCharacters$c("abc", function() {
        return selectAll$2(function() {
          return typeCharacters$c("\b", function() {
            return expectDocument("\n");
          });
        });
      });
    });
    test$g("drag text", function(expectDocument) {
      return typeCharacters$c("abc", function() {
        return moveCursor$9({
          direction: "left",
          times: 2
        }, function(coordinates) {
          return moveCursor$9("right", function() {
            return expandSelection$5("right", function() {
              return dragToCoordinates(coordinates, function() {
                return expectDocument("acb\n");
              });
            });
          });
        });
      });
    });
    testIf$8(Trix$2.config.input.getLevel() === 0, "inserting newline after cursor (control + o)", function(expectDocument) {
      return typeCharacters$c("ab", function() {
        return moveCursor$9("left", function() {
          triggerEvent$7(document.activeElement, "keydown", {
            charCode: 0,
            keyCode: 79,
            which: 79,
            ctrlKey: true
          });
          return defer$9(function() {
            assert$f.locationRange({
              index: 0,
              offset: 1
            });
            return expectDocument("a\nb\n");
          });
        });
      });
    });
    return testIf$8(Trix$2.config.input.getLevel() === 0, "inserting ó with control + alt + o (AltGr)", function(expectDocument) {
      return typeCharacters$c("ab", function() {
        return moveCursor$9("left", function() {
          if (triggerEvent$7(document.activeElement, "keydown", {
            charCode: 0,
            keyCode: 79,
            which: 79,
            altKey: true,
            ctrlKey: true
          })) {
            triggerEvent$7(document.activeElement, "keypress", {
              charCode: 243,
              keyCode: 243,
              which: 243,
              altKey: true,
              ctrlKey: true
            });
            insertNode$3(document.createTextNode("ó"));
          }
          return defer$9(function() {
            assert$f.locationRange({
              index: 0,
              offset: 2
            });
            return expectDocument("aób\n");
          });
        });
      });
    });
  });

  var assert$e, clickToolbarButton$a, defer$8, expandSelection$4, isToolbarButtonActive$3, isToolbarButtonDisabled$1, moveCursor$8, pressKey$5, replaceDocument, selectAll$1, test$f, testGroup$f, typeCharacters$b;

  ({assert: assert$e, clickToolbarButton: clickToolbarButton$a, defer: defer$8, expandSelection: expandSelection$4, isToolbarButtonActive: isToolbarButtonActive$3, isToolbarButtonDisabled: isToolbarButtonDisabled$1, moveCursor: moveCursor$8, pressKey: pressKey$5, replaceDocument, selectAll: selectAll$1, test: test$f, testGroup: testGroup$f, typeCharacters: typeCharacters$b} = Trix$2.TestHelpers);

  testGroup$f("Block formatting", {
    template: "editor_empty"
  }, function() {
    test$f("applying block attributes", function(done) {
      return typeCharacters$b("abc", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          assert$e.blockAttributes([0, 4], ["quote"]);
          assert$e.ok(isToolbarButtonActive$3({
            attribute: "quote"
          }));
          return clickToolbarButton$a({
            attribute: "code"
          }, function() {
            assert$e.blockAttributes([0, 4], ["quote", "code"]);
            assert$e.ok(isToolbarButtonActive$3({
              attribute: "code"
            }));
            return clickToolbarButton$a({
              attribute: "code"
            }, function() {
              assert$e.blockAttributes([0, 4], ["quote"]);
              assert$e.notOk(isToolbarButtonActive$3({
                attribute: "code"
              }));
              assert$e.ok(isToolbarButtonActive$3({
                attribute: "quote"
              }));
              return done();
            });
          });
        });
      });
    });
    test$f("applying block attributes to text after newline", function(done) {
      return typeCharacters$b("a\nbc", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          assert$e.blockAttributes([0, 2], []);
          assert$e.blockAttributes([2, 4], ["quote"]);
          return done();
        });
      });
    });
    test$f("applying block attributes to text between newlines", function(done) {
      return typeCharacters$b(`ab
def
ghi
j`, function() {
        return moveCursor$8({
          direction: "left",
          times: 2
        }, function() {
          return expandSelection$4({
            direction: "left",
            times: 5
          }, function() {
            return clickToolbarButton$a({
              attribute: "quote"
            }, function() {
              assert$e.blockAttributes([0, 3], []);
              assert$e.blockAttributes([3, 11], ["quote"]);
              assert$e.blockAttributes([11, 13], []);
              return done();
            });
          });
        });
      });
    });
    test$f("applying bullets to text with newlines", function(done) {
      return typeCharacters$b(`abc
def
ghi
jkl
mno`, function() {
        return moveCursor$8({
          direction: "left",
          times: 2
        }, function() {
          return expandSelection$4({
            direction: "left",
            times: 15
          }, function() {
            return clickToolbarButton$a({
              attribute: "bullet"
            }, function() {
              assert$e.blockAttributes([0, 4], ["bulletList", "bullet"]);
              assert$e.blockAttributes([4, 8], ["bulletList", "bullet"]);
              assert$e.blockAttributes([8, 12], ["bulletList", "bullet"]);
              assert$e.blockAttributes([12, 16], ["bulletList", "bullet"]);
              assert$e.blockAttributes([16, 20], ["bulletList", "bullet"]);
              return done();
            });
          });
        });
      });
    });
    test$f("applying block attributes to adjacent unformatted blocks consolidates them", function(done) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("1"), ["bulletList", "bullet"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("c"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("2"), ["bulletList", "bullet"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("3"), ["bulletList", "bullet"])]);
      replaceDocument(document);
      getEditorController().setLocationRange([
        {
          index: 0,
          offset: 0
        },
        {
          index: 5,
          offset: 1
        }
      ]);
      return defer$8(function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          assert$e.blockAttributes([0, 2], ["bulletList", "bullet", "quote"]);
          assert$e.blockAttributes([2, 8], ["quote"]);
          assert$e.blockAttributes([8, 10], ["bulletList", "bullet", "quote"]);
          assert$e.blockAttributes([10, 12], ["bulletList", "bullet", "quote"]);
          return done();
        });
      });
    });
    test$f("breaking out of the end of a block", function(done) {
      return typeCharacters$b("abc", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return typeCharacters$b("\n\n", function() {
            var block, document;
            document = getDocument();
            assert$e.equal(document.getBlockCount(), 2);
            block = document.getBlockAtIndex(0);
            assert$e.deepEqual(block.getAttributes(), ["quote"]);
            assert$e.equal(block.toString(), "abc\n");
            block = document.getBlockAtIndex(1);
            assert$e.deepEqual(block.getAttributes(), []);
            assert$e.equal(block.toString(), "\n");
            assert$e.locationRange({
              index: 1,
              offset: 0
            });
            return done();
          });
        });
      });
    });
    test$f("breaking out of the middle of a block before character", function(done) {
      // * = cursor

      // ab
      // *c

      return typeCharacters$b("abc", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return moveCursor$8("left", function() {
            return typeCharacters$b("\n\n", function() {
              var block, document;
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 3);
              block = document.getBlockAtIndex(0);
              assert$e.deepEqual(block.getAttributes(), ["quote"]);
              assert$e.equal(block.toString(), "ab\n");
              block = document.getBlockAtIndex(1);
              assert$e.deepEqual(block.getAttributes(), []);
              assert$e.equal(block.toString(), "\n");
              block = document.getBlockAtIndex(2);
              assert$e.deepEqual(block.getAttributes(), ["quote"]);
              assert$e.equal(block.toString(), "c\n");
              assert$e.locationRange({
                index: 2,
                offset: 0
              });
              return done();
            });
          });
        });
      });
    });
    test$f("breaking out of the middle of a block before newline", function(done) {
      // * = cursor

      // ab
      // *
      // c

      return typeCharacters$b("abc", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return moveCursor$8("left", function() {
            return typeCharacters$b("\n", function() {
              return moveCursor$8("left", function() {
                return typeCharacters$b("\n\n", function() {
                  var block, document;
                  document = getDocument();
                  assert$e.equal(document.getBlockCount(), 3);
                  block = document.getBlockAtIndex(0);
                  assert$e.deepEqual(block.getAttributes(), ["quote"]);
                  assert$e.equal(block.toString(), "ab\n");
                  block = document.getBlockAtIndex(1);
                  assert$e.deepEqual(block.getAttributes(), []);
                  assert$e.equal(block.toString(), "\n");
                  block = document.getBlockAtIndex(2);
                  assert$e.deepEqual(block.getAttributes(), ["quote"]);
                  assert$e.equal(block.toString(), "c\n");
                  return done();
                });
              });
            });
          });
        });
      });
    });
    test$f("breaking out of a formatted block with adjacent non-formatted blocks", function(expectDocument) {
      var document;
      // * = cursor

      // a
      // b*
      // c
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), ["quote"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("c"), [])]);
      replaceDocument(document);
      getEditor().setSelectedRange(3);
      return typeCharacters$b("\n\n", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 4);
        assert$e.blockAttributes([0, 1], []);
        assert$e.blockAttributes([2, 3], ["quote"]);
        assert$e.blockAttributes([4, 5], []);
        assert$e.blockAttributes([5, 6], []);
        return expectDocument("a\nb\n\nc\n");
      });
    });
    test$f("breaking out a block after newline at offset 0", function(done) {
      // * = cursor

      // *a

      return typeCharacters$b("a", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return moveCursor$8("left", function() {
            return typeCharacters$b("\n\n", function() {
              var block, document;
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 2);
              block = document.getBlockAtIndex(0);
              assert$e.deepEqual(block.getAttributes(), []);
              assert$e.equal(block.toString(), "\n");
              block = document.getBlockAtIndex(1);
              assert$e.deepEqual(block.getAttributes(), ["quote"]);
              assert$e.equal(block.toString(), "a\n");
              assert$e.locationRange({
                index: 1,
                offset: 0
              });
              return done();
            });
          });
        });
      });
    });
    test$f("deleting the only non-block-break character in a block", function(done) {
      return typeCharacters$b("ab", function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return typeCharacters$b("\b\b", function() {
            assert$e.blockAttributes([0, 1], ["quote"]);
            return done();
          });
        });
      });
    });
    test$f("backspacing a quote", function(done) {
      return clickToolbarButton$a({
        attribute: "quote"
      }, function() {
        assert$e.blockAttributes([0, 1], ["quote"]);
        return pressKey$5("backspace", function() {
          assert$e.blockAttributes([0, 1], []);
          return done();
        });
      });
    });
    test$f("backspacing a nested quote", function(done) {
      return clickToolbarButton$a({
        attribute: "quote"
      }, function() {
        return clickToolbarButton$a({
          action: "increaseNestingLevel"
        }, function() {
          assert$e.blockAttributes([0, 1], ["quote", "quote"]);
          return pressKey$5("backspace", function() {
            assert$e.blockAttributes([0, 1], ["quote"]);
            return pressKey$5("backspace", function() {
              assert$e.blockAttributes([0, 1], []);
              return done();
            });
          });
        });
      });
    });
    test$f("backspacing a list item", function(done) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        assert$e.blockAttributes([0, 1], ["bulletList", "bullet"]);
        return pressKey$5("backspace", function() {
          assert$e.blockAttributes([0, 0], []);
          return done();
        });
      });
    });
    test$f("backspacing a nested list item", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return typeCharacters$b("a\n", function() {
          return clickToolbarButton$a({
            action: "increaseNestingLevel"
          }, function() {
            assert$e.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"]);
            return pressKey$5("backspace", function() {
              assert$e.blockAttributes([2, 3], ["bulletList", "bullet"]);
              return expectDocument("a\n\n");
            });
          });
        });
      });
    });
    test$f("backspacing a list item inside a quote", function(done) {
      return clickToolbarButton$a({
        attribute: "quote"
      }, function() {
        return clickToolbarButton$a({
          attribute: "bullet"
        }, function() {
          assert$e.blockAttributes([0, 1], ["quote", "bulletList", "bullet"]);
          return pressKey$5("backspace", function() {
            assert$e.blockAttributes([0, 1], ["quote"]);
            return pressKey$5("backspace", function() {
              assert$e.blockAttributes([0, 1], []);
              return done();
            });
          });
        });
      });
    });
    test$f("backspacing selected nested list items", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return typeCharacters$b("a\n", function() {
          return clickToolbarButton$a({
            action: "increaseNestingLevel"
          }, function() {
            return typeCharacters$b("b", function() {
              getSelectionManager().setLocationRange([
                {
                  index: 0,
                  offset: 0
                },
                {
                  index: 1,
                  offset: 1
                }
              ]);
              return pressKey$5("backspace", function() {
                assert$e.blockAttributes([0, 1], ["bulletList", "bullet"]);
                return expectDocument("\n");
              });
            });
          });
        });
      });
    });
    test$f("backspace selection spanning formatted blocks", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "quote"
      }, function() {
        return typeCharacters$b("ab\n\n", function() {
          return clickToolbarButton$a({
            attribute: "code"
          }, function() {
            return typeCharacters$b("cd", function() {
              getSelectionManager().setLocationRange([
                {
                  index: 0,
                  offset: 1
                },
                {
                  index: 1,
                  offset: 1
                }
              ]);
              getComposition().deleteInDirection("backward");
              assert$e.blockAttributes([0, 2], ["quote"]);
              return expectDocument("ad\n");
            });
          });
        });
      });
    });
    test$f("backspace selection spanning and entire formatted block and a formatted block", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "quote"
      }, function() {
        return typeCharacters$b("ab\n\n", function() {
          return clickToolbarButton$a({
            attribute: "code"
          }, function() {
            return typeCharacters$b("cd", function() {
              getSelectionManager().setLocationRange([
                {
                  index: 0,
                  offset: 0
                },
                {
                  index: 1,
                  offset: 1
                }
              ]);
              getComposition().deleteInDirection("backward");
              assert$e.blockAttributes([0, 2], ["code"]);
              return expectDocument("d\n");
            });
          });
        });
      });
    });
    test$f("increasing list level", function(done) {
      assert$e.ok(isToolbarButtonDisabled$1({
        action: "increaseNestingLevel"
      }));
      assert$e.ok(isToolbarButtonDisabled$1({
        action: "decreaseNestingLevel"
      }));
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        assert$e.ok(isToolbarButtonDisabled$1({
          action: "increaseNestingLevel"
        }));
        assert$e.notOk(isToolbarButtonDisabled$1({
          action: "decreaseNestingLevel"
        }));
        return typeCharacters$b("a\n", function() {
          assert$e.notOk(isToolbarButtonDisabled$1({
            action: "increaseNestingLevel"
          }));
          assert$e.notOk(isToolbarButtonDisabled$1({
            action: "decreaseNestingLevel"
          }));
          return clickToolbarButton$a({
            action: "increaseNestingLevel"
          }, function() {
            return typeCharacters$b("b", function() {
              assert$e.ok(isToolbarButtonDisabled$1({
                action: "increaseNestingLevel"
              }));
              assert$e.notOk(isToolbarButtonDisabled$1({
                action: "decreaseNestingLevel"
              }));
              assert$e.blockAttributes([0, 2], ["bulletList", "bullet"]);
              assert$e.blockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"]);
              return done();
            });
          });
        });
      });
    });
    test$f("changing list type", function(done) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        assert$e.blockAttributes([0, 1], ["bulletList", "bullet"]);
        return clickToolbarButton$a({
          attribute: "number"
        }, function() {
          assert$e.blockAttributes([0, 1], ["numberList", "number"]);
          return done();
        });
      });
    });
    test$f("adding bullet to heading block", function(done) {
      return clickToolbarButton$a({
        attribute: "heading1"
      }, function() {
        return clickToolbarButton$a({
          attribute: "bullet"
        }, function() {
          assert$e.ok(isToolbarButtonActive$3({
            attribute: "heading1"
          }));
          assert$e.blockAttributes([1, 2], []);
          return done();
        });
      });
    });
    test$f("removing bullet from heading block", function(done) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return clickToolbarButton$a({
          attribute: "heading1"
        }, function() {
          assert$e.ok(isToolbarButtonDisabled$1({
            attribute: "bullet"
          }));
          return done();
        });
      });
    });
    test$f("breaking out of heading in list", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return clickToolbarButton$a({
          attribute: "heading1"
        }, function() {
          assert$e.ok(isToolbarButtonActive$3({
            attribute: "heading1"
          }));
          return typeCharacters$b("abc", function() {
            return typeCharacters$b("\n", function() {
              var document;
              assert$e.ok(isToolbarButtonActive$3({
                attribute: "bullet"
              }));
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 2);
              assert$e.blockAttributes([0, 4], ["bulletList", "bullet", "heading1"]);
              assert$e.blockAttributes([4, 5], ["bulletList", "bullet"]);
              return expectDocument("abc\n\n");
            });
          });
        });
      });
    });
    test$f("breaking out of middle of heading block", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "heading1"
      }, function() {
        return typeCharacters$b("abc", function() {
          assert$e.ok(isToolbarButtonActive$3({
            attribute: "heading1"
          }));
          return moveCursor$8({
            direction: "left",
            times: 1
          }, function() {
            return typeCharacters$b("\n", function() {
              var document;
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 2);
              assert$e.blockAttributes([0, 3], ["heading1"]);
              assert$e.blockAttributes([3, 4], ["heading1"]);
              return expectDocument("ab\nc\n");
            });
          });
        });
      });
    });
    test$f("breaking out of middle of heading block with preceding blocks", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("cd"), ["heading1"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(5);
      assert$e.ok(isToolbarButtonActive$3({
        attribute: "heading1"
      }));
      return typeCharacters$b("\n", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 4);
        assert$e.blockAttributes([0, 1], ["heading1"]);
        assert$e.blockAttributes([2, 3], []);
        assert$e.blockAttributes([4, 5], ["heading1"]);
        assert$e.blockAttributes([6, 7], ["heading1"]);
        return expectDocument("a\nb\nc\nd\n");
      });
    });
    test$f("breaking out of end of heading block with preceding blocks", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("cd"), ["heading1"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(6);
      assert$e.ok(isToolbarButtonActive$3({
        attribute: "heading1"
      }));
      return typeCharacters$b("\n", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 4);
        assert$e.blockAttributes([0, 1], ["heading1"]);
        assert$e.blockAttributes([2, 3], []);
        assert$e.blockAttributes([4, 6], ["heading1"]);
        assert$e.blockAttributes([7, 8], []);
        return expectDocument("a\nb\ncd\n\n");
      });
    });
    test$f("inserting newline before heading", function(done) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("\n"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("abc"), ["heading1"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(0);
      return typeCharacters$b("\n", function() {
        var block;
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 2);
        block = document.getBlockAtIndex(0);
        assert$e.deepEqual(block.getAttributes(), []);
        assert$e.equal(block.toString(), "\n\n\n");
        block = document.getBlockAtIndex(1);
        assert$e.deepEqual(block.getAttributes(), ["heading1"]);
        assert$e.equal(block.toString(), "abc\n");
        return done();
      });
    });
    test$f("inserting multiple newlines before heading", function(done) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("\n"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("abc"), ["heading1"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(0);
      return typeCharacters$b("\n\n", function() {
        var block;
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 2);
        block = document.getBlockAtIndex(0);
        assert$e.deepEqual(block.getAttributes(), []);
        assert$e.equal(block.toString(), "\n\n\n\n");
        block = document.getBlockAtIndex(1);
        assert$e.deepEqual(block.getAttributes(), ["heading1"]);
        assert$e.equal(block.toString(), "abc\n");
        return done();
      });
    });
    test$f("inserting multiple newlines before formatted block", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("\n"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("abc"), ["quote"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(1);
      return typeCharacters$b("\n\n", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 2);
        assert$e.blockAttributes([0, 1], []);
        assert$e.blockAttributes([2, 3], []);
        assert$e.blockAttributes([4, 6], ["quote"]);
        assert$e.locationRange({
          index: 0,
          offset: 3
        });
        return expectDocument("\n\n\n\nabc\n");
      });
    });
    test$f("inserting newline after heading with text in following block", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("ab"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("cd"), [])]);
      replaceDocument(document);
      getEditor().setSelectedRange(2);
      return typeCharacters$b("\n", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 3);
        assert$e.blockAttributes([0, 2], ["heading1"]);
        assert$e.blockAttributes([3, 4], []);
        assert$e.blockAttributes([5, 6], []);
        return expectDocument("ab\n\ncd\n");
      });
    });
    test$f("backspacing a newline in an empty block with adjacent formatted blocks", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("abc"), ["heading1"]), new Trix$2.Block(), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("d"), ["heading1"])]);
      replaceDocument(document);
      getEditor().setSelectedRange(4);
      return pressKey$5("backspace", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 2);
        assert$e.blockAttributes([0, 1], ["heading1"]);
        assert$e.blockAttributes([2, 3], ["heading1"]);
        return expectDocument("abc\nd\n");
      });
    });
    test$f("backspacing a newline at beginning of non-formatted block", function(expectDocument) {
      var document;
      document = new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("ab"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("\ncd"), [])]);
      replaceDocument(document);
      getEditor().setSelectedRange(3);
      return pressKey$5("backspace", function() {
        document = getDocument();
        assert$e.equal(document.getBlockCount(), 2);
        assert$e.blockAttributes([0, 2], ["heading1"]);
        assert$e.blockAttributes([3, 5], []);
        return expectDocument("ab\ncd\n");
      });
    });
    test$f("inserting newline after single character header", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "heading1"
      }, function() {
        return typeCharacters$b("a", function() {
          return typeCharacters$b("\n", function() {
            var document;
            document = getDocument();
            assert$e.equal(document.getBlockCount(), 2);
            assert$e.blockAttributes([0, 1], ["heading1"]);
            return expectDocument("a\n\n");
          });
        });
      });
    });
    test$f("terminal attributes are only added once", function(expectDocument) {
      replaceDocument(new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("c"), [])]));
      return selectAll$1(function() {
        return clickToolbarButton$a({
          attribute: "heading1"
        }, function() {
          assert$e.equal(getDocument().getBlockCount(), 3);
          assert$e.blockAttributes([0, 1], ["heading1"]);
          assert$e.blockAttributes([2, 3], ["heading1"]);
          assert$e.blockAttributes([4, 5], ["heading1"]);
          return expectDocument("a\nb\nc\n");
        });
      });
    });
    test$f("terminal attributes replace existing terminal attributes", function(expectDocument) {
      replaceDocument(new Trix$2.Document([new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("a"), []), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("b"), ["heading1"]), new Trix$2.Block(Trix$2.Text.textForStringWithAttributes("c"), [])]));
      return selectAll$1(function() {
        return clickToolbarButton$a({
          attribute: "code"
        }, function() {
          assert$e.equal(getDocument().getBlockCount(), 3);
          assert$e.blockAttributes([0, 1], ["code"]);
          assert$e.blockAttributes([2, 3], ["code"]);
          assert$e.blockAttributes([4, 5], ["code"]);
          return expectDocument("a\nb\nc\n");
        });
      });
    });
    test$f("code blocks preserve newlines", function(expectDocument) {
      return typeCharacters$b("a\nb", function() {
        return selectAll$1(function() {
          return clickToolbarButton$a({
            attribute: "code"
          }, function() {
            assert$e.equal(getDocument().getBlockCount(), 1);
            assert$e.blockAttributes([0, 3], ["code"]);
            return expectDocument("a\nb\n");
          });
        });
      });
    });
    test$f("code blocks are not indentable", function(done) {
      return clickToolbarButton$a({
        attribute: "code"
      }, function() {
        assert$e.notOk(isToolbarButtonActive$3({
          action: "increaseNestingLevel"
        }));
        return done();
      });
    });
    test$f("code blocks are terminal", function(done) {
      return clickToolbarButton$a({
        attribute: "code"
      }, function() {
        assert$e.ok(isToolbarButtonDisabled$1({
          attribute: "quote"
        }));
        assert$e.ok(isToolbarButtonDisabled$1({
          attribute: "heading1"
        }));
        assert$e.ok(isToolbarButtonDisabled$1({
          attribute: "bullet"
        }));
        assert$e.ok(isToolbarButtonDisabled$1({
          attribute: "number"
        }));
        assert$e.notOk(isToolbarButtonDisabled$1({
          attribute: "code"
        }));
        assert$e.notOk(isToolbarButtonDisabled$1({
          attribute: "bold"
        }));
        assert$e.notOk(isToolbarButtonDisabled$1({
          attribute: "italic"
        }));
        return done();
      });
    });
    test$f("unindenting a code block inside a bullet", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return clickToolbarButton$a({
          attribute: "code"
        }, function() {
          return typeCharacters$b("a", function() {
            return clickToolbarButton$a({
              action: "decreaseNestingLevel"
            }, function() {
              var document;
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 1);
              assert$e.blockAttributes([0, 1], ["code"]);
              return expectDocument("a\n");
            });
          });
        });
      });
    });
    test$f("indenting a heading inside a bullet", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return typeCharacters$b("a", function() {
          return typeCharacters$b("\n", function() {
            return clickToolbarButton$a({
              attribute: "heading1"
            }, function() {
              return typeCharacters$b("b", function() {
                return clickToolbarButton$a({
                  action: "increaseNestingLevel"
                }, function() {
                  var document;
                  document = getDocument();
                  assert$e.equal(document.getBlockCount(), 2);
                  assert$e.blockAttributes([0, 1], ["bulletList", "bullet"]);
                  assert$e.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet", "heading1"]);
                  return expectDocument("a\nb\n");
                });
              });
            });
          });
        });
      });
    });
    test$f("indenting a quote inside a bullet", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return clickToolbarButton$a({
          attribute: "quote"
        }, function() {
          return clickToolbarButton$a({
            action: "increaseNestingLevel"
          }, function() {
            var document;
            document = getDocument();
            assert$e.equal(document.getBlockCount(), 1);
            assert$e.blockAttributes([0, 1], ["bulletList", "bullet", "quote", "quote"]);
            return expectDocument("\n");
          });
        });
      });
    });
    return test$f("list indentation constraints consider the list type", function(expectDocument) {
      return clickToolbarButton$a({
        attribute: "bullet"
      }, function() {
        return typeCharacters$b("a\n\n", function() {
          return clickToolbarButton$a({
            attribute: "number"
          }, function() {
            return clickToolbarButton$a({
              action: "increaseNestingLevel"
            }, function() {
              var document;
              document = getDocument();
              assert$e.equal(document.getBlockCount(), 2);
              assert$e.blockAttributes([0, 1], ["bulletList", "bullet"]);
              assert$e.blockAttributes([2, 3], ["numberList", "number"]);
              return expectDocument("a\n\n");
            });
          });
        });
      });
    });
  });

  var assert$d, clickToolbarButton$9, moveCursor$7, test$e, testGroup$e, typeCharacters$a;

  ({assert: assert$d, clickToolbarButton: clickToolbarButton$9, moveCursor: moveCursor$7, test: test$e, testGroup: testGroup$e, typeCharacters: typeCharacters$a} = Trix$2.TestHelpers);

  testGroup$e("View caching", {
    template: "editor_empty"
  }, function() {
    test$e("reparsing and rendering identical texts", function(done) {
      return typeCharacters$a("a\nb\na", function() {
        return moveCursor$7({
          direction: "left",
          times: 2
        }, function() {
          return clickToolbarButton$9({
            attribute: "quote"
          }, function() {
            var html;
            html = getEditorElement().innerHTML;
            getEditorController().reparse();
            getEditorController().render();
            assert$d.equal(getEditorElement().innerHTML, html);
            return done();
          });
        });
      });
    });
    return test$e("reparsing and rendering identical blocks", function(done) {
      return clickToolbarButton$9({
        attribute: "bullet"
      }, function() {
        return typeCharacters$a("a\na", function() {
          var html;
          html = getEditorElement().innerHTML;
          getEditorController().reparse();
          getEditorController().render();
          assert$d.equal(getEditorElement().innerHTML, html);
          return done();
        });
      });
    });
  });

  var cancel, cancelingAtTarget, cancelingInCapturingPhase, pressKey$4, test$d, testGroup$d, testOptions$1, typeCharacters$9;

  ({pressKey: pressKey$4, test: test$d, testGroup: testGroup$d, typeCharacters: typeCharacters$9} = Trix$2.TestHelpers);

  testOptions$1 = {
    template: "editor_empty",
    setup: function() {
      var handler;
      addEventListener("keydown", cancel, true);
      return addEventListener("trix-before-initialize", handler = function({target}) {
        removeEventListener("trix-before-initialize", handler);
        return target.addEventListener("keydown", cancel);
      });
    },
    teardown: function() {
      return removeEventListener("keydown", cancel, true);
    }
  };

  cancelingInCapturingPhase = false;

  cancelingAtTarget = false;

  cancel = function(event) {
    switch (event.eventPhase) {
      case Event.prototype.CAPTURING_PHASE:
        if (cancelingInCapturingPhase) {
          return event.preventDefault();
        }
        break;
      case Event.prototype.AT_TARGET:
        if (cancelingAtTarget) {
          return event.preventDefault();
        }
    }
  };

  testGroup$d("Canceled input", testOptions$1, function() {
    test$d("ignoring canceled input events in capturing phase", function(expectDocument) {
      return typeCharacters$9("a", function() {
        cancelingInCapturingPhase = true;
        return pressKey$4("backspace", function() {
          return pressKey$4("return", function() {
            cancelingInCapturingPhase = false;
            return typeCharacters$9("b", function() {
              return expectDocument("ab\n");
            });
          });
        });
      });
    });
    return test$d("ignoring canceled input events at target", function(expectDocument) {
      return typeCharacters$9("a", function() {
        cancelingAtTarget = true;
        return pressKey$4("backspace", function() {
          return pressKey$4("return", function() {
            cancelingAtTarget = false;
            return typeCharacters$9("b", function() {
              return expectDocument("ab\n");
            });
          });
        });
      });
    });
  });

  var assert$c, browser, clickToolbarButton$8, defer$7, endComposition, insertNode$2, pressKey$3, removeCharacters, selectNode$2, startComposition, test$c, testGroup$c, testIf$7, triggerEvent$6, triggerInputEvent$1, typeCharacters$8, updateComposition;

  ({assert: assert$c, clickToolbarButton: clickToolbarButton$8, defer: defer$7, endComposition, insertNode: insertNode$2, pressKey: pressKey$3, selectNode: selectNode$2, startComposition, test: test$c, testIf: testIf$7, testGroup: testGroup$c, triggerEvent: triggerEvent$6, triggerInputEvent: triggerInputEvent$1, typeCharacters: typeCharacters$8, updateComposition} = Trix$2.TestHelpers);

  ({browser} = Trix$2);

  testGroup$c("Composition input", {
    template: "editor_empty"
  }, function() {
    test$c("composing", function(expectDocument) {
      return startComposition("a", function() {
        return updateComposition("ab", function() {
          return endComposition("abc", function() {
            return expectDocument("abc\n");
          });
        });
      });
    });
    test$c("typing and composing", function(expectDocument) {
      return typeCharacters$8("a", function() {
        return startComposition("b", function() {
          return updateComposition("bc", function() {
            return endComposition("bcd", function() {
              return typeCharacters$8("e", function() {
                return expectDocument("abcde\n");
              });
            });
          });
        });
      });
    });
    test$c("composition input is serialized", function(expectDocument) {
      return startComposition("´", function() {
        return endComposition("é", function() {
          assert$c.equal(getEditorElement().value, "<div>é</div>");
          return expectDocument("é\n");
        });
      });
    });
    test$c("pressing return after a canceled composition", function(expectDocument) {
      return typeCharacters$8("ab", function() {
        triggerEvent$6(document.activeElement, "compositionend", {
          data: "ab"
        });
        return pressKey$3("return", function() {
          return expectDocument("ab\n\n");
        });
      });
    });
    test$c("composing formatted text", function(expectDocument) {
      return typeCharacters$8("abc", function() {
        return clickToolbarButton$8({
          attribute: "bold"
        }, function() {
          return startComposition("d", function() {
            return updateComposition("de", function() {
              return endComposition("def", function() {
                assert$c.textAttributes([0, 3], {});
                assert$c.textAttributes([3, 6], {
                  bold: true
                });
                return expectDocument("abcdef\n");
              });
            });
          });
        });
      });
    });
    test$c("composing away from formatted text", function(expectDocument) {
      return clickToolbarButton$8({
        attribute: "bold"
      }, function() {
        return typeCharacters$8("abc", function() {
          return clickToolbarButton$8({
            attribute: "bold"
          }, function() {
            return startComposition("d", function() {
              return updateComposition("de", function() {
                return endComposition("def", function() {
                  assert$c.textAttributes([0, 3], {
                    bold: true
                  });
                  assert$c.textAttributes([3, 6], {});
                  return expectDocument("abcdef\n");
                });
              });
            });
          });
        });
      });
    });
    test$c("composing another language using a QWERTY keyboard", function(expectDocument) {
      var element, keyCodes;
      element = getEditorElement();
      keyCodes = {
        x: 120,
        i: 105
      };
      triggerEvent$6(element, "keypress", {
        charCode: keyCodes.x,
        keyCode: keyCodes.x,
        which: keyCodes.x
      });
      return startComposition("x", function() {
        triggerEvent$6(element, "keypress", {
          charCode: keyCodes.i,
          keyCode: keyCodes.i,
          which: keyCodes.i
        });
        return updateComposition("xi", function() {
          return endComposition("喜", function() {
            return expectDocument("喜\n");
          });
        });
      });
    });
    // Simulates the sequence of events when pressing backspace through a word on Android
    testIf$7(Trix$2.config.input.getLevel() === 0, "backspacing through a composition", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.insertString("a cat");
      triggerEvent$6(element, "keydown", {
        charCode: 0,
        keyCode: 229,
        which: 229
      });
      triggerEvent$6(element, "compositionupdate", {
        data: "ca"
      });
      triggerEvent$6(element, "input");
      return removeCharacters(-1, function() {
        triggerEvent$6(element, "keydown", {
          charCode: 0,
          keyCode: 229,
          which: 229
        });
        triggerEvent$6(element, "compositionupdate", {
          data: "c"
        });
        triggerEvent$6(element, "input");
        triggerEvent$6(element, "compositionend", {
          data: "c"
        });
        return removeCharacters(-1, function() {
          return pressKey$3("backspace", function() {
            return expectDocument("a \n");
          });
        });
      });
    });
    // Simulates the sequence of events when pressing backspace at the end of a
    // word and updating it on Android (running older versions of System WebView)
    testIf$7(Trix$2.config.input.getLevel() === 0, "updating a composition", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.insertString("cat");
      triggerEvent$6(element, "keydown", {
        charCode: 0,
        keyCode: 229,
        which: 229
      });
      triggerEvent$6(element, "compositionstart", {
        data: "cat"
      });
      triggerEvent$6(element, "compositionupdate", {
        data: "cat"
      });
      triggerEvent$6(element, "input");
      return removeCharacters(-1, function() {
        triggerEvent$6(element, "keydown", {
          charCode: 0,
          keyCode: 229,
          which: 229
        });
        triggerEvent$6(element, "compositionupdate", {
          data: "car"
        });
        triggerEvent$6(element, "input");
        triggerEvent$6(element, "compositionend", {
          data: "car"
        });
        return insertNode$2(document.createTextNode("r"), function() {
          return expectDocument("car\n");
        });
      });
    });
    // Simulates the sequence of events when typing on Android and then tapping elsewhere
    testIf$7(Trix$2.config.input.getLevel() === 0, "leaving a composition", function(expectDocument) {
      var element, node;
      element = getEditorElement();
      triggerEvent$6(element, "keydown", {
        charCode: 0,
        keyCode: 229,
        which: 229
      });
      triggerEvent$6(element, "compositionstart", {
        data: ""
      });
      triggerInputEvent$1(element, "beforeinput", {
        inputType: "insertCompositionText",
        data: "c"
      });
      triggerEvent$6(element, "compositionupdate", {
        data: "c"
      });
      triggerEvent$6(element, "input");
      node = document.createTextNode("c");
      insertNode$2(node);
      selectNode$2(node);
      return defer$7(function() {
        triggerEvent$6(element, "keydown", {
          charCode: 0,
          keyCode: 229,
          which: 229
        });
        triggerInputEvent$1(element, "beforeinput", {
          inputType: "insertCompositionText",
          data: "ca"
        });
        triggerEvent$6(element, "compositionupdate", {
          data: "ca"
        });
        triggerEvent$6(element, "input");
        node.data = "ca";
        return defer$7(function() {
          triggerEvent$6(element, "compositionend", {
            data: ""
          });
          return defer$7(function() {
            return expectDocument("ca\n");
          });
        });
      });
    });
    testIf$7(browser.composesExistingText, "composition events from cursor movement are ignored", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.insertString("ab ");
      element.editor.setSelectedRange(0);
      triggerEvent$6(element, "compositionstart", {
        data: ""
      });
      triggerEvent$6(element, "compositionupdate", {
        data: "ab"
      });
      return defer$7(function() {
        element.editor.setSelectedRange(1);
        triggerEvent$6(element, "compositionupdate", {
          data: "ab"
        });
        return defer$7(function() {
          element.editor.setSelectedRange(2);
          triggerEvent$6(element, "compositionupdate", {
            data: "ab"
          });
          return defer$7(function() {
            element.editor.setSelectedRange(3);
            triggerEvent$6(element, "compositionend", {
              data: "ab"
            });
            return defer$7(function() {
              return expectDocument("ab \n");
            });
          });
        });
      });
    });
    // Simulates compositions in Firefox where the final composition data is
    // dispatched as both compositionupdate and compositionend.
    return testIf$7(Trix$2.config.input.getLevel() === 0, "composition ending with same data as last update", function(expectDocument) {
      var element, node;
      element = getEditorElement();
      triggerEvent$6(element, "keydown", {
        charCode: 0,
        keyCode: 229,
        which: 229
      });
      triggerEvent$6(element, "compositionstart", {
        data: ""
      });
      triggerEvent$6(element, "compositionupdate", {
        data: "´"
      });
      node = document.createTextNode("´");
      insertNode$2(node);
      selectNode$2(node);
      return defer$7(function() {
        triggerEvent$6(element, "keydown", {
          charCode: 0,
          keyCode: 229,
          which: 229
        });
        triggerEvent$6(element, "compositionupdate", {
          data: "é"
        });
        triggerEvent$6(element, "input");
        node.data = "é";
        return defer$7(function() {
          triggerEvent$6(element, "keydown", {
            charCode: 0,
            keyCode: 229,
            which: 229
          });
          triggerEvent$6(element, "compositionupdate", {
            data: "éé"
          });
          triggerEvent$6(element, "input");
          node.data = "éé";
          return defer$7(function() {
            triggerEvent$6(element, "compositionend", {
              data: "éé"
            });
            return defer$7(function() {
              assert$c.locationRange({
                index: 0,
                offset: 2
              });
              return expectDocument("éé\n");
            });
          });
        });
      });
    });
  });

  removeCharacters = function(direction, callback) {
    var range, selection;
    selection = rangy.getSelection();
    range = selection.getRangeAt(0);
    range.moveStart("character", direction);
    range.deleteContents();
    return defer$7(callback);
  };

  var assert$b, createFile$3, expandSelection$3, insertFile, insertString$2, moveCursor$6, test$b, testGroup$b;

  ({assert: assert$b, createFile: createFile$3, expandSelection: expandSelection$3, insertFile, insertString: insertString$2, moveCursor: moveCursor$6, test: test$b, testGroup: testGroup$b} = Trix$2.TestHelpers);

  testGroup$b("Cursor movement", {
    template: "editor_empty"
  }, function() {
    test$b("move cursor around attachment", function(done) {
      insertFile(createFile$3());
      assert$b.locationRange({
        index: 0,
        offset: 1
      });
      return moveCursor$6("left", function() {
        assert$b.locationRange({
          index: 0,
          offset: 0
        }, {
          index: 0,
          offset: 1
        });
        return moveCursor$6("left", function() {
          assert$b.locationRange({
            index: 0,
            offset: 0
          });
          return moveCursor$6("right", function() {
            assert$b.locationRange({
              index: 0,
              offset: 0
            }, {
              index: 0,
              offset: 1
            });
            return moveCursor$6("right", function() {
              assert$b.locationRange({
                index: 0,
                offset: 1
              });
              return done();
            });
          });
        });
      });
    });
    test$b("move cursor around attachment and text", function(done) {
      insertString$2("a");
      insertFile(createFile$3());
      insertString$2("b");
      assert$b.locationRange({
        index: 0,
        offset: 3
      });
      return moveCursor$6("left", function() {
        assert$b.locationRange({
          index: 0,
          offset: 2
        });
        return moveCursor$6("left", function() {
          assert$b.locationRange({
            index: 0,
            offset: 1
          }, {
            index: 0,
            offset: 2
          });
          return moveCursor$6("left", function() {
            assert$b.locationRange({
              index: 0,
              offset: 1
            });
            return moveCursor$6("left", function() {
              assert$b.locationRange({
                index: 0,
                offset: 0
              });
              return done();
            });
          });
        });
      });
    });
    test$b("expand selection over attachment", function(done) {
      insertFile(createFile$3());
      assert$b.locationRange({
        index: 0,
        offset: 1
      });
      return expandSelection$3("left", function() {
        assert$b.locationRange({
          index: 0,
          offset: 0
        }, {
          index: 0,
          offset: 1
        });
        return moveCursor$6("left", function() {
          assert$b.locationRange({
            index: 0,
            offset: 0
          });
          return expandSelection$3("right", function() {
            assert$b.locationRange({
              index: 0,
              offset: 0
            }, {
              index: 0,
              offset: 1
            });
            return done();
          });
        });
      });
    });
    return test$b("expand selection over attachment and text", function(done) {
      insertString$2("a");
      insertFile(createFile$3());
      insertString$2("b");
      assert$b.locationRange({
        index: 0,
        offset: 3
      });
      return expandSelection$3("left", function() {
        assert$b.locationRange({
          index: 0,
          offset: 2
        }, {
          index: 0,
          offset: 3
        });
        return expandSelection$3("left", function() {
          assert$b.locationRange({
            index: 0,
            offset: 1
          }, {
            index: 0,
            offset: 3
          });
          return expandSelection$3("left", function() {
            assert$b.locationRange({
              index: 0,
              offset: 0
            }, {
              index: 0,
              offset: 3
            });
            return done();
          });
        });
      });
    });
  });

  var after$4, assert$a, clickElement$1, clickToolbarButton$7, createFile$2, defer$6, insertImageAttachment, moveCursor$5, pasteContent$1, skip, test$a, testGroup$a, testIf$6, triggerEvent$5, typeCharacters$7, typeInToolbarDialog$1;

  ({after: after$4, assert: assert$a, clickElement: clickElement$1, clickToolbarButton: clickToolbarButton$7, createFile: createFile$2, defer: defer$6, insertImageAttachment, moveCursor: moveCursor$5, pasteContent: pasteContent$1, skip, test: test$a, testIf: testIf$6, testGroup: testGroup$a, triggerEvent: triggerEvent$5, typeCharacters: typeCharacters$7, typeInToolbarDialog: typeInToolbarDialog$1} = Trix$2.TestHelpers);

  testGroup$a("Custom element API", {
    template: "editor_empty"
  }, function() {
    test$a("element triggers trix-initialize on first connect", function(done) {
      var container, element, initializeEventCount;
      container = document.getElementById("trix-container");
      container.innerHTML = "";
      initializeEventCount = 0;
      element = document.createElement("trix-editor");
      element.addEventListener("trix-initialize", function() {
        return initializeEventCount++;
      });
      container.appendChild(element);
      return requestAnimationFrame(function() {
        container.removeChild(element);
        return requestAnimationFrame(function() {
          container.appendChild(element);
          return after$4(60, function() {
            assert$a.equal(initializeEventCount, 1);
            return done();
          });
        });
      });
    });
    test$a("files are accepted by default", function() {
      getComposition().insertFile(createFile$2());
      return assert$a.equal(getComposition().getAttachments().length, 1);
    });
    test$a("rejecting a file by canceling the trix-file-accept event", function() {
      getEditorElement().addEventListener("trix-file-accept", function(event) {
        return event.preventDefault();
      });
      getComposition().insertFile(createFile$2());
      return assert$a.equal(getComposition().getAttachments().length, 0);
    });
    test$a("element triggers attachment events", function() {
      var attachment, composition, element, events, file;
      file = createFile$2();
      element = getEditorElement();
      composition = getComposition();
      attachment = null;
      events = [];
      element.addEventListener("trix-file-accept", function(event) {
        events.push(event.type);
        return assert$a.ok(file === event.file);
      });
      element.addEventListener("trix-attachment-add", function(event) {
        events.push(event.type);
        return attachment = event.attachment;
      });
      composition.insertFile(file);
      assert$a.deepEqual(events, ["trix-file-accept", "trix-attachment-add"]);
      element.addEventListener("trix-attachment-remove", function(event) {
        events.push(event.type);
        return assert$a.ok(attachment === event.attachment);
      });
      attachment.remove();
      return assert$a.deepEqual(events, ["trix-file-accept", "trix-attachment-add", "trix-attachment-remove"]);
    });
    test$a("element triggers trix-change when an attachment is edited", function() {
      var attachment, composition, element, events, file;
      file = createFile$2();
      element = getEditorElement();
      composition = getComposition();
      attachment = null;
      events = [];
      element.addEventListener("trix-attachment-add", function(event) {
        return attachment = event.attachment;
      });
      composition.insertFile(file);
      element.addEventListener("trix-attachment-edit", function(event) {
        return events.push(event.type);
      });
      element.addEventListener("trix-change", function(event) {
        return events.push(event.type);
      });
      attachment.setAttributes({
        width: 9876
      });
      return assert$a.deepEqual(events, ["trix-attachment-edit", "trix-change"]);
    });
    test$a("editing the document in a trix-attachment-add handler doesn't trigger trix-attachment-add again", function() {
      var composition, element, eventCount;
      element = getEditorElement();
      composition = getComposition();
      eventCount = 0;
      element.addEventListener("trix-attachment-add", function() {
        if (eventCount++ === 0) {
          element.editor.setSelectedRange([0, 1]);
          return element.editor.activateAttribute("bold");
        }
      });
      composition.insertFile(createFile$2());
      return assert$a.equal(eventCount, 1);
    });
    test$a("element triggers trix-change events when the document changes", function(done) {
      var element, eventCount;
      element = getEditorElement();
      eventCount = 0;
      element.addEventListener("trix-change", function(event) {
        return eventCount++;
      });
      return typeCharacters$7("a", function() {
        assert$a.equal(eventCount, 1);
        return moveCursor$5("left", function() {
          assert$a.equal(eventCount, 1);
          return typeCharacters$7("bcd", function() {
            assert$a.equal(eventCount, 4);
            return clickToolbarButton$7({
              action: "undo"
            }, function() {
              assert$a.equal(eventCount, 5);
              return done();
            });
          });
        });
      });
    });
    test$a("element triggers trix-change event after toggling attributes", function(done) {
      var afterChangeEvent, editor, element;
      element = getEditorElement();
      editor = element.editor;
      afterChangeEvent = function(edit, callback) {
        var handler;
        element.addEventListener("trix-change", handler = function(event) {
          element.removeEventListener("trix-change", handler);
          return callback(event);
        });
        return edit();
      };
      return typeCharacters$7("hello", function() {
        var edit;
        edit = function() {
          return editor.activateAttribute("quote");
        };
        return afterChangeEvent(edit, function() {
          assert$a.ok(editor.attributeIsActive("quote"));
          edit = function() {
            return editor.deactivateAttribute("quote");
          };
          return afterChangeEvent(edit, function() {
            assert$a.notOk(editor.attributeIsActive("quote"));
            editor.setSelectedRange([0, 5]);
            edit = function() {
              return editor.activateAttribute("bold");
            };
            return afterChangeEvent(edit, function() {
              assert$a.ok(editor.attributeIsActive("bold"));
              edit = function() {
                return editor.deactivateAttribute("bold");
              };
              return afterChangeEvent(edit, function() {
                assert$a.notOk(editor.attributeIsActive("bold"));
                return done();
              });
            });
          });
        });
      });
    });
    test$a("disabled attributes aren't considered active", function(done) {
      var editor;
      ({editor} = getEditorElement());
      editor.activateAttribute("heading1");
      assert$a.notOk(editor.attributeIsActive("code"));
      assert$a.notOk(editor.attributeIsActive("quote"));
      return done();
    });
    test$a("element triggers trix-selection-change events when the location range changes", function(done) {
      var element, eventCount;
      element = getEditorElement();
      eventCount = 0;
      element.addEventListener("trix-selection-change", function(event) {
        return eventCount++;
      });
      return typeCharacters$7("a", function() {
        assert$a.equal(eventCount, 1);
        return moveCursor$5("left", function() {
          assert$a.equal(eventCount, 2);
          return done();
        });
      });
    });
    test$a("only triggers trix-selection-change events on the active element", function(done) {
      var elementA, elementB;
      elementA = getEditorElement();
      elementB = document.createElement("trix-editor");
      elementA.parentNode.insertBefore(elementB, elementA.nextSibling);
      return elementB.addEventListener("trix-initialize", function() {
        var eventCountA, eventCountB;
        elementA.editor.insertString("a");
        elementB.editor.insertString("b");
        rangy.getSelection().removeAllRanges();
        eventCountA = 0;
        eventCountB = 0;
        elementA.addEventListener("trix-selection-change", function(event) {
          return eventCountA++;
        });
        elementB.addEventListener("trix-selection-change", function(event) {
          return eventCountB++;
        });
        elementA.editor.setSelectedRange(0);
        assert$a.equal(eventCountA, 1);
        assert$a.equal(eventCountB, 0);
        elementB.editor.setSelectedRange(0);
        assert$a.equal(eventCountA, 1);
        assert$a.equal(eventCountB, 1);
        elementA.editor.setSelectedRange(1);
        assert$a.equal(eventCountA, 2);
        assert$a.equal(eventCountB, 1);
        return done();
      });
    });
    test$a("element triggers toolbar dialog events", function(done) {
      var element, events;
      element = getEditorElement();
      events = [];
      element.addEventListener("trix-toolbar-dialog-show", function(event) {
        return events.push(event.type);
      });
      element.addEventListener("trix-toolbar-dialog-hide", function(event) {
        return events.push(event.type);
      });
      return clickToolbarButton$7({
        action: "link"
      }, function() {
        return typeInToolbarDialog$1("http://example.com", {
          attribute: "href"
        }, function() {
          return defer$6(function() {
            assert$a.deepEqual(events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]);
            return done();
          });
        });
      });
    });
    test$a("element triggers before-paste event with paste data", function(expectDocument) {
      var element, eventCount, paste;
      element = getEditorElement();
      eventCount = 0;
      paste = null;
      element.addEventListener("trix-before-paste", function(event) {
        eventCount++;
        return ({paste} = event);
      });
      return typeCharacters$7("", function() {
        return pasteContent$1("text/html", "<strong>hello</strong>", function() {
          assert$a.equal(eventCount, 1);
          assert$a.equal(paste.type, "text/html");
          assert$a.equal(paste.html, "<strong>hello</strong>");
          return expectDocument("hello\n");
        });
      });
    });
    test$a("element triggers before-paste event with mutable paste data", function(expectDocument) {
      var element, eventCount, paste;
      element = getEditorElement();
      eventCount = 0;
      paste = null;
      element.addEventListener("trix-before-paste", function(event) {
        eventCount++;
        ({paste} = event);
        return paste.html = "<strong>greetings</strong>";
      });
      return typeCharacters$7("", function() {
        return pasteContent$1("text/html", "<strong>hello</strong>", function() {
          assert$a.equal(eventCount, 1);
          assert$a.equal(paste.type, "text/html");
          return expectDocument("greetings\n");
        });
      });
    });
    test$a("element triggers paste event with position range", function(done) {
      var element, eventCount, paste;
      element = getEditorElement();
      eventCount = 0;
      paste = null;
      element.addEventListener("trix-paste", function(event) {
        eventCount++;
        return ({paste} = event);
      });
      return typeCharacters$7("", function() {
        return pasteContent$1("text/html", "<strong>hello</strong>", function() {
          assert$a.equal(eventCount, 1);
          assert$a.equal(paste.type, "text/html");
          assert$a.ok(Trix$2.rangesAreEqual([0, 5], paste.range));
          return done();
        });
      });
    });
    test$a("element triggers attribute change events", function(done) {
      var attributes, element, eventCount;
      element = getEditorElement();
      eventCount = 0;
      attributes = null;
      element.addEventListener("trix-attributes-change", function(event) {
        eventCount++;
        return ({attributes} = event);
      });
      return typeCharacters$7("", function() {
        assert$a.equal(eventCount, 0);
        return clickToolbarButton$7({
          attribute: "bold"
        }, function() {
          assert$a.equal(eventCount, 1);
          assert$a.deepEqual({
            bold: true
          }, attributes);
          return done();
        });
      });
    });
    test$a("element triggers action change events", function(done) {
      var actions, element, eventCount;
      element = getEditorElement();
      eventCount = 0;
      actions = null;
      element.addEventListener("trix-actions-change", function(event) {
        eventCount++;
        return ({actions} = event);
      });
      return typeCharacters$7("", function() {
        assert$a.equal(eventCount, 0);
        return clickToolbarButton$7({
          attribute: "bullet"
        }, function() {
          assert$a.equal(eventCount, 1);
          assert$a.equal(actions.decreaseNestingLevel, true);
          assert$a.equal(actions.increaseNestingLevel, false);
          return done();
        });
      });
    });
    test$a("element triggers custom focus and blur events", function(done) {
      var blurEventCount, element, focusEventCount;
      element = getEditorElement();
      focusEventCount = 0;
      blurEventCount = 0;
      element.addEventListener("trix-focus", function() {
        return focusEventCount++;
      });
      element.addEventListener("trix-blur", function() {
        return blurEventCount++;
      });
      triggerEvent$5(element, "blur");
      return defer$6(function() {
        assert$a.equal(blurEventCount, 1);
        assert$a.equal(focusEventCount, 0);
        triggerEvent$5(element, "focus");
        return defer$6(function() {
          assert$a.equal(blurEventCount, 1);
          assert$a.equal(focusEventCount, 1);
          insertImageAttachment();
          return after$4(20, function() {
            return clickElement$1(element.querySelector("figure"), function() {
              var textarea;
              textarea = element.querySelector("textarea");
              textarea.focus();
              return defer$6(function() {
                assert$a.equal(document.activeElement, textarea);
                assert$a.equal(blurEventCount, 1);
                assert$a.equal(focusEventCount, 1);
                return done();
              });
            });
          });
        });
      });
    });
    // Selenium doesn't seem to focus windows properly in some browsers (FF 47 on OS X)
    // so skip this test when unfocused pending a better solution.
    testIf$6(document.hasFocus(), "element triggers custom focus event when autofocusing", function(done) {
      var container, element, focusEventCount;
      element = document.createElement("trix-editor");
      element.setAttribute("autofocus", "");
      focusEventCount = 0;
      element.addEventListener("trix-focus", function() {
        return focusEventCount++;
      });
      container = document.getElementById("trix-container");
      container.innerHTML = "";
      container.appendChild(element);
      return element.addEventListener("trix-initialize", function() {
        assert$a.equal(focusEventCount, 1);
        return done();
      });
    });
    test$a("element serializes HTML after attribute changes", function(done) {
      var element, serializedHTML;
      element = getEditorElement();
      serializedHTML = element.value;
      return typeCharacters$7("a", function() {
        assert$a.notEqual(serializedHTML, element.value);
        serializedHTML = element.value;
        return clickToolbarButton$7({
          attribute: "quote"
        }, function() {
          assert$a.notEqual(serializedHTML, element.value);
          serializedHTML = element.value;
          return clickToolbarButton$7({
            attribute: "quote"
          }, function() {
            assert$a.notEqual(serializedHTML, element.value);
            return done();
          });
        });
      });
    });
    test$a("element serializes HTML after attachment attribute changes", function(done) {
      var attributes, element;
      element = getEditorElement();
      attributes = {
        url: "test_helpers/fixtures/logo.png",
        contentType: "image/png"
      };
      element.addEventListener("trix-attachment-add", function(event) {
        var attachment;
        ({attachment} = event);
        return requestAnimationFrame(function() {
          var serializedHTML;
          serializedHTML = element.value;
          attachment.setAttributes(attributes);
          assert$a.notEqual(serializedHTML, element.value);
          serializedHTML = element.value;
          assert$a.ok(serializedHTML.indexOf(TEST_IMAGE_URL) < 0, "serialized HTML contains previous attachment attributes");
          assert$a.ok(serializedHTML.indexOf(attributes.url) > 0, "serialized HTML doesn't contain current attachment attributes");
          attachment.remove();
          return requestAnimationFrame(function() {
            return done();
          });
        });
      });
      return requestAnimationFrame(function() {
        return insertImageAttachment();
      });
    });
    test$a("editor resets to its original value on form reset", function(expectDocument) {
      var element, form;
      element = getEditorElement();
      form = element.inputElement.form;
      return typeCharacters$7("hello", function() {
        form.reset();
        return expectDocument("\n");
      });
    });
    test$a("editor resets to last-set value on form reset", function(expectDocument) {
      var element, form;
      element = getEditorElement();
      form = element.inputElement.form;
      element.value = "hi";
      return typeCharacters$7("hello", function() {
        form.reset();
        return expectDocument("hi\n");
      });
    });
    return test$a("editor respects preventDefault on form reset", function(expectDocument) {
      var element, form, preventDefault;
      element = getEditorElement();
      form = element.inputElement.form;
      preventDefault = function(event) {
        return event.preventDefault();
      };
      return typeCharacters$7("hello", function() {
        form.addEventListener("reset", preventDefault, false);
        form.reset();
        form.removeEventListener("reset", preventDefault, false);
        return expectDocument("hello\n");
      });
    });
  });

  testGroup$a("<label> support", {
    template: "editor_with_labels"
  }, function() {
    test$a("associates all label elements", function(done) {
      var labels;
      labels = [document.getElementById("label-1"), document.getElementById("label-3")];
      assert$a.deepEqual(getEditorElement().labels, labels);
      return done();
    });
    test$a("focuses when <label> clicked", function(done) {
      document.getElementById("label-1").click();
      assert$a.equal(getEditorElement(), document.activeElement);
      return done();
    });
    test$a("focuses when <label> descendant clicked", function(done) {
      document.getElementById("label-1").querySelector("span").click();
      assert$a.equal(getEditorElement(), document.activeElement);
      return done();
    });
    return test$a("does not focus when <label> controls another element", function(done) {
      var label;
      label = document.getElementById("label-2");
      assert$a.notEqual(getEditorElement(), label.control);
      label.click();
      assert$a.notEqual(getEditorElement(), document.activeElement);
      return done();
    });
  });

  testGroup$a("form property references its <form>", {
    template: "editors_with_forms",
    container: "div"
  }, function() {
    test$a("accesses its ancestor form", function(done) {
      var editor, form;
      form = document.getElementById("ancestor-form");
      editor = document.getElementById("editor-with-ancestor-form");
      assert$a.equal(editor.form, form);
      return done();
    });
    test$a("transitively accesses its related <input> element's <form>", function(done) {
      var editor, form;
      form = document.getElementById("input-form");
      editor = document.getElementById("editor-with-input-form");
      assert$a.equal(editor.form, form);
      return done();
    });
    return test$a("returns null when there is no associated <form>", function(done) {
      var editor;
      editor = document.getElementById("editor-with-no-form");
      assert$a.equal(editor.form, null);
      return done();
    });
  });

  var after$3, assert$9, test$9, testGroup$9;

  ({after: after$3, assert: assert$9, test: test$9, testGroup: testGroup$9} = Trix$2.TestHelpers);

  testGroup$9("HTML loading", function() {
    testGroup$9("inline elements", {
      template: "editor_with_styled_content"
    }, function() {
      var cases, details, name, results;
      cases = {
        "BR before block element styled otherwise": {
          html: `a<br><figure class="attachment"><img src="${TEST_IMAGE_URL}"></figure>`,
          expectedDocument: `a\n${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`
        },
        "BR in text before block element styled otherwise": {
          html: `<div>a<br>b<figure class="attachment"><img src="${TEST_IMAGE_URL}"></figure></div>`,
          expectedDocument: `a\nb${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`
        }
      };
      results = [];
      for (name in cases) {
        details = cases[name];
        results.push((function(name, details) {
          return test$9(name, function(expectDocument) {
            getEditor().loadHTML(details.html);
            return expectDocument(details.expectedDocument);
          });
        })(name, details));
      }
      return results;
    });
    testGroup$9("bold elements", {
      template: "editor_with_bold_styles"
    }, function() {
      test$9("<strong> with font-weight: 500", function(expectDocument) {
        getEditor().loadHTML("<strong>a</strong>");
        assert$9.textAttributes([0, 1], {
          bold: true
        });
        return expectDocument("a\n");
      });
      test$9("<span> with font-weight: 600", function(expectDocument) {
        getEditor().loadHTML("<span>a</span>");
        assert$9.textAttributes([0, 1], {
          bold: true
        });
        return expectDocument("a\n");
      });
      return test$9("<article> with font-weight: bold", function(expectDocument) {
        getEditor().loadHTML("<article>a</article>");
        assert$9.textAttributes([0, 1], {
          bold: true
        });
        return expectDocument("a\n");
      });
    });
    testGroup$9("styled block elements", {
      template: "editor_with_block_styles"
    }, function() {
      test$9("<em> in <blockquote> with font-style: italic", function(expectDocument) {
        getEditor().loadHTML("<blockquote>a<em>b</em></blockquote>");
        assert$9.textAttributes([0, 1], {});
        assert$9.textAttributes([1, 2], {
          italic: true
        });
        assert$9.blockAttributes([0, 2], ["quote"]);
        return expectDocument("ab\n");
      });
      test$9("<strong> in <li> with font-weight: bold", function(expectDocument) {
        getEditor().loadHTML("<ul><li>a<strong>b</strong></li></ul>");
        assert$9.textAttributes([0, 1], {});
        assert$9.textAttributes([1, 2], {
          bold: true
        });
        assert$9.blockAttributes([0, 2], ["bulletList", "bullet"]);
        return expectDocument("ab\n");
      });
      return test$9("newline in <li> with font-weight: bold", function(expectDocument) {
        getEditor().loadHTML("<ul><li>a<br>b</li></ul>");
        assert$9.textAttributes([0, 2], {});
        assert$9.blockAttributes([0, 2], ["bulletList", "bullet"]);
        return expectDocument("a\nb\n");
      });
    });
    testGroup$9("in a table", {
      template: "editor_in_table"
    }, function() {
      return test$9("block elements", function(expectDocument) {
        getEditor().loadHTML("<h1>a</h1><blockquote>b</blockquote>");
        assert$9.blockAttributes([0, 2], ["heading1"]);
        assert$9.blockAttributes([2, 4], ["quote"]);
        return expectDocument("a\nb\n");
      });
    });
    testGroup$9("images", {
      template: "editor_empty"
    }, function() {
      test$9("without dimensions", function(expectDocument) {
        getEditor().loadHTML(`<img src="${TEST_IMAGE_URL}">`);
        return after$3(20, function() {
          var attachment, image;
          attachment = getDocument().getAttachments()[0];
          image = getEditorElement().querySelector("img");
          assert$9.equal(attachment.getWidth(), 1);
          assert$9.equal(attachment.getHeight(), 1);
          assert$9.equal(image.getAttribute("width"), "1");
          assert$9.equal(image.getAttribute("height"), "1");
          return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
        });
      });
      return test$9("with dimensions", function(expectDocument) {
        getEditor().loadHTML(`<img src="${TEST_IMAGE_URL}" width="10" height="20">`);
        return after$3(20, function() {
          var attachment, image;
          attachment = getDocument().getAttachments()[0];
          image = getEditorElement().querySelector("img");
          assert$9.equal(attachment.getWidth(), 10);
          assert$9.equal(attachment.getHeight(), 20);
          assert$9.equal(image.getAttribute("width"), "10");
          assert$9.equal(image.getAttribute("height"), "20");
          return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
        });
      });
    });
    return testGroup$9("text after closing tag", {
      template: "editor_empty"
    }, function() {
      return test$9("parses text as separate block", function(expectDocument) {
        getEditor().loadHTML("<h1>a</h1>b");
        assert$9.blockAttributes([0, 2], ["heading1"]);
        assert$9.blockAttributes([2, 4], []);
        return expectDocument("a\nb\n");
      });
    });
  });

  var assert$8, test$8, testGroup$8;

  ({assert: assert$8, test: test$8, testGroup: testGroup$8} = Trix$2.TestHelpers);

  testGroup$8("HTML Reparsing", {
    template: "editor_empty"
  }, function() {
    test$8("mutation resulting in identical blocks", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.loadHTML("<ul><li>a</li><li>b</li></ul>");
      return requestAnimationFrame(function() {
        element.querySelector("li").textContent = "b";
        return requestAnimationFrame(function() {
          assert$8.blockAttributes([0, 1], ["bulletList", "bullet"]);
          assert$8.blockAttributes([2, 3], ["bulletList", "bullet"]);
          assert$8.equal(element.value, "<ul><li>b</li><li>b</li></ul>");
          return expectDocument("b\nb\n");
        });
      });
    });
    return test$8("mutation resulting in identical pieces", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.loadHTML("<div><strong>a</strong> <strong>b</strong></div>");
      return requestAnimationFrame(function() {
        element.querySelector("strong").textContent = "b";
        return requestAnimationFrame(function() {
          assert$8.textAttributes([0, 1], {
            bold: true
          });
          assert$8.textAttributes([2, 3], {
            bold: true
          });
          assert$8.equal(element.value, "<div><strong>b</strong> <strong>b</strong></div>");
          return expectDocument("b b\n");
        });
      });
    });
  });

  var assert$7, clickToolbarButton$6, collapseSelection$1, defer$5, getElementWithText, moveCursor$4, pressCommandBackspace, selectNode$1, test$7, testGroup$7, testIf$5, triggerEvent$4, typeCharacters$6;

  ({assert: assert$7, clickToolbarButton: clickToolbarButton$6, collapseSelection: collapseSelection$1, defer: defer$5, moveCursor: moveCursor$4, selectNode: selectNode$1, typeCharacters: typeCharacters$6, testIf: testIf$5, testGroup: testGroup$7, triggerEvent: triggerEvent$4} = Trix$2.TestHelpers);

  test$7 = function() {
    return testIf$5(Trix$2.config.input.getLevel() === 0, ...arguments);
  };

  testGroup$7("Level 0 input: HTML replacement", function() {
    return testGroup$7("deleting with command+backspace", {
      template: "editor_empty"
    }, function() {
      test$7("from the end of a line", function(expectDocument) {
        getEditor().loadHTML("<div>a</div><blockquote>b</blockquote><div>c</div>");
        getSelectionManager().setLocationRange({
          index: 1,
          offset: 1
        });
        return pressCommandBackspace({
          replaceText: "b"
        }, function() {
          assert$7.locationRange({
            index: 1,
            offset: 0
          });
          assert$7.blockAttributes([0, 2], []);
          assert$7.blockAttributes([2, 3], ["quote"]);
          assert$7.blockAttributes([3, 5], []);
          return expectDocument("a\n\nc\n");
        });
      });
      test$7("in the first block", function(expectDocument) {
        getEditor().loadHTML("<div>a</div><blockquote>b</blockquote>");
        getSelectionManager().setLocationRange({
          index: 0,
          offset: 1
        });
        return pressCommandBackspace({
          replaceText: "a"
        }, function() {
          assert$7.locationRange({
            index: 0,
            offset: 0
          });
          assert$7.blockAttributes([0, 1], []);
          assert$7.blockAttributes([1, 3], ["quote"]);
          return expectDocument("\nb\n");
        });
      });
      test$7("from the middle of a line", function(expectDocument) {
        getEditor().loadHTML("<div>a</div><blockquote>bc</blockquote><div>d</div>");
        getSelectionManager().setLocationRange({
          index: 1,
          offset: 1
        });
        return pressCommandBackspace({
          replaceText: "b"
        }, function() {
          assert$7.locationRange({
            index: 1,
            offset: 0
          });
          assert$7.blockAttributes([0, 2], []);
          assert$7.blockAttributes([2, 4], ["quote"]);
          assert$7.blockAttributes([4, 6], []);
          return expectDocument("a\nc\nd\n");
        });
      });
      test$7("from the middle of a line in a multi-line block", function(expectDocument) {
        getEditor().loadHTML("<div>a</div><blockquote>bc<br>d</blockquote><div>e</div>");
        getSelectionManager().setLocationRange({
          index: 1,
          offset: 1
        });
        return pressCommandBackspace({
          replaceText: "b"
        }, function() {
          assert$7.locationRange({
            index: 1,
            offset: 0
          });
          assert$7.blockAttributes([0, 2], []);
          assert$7.blockAttributes([2, 6], ["quote"]);
          return expectDocument("a\nc\nd\ne\n");
        });
      });
      test$7("from the end of a list item", function(expectDocument) {
        getEditor().loadHTML("<ul><li>a</li><li>b</li></ul>");
        getSelectionManager().setLocationRange({
          index: 1,
          offset: 1
        });
        return pressCommandBackspace({
          replaceText: "b"
        }, function() {
          assert$7.locationRange({
            index: 1,
            offset: 0
          });
          assert$7.blockAttributes([0, 2], ["bulletList", "bullet"]);
          assert$7.blockAttributes([2, 4], ["bulletList", "bullet"]);
          return expectDocument("a\n\n");
        });
      });
      test$7("a character that is its text node's only data", function(expectDocument) {
        getEditor().loadHTML("<div>a<br>b<br><strong>c</strong></div>");
        getSelectionManager().setLocationRange({
          index: 0,
          offset: 3
        });
        return pressCommandBackspace({
          replaceText: "b"
        }, function() {
          assert$7.locationRange({
            index: 0,
            offset: 2
          });
          return expectDocument("a\n\nc\n");
        });
      });
      return test$7("a formatted word", function(expectDocument) {
        getEditor().loadHTML("<div>a<strong>bc</strong></div>");
        getSelectionManager().setLocationRange({
          index: 0,
          offset: 4
        });
        return pressCommandBackspace({
          replaceElementWithText: "bc"
        }, function() {
          assert$7.locationRange({
            index: 0,
            offset: 1
          });
          return expectDocument("a\n");
        });
      });
    });
  });

  pressCommandBackspace = function({replaceText, replaceElementWithText}, callback) {
    var element, nextSibling, node, parentNode, previousSibling, range;
    triggerEvent$4(document.activeElement, "keydown", {
      charCode: 0,
      keyCode: 8,
      which: 8,
      metaKey: true
    });
    range = rangy.getSelection().getRangeAt(0);
    if (replaceElementWithText) {
      element = getElementWithText(replaceElementWithText);
      ({previousSibling} = element);
      element.parentNode.removeChild(element);
      range.collapseAfter(previousSibling);
    } else {
      range.findText(replaceText, {
        direction: "backward"
      });
      range.splitBoundaries();
      node = range.getNodes()[0];
      ({previousSibling, nextSibling, parentNode} = node);
      if ((previousSibling != null ? previousSibling.nodeType : void 0) === Node.COMMENT_NODE) {
        parentNode.removeChild(previousSibling);
      }
      node.data = "";
      parentNode.removeChild(node);
      if (!parentNode.hasChildNodes()) {
        parentNode.appendChild(document.createElement("br"));
      }
      range.collapseBefore(nextSibling != null ? nextSibling : parentNode.firstChild);
    }
    range.select();
    return requestAnimationFrame(callback);
  };

  getElementWithText = function(text) {
    var element, i, len, ref;
    ref = document.activeElement.querySelectorAll("*");
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      if (element.innerText === text) {
        return element;
      }
    }
    return null;
  };

  var assert$6, defer$4, test$6, testGroup$6;

  ({assert: assert$6, defer: defer$4, test: test$6, testGroup: testGroup$6} = Trix$2.TestHelpers);

  testGroup$6("Installation process", {
    template: "editor_html"
  }, function() {
    test$6("element.editorController", function() {
      return assert$6.ok(getEditorController() instanceof Trix$2.EditorController);
    });
    test$6("creates a contenteditable element", function() {
      return assert$6.ok(getEditorElement());
    });
    test$6("loads the initial document", function() {
      return assert$6.equal(getEditorElement().textContent, "Hello world");
    });
    return test$6("sets value property", function(done) {
      return defer$4(function() {
        assert$6.equal(getEditorElement().value, "<div>Hello world</div>");
        return done();
      });
    });
  });

  testGroup$6("Installation process without specified elements", {
    template: "editor_empty"
  }, function() {
    return test$6("creates identified toolbar and input elements", function(done) {
      var editorElement, inputElement, inputId, toolbarElement, toolbarId;
      editorElement = getEditorElement();
      toolbarId = editorElement.getAttribute("toolbar");
      assert$6.ok(/trix-toolbar-\d+/.test(toolbarId), `toolbar id not assert.ok ${JSON.stringify(toolbarId)}`);
      toolbarElement = document.getElementById(toolbarId);
      assert$6.ok(toolbarElement, "toolbar element not assert.ok");
      assert$6.equal(editorElement.toolbarElement, toolbarElement);
      inputId = editorElement.getAttribute("input");
      assert$6.ok(/trix-input-\d+/.test(inputId), `input id not assert.ok ${JSON.stringify(inputId)}`);
      inputElement = document.getElementById(inputId);
      assert$6.ok(inputElement, "input element not assert.ok");
      assert$6.equal(editorElement.inputElement, inputElement);
      return done();
    });
  });

  testGroup$6("Installation process with specified elements", {
    template: "editor_with_toolbar_and_input"
  }, function() {
    test$6("uses specified elements", function(done) {
      var editorElement;
      editorElement = getEditorElement();
      assert$6.equal(editorElement.toolbarElement, document.getElementById("my_toolbar"));
      assert$6.equal(editorElement.inputElement, document.getElementById("my_input"));
      assert$6.equal(editorElement.value, "<div>Hello world</div>");
      return done();
    });
    return test$6("can be cloned", function(done) {
      var clonedElement, originalElement, parentElement;
      originalElement = document.getElementById("my_editor");
      clonedElement = originalElement.cloneNode(true);
      ({parentElement} = originalElement);
      parentElement.removeChild(originalElement);
      parentElement.appendChild(clonedElement);
      return defer$4(function() {
        var editorElement;
        editorElement = getEditorElement();
        assert$6.equal(editorElement.toolbarElement, document.getElementById("my_toolbar"));
        assert$6.equal(editorElement.inputElement, document.getElementById("my_input"));
        assert$6.equal(editorElement.value, "<div>Hello world</div>");
        return done();
      });
    });
  });

  var after$2, assert$5, clickToolbarButton$5, createDataTransfer, createEvent, createFile$1, defer$3, inputEvents, insertNode$1, insertString$1, isToolbarButtonActive$2, paste, performInputTypeUsingExecCommand, recordInputEvent, selectAll, selectNode, test$5, testGroup$5, testIf$4, testOptions, triggerEvent$3, triggerInputEvent, typeCharacters$5;

  ({assert: assert$5, after: after$2, clickToolbarButton: clickToolbarButton$5, defer: defer$3, insertString: insertString$1, insertNode: insertNode$1, isToolbarButtonActive: isToolbarButtonActive$2, selectAll, selectNode, test: test$5, testIf: testIf$4, testGroup: testGroup$5, triggerEvent: triggerEvent$3, triggerInputEvent, typeCharacters: typeCharacters$5} = Trix$2.TestHelpers);

  test$5 = function() {
    return testIf$4(Trix$2.config.input.getLevel() === 2, ...arguments);
  };

  testOptions = {
    template: "editor_empty",
    setup: function() {
      addEventListener("beforeinput", recordInputEvent, true);
      return addEventListener("input", recordInputEvent, true);
    },
    teardown: function() {
      removeEventListener("beforeinput", recordInputEvent, true);
      return removeEventListener("input", recordInputEvent, true);
    }
  };

  inputEvents = [];

  recordInputEvent = function(event) {
    var data, inputType, type;
    // Not all browsers dispatch "beforeinput" event when calling execCommand() so
    // we manually dispatch a synthetic one. If a second one arrives, ignore it.
    if (event.type === "beforeinput" && inputEvents.length === 1 && inputEvents[0].type === "beforeinput") {
      return event.stopImmediatePropagation();
    } else {
      ({type, inputType, data} = event);
      return inputEvents.push({type, inputType, data});
    }
  };

  // Borrowed from https://github.com/web-platform-tests/wpt/blob/master/input-events/input-events-exec-command.html
  performInputTypeUsingExecCommand = function(command, {inputType, data}, callback) {
    inputEvents = [];
    return requestAnimationFrame(function() {
      triggerInputEvent(document.activeElement, "beforeinput", {inputType, data});
      document.execCommand(command, false, data);
      assert$5.equal(inputEvents.length, 2);
      assert$5.equal(inputEvents[0].type, "beforeinput");
      assert$5.equal(inputEvents[1].type, "input");
      assert$5.equal(inputEvents[0].inputType, inputType);
      assert$5.equal(inputEvents[0].data, data);
      return requestAnimationFrame(function() {
        return requestAnimationFrame(callback);
      });
    });
  };

  testGroup$5("Level 2 Input", testOptions, function() {
    test$5("insertText", function(expectDocument) {
      return performInputTypeUsingExecCommand("insertText", {
        inputType: "insertText",
        data: "abc"
      }, function() {
        return expectDocument("abc\n");
      });
    });
    test$5("insertOrderedList", function(expectDocument) {
      insertString$1("a\nb");
      return performInputTypeUsingExecCommand("insertOrderedList", {
        inputType: "insertOrderedList"
      }, function() {
        assert$5.blockAttributes([0, 2], []);
        assert$5.blockAttributes([2, 4], ["numberList", "number"]);
        assert$5.ok(isToolbarButtonActive$2({
          attribute: "number"
        }));
        return expectDocument("a\nb\n");
      });
    });
    test$5("insertUnorderedList", function(expectDocument) {
      insertString$1("a\nb");
      return performInputTypeUsingExecCommand("insertUnorderedList", {
        inputType: "insertUnorderedList"
      }, function() {
        assert$5.blockAttributes([0, 2], []);
        assert$5.blockAttributes([2, 4], ["bulletList", "bullet"]);
        assert$5.ok(isToolbarButtonActive$2({
          attribute: "bullet"
        }));
        return expectDocument("a\nb\n");
      });
    });
    test$5("insertLineBreak", function(expectDocument) {
      return clickToolbarButton$5({
        attribute: "quote"
      }, function() {
        insertString$1("abc");
        return performInputTypeUsingExecCommand("insertLineBreak", {
          inputType: "insertLineBreak"
        }, function() {
          return performInputTypeUsingExecCommand("insertLineBreak", {
            inputType: "insertLineBreak"
          }, function() {
            assert$5.blockAttributes([0, 6], ["quote"]);
            return expectDocument("abc\n\n\n");
          });
        });
      });
    });
    test$5("insertParagraph", function(expectDocument) {
      return clickToolbarButton$5({
        attribute: "quote"
      }, function() {
        insertString$1("abc");
        return performInputTypeUsingExecCommand("insertParagraph", {
          inputType: "insertParagraph"
        }, function() {
          return performInputTypeUsingExecCommand("insertParagraph", {
            inputType: "insertParagraph"
          }, function() {
            assert$5.blockAttributes([0, 4], ["quote"]);
            assert$5.blockAttributes([4, 5], []);
            return expectDocument("abc\n\n");
          });
        });
      });
    });
    test$5("formatBold", function(expectDocument) {
      insertString$1("abc");
      getComposition().setSelectedRange([1, 2]);
      return performInputTypeUsingExecCommand("bold", {
        inputType: "formatBold"
      }, function() {
        assert$5.textAttributes([0, 1], {});
        assert$5.textAttributes([1, 2], {
          bold: true
        });
        assert$5.textAttributes([2, 3], {});
        return expectDocument("abc\n");
      });
    });
    test$5("formatItalic", function(expectDocument) {
      insertString$1("abc");
      getComposition().setSelectedRange([1, 2]);
      return performInputTypeUsingExecCommand("italic", {
        inputType: "formatItalic"
      }, function() {
        assert$5.textAttributes([0, 1], {});
        assert$5.textAttributes([1, 2], {
          italic: true
        });
        assert$5.textAttributes([2, 3], {});
        return expectDocument("abc\n");
      });
    });
    test$5("formatStrikeThrough", function(expectDocument) {
      insertString$1("abc");
      getComposition().setSelectedRange([1, 2]);
      return performInputTypeUsingExecCommand("strikeThrough", {
        inputType: "formatStrikeThrough"
      }, function() {
        assert$5.textAttributes([0, 1], {});
        assert$5.textAttributes([1, 2], {
          strike: true
        });
        assert$5.textAttributes([2, 3], {});
        return expectDocument("abc\n");
      });
    });
    // https://input-inspector.now.sh/profiles/hVXS1cHYFvc2EfdRyTWQ
    test$5("correcting a misspelled word in Chrome", function(expectDocument) {
      insertString$1("onr");
      getComposition().setSelectedRange([0, 3]);
      return requestAnimationFrame(function() {
        var dataTransfer, event, inputType;
        inputType = "insertReplacementText";
        dataTransfer = createDataTransfer({
          "text/plain": "one"
        });
        event = createEvent("beforeinput", {inputType, dataTransfer});
        document.activeElement.dispatchEvent(event);
        return requestAnimationFrame(function() {
          return expectDocument("one\n");
        });
      });
    });
    // https://input-inspector.now.sh/profiles/XsZVwKtFxakwnsNs0qnX
    test$5("correcting a misspelled word in Safari", function(expectDocument) {
      insertString$1("onr");
      getComposition().setSelectedRange([0, 3]);
      return requestAnimationFrame(function() {
        var dataTransfer, event, inputType;
        inputType = "insertText";
        dataTransfer = createDataTransfer({
          "text/plain": "one",
          "text/html": "one"
        });
        event = createEvent("beforeinput", {inputType, dataTransfer});
        document.activeElement.dispatchEvent(event);
        return requestAnimationFrame(function() {
          return expectDocument("one\n");
        });
      });
    });
    // https://input-inspector.now.sh/profiles/yZlsrfG93QMzp2oyr0BE
    test$5("deleting the last character in a composed word on Android", function(expectDocument) {
      var element, textNode;
      insertString$1("c");
      element = getEditorElement();
      textNode = element.firstChild.lastChild;
      return selectNode(textNode, function() {
        triggerInputEvent(element, "beforeinput", {
          inputType: "insertCompositionText",
          data: ""
        });
        triggerEvent$3(element, "compositionend", {
          data: ""
        });
        return requestAnimationFrame(function() {
          return expectDocument("\n");
        });
      });
    });
    test$5("pasting a file", function(expectDocument) {
      return createFile$1(function(file) {
        var clipboardData, dataTransfer;
        clipboardData = createDataTransfer({
          "Files": [file]
        });
        dataTransfer = createDataTransfer({
          "Files": [file]
        });
        return paste({clipboardData, dataTransfer}, function() {
          var attachments;
          attachments = getDocument().getAttachments();
          assert$5.equal(attachments.length, 1);
          assert$5.equal(attachments[0].getFilename(), file.name);
          return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
        });
      });
    });
    // "insertFromPaste InputEvent missing pasted files in dataTransfer"
    // - https://bugs.webkit.org/show_bug.cgi?id=194921
    test$5("pasting a file in Safari", function(expectDocument) {
      return createFile$1(function(file) {
        var clipboardData, dataTransfer;
        clipboardData = createDataTransfer({
          "Files": [file]
        });
        dataTransfer = createDataTransfer({
          "text/html": `<img src="blob:${location.origin}/531de8">`
        });
        return paste({clipboardData, dataTransfer}, function() {
          var attachments;
          attachments = getDocument().getAttachments();
          assert$5.equal(attachments.length, 1);
          assert$5.equal(attachments[0].getFilename(), file.name);
          return expectDocument(`${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
        });
      });
    });
    // "insertFromPaste InputEvent missing text/uri-list in dataTransfer for pasted links"
    // - https://bugs.webkit.org/show_bug.cgi?id=196702
    test$5("pasting a link in Safari", function(expectDocument) {
      return createFile$1(function(file) {
        var clipboardData, dataTransfer, text, url;
        url = "https://bugs.webkit.org";
        text = "WebKit Bugzilla";
        clipboardData = createDataTransfer({
          "URL": url,
          "text/uri-list": url,
          "text/plain": text
        });
        dataTransfer = createDataTransfer({
          "text/html": `<a href="${url}">${text}</a>`,
          "text/plain": text
        });
        return paste({clipboardData, dataTransfer}, function() {
          assert$5.textAttributes([0, url.length], {
            href: url
          });
          return expectDocument(`${url}\n`);
        });
      });
    });
    // Pastes from MS Word include an image of the copied text 🙃
    // https://input-inspector.now.sh/profiles/QWDITsV60dpEVl1SOZg8
    test$5("pasting text from MS Word", function(expectDocument) {
      return createFile$1(function(file) {
        var clipboardData, dataTransfer;
        clipboardData = dataTransfer = createDataTransfer({
          "text/html": `<span class="MsoNormal">abc</span>`,
          "text/plain": "abc",
          "Files": [file]
        });
        return paste({dataTransfer}, function() {
          var attachments;
          attachments = getDocument().getAttachments();
          assert$5.equal(attachments.length, 0);
          return expectDocument("abc\n");
        });
      });
    });
    // "beforeinput" event is not fired for Paste and Match Style operations
    // - https://bugs.chromium.org/p/chromium/issues/detail?id=934448
    return test$5("Paste and Match Style in Chrome", function(expectDocument) {
      var done;
      done = function() {
        return expectDocument("a\n\nb\n\nc\n");
      };
      return typeCharacters$5("a\n\n", function() {
        var clipboardData, node, pasteEvent;
        clipboardData = createDataTransfer({
          "text/plain": "b\n\nc"
        });
        pasteEvent = createEvent("paste", {clipboardData});
        if (document.activeElement.dispatchEvent(pasteEvent)) {
          node = document.createElement("div");
          node.innerHTML = `<div>b</div><div><br></div><div>c</div>`;
          return insertNode$1(node, done);
        } else {
          return requestAnimationFrame(done);
        }
      });
    });
  });

  createFile$1 = function(callback) {
    var canvas;
    canvas = document.createElement("canvas");
    return canvas.toBlob(function(file) {
      file.name = "image.png";
      return callback(file);
    });
  };

  createDataTransfer = function(data = {}) {
    var key, ref;
    return {
      types: (function() {
        var results;
        results = [];
        for (key in data) {
          results.push(key);
        }
        return results;
      })(),
      files: (ref = data.Files) != null ? ref : [],
      getData: function(type) {
        return data[type];
      }
    };
  };

  createEvent = function(type, properties = {}) {
    var event, key, value;
    event = document.createEvent("Events");
    event.initEvent(type, true, true);
    for (key in properties) {
      value = properties[key];
      Object.defineProperty(event, key, {value});
    }
    return event;
  };

  paste = function({dataTransfer, clipboardData} = {}, callback) {
    var inputEvent, pasteEvent;
    pasteEvent = createEvent("paste", {
      clipboardData: clipboardData || dataTransfer
    });
    inputEvent = createEvent("beforeinput", {
      inputType: "insertFromPaste",
      dataTransfer: dataTransfer
    });
    if (document.activeElement.dispatchEvent(pasteEvent)) {
      document.activeElement.dispatchEvent(inputEvent);
    }
    return after$2(60, callback);
  };

  var assert$4, clickToolbarButton$4, defer$2, moveCursor$3, pressKey$2, test$4, testGroup$4, testIf$3, triggerEvent$2, typeCharacters$4;

  ({assert: assert$4, clickToolbarButton: clickToolbarButton$4, defer: defer$2, moveCursor: moveCursor$3, pressKey: pressKey$2, test: test$4, testIf: testIf$3, testGroup: testGroup$4, triggerEvent: triggerEvent$2, typeCharacters: typeCharacters$4} = Trix$2.TestHelpers);

  testGroup$4("List formatting", {
    template: "editor_empty"
  }, function() {
    test$4("creating a new list item", function(done) {
      return typeCharacters$4("a", function() {
        return clickToolbarButton$4({
          attribute: "bullet"
        }, function() {
          return typeCharacters$4("\n", function() {
            assert$4.locationRange({
              index: 1,
              offset: 0
            });
            assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
            assert$4.blockAttributes([2, 3], ["bulletList", "bullet"]);
            return done();
          });
        });
      });
    });
    test$4("breaking out of a list", function(expectDocument) {
      return typeCharacters$4("a", function() {
        return clickToolbarButton$4({
          attribute: "bullet"
        }, function() {
          return typeCharacters$4("\n\n", function() {
            assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
            assert$4.blockAttributes([2, 3], []);
            return expectDocument("a\n\n");
          });
        });
      });
    });
    test$4("pressing return at the beginning of a non-empty list item", function(expectDocument) {
      return clickToolbarButton$4({
        attribute: "bullet"
      }, function() {
        return typeCharacters$4("a\nb", function() {
          return moveCursor$3("left", function() {
            return pressKey$2("return", function() {
              assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
              assert$4.blockAttributes([2, 3], ["bulletList", "bullet"]);
              assert$4.blockAttributes([3, 5], ["bulletList", "bullet"]);
              return expectDocument("a\n\nb\n");
            });
          });
        });
      });
    });
    test$4("pressing tab increases nesting level, tab+shift decreases nesting level", function(expectDocument) {
      return clickToolbarButton$4({
        attribute: "bullet"
      }, function() {
        return typeCharacters$4("a", function() {
          return pressKey$2("return", function() {
            return pressKey$2("tab", function() {
              return typeCharacters$4("b", function() {
                assert$4.blockAttributes([0, 1], ["bulletList", "bullet"]);
                assert$4.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"]);
                return defer$2(function() {
                  var pressShiftTab;
                  pressShiftTab = triggerEvent$2(document.activeElement, "keydown", {
                    key: "Tab",
                    charCode: 0,
                    keyCode: 9,
                    which: 9,
                    shiftKey: true
                  });
                  assert$4.blockAttributes([0, 1], ["bulletList", "bullet"]);
                  assert$4.blockAttributes([2, 3], ["bulletList", "bullet"]);
                  return expectDocument("a\nb\n");
                });
              });
            });
          });
        });
      });
    });
    testIf$3(Trix$2.config.input.getLevel() === 0, "pressing shift-return at the end of a list item", function(expectDocument) {
      return clickToolbarButton$4({
        attribute: "bullet"
      }, function() {
        return typeCharacters$4("a", function() {
          var pressShiftReturn;
          pressShiftReturn = triggerEvent$2(document.activeElement, "keydown", {
            charCode: 0,
            keyCode: 13,
            which: 13,
            shiftKey: true
          });
          assert$4.notOk(pressShiftReturn); // Assert defaultPrevented
          assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
          return expectDocument("a\n\n");
        });
      });
    });
    test$4("pressing delete at the beginning of a non-empty nested list item", function(expectDocument) {
      return clickToolbarButton$4({
        attribute: "bullet"
      }, function() {
        return typeCharacters$4("a\n", function() {
          return clickToolbarButton$4({
            action: "increaseNestingLevel"
          }, function() {
            return typeCharacters$4("b\n", function() {
              return clickToolbarButton$4({
                action: "increaseNestingLevel"
              }, function() {
                return typeCharacters$4("c", function() {
                  getSelectionManager().setLocationRange({
                    index: 1,
                    offset: 0
                  });
                  getComposition().deleteInDirection("backward");
                  getEditorController().render();
                  return defer$2(function() {
                    assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
                    assert$4.blockAttributes([3, 4], ["bulletList", "bullet", "bulletList", "bullet"]);
                    return expectDocument("ab\nc\n");
                  });
                });
              });
            });
          });
        });
      });
    });
    return test$4("decreasing list item's level decreases its nested items level too", function(expectDocument) {
      return clickToolbarButton$4({
        attribute: "bullet"
      }, function() {
        return typeCharacters$4("a\n", function() {
          return clickToolbarButton$4({
            action: "increaseNestingLevel"
          }, function() {
            return typeCharacters$4("b\n", function() {
              return clickToolbarButton$4({
                action: "increaseNestingLevel"
              }, function() {
                return typeCharacters$4("c", function() {
                  var i, n;
                  getSelectionManager().setLocationRange({
                    index: 1,
                    offset: 1
                  });
                  for (n = i = 0; i < 3; n = ++i) {
                    getComposition().deleteInDirection("backward");
                    getEditorController().render();
                  }
                  assert$4.blockAttributes([0, 2], ["bulletList", "bullet"]);
                  assert$4.blockAttributes([2, 3], []);
                  assert$4.blockAttributes([3, 5], ["bulletList", "bullet"]);
                  return expectDocument("a\n\nc\n");
                });
              });
            });
          });
        });
      });
    });
  });

  var assert$3, clickToolbarButton$3, defer$1, insertNode, isToolbarButtonActive$1, test$3, testGroup$3, testIf$2, triggerEvent$1, typeCharacters$3;

  ({assert: assert$3, defer: defer$1, testIf: testIf$2, testGroup: testGroup$3, triggerEvent: triggerEvent$1, typeCharacters: typeCharacters$3, clickToolbarButton: clickToolbarButton$3, isToolbarButtonActive: isToolbarButtonActive$1, insertNode} = Trix$2.TestHelpers);

  test$3 = function() {
    return testIf$2(Trix$2.config.input.getLevel() === 0, ...arguments);
  };

  testGroup$3("Mutation input", {
    template: "editor_empty"
  }, function() {
    test$3("deleting a newline", function(expectDocument) {
      var br, element;
      element = getEditorElement();
      element.editor.insertString("a\n\nb");
      triggerEvent$1(element, "keydown", {
        charCode: 0,
        keyCode: 229,
        which: 229
      });
      br = element.querySelectorAll("br")[1];
      br.parentNode.removeChild(br);
      return requestAnimationFrame(function() {
        return expectDocument("a\nb\n");
      });
    });
    test$3("typing a space in formatted text at the end of a block", function(expectDocument) {
      var element;
      element = getEditorElement();
      return clickToolbarButton$3({
        attribute: "bold"
      }, function() {
        return typeCharacters$3("a", function() {
          var boldElement;
          // Press space key
          triggerEvent$1(element, "keydown", {
            charCode: 0,
            keyCode: 32,
            which: 32
          });
          triggerEvent$1(element, "keypress", {
            charCode: 32,
            keyCode: 32,
            which: 32
          });
          boldElement = element.querySelector("strong");
          boldElement.appendChild(document.createTextNode(" "));
          boldElement.appendChild(document.createElement("br"));
          return requestAnimationFrame(function() {
            assert$3.ok(isToolbarButtonActive$1({
              attribute: "bold"
            }));
            assert$3.textAttributes([0, 2], {
              bold: true
            });
            return expectDocument("a \n");
          });
        });
      });
    });
    test$3("typing formatted text after a newline at the end of block", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.insertHTML("<ul><li>a</li><li><br></li></ul>");
      element.editor.setSelectedRange(3);
      return clickToolbarButton$3({
        attribute: "bold"
      }, function() {
        var extraBR, node;
        // Press B key
        triggerEvent$1(element, "keydown", {
          charCode: 0,
          keyCode: 66,
          which: 66
        });
        triggerEvent$1(element, "keypress", {
          charCode: 98,
          keyCode: 98,
          which: 98
        });
        node = document.createTextNode("b");
        extraBR = element.querySelectorAll("br")[1];
        extraBR.parentNode.insertBefore(node, extraBR);
        extraBR.parentNode.removeChild(extraBR);
        return requestAnimationFrame(function() {
          assert$3.ok(isToolbarButtonActive$1({
            attribute: "bold"
          }));
          assert$3.textAttributes([0, 1], {});
          assert$3.textAttributes([3, 4], {
            bold: true
          });
          return expectDocument("a\n\nb\n");
        });
      });
    });
    test$3("typing an emoji after a newline at the end of block", function(expectDocument) {
      var element;
      element = getEditorElement();
      return typeCharacters$3("\n", function() {
        var extraBR, node;
        // Tap 👏🏻 on iOS
        triggerEvent$1(element, "keydown", {
          charCode: 0,
          keyCode: 0,
          which: 0,
          key: "👏🏻"
        });
        triggerEvent$1(element, "keypress", {
          charCode: 128079,
          keyCode: 128079,
          which: 128079,
          key: "👏🏻"
        });
        node = document.createTextNode("👏🏻");
        extraBR = element.querySelectorAll("br")[1];
        extraBR.parentNode.insertBefore(node, extraBR);
        extraBR.parentNode.removeChild(extraBR);
        return requestAnimationFrame(function() {
          return expectDocument("\n👏🏻\n");
        });
      });
    });
    test$3("backspacing an attachment at the beginning of an otherwise empty document", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.loadHTML(`<img src="${TEST_IMAGE_URL}" width="10" height="10">`);
      return requestAnimationFrame(function() {
        element.editor.setSelectedRange([0, 1]);
        triggerEvent$1(element, "keydown", {
          charCode: 0,
          keyCode: 8,
          which: 8
        });
        element.firstElementChild.innerHTML = "<br>";
        return requestAnimationFrame(function() {
          assert$3.locationRange({
            index: 0,
            offset: 0
          });
          return expectDocument("\n");
        });
      });
    });
    test$3("backspacing a block comment node", function(expectDocument) {
      var element;
      element = getEditorElement();
      element.editor.loadHTML(`<blockquote>a</blockquote><div>b</div>`);
      return defer$1(function() {
        var commentNode;
        element.editor.setSelectedRange(2);
        triggerEvent$1(element, "keydown", {
          charCode: 0,
          keyCode: 8,
          which: 8
        });
        commentNode = element.lastChild.firstChild;
        commentNode.parentNode.removeChild(commentNode);
        return defer$1(function() {
          assert$3.locationRange({
            index: 0,
            offset: 1
          });
          return expectDocument("ab\n");
        });
      });
    });
    return test$3("typing formatted text with autocapitalization on", function(expectDocument) {
      var element;
      element = getEditorElement();
      return clickToolbarButton$3({
        attribute: "bold"
      }, function() {
        // Type "b", autocapitalize to "B"
        triggerEvent$1(element, "keydown", {
          charCode: 0,
          keyCode: 66,
          which: 66
        });
        triggerEvent$1(element, "keypress", {
          charCode: 98,
          keyCode: 98,
          which: 98
        });
        triggerEvent$1(element, "textInput", {
          data: "B"
        });
        return insertNode(document.createTextNode("B"), function() {
          assert$3.ok(isToolbarButtonActive$1({
            attribute: "bold"
          }));
          assert$3.textAttributes([0, 1], {
            bold: true
          });
          return expectDocument("B\n");
        });
      });
    });
  });

  var after$1, assert$2, clickToolbarButton$2, createFile, defer, expandSelection$2, moveCursor$2, pasteContent, pressKey$1, test$2, testGroup$2, testIf$1, triggerEvent, typeCharacters$2;

  ({after: after$1, assert: assert$2, clickToolbarButton: clickToolbarButton$2, createFile, defer, expandSelection: expandSelection$2, moveCursor: moveCursor$2, pasteContent, pressKey: pressKey$1, test: test$2, testIf: testIf$1, testGroup: testGroup$2, triggerEvent, typeCharacters: typeCharacters$2} = Trix$2.TestHelpers);

  testGroup$2("Pasting", {
    template: "editor_empty"
  }, function() {
    test$2("paste plain text", function(expectDocument) {
      return typeCharacters$2("abc", function() {
        return moveCursor$2("left", function() {
          return pasteContent("text/plain", "!", function() {
            return expectDocument("ab!c\n");
          });
        });
      });
    });
    test$2("paste simple html", function(expectDocument) {
      return typeCharacters$2("abc", function() {
        return moveCursor$2("left", function() {
          return pasteContent("text/html", "&lt;", function() {
            return expectDocument("ab<c\n");
          });
        });
      });
    });
    test$2("paste complex html", function(expectDocument) {
      return typeCharacters$2("abc", function() {
        return moveCursor$2("left", function() {
          return pasteContent("text/html", "<div>Hello world<br></div><div>This is a test</div>", function() {
            return expectDocument("abHello world\nThis is a test\nc\n");
          });
        });
      });
    });
    test$2("paste html in expanded selection", function(expectDocument) {
      return typeCharacters$2("abc", function() {
        return moveCursor$2("left", function() {
          return expandSelection$2({
            direction: "left",
            times: 2
          }, function() {
            return pasteContent("text/html", "<strong>x</strong>", function() {
              assert$2.selectedRange(1);
              return expectDocument("xc\n");
            });
          });
        });
      });
    });
    test$2("paste plain text with CRLF ", function(expectDocument) {
      return pasteContent("text/plain", "a\r\nb\r\nc", function() {
        return expectDocument("a\nb\nc\n");
      });
    });
    test$2("paste html with CRLF ", function(expectDocument) {
      return pasteContent("text/html", "<div>a<br></div>\r\n<div>b<br></div>\r\n<div>c<br></div>", function() {
        return expectDocument("a\nb\nc\n");
      });
    });
    test$2("paste unsafe html", function(done) {
      var pasteData;
      window.unsanitized = [];
      pasteData = {
        "text/plain": "x",
        "text/html": `<img onload="window.unsanitized.push('img.onload');" src="${TEST_IMAGE_URL}">
<img onerror="window.unsanitized.push('img.onerror');" src="data:image/gif;base64,TOTALLYBOGUS">
<script>
  window.unsanitized.push('script tag');
</script>`
      };
      return pasteContent(pasteData, function() {
        return after$1(20, function() {
          assert$2.deepEqual(window.unsanitized, []);
          delete window.unsanitized;
          return done();
        });
      });
    });
    test$2("prefers plain text when html lacks formatting", function(expectDocument) {
      var pasteData;
      pasteData = {
        "text/html": "<meta charset='utf-8'>a\nb",
        "text/plain": "a\nb"
      };
      return pasteContent(pasteData, function() {
        return expectDocument("a\nb\n");
      });
    });
    test$2("prefers formatted html", function(expectDocument) {
      var pasteData;
      pasteData = {
        "text/html": "<meta charset='utf-8'>a\n<strong>b</strong>",
        "text/plain": "a\nb"
      };
      return pasteContent(pasteData, function() {
        return expectDocument("a b\n");
      });
    });
    test$2("paste URL", function(expectDocument) {
      return typeCharacters$2("a", function() {
        return pasteContent("URL", "http://example.com", function() {
          assert$2.textAttributes([1, 18], {
            href: "http://example.com"
          });
          return expectDocument("ahttp://example.com\n");
        });
      });
    });
    test$2("paste URL with name", function(expectDocument) {
      var pasteData;
      pasteData = {
        "URL": "http://example.com",
        "public.url-name": "Example",
        "text/plain": "http://example.com"
      };
      return pasteContent(pasteData, function() {
        assert$2.textAttributes([0, 7], {
          href: "http://example.com"
        });
        return expectDocument("Example\n");
      });
    });
    test$2("paste JavaScript URL", function(expectDocument) {
      var pasteData;
      pasteData = {
        "URL": "javascript:alert('XSS')"
      };
      return pasteContent(pasteData, function() {
        assert$2.textAttributes([0, 23], {});
        return expectDocument("javascript:alert('XSS')\n");
      });
    });
    test$2("paste URL with name containing extraneous whitespace", function(expectDocument) {
      var pasteData;
      pasteData = {
        "URL": "http://example.com",
        "public.url-name": "   Example from \n link  around\n\nnested \nelements ",
        "text/plain": "http://example.com"
      };
      return pasteContent(pasteData, function() {
        assert$2.textAttributes([0, 40], {
          href: "http://example.com"
        });
        return expectDocument("Example from link around nested elements\n");
      });
    });
    test$2("paste complex html into formatted block", function(done) {
      return typeCharacters$2("abc", function() {
        return clickToolbarButton$2({
          attribute: "quote"
        }, function() {
          return pasteContent("text/html", "<div>Hello world<br></div><pre>This is a test</pre>", function() {
            var block, document;
            document = getDocument();
            assert$2.equal(document.getBlockCount(), 2);
            block = document.getBlockAtIndex(0);
            assert$2.deepEqual(block.getAttributes(), ["quote"], assert$2.equal(block.toString(), "abcHello world\n"));
            block = document.getBlockAtIndex(1);
            assert$2.deepEqual(block.getAttributes(), ["quote", "code"]);
            assert$2.equal(block.toString(), "This is a test\n");
            return done();
          });
        });
      });
    });
    test$2("paste list into list", function(done) {
      return clickToolbarButton$2({
        attribute: "bullet"
      }, function() {
        return typeCharacters$2("abc\n", function() {
          return pasteContent("text/html", "<ul><li>one</li><li>two</li></ul>", function() {
            var block, document;
            document = getDocument();
            assert$2.equal(document.getBlockCount(), 3);
            block = document.getBlockAtIndex(0);
            assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
            assert$2.equal(block.toString(), "abc\n");
            block = document.getBlockAtIndex(1);
            assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
            assert$2.equal(block.toString(), "one\n");
            block = document.getBlockAtIndex(2);
            assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
            assert$2.equal(block.toString(), "two\n");
            return done();
          });
        });
      });
    });
    test$2("paste list into quote", function(done) {
      return clickToolbarButton$2({
        attribute: "quote"
      }, function() {
        return typeCharacters$2("abc", function() {
          return pasteContent("text/html", "<ul><li>one</li><li>two</li></ul>", function() {
            var block, document;
            document = getDocument();
            assert$2.equal(document.getBlockCount(), 3);
            block = document.getBlockAtIndex(0);
            assert$2.deepEqual(block.getAttributes(), ["quote"]);
            assert$2.equal(block.toString(), "abc\n");
            block = document.getBlockAtIndex(1);
            assert$2.deepEqual(block.getAttributes(), ["quote", "bulletList", "bullet"]);
            assert$2.equal(block.toString(), "one\n");
            block = document.getBlockAtIndex(2);
            assert$2.deepEqual(block.getAttributes(), ["quote", "bulletList", "bullet"]);
            assert$2.equal(block.toString(), "two\n");
            return done();
          });
        });
      });
    });
    test$2("paste list into quoted list", function(done) {
      return clickToolbarButton$2({
        attribute: "quote"
      }, function() {
        return clickToolbarButton$2({
          attribute: "bullet"
        }, function() {
          return typeCharacters$2("abc\n", function() {
            return pasteContent("text/html", "<ul><li>one</li><li>two</li></ul>", function() {
              var block, document;
              document = getDocument();
              assert$2.equal(document.getBlockCount(), 3);
              block = document.getBlockAtIndex(0);
              assert$2.deepEqual(block.getAttributes(), ["quote", "bulletList", "bullet"]);
              assert$2.equal(block.toString(), "abc\n");
              block = document.getBlockAtIndex(1);
              assert$2.deepEqual(block.getAttributes(), ["quote", "bulletList", "bullet"]);
              assert$2.equal(block.toString(), "one\n");
              block = document.getBlockAtIndex(2);
              assert$2.deepEqual(block.getAttributes(), ["quote", "bulletList", "bullet"]);
              assert$2.equal(block.toString(), "two\n");
              return done();
            });
          });
        });
      });
    });
    test$2("paste nested list into empty list item", function(done) {
      return clickToolbarButton$2({
        attribute: "bullet"
      }, function() {
        return typeCharacters$2("y\nzz", function() {
          getSelectionManager().setLocationRange({
            index: 0,
            offset: 1
          });
          return defer(function() {
            return pressKey$1("backspace", function() {
              var block, document;
              pasteContent("text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", function() {});
              document = getDocument();
              assert$2.equal(document.getBlockCount(), 3);
              block = document.getBlockAtIndex(0);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
              assert$2.equal(block.toString(), "a\n");
              block = document.getBlockAtIndex(1);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet", "bulletList", "bullet"]);
              assert$2.equal(block.toString(), "b\n");
              block = document.getBlockAtIndex(2);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
              assert$2.equal(block.toString(), "zz\n");
              return done();
            });
          });
        });
      });
    });
    test$2("paste nested list over list item contents", function(done) {
      return clickToolbarButton$2({
        attribute: "bullet"
      }, function() {
        return typeCharacters$2("y\nzz", function() {
          getSelectionManager().setLocationRange({
            index: 0,
            offset: 1
          });
          return defer(function() {
            return expandSelection$2("left", function() {
              var block, document;
              pasteContent("text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", function() {});
              document = getDocument();
              assert$2.equal(document.getBlockCount(), 3);
              block = document.getBlockAtIndex(0);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
              assert$2.equal(block.toString(), "a\n");
              block = document.getBlockAtIndex(1);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet", "bulletList", "bullet"]);
              assert$2.equal(block.toString(), "b\n");
              block = document.getBlockAtIndex(2);
              assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
              assert$2.equal(block.toString(), "zz\n");
              return done();
            });
          });
        });
      });
    });
    test$2("paste list into empty block before list", function(done) {
      return clickToolbarButton$2({
        attribute: "bullet"
      }, function() {
        return typeCharacters$2("c", function() {
          return moveCursor$2("left", function() {
            return pressKey$1("return", function() {
              getSelectionManager().setLocationRange({
                index: 0,
                offset: 0
              });
              return defer(function() {
                return pasteContent("text/html", "<ul><li>a</li><li>b</li></ul>", function() {
                  var block, document;
                  document = getDocument();
                  assert$2.equal(document.getBlockCount(), 3);
                  block = document.getBlockAtIndex(0);
                  assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
                  assert$2.equal(block.toString(), "a\n");
                  block = document.getBlockAtIndex(1);
                  assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
                  assert$2.equal(block.toString(), "b\n");
                  block = document.getBlockAtIndex(2);
                  assert$2.deepEqual(block.getAttributes(), ["bulletList", "bullet"]);
                  assert$2.equal(block.toString(), "c\n");
                  return done();
                });
              });
            });
          });
        });
      });
    });
    test$2("paste file", function(expectDocument) {
      return typeCharacters$2("a", function() {
        return pasteContent("Files", createFile(), function() {
          return expectDocument(`a${Trix$2.OBJECT_REPLACEMENT_CHARACTER}\n`);
        });
      });
    });
    return testIf$1(Trix$2.config.input.getLevel() === 0, "paste event with no clipboardData", function(expectDocument) {
      return typeCharacters$2("a", function() {
        triggerEvent(document.activeElement, "paste");
        document.activeElement.insertAdjacentHTML("beforeend", "<span>bc</span>");
        return requestAnimationFrame(function() {
          return expectDocument("abc\n");
        });
      });
    });
  });

  var assert$1, clickElement, clickToolbarButton$1, clickToolbarDialogButton, collapseSelection, expandSelection$1, insertString, insertText, isToolbarButtonActive, isToolbarButtonDisabled, isToolbarDialogActive, moveCursor$1, pressKey, test$1, testGroup$1, testIf, typeCharacters$1, typeInToolbarDialog, typeToolbarKeyCommand;

  ({assert: assert$1, clickElement, clickToolbarButton: clickToolbarButton$1, clickToolbarDialogButton, collapseSelection, expandSelection: expandSelection$1, insertString, insertText, isToolbarButtonActive, isToolbarButtonDisabled, isToolbarDialogActive, moveCursor: moveCursor$1, pressKey, test: test$1, testIf, testGroup: testGroup$1, typeCharacters: typeCharacters$1, typeInToolbarDialog, typeToolbarKeyCommand} = Trix$2.TestHelpers);

  testGroup$1("Text formatting", {
    template: "editor_empty"
  }, function() {
    test$1("applying attributes to text", function(done) {
      return typeCharacters$1("abc", function() {
        return expandSelection$1("left", function() {
          return clickToolbarButton$1({
            attribute: "bold"
          }, function() {
            assert$1.textAttributes([0, 2], {});
            assert$1.textAttributes([2, 3], {
              bold: true
            });
            assert$1.textAttributes([3, 4], {
              blockBreak: true
            });
            return done();
          });
        });
      });
    });
    test$1("applying a link to text", function(done) {
      return typeCharacters$1("abc", function() {
        return moveCursor$1("left", function() {
          return expandSelection$1("left", function() {
            return clickToolbarButton$1({
              attribute: "href"
            }, function() {
              assert$1.ok(isToolbarDialogActive({
                attribute: "href"
              }));
              return typeInToolbarDialog("http://example.com", {
                attribute: "href"
              }, function() {
                assert$1.textAttributes([0, 1], {});
                assert$1.textAttributes([1, 2], {
                  href: "http://example.com"
                });
                assert$1.textAttributes([2, 3], {});
                return done();
              });
            });
          });
        });
      });
    });
    test$1("inserting a link", function(expectDocument) {
      return typeCharacters$1("a", function() {
        return clickToolbarButton$1({
          attribute: "href"
        }, function() {
          assert$1.ok(isToolbarDialogActive({
            attribute: "href"
          }));
          return typeInToolbarDialog("http://example.com", {
            attribute: "href"
          }, function() {
            assert$1.textAttributes([0, 1], {});
            assert$1.textAttributes([1, 19], {
              href: "http://example.com"
            });
            return expectDocument("ahttp://example.com\n");
          });
        });
      });
    });
    test$1("editing a link", function(done) {
      var text;
      insertString("a");
      text = Trix$2.Text.textForStringWithAttributes("bc", {
        href: "http://example.com"
      });
      insertText(text);
      insertString("d");
      return moveCursor$1({
        direction: "left",
        times: 2
      }, function() {
        return clickToolbarButton$1({
          attribute: "href"
        }, function() {
          assert$1.ok(isToolbarDialogActive({
            attribute: "href"
          }));
          assert$1.locationRange({
            index: 0,
            offset: 1
          }, {
            index: 0,
            offset: 3
          });
          return typeInToolbarDialog("http://example.org", {
            attribute: "href"
          }, function() {
            assert$1.textAttributes([0, 1], {});
            assert$1.textAttributes([1, 3], {
              href: "http://example.org"
            });
            assert$1.textAttributes([3, 4], {});
            return done();
          });
        });
      });
    });
    test$1("removing a link", function(done) {
      var text;
      text = Trix$2.Text.textForStringWithAttributes("ab", {
        href: "http://example.com"
      });
      insertText(text);
      assert$1.textAttributes([0, 2], {
        href: "http://example.com"
      });
      return expandSelection$1({
        direction: "left",
        times: 2
      }, function() {
        return clickToolbarButton$1({
          attribute: "href"
        }, function() {
          return clickToolbarDialogButton({
            method: "removeAttribute"
          }, function() {
            assert$1.textAttributes([0, 2], {});
            return done();
          });
        });
      });
    });
    test$1("selecting an attachment disables text formatting", function(done) {
      var text;
      text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak();
      insertText(text);
      return typeCharacters$1("a", function() {
        assert$1.notOk(isToolbarButtonDisabled({
          attribute: "bold"
        }));
        return expandSelection$1("left", function() {
          assert$1.notOk(isToolbarButtonDisabled({
            attribute: "bold"
          }));
          return expandSelection$1("left", function() {
            assert$1.ok(isToolbarButtonDisabled({
              attribute: "bold"
            }));
            return done();
          });
        });
      });
    });
    test$1("selecting an attachment deactivates toolbar dialog", function(done) {
      var text;
      text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak();
      insertText(text);
      return clickToolbarButton$1({
        attribute: "href"
      }, function() {
        assert$1.ok(isToolbarDialogActive({
          attribute: "href"
        }));
        return clickElement(getEditorElement().querySelector("figure"), function() {
          assert$1.notOk(isToolbarDialogActive({
            attribute: "href"
          }));
          assert$1.ok(isToolbarButtonDisabled({
            attribute: "href"
          }));
          return done();
        });
      });
    });
    test$1("typing over a selected attachment does not apply disabled formatting attributes", function(expectDocument) {
      var text;
      text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak();
      insertText(text);
      return expandSelection$1("left", function() {
        assert$1.ok(isToolbarButtonDisabled({
          attribute: "bold"
        }));
        return typeCharacters$1("a", function() {
          assert$1.textAttributes([0, 1], {});
          return expectDocument("a\n");
        });
      });
    });
    test$1("applying a link to an attachment with a host-provided href", function(done) {
      var text;
      text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak();
      insertText(text);
      return typeCharacters$1("a", function() {
        assert$1.notOk(isToolbarButtonDisabled({
          attribute: "href"
        }));
        return expandSelection$1("left", function() {
          assert$1.notOk(isToolbarButtonDisabled({
            attribute: "href"
          }));
          return expandSelection$1("left", function() {
            assert$1.ok(isToolbarButtonDisabled({
              attribute: "href"
            }));
            return done();
          });
        });
      });
    });
    test$1("typing after a link", function(done) {
      return typeCharacters$1("ab", function() {
        return expandSelection$1({
          direction: "left",
          times: 2
        }, function() {
          return clickToolbarButton$1({
            attribute: "href"
          }, function() {
            return typeInToolbarDialog("http://example.com", {
              attribute: "href"
            }, function() {
              return collapseSelection("right", function() {
                assert$1.locationRange({
                  index: 0,
                  offset: 2
                });
                return typeCharacters$1("c", function() {
                  assert$1.textAttributes([0, 2], {
                    href: "http://example.com"
                  });
                  assert$1.textAttributes([2, 3], {});
                  return moveCursor$1("left", function() {
                    assert$1.notOk(isToolbarButtonActive({
                      attribute: "href"
                    }));
                    return moveCursor$1("left", function() {
                      assert$1.ok(isToolbarButtonActive({
                        attribute: "href"
                      }));
                      return done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    test$1("applying formatting and then typing", function(done) {
      return typeCharacters$1("a", function() {
        return clickToolbarButton$1({
          attribute: "bold"
        }, function() {
          return typeCharacters$1("bcd", function() {
            return clickToolbarButton$1({
              attribute: "bold"
            }, function() {
              return typeCharacters$1("e", function() {
                assert$1.textAttributes([0, 1], {});
                assert$1.textAttributes([1, 4], {
                  bold: true
                });
                assert$1.textAttributes([4, 5], {});
                return done();
              });
            });
          });
        });
      });
    });
    test$1("applying formatting and then moving the cursor away", function(done) {
      return typeCharacters$1("abc", function() {
        return moveCursor$1("left", function() {
          assert$1.notOk(isToolbarButtonActive({
            attribute: "bold"
          }));
          return clickToolbarButton$1({
            attribute: "bold"
          }, function() {
            assert$1.ok(isToolbarButtonActive({
              attribute: "bold"
            }));
            return moveCursor$1("right", function() {
              assert$1.notOk(isToolbarButtonActive({
                attribute: "bold"
              }));
              return moveCursor$1("left", function() {
                assert$1.notOk(isToolbarButtonActive({
                  attribute: "bold"
                }));
                assert$1.textAttributes([0, 3], {});
                assert$1.textAttributes([3, 4], {
                  blockBreak: true
                });
                return done();
              });
            });
          });
        });
      });
    });
    test$1("applying formatting to an unfocused editor", function(done) {
      var input;
      input = Trix$2.makeElement("input", {
        type: "text"
      });
      document.body.appendChild(input);
      input.focus();
      return clickToolbarButton$1({
        attribute: "bold"
      }, function() {
        return typeCharacters$1("a", function() {
          assert$1.textAttributes([0, 1], {
            bold: true
          });
          document.body.removeChild(input);
          return done();
        });
      });
    });
    test$1("editing formatted text", function(done) {
      return clickToolbarButton$1({
        attribute: "bold"
      }, function() {
        return typeCharacters$1("ab", function() {
          return clickToolbarButton$1({
            attribute: "bold"
          }, function() {
            return typeCharacters$1("c", function() {
              assert$1.notOk(isToolbarButtonActive({
                attribute: "bold"
              }));
              return moveCursor$1("left", function() {
                assert$1.ok(isToolbarButtonActive({
                  attribute: "bold"
                }));
                return moveCursor$1("left", function() {
                  assert$1.ok(isToolbarButtonActive({
                    attribute: "bold"
                  }));
                  return typeCharacters$1("Z", function() {
                    assert$1.ok(isToolbarButtonActive({
                      attribute: "bold"
                    }));
                    assert$1.textAttributes([0, 3], {
                      bold: true
                    });
                    assert$1.textAttributes([3, 4], {});
                    assert$1.textAttributes([4, 5], {
                      blockBreak: true
                    });
                    return moveCursor$1("right", function() {
                      assert$1.ok(isToolbarButtonActive({
                        attribute: "bold"
                      }));
                      return moveCursor$1("right", function() {
                        assert$1.notOk(isToolbarButtonActive({
                          attribute: "bold"
                        }));
                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    testIf(Trix$2.config.input.getLevel() === 0, "key command activates toolbar button", function(done) {
      return typeToolbarKeyCommand({
        attribute: "bold"
      }, function() {
        assert$1.ok(isToolbarButtonActive({
          attribute: "bold"
        }));
        return done();
      });
    });
    return test$1("backspacing newline after text", function(expectDocument) {
      return typeCharacters$1("a\n", function() {
        return pressKey("backspace", function() {
          return expectDocument("a\n");
        });
      });
    });
  });

  var assert, clickToolbarButton, expandSelection, moveCursor, test, testGroup, typeCharacters;

  ({assert, clickToolbarButton, expandSelection, moveCursor, test, testGroup, typeCharacters} = Trix$2.TestHelpers);

  testGroup("Undo/Redo", {
    template: "editor_empty"
  }, function() {
    test("typing and undoing", function(done) {
      var first;
      first = getDocument().copy();
      return typeCharacters("abc", function() {
        assert.notOk(getDocument().isEqualTo(first));
        return clickToolbarButton({
          action: "undo"
        }, function() {
          assert.ok(getDocument().isEqualTo(first));
          return done();
        });
      });
    });
    test("typing, formatting, typing, and undoing", function(done) {
      var first;
      first = getDocument().copy();
      return typeCharacters("abc", function() {
        var second;
        second = getDocument().copy();
        return clickToolbarButton({
          attribute: "bold"
        }, function() {
          return typeCharacters("def", function() {
            var third;
            third = getDocument().copy();
            return clickToolbarButton({
              action: "undo"
            }, function() {
              assert.ok(getDocument().isEqualTo(second));
              return clickToolbarButton({
                action: "undo"
              }, function() {
                assert.ok(getDocument().isEqualTo(first));
                return clickToolbarButton({
                  action: "redo"
                }, function() {
                  assert.ok(getDocument().isEqualTo(second));
                  return clickToolbarButton({
                    action: "redo"
                  }, function() {
                    assert.ok(getDocument().isEqualTo(third));
                    return done();
                  });
                });
              });
            });
          });
        });
      });
    });
    test("formatting changes are batched by location range", function(done) {
      return typeCharacters("abc", function() {
        var first;
        first = getDocument().copy();
        return expandSelection("left", function() {
          return clickToolbarButton({
            attribute: "bold"
          }, function() {
            return clickToolbarButton({
              attribute: "italic"
            }, function() {
              var second;
              second = getDocument().copy();
              return moveCursor("left", function() {
                return expandSelection("left", function() {
                  return clickToolbarButton({
                    attribute: "italic"
                  }, function() {
                    var third;
                    third = getDocument().copy();
                    return clickToolbarButton({
                      action: "undo"
                    }, function() {
                      assert.ok(getDocument().isEqualTo(second));
                      return clickToolbarButton({
                        action: "undo"
                      }, function() {
                        assert.ok(getDocument().isEqualTo(first));
                        return clickToolbarButton({
                          action: "redo"
                        }, function() {
                          assert.ok(getDocument().isEqualTo(second));
                          return clickToolbarButton({
                            action: "redo"
                          }, function() {
                            assert.ok(getDocument().isEqualTo(third));
                            return done();
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
    return test("block formatting are undoable", function(done) {
      return typeCharacters("abc", function() {
        var first;
        first = getDocument().copy();
        return clickToolbarButton({
          attribute: "heading1"
        }, function() {
          var second;
          second = getDocument().copy();
          return clickToolbarButton({
            action: "undo"
          }, function() {
            assert.ok(getDocument().isEqualTo(first));
            return clickToolbarButton({
              action: "redo"
            }, function() {
              assert.ok(getDocument().isEqualTo(second));
              return done();
            });
          });
        });
      });
    });
  });

  Trix$2.config.undoInterval = 0;

  QUnit.config.hidepassed = true;

  QUnit.config.testTimeout = 20000;

  document.head.insertAdjacentHTML("beforeend", `<style type="text/css">
  #trix-container { height: 150px; }
  trix-toolbar { margin-bottom: 10px; }
  trix-toolbar button { border: 1px solid #ccc; background: #fff; }
  trix-toolbar button.active { background: #d3e6fd; }
  trix-toolbar button:disabled { color: #ccc; }
</style>`);

})));
