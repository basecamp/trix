#= require_self
#= require trix/installer

@Trix =
  install: (config) ->
    installer = new Trix.Installer config
    installer.createEditor()

  attributes:
    bold:
      tagName: "strong"
      inheritable: true
    italic:
      tagName: "em"
      inheritable: true
    href:
      tagName: "a"
      parent: true
    underline:
      style: { "text-decoration": "underline" }
      inheritable: true
    frozen:
      style: { "background-color": "highlight" }

  config:
    editorCSS: """
      .trix-editor[contenteditable=true]:empty:before {
        content: attr(data-placeholder);
        color: graytext;
      }

      .trix-editor .image-editor {
        position: relative;
        display: inline-block;
      }

      .trix-editor .image-editor img {
        outline: 1px dashed #333;
      }

      .trix-editor .image-editor .resize-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        border: 1px solid #333;
        background: white;
      }

      .trix-editor .image-editor .resize-handle.se {
        bottom: -4px;
        right: -4px;
        cursor: nwse-resize;
      }
    """
