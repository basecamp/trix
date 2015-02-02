{makeElement} = Trix

class HTMLElement
  @prototype = Object.create window.HTMLElement.prototype,
    constructor:
      writable: true
      value: this

class Trix.Element extends HTMLElement
  createdCallback: ->
    @loadStylesheet()
    @innerHTML = @constructor.defaultHTML if @constructor.defaultHTML? and @innerHTML is ""

  loadStylesheet: ->
    tagName = @tagName.toLowerCase()
    return if document.querySelector("style[data-tag-name='#{tagName}']")

    css = "#{tagName} { display: block }\n"
    css += @constructor.defaultCSS if @constructor.defaultCSS?

    element = makeElement("style", type: "text/css")
    element.setAttribute("data-tag-name", tagName)
    element.textContent = css

    head = document.querySelector("head")
    head.insertBefore(element, head.firstChild)
    element
