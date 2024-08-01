import * as config from "trix/config"
import { TEST_IMAGE_URL } from "./test_image_url"

export default () =>
  config.editor.formAssociated ?
    `<trix-editor autofocus placeholder="Say hello...">ab<img src="${TEST_IMAGE_URL}" width="10" height="10"></trix-editor>
    ` :
    `<trix-editor input="my_input" autofocus placeholder="Say hello..."></trix-editor>
    <input id="my_input" type="hidden" value="ab&lt;img src=&quot;${TEST_IMAGE_URL}&quot; width=&quot;10&quot; height=&quot;10&quot;&gt;">`
