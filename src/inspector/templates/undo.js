/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!window.JST) { window.JST = {}; }

window.JST["trix/inspector/templates/undo"] = function() { return `\
<h4>Undo stack</h4>
<ol class="undo-entries">
   ${ entryList(this.undoEntries) }
</ol>

<h4>Redo stack</h4>
<ol class="redo-entries">
  ${ entryList(this.redoEntries) }
</ol>\
`; };

var entryList = entries => Array.from(entries).map((entry) =>
  `<li>${ entry.description } ${ JSON.stringify({selectedRange: entry.snapshot.selectedRange, context: entry.context}) }</li>`);
