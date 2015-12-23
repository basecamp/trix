{lang} = Trix.config

Trix.config.toolbar =
  buttons:
    # Text
    bold:
      attribute: "bold"
      key: "b"
    italic:
      attribute: "bold"
      key: "i"
    strike:
      attribute: "strike"
    link:
      attribute: "href"
      action: "link"
      key: "k"
      createDialog: -> """
        <input type="url" required name="href" placeholder="#{lang.urlPlaceholder}">
        <div class="button-group">
          <input type="button" value="#{lang.link}" data-method="setAttribute">
          <input type="button" value="#{lang.unlink}" data-method="removeAttribute">
        </div>
      """

    # Block
    quote:
      attribute: "quote"
    code:
      attribute: "code"
    bullets:
      attribute: "bullet"
    numbers:
      attribute: "number"
    outdent:
      action: "decreaseBlockLevel"
    indent:
      action: "increaseBlockLevel"

    # History
    undo:
      action: "undo"
      key: "z"
    redo:
      action: "redo"
      key: "shift+z"

  groups: [
    ["bold", "italic", "strike", "link"]
    ["quote", "code", "bullets", "numbers", "outdent", "indent"]
    ["undo", "redo"]
  ]
