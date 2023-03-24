import { removeNode } from "trix/core/helpers"

import * as config from "trix/config"
import BasicObject from "trix/core/basic_object"

import { defer, handleEvent, makeElement, tagName, triggerEvent } from "trix/core/helpers"
const { lang, css, keyNames } = config

const undoable = function(fn) {
  return function() {
    const commands = fn.apply(this, arguments)
    commands.do()
    if (!this.undos) {
      this.undos = []
    }
    this.undos.push(commands.undo)
  }
}

export default class AttachmentEditorController extends BasicObject {
  constructor(attachmentPiece, element, container, options = {}) {
    super(...arguments)
    this.didClickToolbar = this.didClickToolbar.bind(this)
    this.didClickActionButton = this.didClickActionButton.bind(this)
    this.didKeyDownCaption = this.didKeyDownCaption.bind(this)
    this.didInputCaption = this.didInputCaption.bind(this)
    this.didChangeCaption = this.didChangeCaption.bind(this)
    this.didBlurCaption = this.didBlurCaption.bind(this)
    this.attachmentPiece = attachmentPiece
    this.element = element
    this.container = container
    this.options = options
    this.attachment = this.attachmentPiece.attachment
    if (tagName(this.element) === "a") {
      this.element = this.element.firstChild
    }
    this.install()
  }

  install() {
    this.makeElementMutable()
    this.addToolbar()
    if (this.attachment.isPreviewable()) {
      this.installCaptionEditor()
    }
  }

  uninstall() {
    let undo = this.undos.pop()
    this.savePendingCaption()
    while (undo) {
      undo()
      undo = this.undos.pop()
    }
    this.delegate?.didUninstallAttachmentEditor(this)
  }

  // Private

  savePendingCaption() {
    if (this.pendingCaption != null) {
      const caption = this.pendingCaption
      this.pendingCaption = null
      if (caption) {
        this.delegate?.attachmentEditorDidRequestUpdatingAttributesForAttachment?.({ caption }, this.attachment)
      } else {
        this.delegate?.attachmentEditorDidRequestRemovingAttributeForAttachment?.("caption", this.attachment)
      }
    }
  }

  // Installing and uninstalling

  makeElementMutable = undoable(() => {
    return {
      do: () => {
        this.element.dataset.trixMutable = true
      },
      undo: () => delete this.element.dataset.trixMutable,
    }
  })

  addToolbar = undoable(() => {
    // <div class="#{css.attachmentMetadataContainer}" data-trix-mutable="true">
    //   <div class="trix-button-row">
    //     <span class="trix-button-group trix-button-group--actions">
    //       <button type="button" class="trix-button trix-button--remove" title="#{lang.remove}" data-trix-action="remove">#{lang.remove}</button>
    //     </span>
    //   </div>
    // </div>
    const element = makeElement({
      tagName: "div",
      className: css.attachmentToolbar,
      data: { trixMutable: true },
      childNodes: makeElement({
        tagName: "div",
        className: "trix-button-row",
        childNodes: makeElement({
          tagName: "span",
          className: "trix-button-group trix-button-group--actions",
          childNodes: makeElement({
            tagName: "button",
            className: "trix-button trix-button--remove",
            textContent: lang.remove,
            attributes: { title: lang.remove },
            data: { trixAction: "remove" },
          }),
        }),
      }),
    })

    if (this.attachment.isPreviewable()) {
      // <div class="#{css.attachmentMetadataContainer}">
      //   <span class="#{css.attachmentMetadata}">
      //     <span class="#{css.attachmentName}" title="#{name}">#{name}</span>
      //     <span class="#{css.attachmentSize}">#{size}</span>
      //   </span>
      // </div>
      element.appendChild(
        makeElement({
          tagName: "div",
          className: css.attachmentMetadataContainer,
          childNodes: makeElement({
            tagName: "span",
            className: css.attachmentMetadata,
            childNodes: [
              makeElement({
                tagName: "span",
                className: css.attachmentName,
                textContent: this.attachment.getFilename(),
                attributes: { title: this.attachment.getFilename() },
              }),
              makeElement({
                tagName: "span",
                className: css.attachmentSize,
                textContent: this.attachment.getFormattedFilesize(),
              }),
            ],
          }),
        })
      )
    }

    handleEvent("click", { onElement: element, withCallback: this.didClickToolbar })
    handleEvent("click", {
      onElement: element,
      matchingSelector: "[data-trix-action]",
      withCallback: this.didClickActionButton,
    })

    triggerEvent("trix-attachment-before-toolbar", { onElement: this.element, attributes: { toolbar: element, attachment: this.attachment } })

    return {
      do: () => this.element.appendChild(element),
      undo: () => removeNode(element),
    }
  })

  installCaptionEditor = undoable(() => {
    const textarea = makeElement({
      tagName: "textarea",
      className: css.attachmentCaptionEditor,
      attributes: { placeholder: lang.captionPlaceholder },
      data: { trixMutable: true },
    })
    textarea.value = this.attachmentPiece.getCaption()

    const textareaClone = textarea.cloneNode()
    textareaClone.classList.add("trix-autoresize-clone")
    textareaClone.tabIndex = -1

    const autoresize = function() {
      textareaClone.value = textarea.value
      textarea.style.height = textareaClone.scrollHeight + "px"
    }

    handleEvent("input", { onElement: textarea, withCallback: autoresize })
    handleEvent("input", { onElement: textarea, withCallback: this.didInputCaption })
    handleEvent("keydown", { onElement: textarea, withCallback: this.didKeyDownCaption })
    handleEvent("change", { onElement: textarea, withCallback: this.didChangeCaption })
    handleEvent("blur", { onElement: textarea, withCallback: this.didBlurCaption })

    const figcaption = this.element.querySelector("figcaption")
    const editingFigcaption = figcaption.cloneNode()

    return {
      do: () => {
        figcaption.style.display = "none"
        editingFigcaption.appendChild(textarea)
        editingFigcaption.appendChild(textareaClone)
        editingFigcaption.classList.add(`${css.attachmentCaption}--editing`)
        figcaption.parentElement.insertBefore(editingFigcaption, figcaption)
        autoresize()
        if (this.options.editCaption) {
          return defer(() => textarea.focus())
        }
      },
      undo() {
        removeNode(editingFigcaption)
        figcaption.style.display = null
      },
    }
  })

  // Event handlers

  didClickToolbar(event) {
    event.preventDefault()
    return event.stopPropagation()
  }

  didClickActionButton(event) {
    const action = event.target.getAttribute("data-trix-action")
    switch (action) {
      case "remove":
        return this.delegate?.attachmentEditorDidRequestRemovalOfAttachment(this.attachment)
    }
  }

  didKeyDownCaption(event) {
    if (keyNames[event.keyCode] === "return") {
      event.preventDefault()
      this.savePendingCaption()
      return this.delegate?.attachmentEditorDidRequestDeselectingAttachment?.(this.attachment)
    }
  }

  didInputCaption(event) {
    this.pendingCaption = event.target.value.replace(/\s/g, " ").trim()
  }

  didChangeCaption(event) {
    return this.savePendingCaption()
  }

  didBlurCaption(event) {
    return this.savePendingCaption()
  }
}
