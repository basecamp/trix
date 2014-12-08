Trix.blockAttributes = attributes =
  default:
    tagName: "div"
    parse: false
  quote:
    tagName: "blockquote"
  code:
    tagName: "pre"
    text:
      plaintext: true
  bulletList:
    tagName: "ul"
    parse: false
  bullet:
    tagName: "li"
    parentAttribute: "bulletList"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is attributes[@parentAttribute].tagName
  numberList:
    tagName: "ol"
    parse: false
  number:
    tagName: "li"
    parentAttribute: "numberList"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is attributes[@parentAttribute].tagName
