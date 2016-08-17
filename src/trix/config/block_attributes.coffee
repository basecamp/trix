Trix.config.blockAttributes = attributes =
  default:
    tagName: "div"
    parse: false
  quote:
    tagName: "blockquote"
    indentable: true
  heading1:
    tagName: "h1"
    terminal: true
    breakOnReturn: true
    group: false
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
    group: false
    indentable: true
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
  numberList:
    tagName: "ol"
    parse: false
  number:
    tagName: "li"
    listAttribute: "numberList"
    group: false
    indentable: true
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
