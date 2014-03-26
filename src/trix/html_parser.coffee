#= require trix/models/text
#= require trix/dom

class Trix.HTMLParser
  styleMap =
    bold: ["font-weight", "bold"]
    italic: ["font-style", "italic"]

  constructor: (html) ->
    @container = document.createElement("div")
    @container.style["display"] = "none"
    @container.innerHTML = html
    @text = new Trix.Text

  parse: ->
    # TODO: Don't append potentially unsafe HTML to the body
    document.body.appendChild(@container)

    walker = document.createTreeWalker(@container, NodeFilter.SHOW_ALL)
    @processNode(walker.currentNode) while walker.nextNode()

    document.body.removeChild(@container)

  processNode: (node) ->
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @processElementNode(node)

  processTextNode: (node) ->
    @appendString(node.textContent, getAttributes(node.parentNode))

  processElementNode: (node) ->
    switch node.tagName.toLowerCase()
      when "br"
        @appendString("\n", getAttributes(node))

  appendString: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @text.appendText(text)

  getAttributes = (element) ->
    attributes = {}
    style = window.getComputedStyle(element)

    for attribute, [property, value] of styleMap
      if style[property] is value
        attributes[attribute] = true

    if link = Trix.DOM.closest(element, "a")
      attributes["href"] = link.getAttribute("href")

    attributes
