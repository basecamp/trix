#= require trix/dom

{DOM} = Trix

class Trix.AttachmentController
  imageEditorSelector = "div.image-editor"
  imageResizeHandleSelector = "#{imageEditorSelector} div.resize-handle"

  constructor: (@element, @responder) ->
    DOM.on(@element, "click", "img", @didClickImage)
    DOM.on(@element, "mousedown", imageResizeHandleSelector, @didMouseDownResizeHandle)

  didClickImage: (event, image) =>
    if DOM.closest(image, imageEditorSelector)
      uninstallImageEditor(image)
    else
      installImageEditor(image)

  didMouseDownResizeHandle: (event, handleElement) =>
    event.preventDefault()

    @element.style["cursor"] = window.getComputedStyle(handleElement)["cursor"]
    @element.addEventListener("mousemove", @didMoveMouseToResize)
    document.addEventListener("mouseup", @didMouseUpToEndResize)

    @resizing =
      editor: editor = handleElement.parentElement
      image: editor.firstChild
      startWidth: parseInt(getDimensions(editor).width, 10)
      startClientX: event.clientX

  didMoveMouseToResize: (event) =>
    width = (@resizing.startWidth + event.clientX - @resizing.startClientX) + "px"
    height = getDimensions(@resizing.image).height
    setStyle(@resizing.editor, {width, height})

  didMouseUpToEndResize: (event) =>
    @element.style["cursor"] = "auto"
    @element.removeEventListener("mousemove", @didMoveMouseToResize)
    document.removeEventListener("mouseup", @didMouseUpToEndResize)

    @delegate?.attachmentControllerDidChangeAttributesAtPosition(getDimensions(@resizing.image), @resizing.image.trixPosition)
    uninstallImageEditor(@resizing.image)
    delete @resizing

  installImageEditor = (image) ->
    editor = document.createElement("div")
    editor.setAttribute("contenteditable", false)
    editor.classList.add("image-editor")
    setStyle(editor, getDimensions(image))

    handle = document.createElement("div")
    handle.classList.add("resize-handle")
    handle.classList.add("se")

    image.parentElement.insertBefore(editor, image)
    editor.appendChild(image)
    editor.appendChild(handle)
    setStyle(image, width: "100%", height: "auto")

  uninstallImageEditor = (image) ->
    setStyle(image, getDimensions(image))
    editor = DOM.closest(image, imageEditorSelector)
    editor.parentElement.replaceChild(image, editor)

  getDimensions = (element) ->
    style = window.getComputedStyle(element)
    dimensions = {}
    dimensions[key] = style[key] for key in ["width", "height"]
    dimensions

  setStyle = (element, attributes) ->
    element.style[key] = value for key, value of attributes
