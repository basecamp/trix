{tagName, walkTree, nodeIsAttachmentElement} = Trix

class Trix.HTMLSanitizer extends Trix.BasicObject
  DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height class".split(" ")

  @sanitize: (html, options) ->
    sanitizer = new this html, options
    sanitizer.sanitize()
    sanitizer

  constructor: (html, {@allowedAttributes} = {}) ->
    @allowedAttributes ?= DEFAULT_ALLOWED_ATTRIBUTES
    @body = createBodyElementForHTML(html)

  sanitize: ->
    @sanitizeElements()

  getHTML: ->
    @body.innerHTML

  getBody: ->
    @body

  # Private

  sanitizeElements: ->
    walker = walkTree(@body)
    nodesToRemove = []

    while walker.nextNode()
      node = walker.currentNode
      switch node.nodeType
        when Node.ELEMENT_NODE
          if elementIsRemovable(node)
            nodesToRemove.push(node)
          else
            @sanitizeElement(node)
        when Node.COMMENT_NODE
          nodesToRemove.push(node)

    for node in nodesToRemove
      node.parentNode.removeChild(node)
    @body

  sanitizeElement: (element) ->
    for {name} in [element.attributes...]
      unless name in @allowedAttributes or name.indexOf("data-trix") is 0
        element.removeAttribute(name)
    element

  elementIsRemovable = (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if nodeIsAttachmentElement(element)
    tagName(element) is "script" or element.getAttribute("data-trix-serialize") is "false"

  createBodyElementForHTML = (html = "") ->
    # Remove everything after </html>
    html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>")
    doc = document.implementation.createHTMLDocument("")
    doc.documentElement.innerHTML = html
    for element in doc.head.querySelectorAll("style")
      doc.body.appendChild(element)
    doc.body
