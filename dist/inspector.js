/*
Trix 2.0.0-alpha
Copyright © 2022 Basecamp, LLC
 */
/* eslint-disable
    id-length,
*/
const arraysAreEqual = function () {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index++) {
    const value = a[index];

    if (value !== b[index]) {
      return false;
    }
  }

  return true;
};
const arrayStartsWith = function () {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return arraysAreEqual(a.slice(0, b.length), b);
};
const spliceArray = function (array) {
  const result = array.slice(0);

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  result.splice(...args);
  return result;
};
const summarizeArrayChange = function () {
  let oldArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let newArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const added = [];
  const removed = [];
  const existingValues = new Set();
  oldArray.forEach(value => {
    existingValues.add(value);
  });
  const currentValues = new Set();
  newArray.forEach(value => {
    currentValues.add(value);

    if (!existingValues.has(value)) {
      added.push(value);
    }
  });
  oldArray.forEach(value => {
    if (!currentValues.has(value)) {
      removed.push(value);
    }
  });
  return {
    added,
    removed
  };
};

const attachmentSelector = "[data-trix-attachment]";
const attachments = {
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

const attributes = {
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

    test(element) {
      return tagName$1(element.parentNode) === attributes[this.listAttribute].tagName;
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

    test(element) {
      return tagName$1(element.parentNode) === attributes[this.listAttribute].tagName;
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

const tagName$1 = element => {
  var _element$tagName;

  return element === null || element === void 0 ? void 0 : (_element$tagName = element.tagName) === null || _element$tagName === void 0 ? void 0 : _element$tagName.toLowerCase();
};

var browser = {
  // Android emits composition events when moving the cursor through existing text
  // Introduced in Chrome 65: https://bugs.chromium.org/p/chromium/issues/detail?id=764439#c9
  composesExistingText: /Android.*Chrome/.test(navigator.userAgent),
  // IE 11 activates resizing handles on editable elements that have "layout"
  forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent),
  // https://www.w3.org/TR/input-events-1/ + https://www.w3.org/TR/input-events-2/
  supportsInputEvents: function () {
    if (typeof InputEvent === "undefined") {
      return false;
    }

    for (const property of ["data", "getTargetRanges", "inputType"]) {
      if (!(property in InputEvent.prototype)) {
        return false;
      }
    }

    return true;
  }()
};

var css = {
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

var lang = {
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

/* eslint-disable
    no-case-declarations,
*/
const sizes = [lang.bytes, lang.KB, lang.MB, lang.GB, lang.TB, lang.PB];
var fileSize = {
  prefix: "IEC",
  precision: 2,

  formatter(number) {
    switch (number) {
      case 0:
        return "0 ".concat(lang.bytes);

      case 1:
        return "1 ".concat(lang.byte);

      default:
        let base;

        if (this.prefix === "SI") {
          base = 1000;
        } else if (this.prefix === "IEC") {
          base = 1024;
        }

        const exp = Math.floor(Math.log(number) / Math.log(base));
        const humanSize = number / Math.pow(base, exp);
        const string = humanSize.toFixed(this.precision);
        const withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "");
        return "".concat(withoutInsignificantZeros, " ").concat(sizes[exp]);
    }
  }

};

const input = {
  level2Enabled: true,

  getLevel() {
    if (this.level2Enabled && browser.supportsInputEvents) {
      return 2;
    } else {
      return 0;
    }
  }

};

var keyNames = {
  8: "backspace",
  9: "tab",
  13: "return",
  27: "escape",
  37: "left",
  39: "right",
  46: "delete",
  68: "d",
  72: "h",
  79: "o"
};

var textAttributes = {
  bold: {
    tagName: "strong",
    inheritable: true,

    parser(element) {
      const style = window.getComputedStyle(element);
      return style.fontWeight === "bold" || style.fontWeight >= 600;
    }

  },
  italic: {
    tagName: "em",
    inheritable: true,

    parser(element) {
      const style = window.getComputedStyle(element);
      return style.fontStyle === "italic";
    }

  },
  href: {
    groupTagName: "a",

    parser(element) {
      const matchingSelector = "a:not(".concat(attachmentSelector, ")");
      const link = element.closest(matchingSelector);

      if (link) {
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
      backgroundColor: "highlight"
    }
  }
};

var toolbar = {
  getDefaultHTML() {
    return "<div class=\"trix-button-row\">\n  <span class=\"trix-button-group trix-button-group--text-tools\" data-trix-button-group=\"text-tools\">\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-bold\" data-trix-attribute=\"bold\" data-trix-key=\"b\" title=\"".concat(lang.bold, "\" tabindex=\"-1\">").concat(lang.bold, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-italic\" data-trix-attribute=\"italic\" data-trix-key=\"i\" title=\"").concat(lang.italic, "\" tabindex=\"-1\">").concat(lang.italic, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-strike\" data-trix-attribute=\"strike\" title=\"").concat(lang.strike, "\" tabindex=\"-1\">").concat(lang.strike, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-link\" data-trix-attribute=\"href\" data-trix-action=\"link\" data-trix-key=\"k\" title=\"").concat(lang.link, "\" tabindex=\"-1\">").concat(lang.link, "</button>\n  </span>\n\n  <span class=\"trix-button-group trix-button-group--block-tools\" data-trix-button-group=\"block-tools\">\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-heading-1\" data-trix-attribute=\"heading1\" title=\"").concat(lang.heading1, "\" tabindex=\"-1\">").concat(lang.heading1, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-quote\" data-trix-attribute=\"quote\" title=\"").concat(lang.quote, "\" tabindex=\"-1\">").concat(lang.quote, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-code\" data-trix-attribute=\"code\" title=\"").concat(lang.code, "\" tabindex=\"-1\">").concat(lang.code, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-bullet-list\" data-trix-attribute=\"bullet\" title=\"").concat(lang.bullets, "\" tabindex=\"-1\">").concat(lang.bullets, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-number-list\" data-trix-attribute=\"number\" title=\"").concat(lang.numbers, "\" tabindex=\"-1\">").concat(lang.numbers, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-decrease-nesting-level\" data-trix-action=\"decreaseNestingLevel\" title=\"").concat(lang.outdent, "\" tabindex=\"-1\">").concat(lang.outdent, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-increase-nesting-level\" data-trix-action=\"increaseNestingLevel\" title=\"").concat(lang.indent, "\" tabindex=\"-1\">").concat(lang.indent, "</button>\n  </span>\n\n  <span class=\"trix-button-group trix-button-group--file-tools\" data-trix-button-group=\"file-tools\">\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-attach\" data-trix-action=\"attachFiles\" title=\"").concat(lang.attachFiles, "\" tabindex=\"-1\">").concat(lang.attachFiles, "</button>\n  </span>\n\n  <span class=\"trix-button-group-spacer\"></span>\n\n  <span class=\"trix-button-group trix-button-group--history-tools\" data-trix-button-group=\"history-tools\">\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-undo\" data-trix-action=\"undo\" data-trix-key=\"z\" title=\"").concat(lang.undo, "\" tabindex=\"-1\">").concat(lang.undo, "</button>\n    <button type=\"button\" class=\"trix-button trix-button--icon trix-button--icon-redo\" data-trix-action=\"redo\" data-trix-key=\"shift+z\" title=\"").concat(lang.redo, "\" tabindex=\"-1\">").concat(lang.redo, "</button>\n  </span>\n</div>\n\n<div class=\"trix-dialogs\" data-trix-dialogs>\n  <div class=\"trix-dialog trix-dialog--link\" data-trix-dialog=\"href\" data-trix-dialog-attribute=\"href\">\n    <div class=\"trix-dialog__link-fields\">\n      <input type=\"url\" name=\"href\" class=\"trix-input trix-input--dialog\" placeholder=\"").concat(lang.urlPlaceholder, "\" aria-label=\"").concat(lang.url, "\" required data-trix-input>\n      <div class=\"trix-button-group\">\n        <input type=\"button\" class=\"trix-button trix-button--dialog\" value=\"").concat(lang.link, "\" data-trix-method=\"setAttribute\">\n        <input type=\"button\" class=\"trix-button trix-button--dialog\" value=\"").concat(lang.unlink, "\" data-trix-method=\"removeAttribute\">\n      </div>\n    </div>\n  </div>\n</div>");
  }

};

const undoInterval = 5000;

const config = {
  attachments,
  blockAttributes: attributes,
  browser,
  css,
  fileSize,
  input,
  keyNames,
  lang,
  textAttributes,
  toolbar,
  undoInterval
};

const ZERO_WIDTH_SPACE = "\uFEFF";
const NON_BREAKING_SPACE = "\u00A0";
const OBJECT_REPLACEMENT_CHARACTER = "\uFFFC";

const extend = function (properties) {
  for (const key in properties) {
    const value = properties[key];
    this[key] = value;
  }

  return this;
};

const html = document.documentElement;
const match = html.matches;
const handleEvent = function (eventName) {
  let {
    onElement,
    matchingSelector,
    withCallback,
    inPhase,
    preventDefault,
    times
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const element = onElement ? onElement : html;
  const selector = matchingSelector;
  const useCapture = inPhase === "capturing";

  const handler = function (event) {
    if (times != null && --times === 0) {
      handler.destroy();
    }

    const target = findClosestElementFromNode(event.target, {
      matchingSelector: selector
    });

    if (target != null) {
      withCallback === null || withCallback === void 0 ? void 0 : withCallback.call(target, event, target);

      if (preventDefault) {
        event.preventDefault();
      }
    }
  };

  handler.destroy = () => element.removeEventListener(eventName, handler, useCapture);

  element.addEventListener(eventName, handler, useCapture);
  return handler;
};
const handleEventOnce = function (eventName) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  options.times = 1;
  return handleEvent(eventName, options);
};
const triggerEvent = function (eventName) {
  let {
    onElement,
    bubbles,
    cancelable,
    attributes
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const element = onElement != null ? onElement : html;
  bubbles = bubbles !== false;
  cancelable = cancelable !== false;
  const event = document.createEvent("Events");
  event.initEvent(eventName, bubbles, cancelable);

  if (attributes != null) {
    extend.call(event, attributes);
  }

  return element.dispatchEvent(event);
};
const elementMatchesSelector = function (element, selector) {
  if ((element === null || element === void 0 ? void 0 : element.nodeType) === 1) {
    return match.call(element, selector);
  }
};
const findClosestElementFromNode = function (node) {
  let {
    matchingSelector,
    untilNode
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }

  if (node == null) {
    return;
  }

  if (matchingSelector != null) {
    if (node.closest && untilNode == null) {
      return node.closest(matchingSelector);
    } else {
      while (node && node !== untilNode) {
        if (elementMatchesSelector(node, matchingSelector)) {
          return node;
        }

        node = node.parentNode;
      }
    }
  } else {
    return node;
  }
};
const findInnerElement = function (element) {
  while ((_element = element) !== null && _element !== void 0 && _element.firstElementChild) {
    var _element;

    element = element.firstElementChild;
  }

  return element;
};
const innerElementIsActive = element => document.activeElement !== element && elementContainsNode(element, document.activeElement);
const elementContainsNode = function (element, node) {
  if (!element || !node) {
    return;
  }

  while (node) {
    if (node === element) {
      return true;
    }

    node = node.parentNode;
  }
};
const findNodeFromContainerAndOffset = function (container, offset) {
  if (!container) {
    return;
  }

  if (container.nodeType === Node.TEXT_NODE) {
    return container;
  } else if (offset === 0) {
    return container.firstChild != null ? container.firstChild : container;
  } else {
    return container.childNodes.item(offset - 1);
  }
};
const findElementFromContainerAndOffset = function (container, offset) {
  const node = findNodeFromContainerAndOffset(container, offset);
  return findClosestElementFromNode(node);
};
const findChildIndexOfNode = function (node) {
  var _node;

  if (!((_node = node) !== null && _node !== void 0 && _node.parentNode)) {
    return;
  }

  let childIndex = 0;
  node = node.previousSibling;

  while (node) {
    childIndex++;
    node = node.previousSibling;
  }

  return childIndex;
};
const removeNode = node => {
  var _node$parentNode;

  return node === null || node === void 0 ? void 0 : (_node$parentNode = node.parentNode) === null || _node$parentNode === void 0 ? void 0 : _node$parentNode.removeChild(node);
};
const walkTree = function (tree) {
  let {
    onlyNodesOfType,
    usingFilter,
    expandEntityReferences
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  const whatToShow = (() => {
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
};
const tagName = element => {
  var _element$tagName;

  return element === null || element === void 0 ? void 0 : (_element$tagName = element.tagName) === null || _element$tagName === void 0 ? void 0 : _element$tagName.toLowerCase();
};
const makeElement = function (tag) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let key, value;

  if (typeof tag === "object") {
    options = tag;
    tag = options.tagName;
  } else {
    options = {
      attributes: options
    };
  }

  const element = document.createElement(tag);

  if (options.editable != null) {
    if (options.attributes == null) {
      options.attributes = {};
    }

    options.attributes.contenteditable = options.editable;
  }

  if (options.attributes) {
    for (key in options.attributes) {
      value = options.attributes[key];
      element.setAttribute(key, value);
    }
  }

  if (options.style) {
    for (key in options.style) {
      value = options.style[key];
      element.style[key] = value;
    }
  }

  if (options.data) {
    for (key in options.data) {
      value = options.data[key];
      element.dataset[key] = value;
    }
  }

  if (options.className) {
    options.className.split(" ").forEach(className => {
      element.classList.add(className);
    });
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  if (options.childNodes) {
    [].concat(options.childNodes).forEach(childNode => {
      element.appendChild(childNode);
    });
  }

  return element;
};
let blockTagNames = undefined;
const getBlockTagNames = function () {
  if (blockTagNames != null) {
    return blockTagNames;
  }

  blockTagNames = [];

  for (const key in config.blockAttributes) {
    const attributes = config.blockAttributes[key];

    if (attributes.tagName) {
      blockTagNames.push(attributes.tagName);
    }
  }

  return blockTagNames;
};
const nodeIsBlockContainer = node => nodeIsBlockStartComment(node === null || node === void 0 ? void 0 : node.firstChild);
const nodeProbablyIsBlockContainer = function (node) {
  return getBlockTagNames().includes(tagName(node)) && !getBlockTagNames().includes(tagName(node.firstChild));
};
const nodeIsBlockStart = function (node) {
  let {
    strict
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    strict: true
  };

  if (strict) {
    return nodeIsBlockStartComment(node);
  } else {
    return nodeIsBlockStartComment(node) || !nodeIsBlockStartComment(node.firstChild) && nodeProbablyIsBlockContainer(node);
  }
};
const nodeIsBlockStartComment = node => nodeIsCommentNode(node) && (node === null || node === void 0 ? void 0 : node.data) === "block";
const nodeIsCommentNode = node => (node === null || node === void 0 ? void 0 : node.nodeType) === Node.COMMENT_NODE;
const nodeIsCursorTarget = function (node) {
  let {
    name
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!node) {
    return;
  }

  if (nodeIsTextNode(node)) {
    if (node.data === ZERO_WIDTH_SPACE) {
      if (name) {
        return node.parentNode.dataset.trixCursorTarget === name;
      } else {
        return true;
      }
    }
  } else {
    return nodeIsCursorTarget(node.firstChild);
  }
};
const nodeIsAttachmentElement = node => elementMatchesSelector(node, attachmentSelector);
const nodeIsEmptyTextNode = node => nodeIsTextNode(node) && (node === null || node === void 0 ? void 0 : node.data) === "";
const nodeIsTextNode = node => (node === null || node === void 0 ? void 0 : node.nodeType) === Node.TEXT_NODE;

const RTL_PATTERN = /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/;
const getDirection = function () {
  const input = makeElement("input", {
    dir: "auto",
    name: "x",
    dirName: "x.dir"
  });
  const form = makeElement("form");
  form.appendChild(input);

  const supportsDirName = function () {
    try {
      return new FormData(form).has(input.dirName);
    } catch (error) {
      return false;
    }
  }();

  const supportsDirSelector = function () {
    try {
      return input.matches(":dir(ltr),:dir(rtl)");
    } catch (error) {
      return false;
    }
  }();

  if (supportsDirName) {
    return function (string) {
      input.value = string;
      return new FormData(form).get(input.dirName);
    };
  } else if (supportsDirSelector) {
    return function (string) {
      input.value = string;

      if (input.matches(":dir(rtl)")) {
        return "rtl";
      } else {
        return "ltr";
      }
    };
  } else {
    return function (string) {
      const char = string.trim().charAt(0);

      if (RTL_PATTERN.test(char)) {
        return "rtl";
      } else {
        return "ltr";
      }
    };
  }
}();

let allAttributeNames = null;
let blockAttributeNames = null;
let textAttributeNames = null;
let listAttributeNames = null;
const getAllAttributeNames = () => {
  if (!allAttributeNames) {
    allAttributeNames = getTextAttributeNames().concat(getBlockAttributeNames());
  }

  return allAttributeNames;
};
const getBlockConfig = attributeName => config.blockAttributes[attributeName];
const getBlockAttributeNames = () => {
  if (!blockAttributeNames) {
    blockAttributeNames = Object.keys(config.blockAttributes);
  }

  return blockAttributeNames;
};
const getTextConfig = attributeName => config.textAttributes[attributeName];
const getTextAttributeNames = () => {
  if (!textAttributeNames) {
    textAttributeNames = Object.keys(config.textAttributes);
  }

  return textAttributeNames;
};
const getListAttributeNames = () => {
  if (!listAttributeNames) {
    listAttributeNames = [];

    for (const key in config.blockAttributes) {
      const {
        listAttribute
      } = config.blockAttributes[key];

      if (listAttribute != null) {
        listAttributeNames.push(listAttribute);
      }
    }
  }

  return listAttributeNames;
};

/* eslint-disable
*/
const installDefaultCSSForTagName = function (tagName, defaultCSS) {
  const styleElement = insertStyleElementForTagName(tagName);
  styleElement.textContent = defaultCSS.replace(/%t/g, tagName);
};

const insertStyleElementForTagName = function (tagName) {
  const element = document.createElement("style");
  element.setAttribute("type", "text/css");
  element.setAttribute("data-tag-name", tagName.toLowerCase());
  const nonce = getCSPNonce();

  if (nonce) {
    element.setAttribute("nonce", nonce);
  }

  document.head.insertBefore(element, document.head.firstChild);
  return element;
};

const getCSPNonce = function () {
  const element = getMetaElement("trix-csp-nonce") || getMetaElement("csp-nonce");

  if (element) {
    return element.getAttribute("content");
  }
};

const getMetaElement = name => document.head.querySelector("meta[name=".concat(name, "]"));

const testTransferData = {
  "application/x-trix-feature-detection": "test"
};
const dataTransferIsPlainText = function (dataTransfer) {
  const text = dataTransfer.getData("text/plain");
  const html = dataTransfer.getData("text/html");

  if (text && html) {
    const {
      body
    } = new DOMParser().parseFromString(html, "text/html");

    if (body.textContent === text) {
      return !body.querySelector("*");
    }
  } else {
    return text === null || text === void 0 ? void 0 : text.length;
  }
};
const dataTransferIsWritable = function (dataTransfer) {
  if (!(dataTransfer !== null && dataTransfer !== void 0 && dataTransfer.setData)) return false;

  for (const key in testTransferData) {
    const value = testTransferData[key];

    try {
      dataTransfer.setData(key, value);
      if (!dataTransfer.getData(key) === value) return false;
    } catch (error) {
      return false;
    }
  }

  return true;
};
const keyEventIsKeyboardCommand = function () {
  if (/Mac|^iP/.test(navigator.platform)) {
    return event => event.metaKey;
  } else {
    return event => event.ctrlKey;
  }
}();

const defer = fn => setTimeout(fn, 1);

/* eslint-disable
    id-length,
*/
const copyObject = function () {
  let object = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const result = {};

  for (const key in object) {
    const value = object[key];
    result[key] = value;
  }

  return result;
};
const objectsAreEqual = function () {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    const value = a[key];

    if (value !== b[key]) {
      return false;
    }
  }

  return true;
};

const normalizeRange = function (range) {
  if (range == null) return;

  if (!Array.isArray(range)) {
    range = [range, range];
  }

  return [copyValue(range[0]), copyValue(range[1] != null ? range[1] : range[0])];
};
const rangeIsCollapsed = function (range) {
  if (range == null) return;
  const [start, end] = normalizeRange(range);
  return rangeValuesAreEqual(start, end);
};
const rangesAreEqual = function (leftRange, rightRange) {
  if (leftRange == null || rightRange == null) return;
  const [leftStart, leftEnd] = normalizeRange(leftRange);
  const [rightStart, rightEnd] = normalizeRange(rightRange);
  return rangeValuesAreEqual(leftStart, rightStart) && rangeValuesAreEqual(leftEnd, rightEnd);
};

const copyValue = function (value) {
  if (typeof value === "number") {
    return value;
  } else {
    return copyObject(value);
  }
};

const rangeValuesAreEqual = function (left, right) {
  if (typeof left === "number") {
    return left === right;
  } else {
    return objectsAreEqual(left, right);
  }
};

class BasicObject {
  static proxyMethod(expression) {
    const {
      name,
      toMethod,
      toProperty,
      optional
    } = parseProxyMethodExpression(expression);

    this.prototype[name] = function () {
      let subject;
      let object;

      if (toMethod) {
        if (optional) {
          var _this$toMethod;

          object = (_this$toMethod = this[toMethod]) === null || _this$toMethod === void 0 ? void 0 : _this$toMethod.call(this);
        } else {
          object = this[toMethod]();
        }
      } else if (toProperty) {
        object = this[toProperty];
      }

      if (optional) {
        var _object;

        subject = (_object = object) === null || _object === void 0 ? void 0 : _object[name];

        if (subject) {
          return apply.call(subject, object, arguments);
        }
      } else {
        subject = object[name];
        return apply.call(subject, object, arguments);
      }
    };
  }

}

const parseProxyMethodExpression = function (expression) {
  const match = expression.match(proxyMethodExpressionPattern);

  if (!match) {
    throw new Error("can't parse @proxyMethod expression: ".concat(expression));
  }

  const args = {
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

const {
  apply
} = Function.prototype;
const proxyMethodExpressionPattern = new RegExp("\
^\
(.+?)\
(\\(\\))?\
(\\?)?\
\\.\
(.+?)\
$\
");

/* eslint-disable
    id-length,
*/
class SelectionChangeObserver extends BasicObject {
  constructor() {
    super(...arguments);
    this.update = this.update.bind(this);
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
    if (!this.selectionManagers.includes(selectionManager)) {
      this.selectionManagers.push(selectionManager);
      return this.start();
    }
  }

  unregisterSelectionManager(selectionManager) {
    this.selectionManagers = this.selectionManagers.filter(s => s !== selectionManager);

    if (this.selectionManagers.length === 0) {
      return this.stop();
    }
  }

  notifySelectionManagersOfSelectionChange() {
    return this.selectionManagers.map(selectionManager => selectionManager.selectionDidChange());
  }

  update() {
    const domRange = getDOMRange();

    if (!domRangesAreEqual(domRange, this.domRange)) {
      this.domRange = domRange;
      return this.notifySelectionManagersOfSelectionChange();
    }
  }

  reset() {
    this.domRange = null;
    return this.update();
  } // Private


  run() {
    if (this.started) {
      this.update();
      return requestAnimationFrame(this.run);
    }
  }

}

const domRangesAreEqual = (left, right) => (left === null || left === void 0 ? void 0 : left.startContainer) === (right === null || right === void 0 ? void 0 : right.startContainer) && (left === null || left === void 0 ? void 0 : left.startOffset) === (right === null || right === void 0 ? void 0 : right.startOffset) && (left === null || left === void 0 ? void 0 : left.endContainer) === (right === null || right === void 0 ? void 0 : right.endContainer) && (left === null || left === void 0 ? void 0 : left.endOffset) === (right === null || right === void 0 ? void 0 : right.endOffset);

const selectionChangeObserver = new SelectionChangeObserver();
const getDOMSelection = function () {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    return selection;
  }
};
const getDOMRange = function () {
  var _getDOMSelection;

  const domRange = (_getDOMSelection = getDOMSelection()) === null || _getDOMSelection === void 0 ? void 0 : _getDOMSelection.getRangeAt(0);

  if (domRange) {
    if (!domRangeIsPrivate(domRange)) {
      return domRange;
    }
  }
};
const setDOMRange = function (domRange) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(domRange);
  return selectionChangeObserver.update();
}; // In Firefox, clicking certain <input> elements changes the selection to a
// private element used to draw its UI. Attempting to access properties of those
// elements throws an error.
// https://bugzilla.mozilla.org/show_bug.cgi?id=208427

const domRangeIsPrivate = domRange => nodeIsPrivate(domRange.startContainer) || nodeIsPrivate(domRange.endContainer);

const nodeIsPrivate = node => !Object.getPrototypeOf(node);

var _Array$from, _$codePointAt, _, _String$fromCodePoint;
class UTF16String extends BasicObject {
  static box() {
    let value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    if (value instanceof this) {
      return value;
    } else {
      return this.fromUCS2String(value === null || value === void 0 ? void 0 : value.toString());
    }
  }

  static fromUCS2String(ucs2String) {
    return new this(ucs2String, ucs2decode(ucs2String));
  }

  static fromCodepoints(codepoints) {
    return new this(ucs2encode(codepoints), codepoints);
  }

  constructor(ucs2String, codepoints) {
    super(...arguments);
    this.ucs2String = ucs2String;
    this.codepoints = codepoints;
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

}
const hasArrayFrom = ((_Array$from = Array.from) === null || _Array$from === void 0 ? void 0 : _Array$from.call(Array, "\ud83d\udc7c").length) === 1;
const hasStringCodePointAt = ((_$codePointAt = (_ = " ").codePointAt) === null || _$codePointAt === void 0 ? void 0 : _$codePointAt.call(_, 0)) != null;
const hasStringFromCodePoint = ((_String$fromCodePoint = String.fromCodePoint) === null || _String$fromCodePoint === void 0 ? void 0 : _String$fromCodePoint.call(String, 32, 128124)) === " \ud83d\udc7c"; // UCS-2 conversion helpers ported from Mathias Bynens' Punycode.js:
// https://github.com/bestiejs/punycode.js#punycodeucs2

let ucs2decode, ucs2encode; // Creates an array containing the numeric code points of each Unicode
// character in the string. While JavaScript uses UCS-2 internally,
// this function will convert a pair of surrogate halves (each of which
// UCS-2 exposes as separate characters) into a single code point,
// matching UTF-16.

if (hasArrayFrom && hasStringCodePointAt) {
  ucs2decode = string => Array.from(string).map(char => char.codePointAt(0));
} else {
  ucs2decode = function (string) {
    const output = [];
    let counter = 0;
    const {
      length
    } = string;

    while (counter < length) {
      let value = string.charCodeAt(counter++);

      if (0xd800 <= value && value <= 0xdbff && counter < length) {
        // high surrogate, and there is a next character
        const extra = string.charCodeAt(counter++);

        if ((extra & 0xfc00) === 0xdc00) {
          // low surrogate
          value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
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
} // Creates a string based on an array of numeric code points.


if (hasStringFromCodePoint) {
  ucs2encode = array => String.fromCodePoint(...Array.from(array || []));
} else {
  ucs2encode = function (array) {
    const characters = (() => {
      const result = [];
      Array.from(array).forEach(value => {
        let output = "";

        if (value > 0xffff) {
          value -= 0x10000;
          output += String.fromCharCode(value >>> 10 & 0x3ff | 0xd800);
          value = 0xdc00 | value & 0x3ff;
        }

        result.push(output + String.fromCharCode(value));
      });
      return result;
    })();

    return characters.join("");
  };
}

/* eslint-disable
    id-length,
    no-useless-escape,
*/
const normalizeSpaces = string => string.replace(new RegExp("".concat(ZERO_WIDTH_SPACE), "g"), "").replace(new RegExp("".concat(NON_BREAKING_SPACE), "g"), " ");
const normalizeNewlines = string => string.replace(/\r\n/g, "\n");
const breakableWhitespacePattern = new RegExp("[^\\S".concat(NON_BREAKING_SPACE, "]"));
const squishBreakableWhitespace = string => string // Replace all breakable whitespace characters with a space
.replace(new RegExp("".concat(breakableWhitespacePattern.source), "g"), " ") // Replace two or more spaces with a single space
.replace(/\ {2,}/g, " ");
const summarizeStringChange = function (oldString, newString) {
  let added, removed;
  oldString = UTF16String.box(oldString);
  newString = UTF16String.box(newString);

  if (newString.length < oldString.length) {
    [removed, added] = utf16StringDifferences(oldString, newString);
  } else {
    [added, removed] = utf16StringDifferences(newString, oldString);
  }

  return {
    added,
    removed
  };
};

const utf16StringDifferences = function (a, b) {
  if (a.isEqualTo(b)) {
    return ["", ""];
  }

  const diffA = utf16StringDifference(a, b);
  const {
    length
  } = diffA.utf16String;
  let diffB;

  if (length) {
    const {
      offset
    } = diffA;
    const codepoints = a.codepoints.slice(0, offset).concat(a.codepoints.slice(offset + length));
    diffB = utf16StringDifference(b, UTF16String.fromCodepoints(codepoints));
  } else {
    diffB = utf16StringDifference(b, a);
  }

  return [diffA.utf16String.toString(), diffB.utf16String.toString()];
};

const utf16StringDifference = function (a, b) {
  let leftIndex = 0;
  let rightIndexA = a.length;
  let rightIndexB = b.length;

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

/* eslint-disable
    id-length,
*/
installDefaultCSSForTagName("trix-inspector", "%t {\n  display: block;\n}\n\n%t {\n  position: fixed;\n  background: #fff;\n  border: 1px solid #444;\n  border-radius: 5px;\n  padding: 10px;\n  font-family: sans-serif;\n  font-size: 12px;\n  overflow: auto;\n  word-wrap: break-word;\n}\n\n%t details {\n  margin-bottom: 10px;\n}\n\n%t summary:focus {\n  outline: none;\n}\n\n%t details .panel {\n  padding: 10px;\n}\n\n%t .performance .metrics {\n  margin: 0 0 5px 5px;\n}\n\n%t .selection .characters {\n  margin-top: 10px;\n}\n\n%t .selection .character {\n  display: inline-block;\n  font-size: 8px;\n  font-family: courier, monospace;\n  line-height: 10px;\n  vertical-align: middle;\n  text-align: center;\n  width: 10px;\n  height: 10px;\n  margin: 0 1px 1px 0;\n  border: 1px solid #333;\n  border-radius: 1px;\n  background: #676666;\n  color: #fff;\n}\n\n%t .selection .character.selected {\n  background: yellow;\n  color: #000;\n}");
class TrixInspector extends HTMLElement {
  connectedCallback() {
    this.editorElement = document.querySelector("trix-editor[trix-id='".concat(this.dataset.trixId, "']"));
    this.views = this.createViews();
    this.views.forEach(view => {
      view.render();
      this.appendChild(view.element);
    });
    this.reposition();
    this.resizeHandler = this.reposition.bind(this);
    addEventListener("resize", this.resizeHandler);
  }

  disconnectedCallback() {
    removeEventListener("resize", this.resizeHandler);
  }

  createViews() {
    const views = Trix.Inspector.views.map(View => new View(this.editorElement));
    return views.sort((a, b) => a.title.toLowerCase() > b.title.toLowerCase());
  }

  reposition() {
    const {
      top,
      right
    } = this.editorElement.getBoundingClientRect();
    this.style.top = "".concat(top, "px");
    this.style.left = "".concat(right + 10, "px");
    this.style.maxWidth = "".concat(window.innerWidth - right - 40, "px");
    this.style.maxHeight = "".concat(window.innerHeight - top - 30, "px");
  }

}
window.customElements.define("trix-inspector", TrixInspector);

window.Trix.Inspector = {
  views: [],

  registerView(constructor) {
    return this.views.push(constructor);
  },

  install(editorElement) {
    this.editorElement = editorElement;
    const element = document.createElement("trix-inspector");
    element.dataset.trixId = this.editorElement.trixId;
    return document.body.appendChild(element);
  }

};

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/debug"] = function () {
  return "<p>\n  <label>\n    <input type=\"checkbox\" name=\"viewCaching\" checked=\"".concat(this.compositionController.isViewCachingEnabled(), "\">\n    Cache views between renders\n  </label>\n</p>\n\n<p>\n  <button data-action=\"render\">Force Render</button> <button data-action=\"parse\">Parse current HTML</button>\n</p>\n\n<p>\n  <label>\n    <input type=\"checkbox\" name=\"controlElement\">\n    Show <code>contenteditable</code> control element\n  </label>\n</p>");
};

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/document"] = function () {
  const details = this.document.getBlocks().map((block, index) => {
    const {
      text
    } = block;
    const pieces = text.pieceList.toArray();
    return "<details class=\"block\">\n      <summary class=\"title\">\n        Block ".concat(block.id, ", Index: ").concat(index, "\n      </summary>\n      <div class=\"attributes\">\n        Attributes: ").concat(JSON.stringify(block.attributes), "\n      </div>\n\n      <div class=\"text\">\n        <div class=\"title\">\n          Text: ").concat(text.id, ", Pieces: ").concat(pieces.length, ", Length: ").concat(text.getLength(), "\n        </div>\n        <div class=\"pieces\">\n          ").concat(piecePartials(pieces).join("\n"), "\n        </div>\n      </div>\n    </details>");
  });
  return details.join("\n");
};

const piecePartials = pieces => pieces.map((piece, index) => "<div class=\"piece\">\n      <div class=\"title\">\n        Piece ".concat(piece.id, ", Index: ").concat(index, "\n      </div>\n      <div class=\"attributes\">\n        Attributes: ").concat(JSON.stringify(piece.attributes), "\n      </div>\n      <div class=\"content\">\n        ").concat(JSON.stringify(piece.toString()), "\n      </div>\n    </div>"));

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/performance"] = function () {
  return Object.keys(this.data).map(name => {
    const data = this.data[name];
    return dataMetrics(name, data, this.round);
  }).join("\n");
};

const dataMetrics = function (name, data, round) {
  let item = "<strong>".concat(name, "</strong> (").concat(data.calls, ")<br>");

  if (data.calls > 0) {
    item += "<div class=\"metrics\">\n        Mean: ".concat(round(data.mean), "ms<br>\n        Max: ").concat(round(data.max), "ms<br>\n        Last: ").concat(round(data.last), "ms\n      </div>");
    return item;
  }
};

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/render"] = function () {
  return "Syncs: ".concat(this.syncCount);
};

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/selection"] = function () {
  return "\nLocation range: [".concat(this.locationRange[0].index, ":").concat(this.locationRange[0].offset, ", ").concat(this.locationRange[1].index, ":").concat(this.locationRange[1].offset, "]\n\n").concat(charSpans(this.characters).join("\n"));
};

const charSpans = characters => Array.from(characters).map(char => "<span class=\"character ".concat(char.selected ? "selected" : undefined, "\">").concat(char.string, "</span>"));

if (!window.JST) {
  window.JST = {};
}

window.JST["trix/inspector/templates/undo"] = function () {
  return "<h4>Undo stack</h4>\n<ol class=\"undo-entries\">\n   ".concat(entryList(this.undoEntries), "\n</ol>\n\n<h4>Redo stack</h4>\n<ol class=\"redo-entries\">\n  ").concat(entryList(this.redoEntries), "\n</ol>");
};

const entryList = entries => entries.map(entry => "<li>".concat(entry.description, " ").concat(JSON.stringify({
  selectedRange: entry.snapshot.selectedRange,
  context: entry.context
}), "</li>"));

const KEY_EVENTS = "keydown keypress input".split(" ");
const COMPOSITION_EVENTS = "compositionstart compositionupdate compositionend textInput".split(" ");
const OBSERVER_OPTIONS = {
  attributes: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
  subtree: true
};
class ControlElement {
  constructor(editorElement) {
    this.didMutate = this.didMutate.bind(this);
    this.editorElement = editorElement;
    this.install();
  }

  install() {
    this.createElement();
    this.logInputEvents();
    this.logMutations();
  }

  uninstall() {
    this.observer.disconnect();
    this.element.parentNode.removeChild(this.element);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.setAttribute("contenteditable", "");
    this.element.style.width = getComputedStyle(this.editorElement).width;
    this.element.style.minHeight = "50px";
    this.element.style.border = "1px solid green";
    this.editorElement.parentNode.insertBefore(this.element, this.editorElement.nextSibling);
  }

  logInputEvents() {
    KEY_EVENTS.forEach(eventName => {
      this.element.addEventListener(eventName, event => console.log("".concat(event.type, ": keyCode = ").concat(event.keyCode)));
    });
    COMPOSITION_EVENTS.forEach(eventName => {
      this.element.addEventListener(eventName, event => console.log("".concat(event.type, ": data = ").concat(JSON.stringify(event.data))));
    });
  }

  logMutations() {
    this.observer = new window.MutationObserver(this.didMutate);
    this.observer.observe(this.element, OBSERVER_OPTIONS);
  }

  didMutate(mutations) {
    console.log("Mutations (".concat(mutations.length, "):"));

    for (let index = 0; index < mutations.length; index++) {
      const mutation = mutations[index];
      console.log(" ".concat(index + 1, ". ").concat(mutation.type, ":"));

      switch (mutation.type) {
        case "characterData":
          console.log("  oldValue = ".concat(JSON.stringify(mutation.oldValue), ", newValue = ").concat(JSON.stringify(mutation.target.data)));
          break;

        case "childList":
          Array.from(mutation.addedNodes).forEach(node => {
            console.log("  node added ".concat(inspectNode(node)));
          });
          Array.from(mutation.removedNodes).forEach(node => {
            console.log("  node removed ".concat(inspectNode(node)));
          });
      }
    }
  }

}

const inspectNode = function (node) {
  if (node.data) {
    return JSON.stringify(node.data);
  } else {
    return JSON.stringify(node.outerHTML);
  }
};

function _asyncIterator(iterable) {
  var method,
      async,
      sync,
      retry = 2;

  if (typeof Symbol !== "undefined") {
    async = Symbol.asyncIterator;
    sync = Symbol.iterator;
  }

  while (retry--) {
    if (async && (method = iterable[async]) != null) {
      return method.call(iterable);
    }

    if (sync && (method = iterable[sync]) != null) {
      return new AsyncFromSyncIterator(method.call(iterable));
    }

    async = "@@asyncIterator";
    sync = "@@iterator";
  }

  throw new TypeError("Object is not async iterable");
}

function AsyncFromSyncIterator(s) {
  AsyncFromSyncIterator = function (s) {
    this.s = s;
    this.n = s.next;
  };

  AsyncFromSyncIterator.prototype = {
    s: null,
    n: null,
    next: function () {
      return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
    },
    return: function (value) {
      var ret = this.s.return;

      if (ret === undefined) {
        return Promise.resolve({
          value: value,
          done: true
        });
      }

      return AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
    },
    throw: function (value) {
      var thr = this.s.return;
      if (thr === undefined) return Promise.reject(value);
      return AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
    }
  };

  function AsyncFromSyncIteratorContinuation(r) {
    if (Object(r) !== r) {
      return Promise.reject(new TypeError(r + " is not an object."));
    }

    var done = r.done;
    return Promise.resolve(r.value).then(function (value) {
      return {
        value: value,
        done: done
      };
    });
  }

  return new AsyncFromSyncIterator(s);
}

var REACT_ELEMENT_TYPE;

function _jsx(type, props, key, children) {
  if (!REACT_ELEMENT_TYPE) {
    REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol["for"] && Symbol["for"]("react.element") || 0xeac7;
  }

  var defaultProps = type && type.defaultProps;
  var childrenLength = arguments.length - 3;

  if (!props && childrenLength !== 0) {
    props = {
      children: void 0
    };
  }

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = new Array(childrenLength);

    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 3];
    }

    props.children = childArray;
  }

  if (props && defaultProps) {
    for (var propName in defaultProps) {
      if (props[propName] === void 0) {
        props[propName] = defaultProps[propName];
      }
    }
  } else if (!props) {
    props = defaultProps || {};
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key === undefined ? null : "" + key,
    ref: null,
    props: props,
    _owner: null
  };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _wrapRegExp() {
  _wrapRegExp = function (re, groups) {
    return new BabelRegExp(re, undefined, groups);
  };

  var _super = RegExp.prototype;

  var _groups = new WeakMap();

  function BabelRegExp(re, flags, groups) {
    var _this = new RegExp(re, flags);

    _groups.set(_this, groups || _groups.get(re));

    return _setPrototypeOf(_this, BabelRegExp.prototype);
  }

  _inherits(BabelRegExp, RegExp);

  BabelRegExp.prototype.exec = function (str) {
    var result = _super.exec.call(this, str);

    if (result) result.groups = buildGroups(result, this);
    return result;
  };

  BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
    if (typeof substitution === "string") {
      var groups = _groups.get(this);

      return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
        return "$" + groups[name];
      }));
    } else if (typeof substitution === "function") {
      var _this = this;

      return _super[Symbol.replace].call(this, str, function () {
        var args = arguments;

        if (typeof args[args.length - 1] !== "object") {
          args = [].slice.call(args);
          args.push(buildGroups(args, _this));
        }

        return substitution.apply(this, args);
      });
    } else {
      return _super[Symbol.replace].call(this, str, substitution);
    }
  };

  function buildGroups(result, re) {
    var g = _groups.get(re);

    return Object.keys(g).reduce(function (groups, name) {
      groups[name] = result[g[name]];
      return groups;
    }, Object.create(null));
  }

  return _wrapRegExp.apply(this, arguments);
}

function _AwaitValue(value) {
  this.wrapped = value;
}

function _AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume(key === "return" ? "return" : "next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen.return !== "function") {
    this.return = undefined;
  }
}

_AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
};

_AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

_AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
};

_AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};

function _wrapAsyncGenerator(fn) {
  return function () {
    return new _AsyncGenerator(fn.apply(this, arguments));
  };
}

function _awaitAsyncGenerator(value) {
  return new _AwaitValue(value);
}

function _asyncGeneratorDelegate(inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  ;

  iter[typeof Symbol !== "undefined" && Symbol.iterator || "@@iterator"] = function () {
    return this;
  };

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner.throw === "function") {
    iter.throw = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner.return === "function") {
    iter.return = function (value) {
      if (waiting) {
        waiting = false;
        return value;
      }

      return pump("return", value);
    };
  }

  return iter;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineEnumerableProperties(obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  if (Object.getOwnPropertySymbols) {
    var objectSymbols = Object.getOwnPropertySymbols(descs);

    for (var i = 0; i < objectSymbols.length; i++) {
      var sym = objectSymbols[i];
      var desc = descs[sym];
      desc.configurable = desc.enumerable = true;
      if ("value" in desc) desc.writable = true;
      Object.defineProperty(obj, sym, desc);
    }
  }

  return obj;
}

function _defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? Object(arguments[i]) : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys.push.apply(ownKeys, Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _instanceof(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return {
      default: obj
    };
  }

  var cache = _getRequireWildcardCache(nodeInterop);

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj.default = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

function _newArrowCheck(innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
}

function _objectDestructuringEmpty(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }

      return desc.value;
    };
  }

  return _get.apply(this, arguments);
}

