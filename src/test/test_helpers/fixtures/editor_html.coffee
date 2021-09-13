window.JST ||= {}

window.JST["test/test_helpers/fixtures/editor_html"] = () => """
<input id="my_input" type="hidden" value="&lt;div&gt;Hello world&lt;/div&gt;">
<trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>

"""
