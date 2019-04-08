Trix.config.attachments =
  preview:
    presentation: "gallery"
    caption:
      name: true
      size: true
  file:
    caption:
      size: true
  toolbarButton:
    # Restrict file formats that can be selected from the file attachment dialog
    # Format: see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
    accept: "*/*"
    # Provide a handler for `trix-attachment-add` before setting to `true`
    enabled: false