function set(target, property, value, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.set) {
    set = Reflect.set;
  } else {
    set = function set(target, property, value, receiver) {
      var base = _superPropBase(target, property);

      var desc;

      if (base) {
        desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.set) {
          desc.set.call(receiver, value);
          return true;
        } else if (!desc.writable) {
          return false;
        }
      }

      desc = Object.getOwnPropertyDescriptor(receiver, property);

      if (desc) {
        if (!desc.writable) {
          return false;
        }

        desc.value = value;
        Object.defineProperty(receiver, property, desc);
      } else {
        _defineProperty(receiver, property, value);
      }

      return true;
    };
  }

  return set(target, property, value, receiver);
}

function _set(target, property, value, receiver, isStrict) {
  var s = set(target, property, value, receiver || target);

  if (!s && isStrict) {
    throw new Error('failed to set property');
  }

  return value;
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _taggedTemplateLiteralLoose(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  strings.raw = raw;
  return strings;
}

function _readOnlyError(name) {
  throw new TypeError("\"" + name + "\" is read-only");
}

function _writeOnlyError(name) {
  throw new TypeError("\"" + name + "\" is write-only");
}

function _classNameTDZError(name) {
  throw new Error("Class \"" + name + "\" cannot be referenced in computed property keys.");
}

function _temporalUndefined() {}

function _tdz(name) {
  throw new ReferenceError(name + " is not defined - temporal dead zone");
}

function _temporalRef(val, name) {
  return val === _temporalUndefined ? _tdz(name) : val;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _slicedToArrayLoose(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimitLoose(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _maybeArrayLike(next, arr, i) {
  if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
    var len = arr.length;
    return _arrayLikeToArray(arr, i !== void 0 && i < len ? i : len);
  }

  return next(arr, i);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _iterableToArrayLimitLoose(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];

  for (_i = _i.call(arr), _step; !(_step = _i.next()).done;) {
    _arr.push(_step.value);

    if (i && _arr.length === i) break;
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);

  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }

  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _skipFirstGeneratorNext(fn) {
  return function () {
    var it = fn.apply(this, arguments);
    it.next();
    return it;
  };
}

function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }

  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");

  return typeof key === "symbol" ? key : String(key);
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.');
}

function _initializerDefineProperty(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

var id = 0;

function _classPrivateFieldLooseKey(name) {
  return "__private_" + id++ + "_" + name;
}

function _classPrivateFieldLooseBase(receiver, privateKey) {
  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
    throw new TypeError("attempted to use private field on non-instance");
  }

  return receiver;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classPrivateFieldDestructureSet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");

  return _classApplyDescriptorDestructureSet(receiver, descriptor);
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  _classCheckPrivateStaticFieldDescriptor(descriptor, "get");

  return _classApplyDescriptorGet(receiver, descriptor);
}

function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  _classCheckPrivateStaticFieldDescriptor(descriptor, "set");

  _classApplyDescriptorSet(receiver, descriptor, value);

  return value;
}

