#= require trix/controllers/attachment_editor_controller

{handleEvent} = Trix.DOM

class Trix.AttachmentEditorController
  constructor: (@attachment, @element, @container) ->
    @removeButton = document.createElement("a")
    @removeButton.setAttribute("href", "#")
    @removeButton.setAttribute("title", "Remove")
    @removeButton.classList.add("remove")
    @removeButton.textContent = "⊗"
    @element.appendChild(@removeButton)

    handleEvent "click", onElement: @removeButton, withCallback: @didClickRemoveButton

  didClickRemoveButton: (event) =>
    event.preventDefault()
    event.stopPropagation()
    @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

  uninstall: ->
    @element?.removeChild(@removeButton)
    @delegate?.didUninstallAttachmentEditor(this)
