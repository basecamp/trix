import * as config from "trix/config"

export default () =>
  config.editor.formAssociated ?
    `<form id="ancestor-form">
      <trix-editor id="editor-with-ancestor-form"></trix-editor>
    </form>
    <form id="input-form"></form>
    <trix-editor id="editor-with-input-form" form="input-form"></trix-editor>
    <trix-editor id="editor-with-no-form"></trix-editor>
    ` :
    `<form id="ancestor-form">
      <trix-editor id="editor-with-ancestor-form"></trix-editor>
    </form>

    <form id="input-form">
      <input type="hidden" id="hidden-input">
    </form>
    <trix-editor id="editor-with-input-form" input="hidden-input"></trix-editor>

    <trix-editor id="editor-with-no-form"></trix-editor>`
