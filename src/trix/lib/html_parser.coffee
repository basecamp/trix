#= require trix/models/text
#= require trix/lib/dom

class Trix.HTMLParser
  allowedAttributes = "style href src width height".split(" ")

  @parse: (html) ->
    parser = new this html
    parser.parse()
    parser

  constructor: (@html) ->
    @text = new Trix.Text

  createHiddenContainer: ->
    @container = sanitizeHTML(squish(@html))
    @container.style["display"] = "none"
    document.body.appendChild(@container)

  removeHiddenContainer: ->
    document.body.removeChild(@container)

  parse: ->
    @createHiddenContainer()
    walker = document.createTreeWalker(@container, NodeFilter.SHOW_ALL)
    @processNode(walker.currentNode) while walker.nextNode()
    @removeHiddenContainer()

  processNode: (node) ->
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @processElementNode(node)

  processTextNode: (node) ->
    string = node.textContent.replace(/\s/, " ")
    @appendString(string, getAttributes(node.parentNode))

  processElementNode: (node) ->
    switch node.tagName.toLowerCase()
      when "br"
        @appendString("\n", getAttributes(node))
      when "img"
        attributes = { contentType: "image", url: node.getAttribute("src") }

        for key in ["width", "height"] when value = node.getAttribute(key)
          attributes[key] = value

        @appendAttachment(attributes, getAttributes(node))

  appendString: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @text.appendText(text)

  appendAttachment: (attachmentAttributes, attributes) ->
    attachment = new Trix.Attachment attachmentAttributes
    text = Trix.Text.textForAttachmentWithAttributes(attachment, attributes)
    @text.appendText(text)

  getText: ->
    @text

  getAttributes = (element) ->
    attributes = {}
    style = window.getComputedStyle(element)

    for attribute, config of Trix.attributes when config.parser
      if value = config.parser({element, style})
        attributes[attribute] = value

    attributes

  squish = (string) ->
    string.trim().replace(/\n/g, " ").replace(/\s{2,}/g, " ")

  sanitizeHTML = (html) ->
    container = document.createElement("div")
    container.innerHTML = html
    walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)

    while walker.nextNode()
      element = walker.currentNode
      for attribute in [element.attributes...]
        do (attribute) ->
          {name} = attribute
          element.removeAttribute(name) unless name in allowedAttributes

    container
