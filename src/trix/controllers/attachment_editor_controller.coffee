#= require trix/controllers/attachment_editor_controller

{handleEvent, makeElement, tagName} = Trix

class Trix.AttachmentEditorController extends Trix.BasicObject
  constructor: (@attachmentPiece, @element, @container) ->
    {@attachment} = @attachmentPiece

    @element = @element.firstChild if tagName(@element) is "a"
    @element.dataset.trixMutable = true

    @addRemoveButton()

  addRemoveButton: ->
    @removeButton = makeElement(tagName: "a", textContent: "⊗", className: "remove", attributes: { href: "#", title: "Remove" })
    @element.appendChild(@removeButton)
    handleEvent "click", onElement: @removeButton, withCallback: @didClickRemoveButton

  didClickRemoveButton: (event) =>
    event.preventDefault()
    event.stopPropagation()
    @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

  editCaption: ->
    if figcaption = @element.querySelector("figcaption:not(.editing)")
      editingFigcaption = figcaption.cloneNode()
      editingFigcaption.classList.add("editing")
      figcaption.style.display = "none"

      value = @attachmentPiece.getCaption()
      placeholder = Trix.config.lang.attachment.captionPlaceholder
      input = makeElement("input", {type: "text", value, placeholder})

      editingFigcaption.appendChild(input)
      figcaption.parentElement.insertBefore(editingFigcaption, figcaption)
      input.select()

      handleEvent "change", onElement: input, withCallback: @didChangeCaption

  didChangeCaption: (event) =>
    caption = event.target.value
    @delegate?.attachmentEditorDidRequestUpdatingAttachmentWithAttributes?(@attachment, {caption})

  stopEditingCaption: ->
    if editingFigcaption = @element.querySelector("figcaption.editing")
      editingFigcaption.parentNode.removeChild(editingFigcaption)

      figcaption = @element.querySelector("figcaption")
      figcaption.removeAttribute("style")

  resetElement: ->
    @stopEditingCaption()
    @element.removeChild(@removeButton)
    delete @element.dataset.trixMutable

  uninstall: ->
    @stopEditingCaption()
    @delegate?.didUninstallAttachmentEditor(this)
