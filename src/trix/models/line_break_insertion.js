// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class LineBreakInsertion {
  constructor(composition) {
    this.composition = composition;
    ({ document: this.document } = this.composition);

    [ this.startPosition, this.endPosition ] = Array.from(this.composition.getSelectedRange())
    this.startLocation = this.document.locationFromPosition(this.startPosition)
    this.endLocation = this.document.locationFromPosition(this.endPosition)

    this.block = this.document.getBlockAtIndex(this.endLocation.index)
    this.breaksOnReturn = this.block.breaksOnReturn()
    this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1)
    this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset)
  }

  shouldInsertBlockBreak() {
    if (this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty()) {
      return this.startLocation.offset !== 0
    } else {
      return this.breaksOnReturn && this.nextCharacter !== "\n"
    }
  }

  shouldBreakFormattedBlock() {
    return this.block.hasAttributes() && !this.block.isListItem() &&
      (this.breaksOnReturn && this.nextCharacter === "\n" || this.previousCharacter === "\n")
  }

  shouldDecreaseListLevel() {
    return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty()
  }

  shouldPrependListItem() {
    return this.block.isListItem() && this.startLocation.offset === 0 && !this.block.isEmpty()
  }

  shouldRemoveLastBlockAttribute() {
    return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty()
  }
}
