class RichText.Renderer
  constructor: (@text) ->

  render: ->
    container = document.createElement("div")
    @text.eachRun (string, attributes, position) ->
      element = document.createElement("span")
      element.setAttribute("data-position", position)

      element.style["font-weight"] = "bold" if attributes.bold
      element.style["font-style"] = "italic" if attributes.italic
      element.style["text-decoration"] = "underline" if attributes.underline

      textNode = document.createTextNode(string)
      element.appendChild(textNode)

      container.appendChild(element)

    container.appendChild(document.createTextNode("\uFEFF"))
    container
