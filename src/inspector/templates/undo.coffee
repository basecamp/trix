window.JST ||= {}

window.JST["trix/inspector/templates/undo"] = () -> """
<h4>Undo stack</h4>
<ol class="undo-entries">
   #{ entryList(@undoEntries) }
</ol>

<h4>Redo stack</h4>
<ol class="redo-entries">
  #{ entryList(@redoEntries) }
</ol>
"""

entryList = (entries) ->
  for entry in entries
    "<li>#{ entry.description } #{ JSON.stringify(selectedRange: entry.snapshot.selectedRange, context: entry.context) }</li>"
