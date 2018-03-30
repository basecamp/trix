#= require trix/controllers/attachment_editor_controller

{defer, handleEvent, makeElement, tagName} = Trix
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
    @addToolbar()
    if @attachment.isPreviewable()
      @editCaption()

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

  createToolbarButtonsElement: ->
    element = makeElement(tagName: "div", className: "trix-button-row")

    if @attachment.isPreviewable()
      element.innerHTML += """
        <span class="trix-button-group trix-button-group--cols">
          <button type="button" data-trix-cols="3" class="trix-button trix-button--cols trix-button--cols-3" title="#{lang.cols3}">❙❙❙</button>
          <button type="button" data-trix-cols="2" class="trix-button trix-button--cols trix-button--cols-2" title="#{lang.cols2}">❚❚</button>
          <button type="button" data-trix-cols="1" class="trix-button trix-button--cols trix-button--cols-1" title="#{lang.cols1}">■</button>
        </span>
      """

      cols = @attachmentPiece.getCols() || 1
      button = element.querySelector("[data-trix-cols='#{cols}']")
      button.classList.add("trix-active")

    element.innerHTML += """
      <span class="trix-button-group trix-button-group--actions">
        <button type="button" data-trix-action="remove" class="trix-button trix-button--remove" title="#{lang.remove}">#{lang.remove}</button>
      </span>
    """

    handleEvent("click", onElement: element, withCallback: @didClickToolbarButton)
    handleEvent("click", onElement: element, matchingSelector: "[data-trix-cols]", withCallback: @didClickColButton)
    handleEvent("click", onElement: element, matchingSelector: "[data-trix-action]", withCallback: @didClickActionButton)
    element

  createMetadataElement: ->
    element = makeElement(tagName: "span", className: "attachment__metadata")
    name = @attachment.getFilename()
    size = @attachment.getFormattedFilesize()

    if name
      nameElement = makeElement(tagName: "span", className: css.attachmentName, textContent: name, attributes: { title: name })
      element.appendChild(nameElement)

    if size
      element.appendChild(document.createTextNode(" ")) if name
      sizeElement = makeElement(tagName: "span", className: css.attachmentSize, textContent: size)
      element.appendChild(sizeElement)

    container = makeElement(tagName: "div", className: "attachment__metadata-container")
    container.appendChild(element)
    container

  # Installing and uninstalling

  makeElementMutable: undoable ->
    do: => @element.dataset.trixMutable = true
    undo: => delete @element.dataset.trixMutable

  addToolbar: undoable ->
    element = makeElement
      tagName: "div"
      className: "attachment__toolbar"
      data: trixMutable: true

    element.appendChild(@createToolbarButtonsElement())
    element.appendChild(@createMetadataElement()) if @attachment.isPreviewable()

    do: => @element.appendChild(element)
    undo: => @element.removeChild(element)

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
      defer -> textarea.focus()
    undo: ->
      editingFigcaption.parentNode.removeChild(editingFigcaption)
      figcaption.style.display = null

  # Event handlers

  didClickToolbarButton: (event) =>
    event.preventDefault()
    event.stopPropagation()

  didClickColButton: (event) =>
    cols = parseInt(event.target.getAttribute("data-trix-cols"))
    if cols > 1
      @delegate?.attachmentEditorDidRequestUpdatingAttributesForAttachment?({cols}, @attachment)
    else
      @delegate?.attachmentEditorDidRequestRemovingAttributeForAttachment?("cols", @attachment)
    @delegate?.attachmentEditorDidRequestDeselectingAttachment?(@attachment)

  didClickActionButton: (event) =>
    action = event.target.getAttribute("data-trix-action")
    if action is "remove"
      @delegate?.attachmentEditorDidRequestRemovalOfAttachment(@attachment)

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
