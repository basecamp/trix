const BLOCK_ATTRIBUTE_NAME = "attachmentGallery"
const TEXT_ATTRIBUTE_NAME = "presentation"
const TEXT_ATTRIBUTE_VALUE = "gallery"

export default class Filter {
  constructor(snapshot) {
    this.document = snapshot.document
    this.selectedRange = snapshot.selectedRange
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
    return this.findRangesOfBlocks().map((range) => this.document = this.document.removeAttributeAtRange(BLOCK_ATTRIBUTE_NAME, range))
  }

  applyBlockAttribute() {
    let offset = 0

    this.findRangesOfPieces().forEach((range) => {
      if (range[1] - range[0] > 1) {
        range[0] += offset
        range[1] += offset

        if (this.document.getCharacterAtPosition(range[1]) !== "\n") {
          this.document = this.document.insertBlockBreakAtRange(range[1])
          if (range[1] < this.selectedRange[1]) {
            this.moveSelectedRangeForward()
          }
          range[1]++
          offset++
        }

        if (range[0] !== 0) {
          if (this.document.getCharacterAtPosition(range[0] - 1) !== "\n") {
            this.document = this.document.insertBlockBreakAtRange(range[0])
            if (range[0] < this.selectedRange[0]) {
              this.moveSelectedRangeForward()
            }
            range[0]++
            offset++
          }
        }

        this.document = this.document.applyBlockAttributeAtRange(BLOCK_ATTRIBUTE_NAME, true, range)
      }
    })
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
