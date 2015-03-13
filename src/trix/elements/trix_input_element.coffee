{makeElement} = Trix

TextAreaElement = Trix.createElementClass(window.HTMLTextAreaElement)

Trix.defineElement class extends TextAreaElement
  @tagName: "trix-input"
  @extends: "textarea"

  @defaultCSS: """
    %t {
      resize: none;
    }
  """

  attachedCallback: ->
    super
    @referenceEl = makeElement("div")
    copyStyles(fromElement: this, toElement: @referenceEl)
    @referenceEl.style.position = "absolute"
    @referenceEl.style.left = "-9999px"
    @parentNode.insertBefore(@referenceEl, this)

    @addEventListener("input", @autoResize)
    @autoResize()

  detachedCallback: ->
    super
    @referenceEl.parentNode.removeChild(@referenceEl)

  autoResize: =>
    @referenceEl.innerHTML = escape(@value) + "<br>"
    @style.height = getHeight(@referenceEl)

  # Helpers

  getHeight = (element) ->
    {height} = getComputedStyle(element)
    if /^\d/.test(height)
      height
    else
      element.clientHeight + "px"

  copyStyles = ({fromElement, toElement}) ->
    for key, value of getComputedStyle(fromElement) when value and typeof value is "string"
      unless key.match(/^\d|overflow|height|cssText/i)
        toElement.style[key] = value

  escape = (string) ->
    el = document.createElement("div")
    el.textContent = string
    el.innerHTML
