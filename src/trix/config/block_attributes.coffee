Trix.blockAttributes =
  default:
    tagName: "div"
  quote:
    tagName: "blockquote"
  code:
    tagName: "pre"
    text:
      plaintext: true
  bullet:
    tagName: "li"
    groupTagName: "ul"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is @groupTagName
  number:
    tagName: "li"
    groupTagName: "ol"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is @groupTagName
