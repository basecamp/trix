export default class LineBreakInsertion {
  constructor(composition) {
    this.composition = composition
    this.document = this.composition.document
    const selectedRange = this.composition.getSelectedRange()
    this.startPosition = selectedRange[0]
    this.endPosition = selectedRange[1]

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
    return (
      this.block.hasAttributes() &&
      !this.block.isListItem() &&
      (this.breaksOnReturn && this.nextCharacter === "\n" || this.previousCharacter === "\n")
    )
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
