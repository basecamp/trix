window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_with_bold_styles"] = () => """
<style type="text/css">
  strong { font-weight: 500; }
  span { font-weight: 600; }
  article { font-weight: bold; }
</style>

<trix-editor class="trix-content"></trix-editor>
"""
