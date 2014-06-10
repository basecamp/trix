#= require trix/controllers/attachment_controller
#= require trix/utilities/dom

class Trix.ImageAttachmentController extends Trix.AttachmentController
  install: ->
    @editor = document.createElement("div")
    @editor.setAttribute("contenteditable", false)
    @editor.classList.add("image-editor")

    @handle = document.createElement("div")
    @handle.classList.add("resize-handle")
    @handle.classList.add("se")
    @handle.addEventListener("mousedown", @startResize)

    @element.parentElement.insertBefore(@editor, @element)
    @editor.appendChild(@element)
    @editor.appendChild(@handle)

    {width, height} = Trix.DOM.getDimensions(@element)

    @setStyle(@editor, width: "#{width}px", height: "#{height}px")
    @setStyle(@element, width: "100%", height: "auto")

  uninstall: ->
    @setStyle(@element, width: null, height: null)
    @editor.parentElement.replaceChild(@element, @editor)
    super()

  startResize: (event) =>
    event.preventDefault()

    @container.style["cursor"] = window.getComputedStyle(@handle)["cursor"]
    @container.addEventListener("mousemove", @resize)
    document.addEventListener("mouseup", @endResize)

    @resizing =
      startWidth: @editor.offsetWidth
      startClientX: event.clientX

  resize: (event) =>
    width = @resizing.startWidth + event.clientX - @resizing.startClientX + "px"
    height = @element.offsetHeight + "px"
    @setStyle(@editor, {width, height})

  endResize: (event) =>
    dimensions = width: @element.offsetWidth, height: @element.offsetHeight

    @container.style["cursor"] = "auto"
    @container.removeEventListener("mousemove", @resize)
    document.removeEventListener("mouseup", @endResize)

    delete @resizing
    @uninstall()

    @delegate?.attachmentControllerDidResizeAttachmentToDimensions(@attachment, dimensions)