function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  return method;
}

function _classStaticPrivateMethodSet() {
  throw new TypeError("attempted to set read only static private field");
}

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

function _classApplyDescriptorDestructureSet(receiver, descriptor) {
  if (descriptor.set) {
    if (!("__destrObj" in descriptor)) {
      descriptor.__destrObj = {
        set value(v) {
          descriptor.set.call(receiver, v);
        }

      };
    }

    return descriptor.__destrObj;
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    return descriptor;
  }
}

function _classStaticPrivateFieldDestructureSet(receiver, classConstructor, descriptor) {
  _classCheckPrivateStaticAccess(receiver, classConstructor);

  _classCheckPrivateStaticFieldDescriptor(descriptor, "set");

  return _classApplyDescriptorDestructureSet(receiver, descriptor);
}

function _classCheckPrivateStaticAccess(receiver, classConstructor) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }
}

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
  if (descriptor === undefined) {
    throw new TypeError("attempted to " + action + " private static field before its declaration");
  }
}

function _decorate(decorators, factory, superClass, mixins) {
  var api = _getDecoratorsApi();

  if (mixins) {
    for (var i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }

  var r = factory(function initialize(O) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}

function _getDecoratorsApi() {
  _getDecoratorsApi = function () {
    return api;
  };

  var api = {
    elementsDefinitionOrder: [["method"], ["field"]],
    initializeInstanceElements: function (O, elements) {
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          if (element.kind === kind && element.placement === "own") {
            this.defineClassElement(O, element);
          }
        }, this);
      }, this);
    },
    initializeClassElements: function (F, elements) {
      var proto = F.prototype;
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          var placement = element.placement;

          if (element.kind === kind && (placement === "static" || placement === "prototype")) {
            var receiver = placement === "static" ? F : proto;
            this.defineClassElement(receiver, element);
          }
        }, this);
      }, this);
    },
    defineClassElement: function (receiver, element) {
      var descriptor = element.descriptor;

      if (element.kind === "field") {
        var initializer = element.initializer;
        descriptor = {
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          configurable: descriptor.configurable,
          value: initializer === void 0 ? void 0 : initializer.call(receiver)
        };
      }

      Object.defineProperty(receiver, element.key, descriptor);
    },
    decorateClass: function (elements, decorators) {
      var newElements = [];
      var finishers = [];
      var placements = {
        static: [],
        prototype: [],
        own: []
      };
      elements.forEach(function (element) {
        this.addElementPlacement(element, placements);
      }, this);
      elements.forEach(function (element) {
        if (!_hasDecorators(element)) return newElements.push(element);
        var elementFinishersExtras = this.decorateElement(element, placements);
        newElements.push(elementFinishersExtras.element);
        newElements.push.apply(newElements, elementFinishersExtras.extras);
        finishers.push.apply(finishers, elementFinishersExtras.finishers);
      }, this);

      if (!decorators) {
        return {
          elements: newElements,
          finishers: finishers
        };
      }

      var result = this.decorateConstructor(newElements, decorators);
      finishers.push.apply(finishers, result.finishers);
      result.finishers = finishers;
      return result;
    },
    addElementPlacement: function (element, placements, silent) {
      var keys = placements[element.placement];

      if (!silent && keys.indexOf(element.key) !== -1) {
        throw new TypeError("Duplicated element (" + element.key + ")");
      }

      keys.push(element.key);
    },
    decorateElement: function (element, placements) {
      var extras = [];
      var finishers = [];

      for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
        var keys = placements[element.placement];
        keys.splice(keys.indexOf(element.key), 1);
        var elementObject = this.fromElementDescriptor(element);
        var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
        element = elementFinisherExtras.element;
        this.addElementPlacement(element, placements);

        if (elementFinisherExtras.finisher) {
          finishers.push(elementFinisherExtras.finisher);
        }

        var newExtras = elementFinisherExtras.extras;

        if (newExtras) {
          for (var j = 0; j < newExtras.length; j++) {
            this.addElementPlacement(newExtras[j], placements);
          }

          extras.push.apply(extras, newExtras);
        }
      }

      return {
        element: element,
        finishers: finishers,
        extras: extras
      };
    },
    decorateConstructor: function (elements, decorators) {
      var finishers = [];

      for (var i = decorators.length - 1; i >= 0; i--) {
        var obj = this.fromClassDescriptor(elements);
        var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

        if (elementsAndFinisher.finisher !== undefined) {
          finishers.push(elementsAndFinisher.finisher);
        }

        if (elementsAndFinisher.elements !== undefined) {
          elements = elementsAndFinisher.elements;

          for (var j = 0; j < elements.length - 1; j++) {
            for (var k = j + 1; k < elements.length; k++) {
              if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                throw new TypeError("Duplicated element (" + elements[j].key + ")");
              }
            }
          }
        }
      }

      return {
        elements: elements,
        finishers: finishers
      };
    },
    fromElementDescriptor: function (element) {
      var obj = {
        kind: element.kind,
        key: element.key,
        placement: element.placement,
        descriptor: element.descriptor
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      if (element.kind === "field") obj.initializer = element.initializer;
      return obj;
    },
    toElementDescriptors: function (elementObjects) {
      if (elementObjects === undefined) return;
      return _toArray(elementObjects).map(function (elementObject) {
        var element = this.toElementDescriptor(elementObject);
        this.disallowProperty(elementObject, "finisher", "An element descriptor");
        this.disallowProperty(elementObject, "extras", "An element descriptor");
        return element;
      }, this);
    },
    toElementDescriptor: function (elementObject) {
      var kind = String(elementObject.kind);

      if (kind !== "method" && kind !== "field") {
        throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
      }

      var key = _toPropertyKey(elementObject.key);

      var placement = String(elementObject.placement);

      if (placement !== "static" && placement !== "prototype" && placement !== "own") {
        throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
      }

      var descriptor = elementObject.descriptor;
      this.disallowProperty(elementObject, "elements", "An element descriptor");
      var element = {
        kind: kind,
        key: key,
        placement: placement,
        descriptor: Object.assign({}, descriptor)
      };

      if (kind !== "field") {
        this.disallowProperty(elementObject, "initializer", "A method descriptor");
      } else {
        this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
        element.initializer = elementObject.initializer;
      }

      return element;
    },
    toElementFinisherExtras: function (elementObject) {
      var element = this.toElementDescriptor(elementObject);

      var finisher = _optionalCallableProperty(elementObject, "finisher");

      var extras = this.toElementDescriptors(elementObject.extras);
      return {
        element: element,
        finisher: finisher,
        extras: extras
      };
    },
    fromClassDescriptor: function (elements) {
      var obj = {
        kind: "class",
        elements: elements.map(this.fromElementDescriptor, this)
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      return obj;
    },
    toClassDescriptor: function (obj) {
      var kind = String(obj.kind);

      if (kind !== "class") {
        throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
      }

      this.disallowProperty(obj, "key", "A class descriptor");
      this.disallowProperty(obj, "placement", "A class descriptor");
      this.disallowProperty(obj, "descriptor", "A class descriptor");
      this.disallowProperty(obj, "initializer", "A class descriptor");
      this.disallowProperty(obj, "extras", "A class descriptor");

      var finisher = _optionalCallableProperty(obj, "finisher");

      var elements = this.toElementDescriptors(obj.elements);
      return {
        elements: elements,
        finisher: finisher
      };
    },
    runClassFinishers: function (constructor, finishers) {
      for (var i = 0; i < finishers.length; i++) {
        var newConstructor = (0, finishers[i])(constructor);

        if (newConstructor !== undefined) {
          if (typeof newConstructor !== "function") {
            throw new TypeError("Finishers must return a constructor.");
          }

          constructor = newConstructor;
        }
      }

      return constructor;
    },
    disallowProperty: function (obj, name, objectType) {
      if (obj[name] !== undefined) {
        throw new TypeError(objectType + " can't have a ." + name + " property.");
      }
    }
  };
  return api;
}

