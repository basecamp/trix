"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n3 = 0, F = function F() {}; return { s: F, n: function n() { return _n3 >= r.length ? { done: !0 } : { done: !1, value: r[_n3++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/*! @license DOMPurify 3.2.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.2.1/LICENSE */
!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).DOMPurify = t();
}(void 0, function () {
  "use strict";

  var e = Object.entries,
    t = Object.setPrototypeOf,
    n = Object.isFrozen,
    o = Object.getPrototypeOf,
    r = Object.getOwnPropertyDescriptor;
  var i = Object.freeze,
    a = Object.seal,
    l = Object.create,
    _ref = "undefined" != typeof Reflect && Reflect,
    c = _ref.apply,
    s = _ref.construct;
  i || (i = function i(e) {
    return e;
  }), a || (a = function a(e) {
    return e;
  }), c || (c = function c(e, t, n) {
    return e.apply(t, n);
  }), s || (s = function s(e, t) {
    return _construct(e, _toConsumableArray(t));
  });
  var u = b(Array.prototype.forEach),
    m = b(Array.prototype.pop),
    p = b(Array.prototype.push),
    f = b(String.prototype.toLowerCase),
    d = b(String.prototype.toString),
    h = b(String.prototype.match),
    g = b(String.prototype.replace),
    T = b(String.prototype.indexOf),
    y = b(String.prototype.trim),
    E = b(Object.prototype.hasOwnProperty),
    _ = b(RegExp.prototype.test),
    A = (N = TypeError, function () {
      for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
      return s(N, t);
    });
  var N;
  function b(e) {
    return function (t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++) o[r - 1] = arguments[r];
      return c(e, t, o);
    };
  }
  function S(e, o) {
    var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : f;
    t && t(e, null);
    var i = o.length;
    for (; i--;) {
      var _t2 = o[i];
      if ("string" == typeof _t2) {
        var _e2 = r(_t2);
        _e2 !== _t2 && (n(o) || (o[i] = _e2), _t2 = _e2);
      }
      e[_t2] = !0;
    }
    return e;
  }
  function R(e) {
    for (var _t3 = 0; _t3 < e.length; _t3++) {
      E(e, _t3) || (e[_t3] = null);
    }
    return e;
  }
  function w(t) {
    var n = l(null);
    var _iterator = _createForOfIteratorHelper(e(t)),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
          _o = _step$value[0],
          _r = _step$value[1];
        E(t, _o) && (Array.isArray(_r) ? n[_o] = R(_r) : _r && "object" == _typeof(_r) && _r.constructor === Object ? n[_o] = w(_r) : n[_o] = _r);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return n;
  }
  function L(e, t) {
    for (; null !== e;) {
      var _n = r(e, t);
      if (_n) {
        if (_n.get) return b(_n.get);
        if ("function" == typeof _n.value) return b(_n.value);
      }
      e = o(e);
    }
    return function () {
      return null;
    };
  }
  var v = i(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]),
    C = i(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]),
    O = i(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]),
    D = i(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]),
    x = i(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]),
    k = i(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]),
    I = i(["#text"]),
    M = i(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns", "slot"]),
    U = i(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]),
    P = i(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]),
    H = i(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
    F = a(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
    z = a(/<%[\w\W]*|[\w\W]*%>/gm),
    B = a(/\${[\w\W]*}/gm),
    W = a(/^data-[\-\w.\u00B7-\uFFFF]/),
    G = a(/^aria-[\-\w]+$/),
    Y = a(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),
    j = a(/^(?:\w+script|data):/i),
    X = a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
    q = a(/^html$/i),
    K = a(/^[a-z][.\w]*(-[.\w]+)+$/i);
  var $ = Object.freeze({
    __proto__: null,
    ARIA_ATTR: G,
    ATTR_WHITESPACE: X,
    CUSTOM_ELEMENT: K,
    DATA_ATTR: W,
    DOCTYPE_NAME: q,
    ERB_EXPR: z,
    IS_ALLOWED_URI: Y,
    IS_SCRIPT_OR_DATA: j,
    MUSTACHE_EXPR: F,
    TMPLIT_EXPR: B
  });
  var V = 1,
    Z = 3,
    J = 7,
    Q = 8,
    ee = 9,
    te = function te() {
      return "undefined" == typeof window ? null : window;
    };
  var ne = function t() {
    var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : te();
    var o = function o(e) {
      return t(e);
    };
    if (o.version = "3.2.1", o.removed = [], !n || !n.document || n.document.nodeType !== ee) return o.isSupported = !1, o;
    var r = n.document;
    var a = r,
      c = a.currentScript,
      s = n.DocumentFragment,
      N = n.HTMLTemplateElement,
      b = n.Node,
      R = n.Element,
      F = n.NodeFilter,
      _n$NamedNodeMap = n.NamedNodeMap,
      z = _n$NamedNodeMap === void 0 ? n.NamedNodeMap || n.MozNamedAttrMap : _n$NamedNodeMap,
      B = n.HTMLFormElement,
      W = n.DOMParser,
      G = n.trustedTypes,
      j = R.prototype,
      X = L(j, "cloneNode"),
      K = L(j, "remove"),
      ne = L(j, "nextSibling"),
      oe = L(j, "childNodes"),
      re = L(j, "parentNode");
    if ("function" == typeof N) {
      var _e3 = r.createElement("template");
      _e3.content && _e3.content.ownerDocument && (r = _e3.content.ownerDocument);
    }
    var ie,
      ae = "";
    var _r2 = r,
      le = _r2.implementation,
      ce = _r2.createNodeIterator,
      se = _r2.createDocumentFragment,
      ue = _r2.getElementsByTagName,
      me = a.importNode;
    var pe = {};
    o.isSupported = "function" == typeof e && "function" == typeof re && le && void 0 !== le.createHTMLDocument;
    var fe = $.MUSTACHE_EXPR,
      de = $.ERB_EXPR,
      he = $.TMPLIT_EXPR,
      ge = $.DATA_ATTR,
      Te = $.ARIA_ATTR,
      ye = $.IS_SCRIPT_OR_DATA,
      Ee = $.ATTR_WHITESPACE,
      _e = $.CUSTOM_ELEMENT;
    var Ae = $.IS_ALLOWED_URI,
      Ne = null;
    var be = S({}, [].concat(_toConsumableArray(v), _toConsumableArray(C), _toConsumableArray(O), _toConsumableArray(x), _toConsumableArray(I)));
    var Se = null;
    var Re = S({}, [].concat(_toConsumableArray(M), _toConsumableArray(U), _toConsumableArray(P), _toConsumableArray(H)));
    var we = Object.seal(l(null, {
        tagNameCheck: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: null
        },
        attributeNameCheck: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: null
        },
        allowCustomizedBuiltInElements: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: !1
        }
      })),
      Le = null,
      ve = null,
      Ce = !0,
      Oe = !0,
      De = !1,
      xe = !0,
      ke = !1,
      Ie = !0,
      Me = !1,
      Ue = !1,
      Pe = !1,
      He = !1,
      Fe = !1,
      ze = !1,
      Be = !0,
      We = !1,
      Ge = !0,
      Ye = !1,
      je = {},
      Xe = null;
    var qe = S({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
    var Ke = null;
    var $e = S({}, ["audio", "video", "img", "source", "image", "track"]);
    var Ve = null;
    var Ze = S({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]),
      Je = "http://www.w3.org/1998/Math/MathML",
      Qe = "http://www.w3.org/2000/svg",
      et = "http://www.w3.org/1999/xhtml";
    var tt = et,
      nt = !1,
      ot = null;
    var rt = S({}, [Je, Qe, et], d);
    var it = S({}, ["mi", "mo", "mn", "ms", "mtext"]),
      at = S({}, ["annotation-xml"]);
    var lt = S({}, ["title", "style", "font", "a", "script"]);
    var ct = null;
    var st = ["application/xhtml+xml", "text/html"];
    var ut = null,
      mt = null;
    var pt = r.createElement("form"),
      ft = function ft(e) {
        return e instanceof RegExp || e instanceof Function;
      },
      dt = function dt() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        if (!mt || mt !== e) {
          if (e && "object" == _typeof(e) || (e = {}), e = w(e), ct = -1 === st.indexOf(e.PARSER_MEDIA_TYPE) ? "text/html" : e.PARSER_MEDIA_TYPE, ut = "application/xhtml+xml" === ct ? d : f, Ne = E(e, "ALLOWED_TAGS") ? S({}, e.ALLOWED_TAGS, ut) : be, Se = E(e, "ALLOWED_ATTR") ? S({}, e.ALLOWED_ATTR, ut) : Re, ot = E(e, "ALLOWED_NAMESPACES") ? S({}, e.ALLOWED_NAMESPACES, d) : rt, Ve = E(e, "ADD_URI_SAFE_ATTR") ? S(w(Ze), e.ADD_URI_SAFE_ATTR, ut) : Ze, Ke = E(e, "ADD_DATA_URI_TAGS") ? S(w($e), e.ADD_DATA_URI_TAGS, ut) : $e, Xe = E(e, "FORBID_CONTENTS") ? S({}, e.FORBID_CONTENTS, ut) : qe, Le = E(e, "FORBID_TAGS") ? S({}, e.FORBID_TAGS, ut) : {}, ve = E(e, "FORBID_ATTR") ? S({}, e.FORBID_ATTR, ut) : {}, je = !!E(e, "USE_PROFILES") && e.USE_PROFILES, Ce = !1 !== e.ALLOW_ARIA_ATTR, Oe = !1 !== e.ALLOW_DATA_ATTR, De = e.ALLOW_UNKNOWN_PROTOCOLS || !1, xe = !1 !== e.ALLOW_SELF_CLOSE_IN_ATTR, ke = e.SAFE_FOR_TEMPLATES || !1, Ie = !1 !== e.SAFE_FOR_XML, Me = e.WHOLE_DOCUMENT || !1, He = e.RETURN_DOM || !1, Fe = e.RETURN_DOM_FRAGMENT || !1, ze = e.RETURN_TRUSTED_TYPE || !1, Pe = e.FORCE_BODY || !1, Be = !1 !== e.SANITIZE_DOM, We = e.SANITIZE_NAMED_PROPS || !1, Ge = !1 !== e.KEEP_CONTENT, Ye = e.IN_PLACE || !1, Ae = e.ALLOWED_URI_REGEXP || Y, tt = e.NAMESPACE || et, it = e.MATHML_TEXT_INTEGRATION_POINTS || it, at = e.HTML_INTEGRATION_POINTS || at, we = e.CUSTOM_ELEMENT_HANDLING || {}, e.CUSTOM_ELEMENT_HANDLING && ft(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (we.tagNameCheck = e.CUSTOM_ELEMENT_HANDLING.tagNameCheck), e.CUSTOM_ELEMENT_HANDLING && ft(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (we.attributeNameCheck = e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), e.CUSTOM_ELEMENT_HANDLING && "boolean" == typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (we.allowCustomizedBuiltInElements = e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), ke && (Oe = !1), Fe && (He = !0), je && (Ne = S({}, I), Se = [], !0 === je.html && (S(Ne, v), S(Se, M)), !0 === je.svg && (S(Ne, C), S(Se, U), S(Se, H)), !0 === je.svgFilters && (S(Ne, O), S(Se, U), S(Se, H)), !0 === je.mathMl && (S(Ne, x), S(Se, P), S(Se, H))), e.ADD_TAGS && (Ne === be && (Ne = w(Ne)), S(Ne, e.ADD_TAGS, ut)), e.ADD_ATTR && (Se === Re && (Se = w(Se)), S(Se, e.ADD_ATTR, ut)), e.ADD_URI_SAFE_ATTR && S(Ve, e.ADD_URI_SAFE_ATTR, ut), e.FORBID_CONTENTS && (Xe === qe && (Xe = w(Xe)), S(Xe, e.FORBID_CONTENTS, ut)), Ge && (Ne["#text"] = !0), Me && S(Ne, ["html", "head", "body"]), Ne.table && (S(Ne, ["tbody"]), delete Le.tbody), e.TRUSTED_TYPES_POLICY) {
            if ("function" != typeof e.TRUSTED_TYPES_POLICY.createHTML) throw A('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
            if ("function" != typeof e.TRUSTED_TYPES_POLICY.createScriptURL) throw A('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
            ie = e.TRUSTED_TYPES_POLICY, ae = ie.createHTML("");
          } else void 0 === ie && (ie = function (e, t) {
            if ("object" != _typeof(e) || "function" != typeof e.createPolicy) return null;
            var n = null;
            var o = "data-tt-policy-suffix";
            t && t.hasAttribute(o) && (n = t.getAttribute(o));
            var r = "dompurify" + (n ? "#" + n : "");
            try {
              return e.createPolicy(r, {
                createHTML: function createHTML(e) {
                  return e;
                },
                createScriptURL: function createScriptURL(e) {
                  return e;
                }
              });
            } catch (e) {
              return console.warn("TrustedTypes policy " + r + " could not be created."), null;
            }
          }(G, c)), null !== ie && "string" == typeof ae && (ae = ie.createHTML(""));
          i && i(e), mt = e;
        }
      },
      ht = S({}, [].concat(_toConsumableArray(C), _toConsumableArray(O), _toConsumableArray(D))),
      gt = S({}, [].concat(_toConsumableArray(x), _toConsumableArray(k))),
      Tt = function Tt(e) {
        p(o.removed, {
          element: e
        });
        try {
          re(e).removeChild(e);
        } catch (t) {
          K(e);
        }
      },
      yt = function yt(e, t) {
        try {
          p(o.removed, {
            attribute: t.getAttributeNode(e),
            from: t
          });
        } catch (e) {
          p(o.removed, {
            attribute: null,
            from: t
          });
        }
        if (t.removeAttribute(e), "is" === e && !Se[e]) if (He || Fe) try {
          Tt(t);
        } catch (e) {} else try {
          t.setAttribute(e, "");
        } catch (e) {}
      },
      Et = function Et(e) {
        var t = null,
          n = null;
        if (Pe) e = "<remove></remove>" + e;else {
          var _t4 = h(e, /^[\r\n\t ]+/);
          n = _t4 && _t4[0];
        }
        "application/xhtml+xml" === ct && tt === et && (e = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + e + "</body></html>");
        var o = ie ? ie.createHTML(e) : e;
        if (tt === et) try {
          t = new W().parseFromString(o, ct);
        } catch (e) {}
        if (!t || !t.documentElement) {
          t = le.createDocument(tt, "template", null);
          try {
            t.documentElement.innerHTML = nt ? ae : o;
          } catch (e) {}
        }
        var i = t.body || t.documentElement;
        return e && n && i.insertBefore(r.createTextNode(n), i.childNodes[0] || null), tt === et ? ue.call(t, Me ? "html" : "body")[0] : Me ? t.documentElement : i;
      },
      _t = function _t(e) {
        return ce.call(e.ownerDocument || e, e, F.SHOW_ELEMENT | F.SHOW_COMMENT | F.SHOW_TEXT | F.SHOW_PROCESSING_INSTRUCTION | F.SHOW_CDATA_SECTION, null);
      },
      At = function At(e) {
        return e instanceof B && ("string" != typeof e.nodeName || "string" != typeof e.textContent || "function" != typeof e.removeChild || !(e.attributes instanceof z) || "function" != typeof e.removeAttribute || "function" != typeof e.setAttribute || "string" != typeof e.namespaceURI || "function" != typeof e.insertBefore || "function" != typeof e.hasChildNodes);
      },
      Nt = function Nt(e) {
        return "function" == typeof b && e instanceof b;
      };
    function bt(e, t, n) {
      pe[e] && u(pe[e], function (e) {
        e.call(o, t, n, mt);
      });
    }
    var St = function St(e) {
        var t = null;
        if (bt("beforeSanitizeElements", e, null), At(e)) return Tt(e), !0;
        var n = ut(e.nodeName);
        if (bt("uponSanitizeElement", e, {
          tagName: n,
          allowedTags: Ne
        }), e.hasChildNodes() && !Nt(e.firstElementChild) && _(/<[/\w]/g, e.innerHTML) && _(/<[/\w]/g, e.textContent)) return Tt(e), !0;
        if (e.nodeType === J) return Tt(e), !0;
        if (Ie && e.nodeType === Q && _(/<[/\w]/g, e.data)) return Tt(e), !0;
        if (!Ne[n] || Le[n]) {
          if (!Le[n] && wt(n)) {
            if (we.tagNameCheck instanceof RegExp && _(we.tagNameCheck, n)) return !1;
            if (we.tagNameCheck instanceof Function && we.tagNameCheck(n)) return !1;
          }
          if (Ge && !Xe[n]) {
            var _t5 = re(e) || e.parentNode,
              _n2 = oe(e) || e.childNodes;
            if (_n2 && _t5) {
              for (var _o2 = _n2.length - 1; _o2 >= 0; --_o2) {
                var _r3 = X(_n2[_o2], !0);
                _r3.__removalCount = (e.__removalCount || 0) + 1, _t5.insertBefore(_r3, ne(e));
              }
            }
          }
          return Tt(e), !0;
        }
        return e instanceof R && !function (e) {
          var t = re(e);
          t && t.tagName || (t = {
            namespaceURI: tt,
            tagName: "template"
          });
          var n = f(e.tagName),
            o = f(t.tagName);
          return !!ot[e.namespaceURI] && (e.namespaceURI === Qe ? t.namespaceURI === et ? "svg" === n : t.namespaceURI === Je ? "svg" === n && ("annotation-xml" === o || it[o]) : Boolean(ht[n]) : e.namespaceURI === Je ? t.namespaceURI === et ? "math" === n : t.namespaceURI === Qe ? "math" === n && at[o] : Boolean(gt[n]) : e.namespaceURI === et ? !(t.namespaceURI === Qe && !at[o]) && !(t.namespaceURI === Je && !it[o]) && !gt[n] && (lt[n] || !ht[n]) : !("application/xhtml+xml" !== ct || !ot[e.namespaceURI]));
        }(e) ? (Tt(e), !0) : "noscript" !== n && "noembed" !== n && "noframes" !== n || !_(/<\/no(script|embed|frames)/i, e.innerHTML) ? (ke && e.nodeType === Z && (t = e.textContent, u([fe, de, he], function (e) {
          t = g(t, e, " ");
        }), e.textContent !== t && (p(o.removed, {
          element: e.cloneNode()
        }), e.textContent = t)), bt("afterSanitizeElements", e, null), !1) : (Tt(e), !0);
      },
      Rt = function Rt(e, t, n) {
        if (Be && ("id" === t || "name" === t) && (n in r || n in pt)) return !1;
        if (Oe && !ve[t] && _(ge, t)) ;else if (Ce && _(Te, t)) ;else if (!Se[t] || ve[t]) {
          if (!(wt(e) && (we.tagNameCheck instanceof RegExp && _(we.tagNameCheck, e) || we.tagNameCheck instanceof Function && we.tagNameCheck(e)) && (we.attributeNameCheck instanceof RegExp && _(we.attributeNameCheck, t) || we.attributeNameCheck instanceof Function && we.attributeNameCheck(t)) || "is" === t && we.allowCustomizedBuiltInElements && (we.tagNameCheck instanceof RegExp && _(we.tagNameCheck, n) || we.tagNameCheck instanceof Function && we.tagNameCheck(n)))) return !1;
        } else if (Ve[t]) ;else if (_(Ae, g(n, Ee, ""))) ;else if ("src" !== t && "xlink:href" !== t && "href" !== t || "script" === e || 0 !== T(n, "data:") || !Ke[e]) {
          if (De && !_(ye, g(n, Ee, ""))) ;else if (n) return !1;
        } else ;
        return !0;
      },
      wt = function wt(e) {
        return "annotation-xml" !== e && h(e, _e);
      },
      Lt = function Lt(e) {
        bt("beforeSanitizeAttributes", e, null);
        var t = e.attributes;
        if (!t) return;
        var n = {
          attrName: "",
          attrValue: "",
          keepAttr: !0,
          allowedAttributes: Se,
          forceKeepAttr: void 0
        };
        var r = t.length;
        var _loop = function _loop() {
            var i = t[r],
              a = i.name,
              l = i.namespaceURI,
              c = i.value,
              s = ut(a);
            var p = "value" === a ? c : y(c);
            if (n.attrName = s, n.attrValue = p, n.keepAttr = !0, n.forceKeepAttr = void 0, bt("uponSanitizeAttribute", e, n), p = n.attrValue, !We || "id" !== s && "name" !== s || (yt(a, e), p = "user-content-" + p), Ie && _(/((--!?|])>)|<\/(style|title)/i, p)) {
              yt(a, e);
              return 0; // continue
            }
            if (n.forceKeepAttr) return 0; // continue
            if (yt(a, e), !n.keepAttr) return 0; // continue
            if (!xe && _(/\/>/i, p)) {
              yt(a, e);
              return 0; // continue
            }
            ke && u([fe, de, he], function (e) {
              p = g(p, e, " ");
            });
            var f = ut(e.nodeName);
            if (Rt(f, s, p)) {
              if (ie && "object" == _typeof(G) && "function" == typeof G.getAttributeType) if (l) ;else switch (G.getAttributeType(f, s)) {
                case "TrustedHTML":
                  p = ie.createHTML(p);
                  break;
                case "TrustedScriptURL":
                  p = ie.createScriptURL(p);
              }
              try {
                l ? e.setAttributeNS(l, a, p) : e.setAttribute(a, p), At(e) ? Tt(e) : m(o.removed);
              } catch (e) {}
            }
          },
          _ret;
        for (; r--;) {
          _ret = _loop();
          if (_ret === 0) continue;
        }
        bt("afterSanitizeAttributes", e, null);
      },
      vt = function e(t) {
        var n = null;
        var o = _t(t);
        for (bt("beforeSanitizeShadowDOM", t, null); n = o.nextNode();) bt("uponSanitizeShadowNode", n, null), St(n) || (n.content instanceof s && e(n.content), Lt(n));
        bt("afterSanitizeShadowDOM", t, null);
      };
    return o.sanitize = function (e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
        n = null,
        r = null,
        i = null,
        l = null;
      if (nt = !e, nt && (e = "\x3c!--\x3e"), "string" != typeof e && !Nt(e)) {
        if ("function" != typeof e.toString) throw A("toString is not a function");
        if ("string" != typeof (e = e.toString())) throw A("dirty is not a string, aborting");
      }
      if (!o.isSupported) return e;
      if (Ue || dt(t), o.removed = [], "string" == typeof e && (Ye = !1), Ye) {
        if (e.nodeName) {
          var _t6 = ut(e.nodeName);
          if (!Ne[_t6] || Le[_t6]) throw A("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (e instanceof b) n = Et("\x3c!----\x3e"), r = n.ownerDocument.importNode(e, !0), r.nodeType === V && "BODY" === r.nodeName || "HTML" === r.nodeName ? n = r : n.appendChild(r);else {
        if (!He && !ke && !Me && -1 === e.indexOf("<")) return ie && ze ? ie.createHTML(e) : e;
        if (n = Et(e), !n) return He ? null : ze ? ae : "";
      }
      n && Pe && Tt(n.firstChild);
      var c = _t(Ye ? e : n);
      for (; i = c.nextNode();) St(i) || (i.content instanceof s && vt(i.content), Lt(i));
      if (Ye) return e;
      if (He) {
        if (Fe) for (l = se.call(n.ownerDocument); n.firstChild;) l.appendChild(n.firstChild);else l = n;
        return (Se.shadowroot || Se.shadowrootmode) && (l = me.call(a, l, !0)), l;
      }
      var m = Me ? n.outerHTML : n.innerHTML;
      return Me && Ne["!doctype"] && n.ownerDocument && n.ownerDocument.doctype && n.ownerDocument.doctype.name && _(q, n.ownerDocument.doctype.name) && (m = "<!DOCTYPE " + n.ownerDocument.doctype.name + ">\n" + m), ke && u([fe, de, he], function (e) {
        m = g(m, e, " ");
      }), ie && ze ? ie.createHTML(m) : m;
    }, o.setConfig = function () {
      dt(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), Ue = !0;
    }, o.clearConfig = function () {
      mt = null, Ue = !1;
    }, o.isValidAttribute = function (e, t, n) {
      mt || dt({});
      var o = ut(e),
        r = ut(t);
      return Rt(o, r, n);
    }, o.addHook = function (e, t) {
      "function" == typeof t && (pe[e] = pe[e] || [], p(pe[e], t));
    }, o.removeHook = function (e) {
      if (pe[e]) return m(pe[e]);
    }, o.removeHooks = function (e) {
      pe[e] && (pe[e] = []);
    }, o.removeAllHooks = function () {
      pe = {};
    }, o;
  }();
  return ne;
});
