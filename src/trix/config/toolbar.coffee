{makeFragment} = Trix
{lang} = Trix.config

Trix.config.toolbar =
  content: makeFragment """
    <div class="button_groups">
      <span class="button_group text_tools">
        <button type="button" class="bold" data-trix-attribute="bold" data-trix-key="b" title="#{lang.bold}">#{lang.bold}</button>
        <button type="button" class="italic" data-trix-attribute="italic" data-trix-key="i" title="#{lang.italic}">#{lang.italic}</button>
        <button type="button" class="strike" data-trix-attribute="strike" title="#{lang.strike}">#{lang.strike}</button>
        <button type="button" class="link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="#{lang.link}">#{lang.link}</button>
      </span>

      <span class="button_group block_tools">
        <button type="button" class="heading-1" data-trix-attribute="heading1" title="#{lang.heading1}">#{lang.heading1}</button>
        <button type="button" class="quote" data-trix-attribute="quote" title="#{lang.quote}">#{lang.quote}</button>
        <button type="button" class="code" data-trix-attribute="code" title="#{lang.code}">#{lang.code}</button>
        <button type="button" class="list bullets" data-trix-attribute="bullet" title="#{lang.bullets}">#{lang.bullets}</button>
        <button type="button" class="list numbers" data-trix-attribute="number" title="#{lang.numbers}">#{lang.numbers}</button>
        <button type="button" class="nesting-level decrease" data-trix-action="decreaseNestingLevel" title="#{lang.outdent}">#{lang.outdent}</button>
        <button type="button" class="nesting-level increase" data-trix-action="increaseNestingLevel" title="#{lang.indent}">#{lang.indent}</button>
      </span>

      <span class="button_group history_tools">
        <button type="button" class="undo" data-trix-action="undo" data-trix-key="z" title="#{lang.undo}">#{lang.undo}</button>
        <button type="button" class="redo" data-trix-action="redo" data-trix-key="shift+z" title="#{lang.redo}">#{lang.redo}</button>
      </span>
    </div>

    <div class="dialogs">
      <div class="dialog link_dialog" data-trix-attribute="href" data-trix-dialog="href">
        <div class="link_url_fields">
          <input type="url" required name="href" placeholder="#{lang.urlPlaceholder}">
          <div class="button_group">
            <input type="button" value="#{lang.link}" data-trix-method="setAttribute">
            <input type="button" value="#{lang.unlink}" data-trix-method="removeAttribute">
          </div>
        </div>
      </div>
    </div>
  """