function _createElementDescriptor(def) {
  var key = _toPropertyKey(def.key);

  var descriptor;

  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }

  var element = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def.static ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}

function _coalesceGetterSetter(element, other) {
  if (element.descriptor.get !== undefined) {
    other.descriptor.get = element.descriptor.get;
  } else {
    other.descriptor.set = element.descriptor.set;
  }
}

function _coalesceClassElements(elements) {
  var newElements = [];

  var isSameElement = function (other) {
    return other.kind === "method" && other.key === element.key && other.placement === element.placement;
  };

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var other;

    if (element.kind === "method" && (other = newElements.find(isSameElement))) {
      if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
        if (_hasDecorators(element) || _hasDecorators(other)) {
          throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
        }

        other.descriptor = element.descriptor;
      } else {
        if (_hasDecorators(element)) {
          if (_hasDecorators(other)) {
            throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
          }

          other.decorators = element.decorators;
        }

        _coalesceGetterSetter(element, other);
      }
    } else {
      newElements.push(element);
    }
  }

  return newElements;
}

function _hasDecorators(element) {
  return element.decorators && element.decorators.length;
}

function _isDataDescriptor(desc) {
  return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}

function _optionalCallableProperty(obj, name) {
  var value = obj[name];

  if (value !== undefined && typeof value !== "function") {
    throw new TypeError("Expected '" + name + "' to be a function");
  }

  return value;
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return fn;
}

