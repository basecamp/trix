{makeFragment} = Trix
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
        <div class="link_url_fields">
          <input type="url" required name="href" placeholder="#{lang.urlPlaceholder}">
          <div class="button_group">
            <input type="button" value="#{lang.link}" data-method="setAttribute">
            <input type="button" value="#{lang.unlink}" data-method="removeAttribute">
          </div>
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

  content: makeFragment """
    <div class="button_row">
      <span class="button_group text_tools">
        <button type="button" class="icon bold" data-trix-attribute="bold" data-trix-key="b" title="#{lang.bold}">#{lang.bold}</button>
        <button type="button" class="icon italic" data-trix-attribute="italic" data-trix-key="i" title="#{lang.italic}">#{lang.italic}</button>
        <button type="button" class="icon strike" data-trix-attribute="strike" title="#{lang.strike}">#{lang.strike}</button>
        <button type="button" class="icon link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="#{lang.link}">#{lang.link}</button>
      </span>

      <span class="button_group block_tools">
        <button type="button" class="icon heading-1" data-trix-attribute="heading1" title="#{lang.heading1}">#{lang.heading1}</button>
        <button type="button" class="icon quote" data-trix-attribute="quote" title="#{lang.quote}">#{lang.quote}</button>
        <button type="button" class="icon code" data-trix-attribute="code" title="#{lang.code}">#{lang.code}</button>
        <button type="button" class="icon list bullets" data-trix-attribute="bullet" title="#{lang.bullets}">#{lang.bullets}</button>
        <button type="button" class="icon list numbers" data-trix-attribute="number" title="#{lang.numbers}">#{lang.numbers}</button>
        <button type="button" class="icon nesting-level decrease" data-trix-action="decreaseNestingLevel" title="#{lang.outdent}">#{lang.outdent}</button>
        <button type="button" class="icon nesting-level increase" data-trix-action="increaseNestingLevel" title="#{lang.indent}">#{lang.indent}</button>
      </span>

      <span class="button_group history_tools">
        <button type="button" class="icon undo" data-trix-action="undo" data-trix-key="z" title="#{lang.undo}">#{lang.undo}</button>
        <button type="button" class="icon redo" data-trix-action="redo" data-trix-key="shift+z" title="#{lang.redo}">#{lang.redo}</button>
      </span>
    </div>

    <div class="dialogs">
      <div class="dialog link_dialog" data-attribute="href" data-dialog="href">
      </div>
    </div>
  """
