#= require trix/models/attachment
#= require trix/dom

class Trix.AttachmentController
  imageEditorSelector = "div.image-editor"
  imageResizeHandleSelector = "#{imageEditorSelector} div.resize-handle"

  constructor: (@element, @container) ->
    @attachment = Trix.Attachment.get(@element.trixAttachmentId)
    @install()

  install: ->
    @editor = document.createElement("div")
    @editor.setAttribute("contenteditable", false)
    @editor.classList.add("image-editor")
    setStyle(@editor, getDimensions(@element))

    @handleElement = document.createElement("div")
    @handleElement.classList.add("resize-handle")
    @handleElement.classList.add("se")
    @handleElement.addEventListener("mousedown", @didMouseDownResizeHandle)

    @element.parentElement.insertBefore(@editor, @element)
    @editor.appendChild(@element)
    @editor.appendChild(@handleElement)
    setStyle(@element, width: "100%", height: "auto")

  uninstall: =>
    setStyle(@element, getDimensions(@element))
    @editor.parentElement.replaceChild(@element, @editor)
    @delegate?.attachmentControllerDidUninstall()

  didMouseDownResizeHandle: =>
    event.preventDefault()

    @container.style["cursor"] = window.getComputedStyle(@handleElement)["cursor"]
    @container.addEventListener("mousemove", @didMoveMouseToResize)
    document.addEventListener("mouseup", @didMouseUpToEndResize)

    @resizing =
      startWidth: parseInt(getDimensions(@editor).width, 10)
      startClientX: event.clientX

  didMoveMouseToResize: (event) =>
    width = (@resizing.startWidth + event.clientX - @resizing.startClientX) + "px"
    height = getDimensions(@element).height
    setStyle(@editor, {width, height})

  didMouseUpToEndResize: =>
    @container.style["cursor"] = "auto"
    @container.removeEventListener("mousemove", @didMoveMouseToResize)
    document.removeEventListener("mouseup", @didMouseUpToEndResize)

    # Use offsets to avoid possible sub-pixel dimensions from the computed style
    attributes = { width: @element.offsetWidth, height: @element.offsetHeight }
    @attachment.setAttributes(attributes)

    @uninstall()

  getDimensions = (element) ->
    style = window.getComputedStyle(element)
    dimensions = {}
    dimensions[key] = style[key] for key in ["width", "height"]
    dimensions

  setStyle = (element, attributes) ->
    element.style[key] = value for key, value of attributes
