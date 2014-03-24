#= require trix/views/text_view
#= require fixtures

module "Trix.TextView"


test "#createElementsForText", ->
  text = fixture("plain")
  elements = getElementsForText(text)
  equal elements.length, 1, "one element for plain string"

  el = elements[0]
  equal el.tagName.toLowerCase(), "span", "container element is a span"
  equal el.trixPosition, 0, "container element has a trixPosition"
  equal el.childNodes.length, 1, "container element has one child node"

  node = el.firstChild
  equal node.nodeType, Node.TEXT_NODE, "child node is a text node"
  equal node.data, text.toString(), "child node contains text string"
  equal node.trixPosition, 0, "child node has a trixPosition property"
  equal node.trixLength, text.getLength(), "child node has a trixLength property"


# Helpers

getElementsForText = (text) ->
  element = document.createElement("div")
  textView = new Trix.TextView element, text
  textView.createElementsForText()
