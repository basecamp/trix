import BasicObject from "trix/core/basic_object"

export default class UndoManager extends BasicObject {
  constructor(composition) {
    super(...arguments)
    this.composition = composition
    this.undoEntries = []
    this.redoEntries = []
  }

  recordUndoEntry(description, { context, consolidatable } = {}) {
    const previousEntry = this.undoEntries.slice(-1)[0]

    if (!consolidatable || !entryHasDescriptionAndContext(previousEntry, description, context)) {
      const undoEntry = this.createEntry({ description, context })
      this.undoEntries.push(undoEntry)
      this.redoEntries = []
    }
  }

  undo() {
    const undoEntry = this.undoEntries.pop()
    if (undoEntry) {
      const redoEntry = this.createEntry(undoEntry)
      this.redoEntries.push(redoEntry)
      return this.composition.loadSnapshot(undoEntry.snapshot)
    }
  }

  redo() {
    const redoEntry = this.redoEntries.pop()
    if (redoEntry) {
      const undoEntry = this.createEntry(redoEntry)
      this.undoEntries.push(undoEntry)
      return this.composition.loadSnapshot(redoEntry.snapshot)
    }
  }

  canUndo() {
    return this.undoEntries.length > 0
  }

  canRedo() {
    return this.redoEntries.length > 0
  }

  // Private

  createEntry({ description, context } = {}) {
    return {
      description: description?.toString(),
      context: JSON.stringify(context),
      snapshot: this.composition.getSnapshot(),
    }
  }
}

const entryHasDescriptionAndContext = (entry, description, context) =>
  entry?.description === description?.toString() && entry?.context === JSON.stringify(context)
