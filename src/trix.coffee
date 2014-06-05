#= require_self
#= require trix/lib/installer
#= require trix/lib/dom

@Trix =
  install: (config) ->
    installer = new Trix.Installer config
    installer.createEditor()

  getSupportedModes: ->
    Trix.Installer.supportedModes.slice(0)

  attributes:
    bold:
      tagName: "strong"
      inheritable: true
      parser: ({style}) ->
        style["fontWeight"] is "bold" or style["fontWeight"] >= 700
    italic:
      tagName: "em"
      inheritable: true
      parser: ({style}) ->
        style["fontStyle"] is "italic"
    href:
      tagName: "a"
      parent: true
      parser: ({element}) ->
        if link = Trix.DOM.closest(element, "a")
          link.getAttribute("href")
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

      .trix-editor .image-editor,
      .trix-editor .pending-attachment {
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
