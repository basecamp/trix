import * as config from "trix/config"

export default () =>
  config.editor.formAssociated ?
    `<trix-editor autofocus placeholder="Say hello..."><div>Hello world</div></trix-editor>
    ` :
    `<input id="my_input" type="hidden" value="&lt;div&gt;Hello world&lt;/div&gt;">
    <trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>`
