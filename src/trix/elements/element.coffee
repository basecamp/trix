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

  attachedCallback: ->

  detachedCallback: ->

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
