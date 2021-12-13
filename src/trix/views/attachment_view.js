/* eslint-disable
    no-cond-assign,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"
import { ZERO_WIDTH_SPACE } from "trix/constants"
import { copyObject, makeElement } from "trix/core/helpers"
import ObjectView from "trix/views/object_view"

const { css } = config

export default class AttachmentView extends ObjectView {
  constructor() {
    super(...arguments)
    this.attachment = this.object
    this.attachment.uploadProgressDelegate = this
    this.attachmentPiece = this.options.piece
  }

  createContentNodes() {
    return []
  }

  createNodes() {
    let href, innerElement
    const figure = innerElement = makeElement({
      tagName: "figure",
      className: this.getClassName(),
      data: this.getData(),
      editable: false,
    })

    if (href = this.getHref()) {
      innerElement = makeElement({ tagName: "a", editable: false, attributes: { href, tabindex: -1 } })
      figure.appendChild(innerElement)
    }

    if (this.attachment.hasContent()) {
      innerElement.innerHTML = this.attachment.getContent()
    } else {
      Array.from(this.createContentNodes()).forEach((node) => {
        innerElement.appendChild(node)
      })
    }

    innerElement.appendChild(this.createCaptionElement())

    if (this.attachment.isPending()) {
      this.progressElement = makeElement({
        tagName: "progress",
        attributes: {
          class: css.attachmentProgress,
          value: this.attachment.getUploadProgress(),
          max: 100,
        },
        data: {
          trixMutable: true,
          trixStoreKey: [ "progressElement", this.attachment.id ].join("/"),
        },
      })

      figure.appendChild(this.progressElement)
    }

    return [ createCursorTarget("left"), figure, createCursorTarget("right") ]
  }

  createCaptionElement() {
    let caption
    const figcaption = makeElement({ tagName: "figcaption", className: css.attachmentCaption })

    if (caption = this.attachmentPiece.getCaption()) {
      figcaption.classList.add(`${css.attachmentCaption}--edited`)
      figcaption.textContent = caption
    } else {
      let name, size
      const captionConfig = this.getCaptionConfig()
      if (captionConfig.name) {
        name = this.attachment.getFilename()
      }
      if (captionConfig.size) {
        size = this.attachment.getFormattedFilesize()
      }

      if (name) {
        const nameElement = makeElement({ tagName: "span", className: css.attachmentName, textContent: name })
        figcaption.appendChild(nameElement)
      }

      if (size) {
        if (name) {
          figcaption.appendChild(document.createTextNode(" "))
        }
        const sizeElement = makeElement({ tagName: "span", className: css.attachmentSize, textContent: size })
        figcaption.appendChild(sizeElement)
      }
    }

    return figcaption
  }

  getClassName() {
    let extension
    const names = [ css.attachment, `${css.attachment}--${this.attachment.getType()}` ]
    if (extension = this.attachment.getExtension()) {
      names.push(`${css.attachment}--${extension}`)
    }
    return names.join(" ")
  }

  getData() {
    const data = {
      trixAttachment: JSON.stringify(this.attachment),
      trixContentType: this.attachment.getContentType(),
      trixId: this.attachment.id,
    }

    const { attributes } = this.attachmentPiece
    if (!attributes.isEmpty()) {
      data.trixAttributes = JSON.stringify(attributes)
    }

    if (this.attachment.isPending()) {
      data.trixSerialize = false
    }

    return data
  }

  getHref() {
    if (!htmlContainsTagName(this.attachment.getContent(), "a")) {
      return this.attachment.getHref()
    }
  }

  getCaptionConfig() {
    const type = this.attachment.getType()
    const captionConfig = copyObject(config.attachments[type]?.caption)
    if (type === "file") {
      captionConfig.name = true
    }
    return captionConfig
  }

  findProgressElement() {
    return this.findElement()?.querySelector("progress")
  }

  // Attachment delegate

  attachmentDidChangeUploadProgress() {
    let progressElement
    const value = this.attachment.getUploadProgress()
    if (progressElement = this.findProgressElement()) {
      progressElement.value = value
    }
  }
}

var createCursorTarget = (name) =>
  makeElement({
    tagName: "span",
    textContent: ZERO_WIDTH_SPACE,
    data: {
      trixCursorTarget: name,
      trixSerialize: false,
    },
  })

var htmlContainsTagName = function(html, tagName) {
  const div = makeElement("div")
  div.innerHTML = html != null ? html : ""
  return div.querySelector(tagName)
}
