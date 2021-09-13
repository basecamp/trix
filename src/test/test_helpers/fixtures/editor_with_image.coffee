window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_with_image"] = () => """
<trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>
<input id="my_input" type="hidden" value="ab&lt;img src=&quot;<%= TEST_IMAGE_URL %>&quot; width=&quot;10&quot; height=&quot;10&quot;&gt;">
"""
