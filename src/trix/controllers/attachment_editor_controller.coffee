#= require trix/controllers/attachment_editor_controller

{handleEvent, makeElement} = Trix

class Trix.AttachmentEditorController extends Trix.BasicObject
  constructor: (@attachment, @element, @container) ->
    @removeButton = makeElement(tagName: "a", textContent: "⊗", className: "remove", attributes: { href: "#", title: "Remove" })
    @element.appendChild(@removeButton)
    @element.dataset.trixMutable = true

    handleEvent "click", onElement: @removeButton, withCallback: @didClickRemoveButton

  didClickRemoveButton: (event) =>
    event.preventDefault()
    event.stopPropagation()
    @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

  uninstall: ->
    @element?.removeChild(@removeButton)
    @delegate?.didUninstallAttachmentEditor(this)
    delete @element.dataset.trixMutable
