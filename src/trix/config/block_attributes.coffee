Trix.config.blockAttributes = attributes =
  default:
    tagName: "div"
    parse: false
    singleLine: true
  h1:
    tagName: "h1"
    singleLine: true
  h2:
    tagName: "h2"
    singleLine: true
  quote:
    tagName: "blockquote"
    nestable: true
  code:
    tagName: "pre"
    text:
      plaintext: true
  bulletList:
    tagName: "ul"
    parse: false
  bullet:
    tagName: "li"
    listAttribute: "bulletList"
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
  numberList:
    tagName: "ol"
    parse: false
  number:
    tagName: "li"
    listAttribute: "numberList"
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
