// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Piece from "trix/models/piece"

import { normalizeNewlines } from "trix/core/helpers"

export default class StringPiece extends Piece {
  static fromJSON(pieceJSON) {
    return new this(pieceJSON.string, pieceJSON.attributes)
  }

  constructor(string) {
    super(...arguments)
    this.string = normalizeNewlines(string)
    this.length = this.string.length
  }

  getValue() {
    return this.string
  }

  toString() {
    return this.string.toString()
  }

  isBlockBreak() {
    return this.toString() === "\n" && this.getAttribute("blockBreak") === true
  }

  toJSON() {
    const result = super.toJSON(...arguments).toJSON(...arguments)
    result.string = this.string
    return result
  }

  // Splittable

  canBeConsolidatedWith(piece) {
    return piece != null && this.hasSameConstructorAs(piece) && this.hasSameAttributesAsPiece(piece)
  }

  consolidateWith(piece) {
    return new this.constructor(this.toString() + piece.toString(), this.attributes)
  }

  splitAtOffset(offset) {
    let left, right
    if (offset === 0) {
      left = null
      right = this
    } else if (offset === this.length) {
      left = this
      right = null
    } else {
      left = new this.constructor(this.string.slice(0, offset), this.attributes)
      right = new this.constructor(this.string.slice(offset), this.attributes)
    }
    return [ left, right ]
  }

  toConsole() {
    let {
      string
    } = this
    if (string.length > 15) { string = string.slice(0, 14) + "…" }
    return JSON.stringify(string.toString())
  }
}

Piece.registerType("string", StringPiece)