function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}

function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);

  privateMap.set(obj, value);
}

function _classPrivateMethodInitSpec(obj, privateSet) {
  _checkPrivateRedeclaration(obj, privateSet);

  privateSet.add(obj);
}

function _classPrivateMethodSet() {
  throw new TypeError("attempted to reassign private method");
}

/* eslint-disable
    no-undef,
*/
class View {
  constructor(editorElement) {
    this.editorElement = editorElement;
    this.editorController = this.editorElement.editorController;
    this.editor = this.editorElement.editor;
    this.compositionController = this.editorController.compositionController;
    this.composition = this.editorController.composition;
    this.element = document.createElement("details");

    if (this.getSetting("open") === "true") {
      this.element.open = true;
    }

    this.element.classList.add(this.constructor.template);
    this.titleElement = document.createElement("summary");
    this.element.appendChild(this.titleElement);
    this.panelElement = document.createElement("div");
    this.panelElement.classList.add("panel");
    this.element.appendChild(this.panelElement);
    this.element.addEventListener("toggle", event => {
      if (event.target === this.element) {
        return this.didToggle();
      }
    });

    if (this.events) {
      this.installEventHandlers();
    }
  }

  installEventHandlers() {
    for (const eventName in this.events) {
      const handler = this.events[eventName];

      const callback = event => {
        requestAnimationFrame(() => {
          handler.call(this, event);
        });
      };

      handleEvent(eventName, {
        onElement: this.editorElement,
        withCallback: callback
      });
    }
  }

