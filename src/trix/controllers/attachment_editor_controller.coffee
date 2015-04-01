#= require trix/controllers/attachment_editor_controller

{handleEvent, makeElement, tagName} = Trix
{keyNames} = Trix.InputController

class Trix.AttachmentEditorController extends Trix.BasicObject
  constructor: (@attachmentPiece, @element, @container) ->
    {@attachment} = @attachmentPiece
    @element = @element.firstChild if tagName(@element) is "a"
    @install()

  undoable = (fn) -> ->
    commands = fn.apply(this, arguments)
    commands.do()
    @undos ?= []
    @undos.push(commands.undo)

  install: ->
    @makeElementMutable()
    @makeCaptionEditable() if @attachment.isPreviewable()
    @addRemoveButton()

  makeElementMutable: undoable ->
    do: => @element.dataset.trixMutable = true
    undo: => delete @element.dataset.trixMutable

  makeCaptionEditable: undoable ->
    figcaption = @element.querySelector("figcaption")
    handler = null
    do: => handler = handleEvent("click", onElement: figcaption, withCallback: @didClickCaption, inPhase: "capturing")
    undo: => handler.destroy()

  addRemoveButton: undoable ->
    removeButton = makeElement(tagName: "a", textContent: "⊗", className: "remove", attributes: { href: "#", title: "Remove" })
    handleEvent("click", onElement: removeButton, withCallback: @didClickRemoveButton)
    do: => @element.appendChild(removeButton)
    undo: => @element.removeChild(removeButton)

  editCaption: undoable ->
    input = document.createElement("textarea", "trix-input")
    input.setAttribute("placeholder", Trix.config.lang.attachment.captionPlaceholder)
    input.value = @attachmentPiece.getCaption()

    handleEvent("keydown", onElement: input, withCallback: @didKeyDownCaption)
    handleEvent("change", onElement: input, withCallback: @didChangeCaption)
    handleEvent("blur", onElement: input, withCallback: @uninstall)

    figcaption = @element.querySelector("figcaption")
    editingFigcaption = figcaption.cloneNode()

    do: ->
      figcaption.style.display = "none"
      editingFigcaption.appendChild(input)
      editingFigcaption.classList.add("editing")
      figcaption.parentElement.insertBefore(editingFigcaption, figcaption)
      input.focus()
    undo: ->
      editingFigcaption.parentNode.removeChild(editingFigcaption)
      figcaption.style.display = null

  didClickRemoveButton: (event) =>
    event.preventDefault()
    event.stopPropagation()
    @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

  didClickCaption: (event) =>
    event.preventDefault()
    @editCaption()

  didChangeCaption: (event) =>
    caption = event.target.value.replace(/\s/g, " ").trim()
    if caption
      @delegate?.attachmentEditorDidRequestUpdatingAttributesForAttachment?({caption}, @attachment)
    else
      @delegate?.attachmentEditorDidRequestRemovingAttributeForAttachment?("caption", @attachment)

  didKeyDownCaption: (event) =>
    if keyNames[event.keyCode] is "return"
      event.preventDefault()
      @didChangeCaption(event)
      @delegate?.attachmentEditorDidRequestDeselectingAttachment?(@attachment)

  uninstall: =>
    undo() while undo = @undos.pop()
    @delegate?.didUninstallAttachmentEditor(this)
