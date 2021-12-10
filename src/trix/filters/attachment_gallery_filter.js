/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export var attachmentGalleryFilter = function(snapshot) {
  const filter = new Filter(snapshot)
  filter.perform()
  return filter.getSnapshot()
}

const BLOCK_ATTRIBUTE_NAME = "attachmentGallery"
const TEXT_ATTRIBUTE_NAME  = "presentation"
const TEXT_ATTRIBUTE_VALUE = "gallery"

class Filter {
  constructor(snapshot) {
    ({ document: this.document, selectedRange: this.selectedRange } = snapshot)
  }

  perform() {
    this.removeBlockAttribute()
    return this.applyBlockAttribute()
  }

  getSnapshot() {
    return { document: this.document, selectedRange: this.selectedRange }
  }

  // Private

  removeBlockAttribute() {
    return Array.from(this.findRangesOfBlocks()).map((range) =>
      this.document = this.document.removeAttributeAtRange(BLOCK_ATTRIBUTE_NAME, range))
  }

  applyBlockAttribute() {
    let offset = 0
    return (() => {
      const result = []

      Array.from(this.findRangesOfPieces()).forEach((range) => {
        if (range[1] - range[0] > 1) {
          range[0] += offset
          range[1] += offset

          if (this.document.getCharacterAtPosition(range[1]) !== "\n") {
            this.document = this.document.insertBlockBreakAtRange(range[1])
            if (range[1] < this.selectedRange[1]) { this.moveSelectedRangeForward() }
            range[1]++
            offset++
          }

          if (range[0] !== 0) {
            if (this.document.getCharacterAtPosition(range[0] - 1) !== "\n") {
              this.document = this.document.insertBlockBreakAtRange(range[0])
              if (range[0] < this.selectedRange[0]) { this.moveSelectedRangeForward() }
              range[0]++
              offset++
            }
          }

          result.push(this.document = this.document.applyBlockAttributeAtRange(BLOCK_ATTRIBUTE_NAME, true, range))
        }
      })

      return result
    })()
  }

  findRangesOfBlocks() {
    return this.document.findRangesForBlockAttribute(BLOCK_ATTRIBUTE_NAME)
  }

  findRangesOfPieces() {
    return this.document.findRangesForTextAttribute(TEXT_ATTRIBUTE_NAME, { withValue: TEXT_ATTRIBUTE_VALUE })
  }

  moveSelectedRangeForward() {
    this.selectedRange[0] += 1
    this.selectedRange[1] += 1
  }
}
