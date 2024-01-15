export default () =>
  `<form id="ancestor-form">
    <trix-editor id="editor-with-ancestor-form"></trix-editor>
  </form>

  <form id="attribute-form"></form>
  <trix-editor id="editor-with-attribute-form" form="attribute-form"></trix-editor>

  <trix-editor id="editor-with-no-form"></trix-editor>`
