import * as config from "trix/config"
import { makeElement } from "trix/core/helpers"

import AttachmentView from "trix/views/attachment_view"

export default class PreviewableAttachmentView extends AttachmentView {
  constructor() {
    super(...arguments)
    this.attachment.previewDelegate = this
  }

  createContentNodes() {
    this.image = makeElement({
      tagName: "img",
      attributes: {
        src: "",
      },
      data: {
        trixMutable: true,
      },
    })

    this.refresh(this.image)
    return [ this.image ]
  }

  createCaptionElement() {
    const figcaption = super.createCaptionElement(...arguments)
    if (!figcaption.textContent) {
      figcaption.setAttribute("data-trix-placeholder", config.lang.captionPlaceholder)
    }
    return figcaption
  }

  refresh(image) {
    if (!image) { image = this.findElement()?.querySelector("img") }
    if (image) {
      return this.updateAttributesForImage(image)
    }
  }

  updateAttributesForImage(image) {
    const url = this.attachment.getURL()
    const previewURL = this.attachment.getPreviewURL()
    image.src = previewURL || url

    if (previewURL === url) {
      image.removeAttribute("data-trix-serialized-attributes")
    } else {
      const serializedAttributes = JSON.stringify({ src: url })
      image.setAttribute("data-trix-serialized-attributes", serializedAttributes)
    }

    const width = this.attachment.getWidth()
    const height = this.attachment.getHeight()

    if (width != null) {
      image.width = width
    }
    if (height != null) {
      image.height = height
    }

    const storeKey = [ "imageElement", this.attachment.id, image.src, image.width, image.height ].join("/")
    image.dataset.trixStoreKey = storeKey
  }

  // Attachment delegate

  attachmentDidChangeAttributes() {
    this.refresh(this.image)
    return this.refresh()
  }
}
