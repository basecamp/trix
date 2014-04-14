#= require trix/controllers/attachment_controller

class Trix.ImageAttachmentController extends Trix.AttachmentController
  imageEditorSelector = "div.image-editor"
  imageResizeHandleSelector = "#{imageEditorSelector} div.resize-handle"

  install: ->
    @editor = document.createElement("div")
    @editor.setAttribute("contenteditable", false)
    @editor.classList.add("image-editor")
    @setStyle(@editor, @getDimensions(@element))

    @handleElement = document.createElement("div")
    @handleElement.classList.add("resize-handle")
    @handleElement.classList.add("se")
    @handleElement.addEventListener("mousedown", @didMouseDownResizeHandle)

    @element.parentElement.insertBefore(@editor, @element)
    @editor.appendChild(@element)
    @editor.appendChild(@handleElement)
    @setStyle(@element, width: "100%", height: "auto")

  uninstall: =>
    @setStyle(@element, width: null, height: null)
    @editor.parentElement.replaceChild(@element, @editor)
    super()

  didMouseDownResizeHandle: =>
    event.preventDefault()

    @container.style["cursor"] = window.getComputedStyle(@handleElement)["cursor"]
    @container.addEventListener("mousemove", @didMoveMouseToResize)
    document.addEventListener("mouseup", @didMouseUpToEndResize)

    @resizing =
      startWidth: parseInt(@getDimensions(@editor).width, 10)
      startClientX: event.clientX

  didMoveMouseToResize: (event) =>
    width = (@resizing.startWidth + event.clientX - @resizing.startClientX) + "px"
    height = @getDimensions(@element).height
    @setStyle(@editor, {width, height})

  didMouseUpToEndResize: =>
    @container.style["cursor"] = "auto"
    @container.removeEventListener("mousemove", @didMoveMouseToResize)
    document.removeEventListener("mouseup", @didMouseUpToEndResize)

    # Use offsets to avoid possible sub-pixel dimensions from the computed style
    attributes = { width: @element.offsetWidth, height: @element.offsetHeight }
    @attachment.setAttributes(attributes)

    @uninstall()
