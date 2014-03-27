#= require trix/models/text
#= require trix/dom

class Trix.HTMLParser
  styleMap =
    bold: ["font-weight", "bold"]
    italic: ["font-style", "italic"]

  @parse: (html) ->
    parser = new this html
    parser.parse()
    parser

  constructor: (@html) ->
    @text = new Trix.Text

  createContainer: ->
    @container = document.createElement("div")
    @container.style["display"] = "none"
    @container.innerHTML = squish(@html)
    # TODO: Don't append potentially unsafe HTML to the body
    document.body.appendChild(@container)

  removeContainer: ->
    document.body.removeChild(@container)

  parse: ->
    @createContainer()
    walker = document.createTreeWalker(@container, NodeFilter.SHOW_ALL)
    @processNode(walker.currentNode) while walker.nextNode()
    @removeContainer()

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
      when "img"
        attachment = { type: "image" }
        attachment[key] = node[key] for key in ["src", "width", "height"]
        @appendAttachment(attachment, getAttributes(node))

  appendString: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @text.appendText(text)

  appendAttachment: (attachment, attributes) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment, attributes)
    @text.appendText(text)

  getText: ->
    @text

  getAttributes = (element) ->
    attributes = {}
    style = window.getComputedStyle(element)

    for attribute, [property, value] of styleMap
      if style[property] is value
        attributes[attribute] = true

    if link = Trix.DOM.closest(element, "a")
      attributes["href"] = link.getAttribute("href")

    attributes

  squish = (string) ->
    string.trim().replace(/\n/g, " ").replace(/\s{2,}/g, " ")
