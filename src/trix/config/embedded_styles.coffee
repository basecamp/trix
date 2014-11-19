Trix.CSS = """
  .trix-editor[contenteditable=true]:empty:not(.focused)::before {
    content: attr(data-placeholder);
    color: graytext;
  }

  .trix-editor a[contenteditable=false] {
    cursor: text;
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

  .trix-editor figure.attachment a.remove {
    position: absolute;
    top: -9px;
    right: -9px;
    z-index: 2;
    display: inline-block;
    padding: 0;
    margin: 0;
    width: 18px;
    height: 18px;
    line-height: 18px;
    font-size: 18px;
    border-radius: 18px;
    vertical-align: middle;
    text-align: center;
    text-decoration: none;
    background-color: white;
    color: rgba(0,0,0,0.8);
  }

  .trix-editor figure.attachment a.remove:hover {
    color: red;
  }

  .trix-editor figure.attachment::selection, figure.attachment *::selection {
    background-color: rgba(0, 0, 0, 0);
  }

  .trix-editor figure.attachment::-moz-selection, figure.attachment *::-moz-selection {
    background-color: rgba(0, 0, 0, 0);
  }
"""
