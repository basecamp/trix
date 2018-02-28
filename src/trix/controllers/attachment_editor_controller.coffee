#= require trix/controllers/attachment_editor_controller

{handleEvent, makeElement, tagName} = Trix
{keyNames} = Trix.InputController
{lang, css} = Trix.config

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
    @addToolbar()

  uninstall: ->
    @savePendingCaption()
    undo() while undo = @undos.pop()
    @delegate?.didUninstallAttachmentEditor(this)

  # Private

  savePendingCaption: ->
    if @pendingCaption?
      caption = @pendingCaption
      @pendingCaption = null
      if caption
        @delegate?.attachmentEditorDidRequestUpdatingAttributesForAttachment?({caption}, @attachment)
      else
        @delegate?.attachmentEditorDidRequestRemovingAttributeForAttachment?("caption", @attachment)

  # Installing and uninstalling

  makeElementMutable: undoable ->
    do: => @element.dataset.trixMutable = true
    undo: => delete @element.dataset.trixMutable

  makeCaptionEditable: undoable ->
    figcaption = @element.querySelector("figcaption")
    handler = null
    do: => handler = handleEvent("click", onElement: figcaption, withCallback: @didClickCaption, inPhase: "capturing")
    undo: => handler.destroy()

  addToolbar: undoable ->
    toolbarElement = makeElement
      tagName: "div"
      className: "attachment__toolbar"
      data: trixMutable: true

    toolbarElement.innerHTML = """
      <button type="button" data-size="small">small</button>
      <button type="button" data-size="medium">medium</button>
      <button type="button" data-size="large">large</button>
      <button type="button" data-remove="true" class="#{css.attachmentRemove} #{css.attachmentRemove}--icon">#{lang.remove}</button>
    """

    handleEvent("click", onElement: toolbarElement, withCallback: @didClickToolbar)

    do: => @element.appendChild(toolbarElement)
    undo: => @element.removeChild(toolbarElement)

  editCaption: undoable ->
    textarea = makeElement
      tagName: "textarea"
      className: css.attachmentCaptionEditor
      attributes: placeholder: lang.captionPlaceholder
    textarea.value = @attachmentPiece.getCaption()

    textareaClone = textarea.cloneNode()
    textareaClone.classList.add("trix-autoresize-clone")

    autoresize = ->
      textareaClone.value = textarea.value
      textarea.style.height = textareaClone.scrollHeight + "px"

    handleEvent("keydown", onElement: textarea, withCallback: @didKeyDownCaption)
    handleEvent("input", onElement: textarea, withCallback: @didInputCaption)
    handleEvent("change", onElement: textarea, withCallback: @didChangeCaption)
    handleEvent("blur", onElement: textarea, withCallback: @didBlurCaption)

    figcaption = @element.querySelector("figcaption")
    editingFigcaption = figcaption.cloneNode()

    do: ->
      figcaption.style.display = "none"
      editingFigcaption.appendChild(textarea)
      editingFigcaption.appendChild(textareaClone)
      editingFigcaption.classList.add("#{css.attachmentCaption}--editing")
      figcaption.parentElement.insertBefore(editingFigcaption, figcaption)
      autoresize()
      textarea.focus()
    undo: ->
      editingFigcaption.parentNode.removeChild(editingFigcaption)
      figcaption.style.display = null

  # Event handlers

  didClickToolbar: (event) =>
    event.preventDefault()
    event.stopPropagation()
    {size, remove} = event.target.dataset

    if size
      if size is "large"
        @delegate?.attachmentEditorDidRequestRemovingAttributeForAttachment?("size", @attachment)
      else
        @delegate?.attachmentEditorDidRequestUpdatingAttributesForAttachment?({size}, @attachment)
      @delegate?.attachmentEditorDidRequestDeselectingAttachment?(@attachment)
    else if remove
      @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

  didClickCaption: (event) =>
    event.preventDefault()
    @editCaption()

  didKeyDownCaption: (event) =>
    if keyNames[event.keyCode] is "return"
      event.preventDefault()
      @savePendingCaption()
      @delegate?.attachmentEditorDidRequestDeselectingAttachment?(@attachment)

  didInputCaption: (event) =>
    @pendingCaption = event.target.value.replace(/\s/g, " ").trim()

  didChangeCaption: (event) =>
    @savePendingCaption()

  didBlurCaption: (event) =>
    @savePendingCaption()
