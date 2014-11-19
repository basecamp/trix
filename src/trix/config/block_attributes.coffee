Trix.blockAttributes =
  quote:
    tagName: "blockquote"
  code:
    tagName: "pre"
    text:
      plaintext: true
  bullet:
    tagName: "li"
    listTagName: "ul"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is @listTagName
  number:
    tagName: "li"
    listTagName: "ol"
    test: (element) ->
      Trix.DOM.tagName(element.parentNode) is @listTagName
