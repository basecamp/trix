window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_with_labels"] = () => """
<label id="label-1" for="editor"><span>Label 1</span></label>
<label id="label-2">
  Label 2
  <trix-editor id="editor"></trix-editor>
</label>
<label id="label-3" for="editor">Label 3</label>
"""
