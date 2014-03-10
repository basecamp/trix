#= require trix/dom

{DOM} = Trix

class Trix.AttachmentController
  imageEditorSelector = "div.image-editor"
  imageResizeHandleSelector = "#{imageEditorSelector} div.resize-handle"

  constructor: (@element, @responder) ->
    DOM.on(@element, "click", "img", @didClickImage)
    DOM.on(@element, "dragover", @dragover)
    for event in ["dragstart", "dragend"]
      DOM.on(@element, event, imageResizeHandleSelector, @[event])

  didClickImage: (event, image) =>
    if DOM.closest(image, imageEditorSelector)
      uninstallImageEditor(image)
    else
      installImageEditor(image)

  dragstart: (event, element) =>
    event.dataTransfer.effectAllowed = "none"
    event.dataTransfer.setData("text/plain", "resize")

    @dragging =
      editor: editor = element.parentElement
      image: editor.firstChild
      width: parseInt(getDimensions(editor).width, 10)
      maxWidth: parseInt(getDimensions(@element).width, 10)
      startX: event.clientX

  dragover: (event, element) =>
    return unless @dragging
    width = @dragging.width + event.clientX - @dragging.startX

    unless width > @dragging.maxWidth
      width = "#{width}px"
      height = getDimensions(@dragging.image).height
      setStyle(@dragging.editor, {width, height})

  dragend: (event, element) =>
    console.log "Image resized to:", getDimensions(@dragging.image)
    uninstallImageEditor(@dragging.image)
    delete @dragging

  installImageEditor = (image) ->
    editor = document.createElement("div")
    editor.setAttribute("contenteditable", false)
    editor.classList.add("image-editor")
    setStyle(editor, getDimensions(image))

    handle = document.createElement("div")
    handle.setAttribute("draggable", true)
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
