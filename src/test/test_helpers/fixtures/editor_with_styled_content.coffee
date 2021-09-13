window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_with_styled_content"] = () => """
<style type="text/css">
  .trix-content figure.attachment {
    display: inline-block;
  }
</style>

<trix-editor class="trix-content"></trix-editor>
"""
