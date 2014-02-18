class RichText.Renderer
  constructor: (@text) ->

  render: ->
    container = document.createElement("div")
    @text.eachRun (string, attributes) ->
      element = document.createElement("span")
      textNode = document.createTextNode(string)
      element.style["font-weight"] = "bold" if attributes.bold
      element.style["font-style"] = "italic" if attributes.italic
      element.style["text-decoration"] = "underline" if attributes.underline
      element.appendChild(textNode)
      container.appendChild(element)
    container
