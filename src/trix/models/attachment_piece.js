// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AttachmentPiece
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import Attachment from "trix/models/attachment"
import Piece from "trix/models/piece"

export default AttachmentPiece = (function() {
  AttachmentPiece = class AttachmentPiece extends Piece {
    static initClass() {

      this.permittedAttributes = [ "caption", "presentation" ]
    }
    static fromJSON(pieceJSON) {
      return new this(Attachment.fromJSON(pieceJSON.attachment), pieceJSON.attributes)
    }

    constructor(attachment) {
      super(...arguments)
      this.attachment = attachment
      this.length = 1
      this.ensureAttachmentExclusivelyHasAttribute("href")
      if (!this.attachment.hasContent()) { this.removeProhibitedAttributes() }
    }

    ensureAttachmentExclusivelyHasAttribute(attribute) {
      if (this.hasAttribute(attribute)) {
        if (!this.attachment.hasAttribute(attribute)) {
          this.attachment.setAttributes(this.attributes.slice(attribute))
        }
        this.attributes = this.attributes.remove(attribute)
      }
    }

    removeProhibitedAttributes() {
      const attributes = this.attributes.slice(this.constructor.permittedAttributes)
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
      return super.isEqualTo(...arguments).isEqualTo(piece) && this.attachment.id === piece?.attachment?.id
    }

    toString() {
      return OBJECT_REPLACEMENT_CHARACTER
    }

    toJSON() {
      const json = super.toJSON(...arguments).toJSON(...arguments)
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
  AttachmentPiece.initClass()
  return AttachmentPiece
})()

Piece.registerType("attachment", AttachmentPiece)
