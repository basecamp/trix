{cloneFragment, makeElement, makeFragment} = Trix

Trix.createElementClass = (constructor = window.HTMLElement) ->
  HTMLElement = class
    @prototype = Object.create constructor.prototype,
      constructor:
        writable: true
        value: this

  class extends HTMLElement
    @defineProperty: (name, descriptor) ->
      Object.defineProperty(@prototype, name, descriptor)

    createdCallback: ->
      @loadStylesheet()
      @loadDefaultContent()

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

    loadDefaultContent: ->
      if @innerHTML is ""
        if content = @getDefaultContent()
          @appendChild(content)

    getDefaultCSS: (css = @constructor.defaultCSS) ->
      selector = @tagName.toLowerCase()
      if type = @getAttribute("is")
        selector += "[is=#{type}]"

      css = "%t { display: block }\n#{[css]}"
      css.replace(/%t/g, selector)

    getDefaultContent: ->
      if @constructor.defaultContent?
        cloneFragment(@constructor.defaultContent)
      else if @constructor.defaultHTML?
        makeFragment(@constructor.defaultHTML)

Trix.Element = Trix.createElementClass()
