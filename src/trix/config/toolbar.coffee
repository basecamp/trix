{lang} = Trix.config

Trix.config.toolbar =
  buttons:
    # Text
    bold:
      attribute: "bold"
      key: "b"
    italic:
      attribute: "italic"
      key: "i"
    strike:
      attribute: "strike"
    link:
      attribute: "href"
      action: "link"
      key: "k"
      dialog: -> """
        <input type="url" required name="href" placeholder="#{lang.urlPlaceholder}">
        <div class="button-group">
          <input type="button" class="button" value="#{lang.link}" data-trix-method="setAttribute">
          <input type="button" class="button" value="#{lang.unlink}" data-trix-method="removeAttribute">
        </div>
      """

    # Block
    heading1:
      attribute: "heading1"
    quote:
      attribute: "quote"
    code:
      attribute: "code"
    bullets:
      attribute: "bullet"
    numbers:
      attribute: "number"
    outdent:
      action: "decreaseNestingLevel"
    indent:
      action: "increaseNestingLevel"

    # History
    undo:
      action: "undo"
      key: "z"
    redo:
      action: "redo"
      key: "shift+z"

  rows: [
    [
      ["bold", "italic", "strike", "link"]
      ["heading1", "quote", "code", "bullets", "numbers", "outdent", "indent"]
      ["undo", "redo"]
    ]
  ]
