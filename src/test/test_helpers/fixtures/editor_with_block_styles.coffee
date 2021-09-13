window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_with_block_styles"] = () => """
<style type="text/css">
  blockquote { font-style: italic; }
  li { font-weight: bold; }
</style>

<trix-editor class="trix-content"></trix-editor>
"""