  didToggle(event) {
    this.saveSetting("open", this.isOpen());
    return this.render();
  }

  isOpen() {
    return this.element.hasAttribute("open");
  }

  getTitle() {
    return this.title || "";
  }

  render() {
    this.renderTitle();

    if (this.isOpen()) {
      this.panelElement.innerHTML = JST["trix/inspector/templates/".concat(this.constructor.template)].apply(this);
    }
  }

  renderTitle() {
    this.titleElement.innerHTML = this.getTitle();
  }

  getSetting(key) {
    var _window$sessionStorag;

    key = this.getSettingsKey(key);
    return (_window$sessionStorag = window.sessionStorage) === null || _window$sessionStorag === void 0 ? void 0 : _window$sessionStorag[key];
  }

  saveSetting(key, value) {
    key = this.getSettingsKey(key);

    if (window.sessionStorage) {
      window.sessionStorage[key] = value;
    }
  }

  getSettingsKey(key) {
    return "trix/inspector/".concat(this.template, "/").concat(key);
  }

  get title() {
    return this.constructor.title;
  }

  get template() {
    return this.constructor.template;
  }

  get events() {
    return this.constructor.events;
  }

}

class DebugView extends View {
  constructor() {
    super(...arguments);
    this.didToggleViewCaching = this.didToggleViewCaching.bind(this);
    this.didClickRenderButton = this.didClickRenderButton.bind(this);
    this.didClickParseButton = this.didClickParseButton.bind(this);
    this.didToggleControlElement = this.didToggleControlElement.bind(this);
    handleEvent("change", {
      onElement: this.element,
      matchingSelector: "input[name=viewCaching]",
      withCallback: this.didToggleViewCaching
    });
    handleEvent("click", {
      onElement: this.element,
      matchingSelector: "button[data-action=render]",
      withCallback: this.didClickRenderButton
    });
    handleEvent("click", {
      onElement: this.element,
      matchingSelector: "button[data-action=parse]",
      withCallback: this.didClickParseButton
    });
    handleEvent("change", {
      onElement: this.element,
      matchingSelector: "input[name=controlElement]",
      withCallback: this.didToggleControlElement
    });
  }

