Trix.config.textAttributes =
  bold:
    tagName: "strong"
    inheritable: true
    parser: (element) ->
      style = window.getComputedStyle(element)
      style["fontWeight"] is "bold" or style["fontWeight"] >= 700
  italic:
    tagName: "em"
    inheritable: true
    parser: (element) ->
      style = window.getComputedStyle(element)
      style["fontStyle"] is "italic"
  href:
    groupTagName: "a"
    parser: (element) ->
      if link = Trix.DOM.findClosestElementFromNode(element, matchingSelector: "a:not([data-trix-attachment])")
        link.getAttribute("href")
  underline:
    style: { "textDecoration": "underline" }
    inheritable: true
  frozen:
    style: { "backgroundColor": "highlight" }
