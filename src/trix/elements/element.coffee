{makeElement} = Trix

class HTMLElement
  @prototype = Object.create window.HTMLElement.prototype,
    constructor:
      writable: true
      value: this

class Trix.Element extends HTMLElement
  @defineProperty: (name, descriptor) ->
    Object.defineProperty(@prototype, name, descriptor)

  createdCallback: ->
    @loadStylesheet()
    @innerHTML = @constructor.defaultHTML if @constructor.defaultHTML? and @innerHTML is ""

  attachedCallback: ->

  detachedCallback: ->

  attributeChangedCallback: ->

  loadStylesheet: ->
    tagName = @tagName.toLowerCase()
    return if document.querySelector("style[data-tag-name='#{tagName}']")

    element = makeElement("style", type: "text/css")
    element.setAttribute("data-tag-name", tagName)
    element.textContent = @getDefaultCSS()

    head = document.querySelector("head")
    head.insertBefore(element, head.firstChild)
    element

  getDefaultCSS: (css = @constructor.defaultCSS) ->
    css = "%t { display: block }\n#{[css]}"
    css.replace(/%t/g, @tagName.toLowerCase())
