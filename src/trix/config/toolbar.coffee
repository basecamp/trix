{lang} = Trix.config

Trix.config.toolbar =
  buttons:
    # Text
    bold:
      attribute: "bold"
    italic:
      attribute: "bold"
    strike:
      attribute: "strike"
    link:
      attribute: "href"
      action: "link"
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
    redo:
      action: "redo"

  groups: [
    ["bold", "italic", "strike", "link"]
    ["quote", "code", "bullets", "numbers", "outdent", "indent"]
    ["undo", "redo"]
  ]
