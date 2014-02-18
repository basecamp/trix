class RichText.Renderer
  constructor: (@text) ->

  render: ->
    container = document.createElement("div")
    @text.eachRun (string, attributes) ->
      for substring, index in string.split("\n")
        container.appendChild(document.createElement("br")) if index > 0
        element = document.createElement("span")
        textNode = document.createTextNode(substring)
        element.style["font-weight"] = "bold" if attributes.bold
        element.style["font-style"] = "italic" if attributes.italic
        element.style["text-decoration"] = "underline" if attributes.underline
        element.appendChild(textNode)
        container.appendChild(element)
    container
