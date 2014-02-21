class Trix.ToolbarController
  constructor: (@element) ->
    @attributes = {}

  updateAttributes: (attributes) ->
    @attributes = attributes
    @eachButton (element, attributeName) ->
      if attributes[attributeName]
        element.classList.add("active")
      else
        element.classList.remove("active")

  eachButton: (callback) ->
    for element in @element.querySelectorAll(".button[data-attribute]")
      attributeName = element.getAttribute("data-attribute")
      callback(element, attributeName)