  didToggleViewCaching(_ref) {
    let {
      target
    } = _ref;

    if (target.checked) {
      return this.compositionController.enableViewCaching();
    } else {
      return this.compositionController.disableViewCaching();
    }
  }

  didClickRenderButton() {
    return this.editorController.render();
  }

  didClickParseButton() {
    return this.editorController.reparse();
  }

  didToggleControlElement(_ref2) {
    let {
      target
    } = _ref2;

    if (target.checked) {
      this.control = new Trix.Inspector.ControlElement(this.editorElement);
    } else {
      var _this$control;

      (_this$control = this.control) === null || _this$control === void 0 ? void 0 : _this$control.uninstall();
      this.control = null;
    }
  }

}

_defineProperty(DebugView, "title", "Debug");

_defineProperty(DebugView, "template", "debug");

Trix.Inspector.registerView(DebugView);

class DocumentView extends View {
  render() {
    this.document = this.editor.getDocument();
    return super.render(...arguments);
  }

}

_defineProperty(DocumentView, "title", "Document");

_defineProperty(DocumentView, "template", "document");

_defineProperty(DocumentView, "events", {
  "trix-change": function () {
    return this.render();
  }
});

Trix.Inspector.registerView(DocumentView);

var _window$performance;
const now = (_window$performance = window.performance) !== null && _window$performance !== void 0 && _window$performance.now ? () => performance.now() : () => new Date().getTime();

class PerformanceView extends View {
  constructor() {
    super(...arguments);
    this.documentView = this.compositionController.documentView;
    this.data = {};
    this.track("documentView.render");
    this.track("documentView.sync");
    this.track("documentView.garbageCollectCachedViews");
    this.track("composition.replaceHTML");
    this.render();
  }

  track(methodPath) {
    this.data[methodPath] = {
      calls: 0,
      total: 0,
      mean: 0,
      max: 0,
      last: 0
    };
    const parts = methodPath.split(".");
    const propertyNames = parts.slice(0, parts.length - 1);
    const methodName = parts[parts.length - 1];
    let object = this;
    propertyNames.forEach(propertyName => {
      object = object[propertyName];
    });
    const original = object[methodName];

    object[methodName] = function () {
      const started = now();
      const result = original.apply(object, arguments);
      const timing = now() - started;
      this.record(methodPath, timing);
      return result;
    }.bind(this);
  }

  record(methodPath, timing) {
    const data = this.data[methodPath];
    data.calls += 1;
    data.total += timing;
    data.mean = data.total / data.calls;

    if (timing > data.max) {
      data.max = timing;
    }

    data.last = timing;
    return this.render();
  }

  round(ms) {
    return Math.round(ms * 1000) / 1000;
  }

}

_defineProperty(PerformanceView, "title", "Performance");

_defineProperty(PerformanceView, "template", "performance");

Trix.Inspector.registerView(PerformanceView);

class RenderView extends View {
  constructor() {
    super(...arguments);
    this.renderCount = 0;
    this.syncCount = 0;
  }

  getTitle() {
    return "".concat(this.title, " (").concat(this.renderCount, ")");
  }

}

_defineProperty(RenderView, "title", "Renders");

_defineProperty(RenderView, "template", "render");

_defineProperty(RenderView, "events", {
  "trix-render": function () {
    this.renderCount++;
    return this.render();
  },
  "trix-sync": function () {
    this.syncCount++;
    return this.render();
  }
});

Trix.Inspector.registerView(RenderView);

class SelectionView extends View {
  render() {
    this.document = this.editor.getDocument();
    this.range = this.editor.getSelectedRange();
    this.locationRange = this.composition.getLocationRange();
    this.characters = this.getCharacters();
    return super.render(...arguments);
  }

  getCharacters() {
    const chars = [];
    const utf16string = UTF16String.box(this.document.toString());
    const rangeIsExpanded = this.range[0] !== this.range[1];
    let position = 0;

    while (position < utf16string.length) {
      let string = utf16string.charAt(position).toString();

      if (string === "\n") {
        string = "⏎";
      }

      const selected = rangeIsExpanded && position >= this.range[0] && position < this.range[1];
      chars.push({
        string,
        selected
      });
      position++;
    }

    return chars;
  }

  getTitle() {
    return "".concat(this.title, " (").concat(this.range.join(), ")");
  }

}

_defineProperty(SelectionView, "title", "Selection");

_defineProperty(SelectionView, "template", "selection");

_defineProperty(SelectionView, "events", {
  "trix-selection-change": function () {
    return this.render();
  },
  "trix-render": function () {
    return this.render();
  }
});

Trix.Inspector.registerView(SelectionView);

class UndoView extends View {
  render() {
    this.undoEntries = this.editor.undoManager.undoEntries;
    this.redoEntries = this.editor.undoManager.redoEntries;
    return super.render(...arguments);
  }

}

_defineProperty(UndoView, "title", "Undo");

_defineProperty(UndoView, "template", "undo");

_defineProperty(UndoView, "events", {
  "trix-change": function () {
    return this.render();
  }
});

Trix.Inspector.registerView(UndoView);
//# sourceMappingURL=inspector.js.map
