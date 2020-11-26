Trix.config.blockAttributes = attributes =
  default:
    tagName: "div"
    parse: false
  quote:
    tagName: "blockquote"
    nestable: true
  heading1:
    tagName: "h1"
    terminal: true
    breakOnReturn: true
    group: false
  heading1:
    tagName: "h1"
    terminal: true
    breakOnReturn: true
    group: false
  heading2:
    tagName: "h2"
    terminal: true
    breakOnReturn: true
    group: false
  heading3:
    tagName: "h3"
    terminal: true
    breakOnReturn: true
    group: false
  heading4:
    tagName: "h4"
    terminal: true
    breakOnReturn: true
    group: false
  heading5:
    tagName: "h5"
    terminal: true
    breakOnReturn: true
    group: false
  heading6:
    tagName: "h6"
    terminal: true
    breakOnReturn: true
    group: false
  code:
    tagName: "pre"
    terminal: true
    text:
      plaintext: true
  bulletList:
    tagName: "ul"
    parse: false
  bullet:
    tagName: "li"
    listAttribute: "bulletList"
    group: false
    nestable: true
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
  numberList:
    tagName: "ol"
    parse: false
  number:
    tagName: "li"
    listAttribute: "numberList"
    group: false
    nestable: true
    test: (element) ->
      Trix.tagName(element.parentNode) is attributes[@listAttribute].tagName
  attachmentGallery:
    tagName: "div"
    exclusive: true
    terminal: true
    parse: false
    group: false
