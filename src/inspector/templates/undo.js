if (!window.JST) window.JST = {}

window.JST["trix/inspector/templates/undo"] = () =>
  `<h4>Undo stack</h4>
    <ol class="undo-entries">
      ${entryList(this.undoEntries)}
    </ol>
    <h4>Redo stack</h4>
    <ol class="redo-entries">
      ${entryList(this.redoEntries)}
    </ol>`

const entryList = (entries) =>
  entries.map((entry) =>
    `<li>${entry.description} ${JSON.stringify({
      selectedRange: entry.snapshot.selectedRange,
      context: entry.context,
    })}</li>`)
