Trix.blockAttributes =
  default:
    tagName: "div"
  quote:
    groupTagName: "blockquote"
  code:
    groupTagName: "pre"
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
