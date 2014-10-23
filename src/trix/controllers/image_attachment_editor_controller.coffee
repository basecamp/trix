#= require trix/controllers/attachment_editor_controller

{handleEvent, measureElement} = Trix.DOM

class Trix.ImageAttachmentEditorController extends Trix.AttachmentEditorController
  constructor: ->
    super
    @editor = document.createElement("div")
    @editor.setAttribute("contenteditable", false)
    @editor.classList.add("image-editor")

    @handle = document.createElement("div")
    @handle.classList.add("resize-handle")
    @handle.classList.add("se")
    @handle.addEventListener("mousedown", @startResize)

    @image = @element.querySelector("img")
    @element.insertBefore(@editor, @image)
    @editor.appendChild(@image)
    @editor.appendChild(@handle)

    {width, height} = measureElement(@image)

    @setStyle(@editor, width: "#{width}px", height: "#{height}px")
    @setStyle(@image, width: "100%", height: "auto")

  uninstall: ->
    @setStyle(@image, width: null, height: null)
    @element.replaceChild(@image, @editor)
    super

  setStyle: (element, attributes) ->
    element.style[key] = value for key, value of attributes

  startResize: (event) =>
    event.preventDefault()

    @container.style["cursor"] = window.getComputedStyle(@handle)["cursor"]

    @resizing =
      startWidth: @editor.offsetWidth
      startClientX: event.clientX
      handlers: [
        handleEvent "mousemove", onElement: @container, withCallback: @resize
        handleEvent "mouseup", withCallback: @endResize
      ]

  resize: (event) =>
    width = @resizing.startWidth + event.clientX - @resizing.startClientX + "px"
    height = @image.offsetHeight + "px"
    @setStyle(@editor, {width, height})

  endResize: (event) =>
    attributes = width: @image.offsetWidth, height: @image.offsetHeight

    @container.style["cursor"] = "auto"

    handler.destroy() for handler in @resizing.handlers
    delete @resizing

    @delegate?.attachmentEditorDidRequestUpdatingAttachmentWithAttributes?(@attachment, attributes)
