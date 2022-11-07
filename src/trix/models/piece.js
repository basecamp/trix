import TrixObject from "trix/core/object" // Don't override window.Object
import Hash from "trix/core/collections/hash"

export default class Piece extends TrixObject {
  static types = {}

  static registerType(type, constructor) {
    constructor.type = type
    this.types[type] = constructor
  }

  static fromJSON(pieceJSON) {
    const constructor = this.types[pieceJSON.type]
    if (constructor) {
      return constructor.fromJSON(pieceJSON)
    }
  }

  constructor(value, attributes = {}) {
    super(...arguments)
    this.attributes = Hash.box(attributes)
  }

  copyWithAttributes(attributes) {
    return new this.constructor(this.getValue(), attributes)
  }

  copyWithAdditionalAttributes(attributes) {
    return this.copyWithAttributes(this.attributes.merge(attributes))
  }

  copyWithoutAttribute(attribute) {
    return this.copyWithAttributes(this.attributes.remove(attribute))
  }

  copy() {
    return this.copyWithAttributes(this.attributes)
  }

  getAttribute(attribute) {
    return this.attributes.get(attribute)
  }

  getAttributesHash() {
    return this.attributes
  }

  getAttributes() {
    return this.attributes.toObject()
  }

  hasAttribute(attribute) {
    return this.attributes.has(attribute)
  }

  hasSameStringValueAsPiece(piece) {
    return piece && this.toString() === piece.toString()
  }

  hasSameAttributesAsPiece(piece) {
    return piece && (this.attributes === piece.attributes || this.attributes.isEqualTo(piece.attributes))
  }

  isBlockBreak() {
    return false
  }

  isEqualTo(piece) {
    return (
      super.isEqualTo(...arguments) ||
      this.hasSameConstructorAs(piece) &&
        this.hasSameStringValueAsPiece(piece) &&
        this.hasSameAttributesAsPiece(piece)
    )
  }

  isEmpty() {
    return this.length === 0
  }

  isSerializable() {
    return true
  }

  toJSON() {
    return {
      type: this.constructor.type,
      attributes: this.getAttributes(),
    }
  }

  contentsForInspection() {
    return {
      type: this.constructor.type,
      attributes: this.attributes.inspect(),
    }
  }

  // Grouping

  canBeGrouped() {
    return this.hasAttribute("href")
  }

  canBeGroupedWith(piece) {
    return this.getAttribute("href") === piece.getAttribute("href")
  }

  // Splittable

  getLength() {
    return this.length
  }

  canBeConsolidatedWith(piece) {
    return false
  }
}
