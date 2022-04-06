import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import Attachment from "trix/models/attachment"
import Piece from "trix/models/piece"

export default class AttachmentPiece extends Piece {
  static permittedAttributes = [ "caption", "presentation" ]

  static fromJSON(pieceJSON) {
    return new this(Attachment.fromJSON(pieceJSON.attachment), pieceJSON.attributes)
  }

  constructor(attachment) {
    super(...arguments)
    this.attachment = attachment
    this.length = 1
    this.ensureAttachmentExclusivelyHasAttribute("href")
    if (!this.attachment.hasContent()) {
      this.removeProhibitedAttributes()
    }
  }

  ensureAttachmentExclusivelyHasAttribute(attribute) {
    if (this.hasAttribute(attribute)) {
      if (!this.attachment.hasAttribute(attribute)) {
        this.attachment.setAttributes(this.attributes.slice([ attribute ]))
      }
      this.attributes = this.attributes.remove(attribute)
    }
  }

  removeProhibitedAttributes() {
    const attributes = this.attributes.slice(AttachmentPiece.permittedAttributes)
    if (!attributes.isEqualTo(this.attributes)) {
      this.attributes = attributes
    }
  }

  getValue() {
    return this.attachment
  }

  isSerializable() {
    return !this.attachment.isPending()
  }

  getCaption() {
    return this.attributes.get("caption") || ""
  }

  isEqualTo(piece) {
    return super.isEqualTo(piece) && this.attachment.id === piece?.attachment?.id
  }

  toString() {
    return OBJECT_REPLACEMENT_CHARACTER
  }

  toJSON() {
    const json = super.toJSON(...arguments)
    json.attachment = this.attachment
    return json
  }

  getCacheKey() {
    return [ super.getCacheKey(...arguments), this.attachment.getCacheKey() ].join("/")
  }

  toConsole() {
    return JSON.stringify(this.toString())
  }
}

Piece.registerType("attachment", AttachmentPiece)
