Trix.defineElement class extends Trix.Element
  @tagName: "trix-toolbar"

  @defaultCSS: """
    %t {
      white-space: collapse;
    }

    %t .dialog {
      display: none;
    }

    %t .dialog.active {
      display: block;
    }

    %t .dialog input.validate:invalid {
      background-color: #ffdddd;
    }
  """

  @defaultHTML: """
    <span class="button_group">
      <button type="button" class="bold" data-attribute="bold" data-key="b">Bold</button>
      <button type="button" class="italic" data-attribute="italic" data-key="i">Italic</button>
      <button type="button" class="strike" data-attribute="strike">Strike</button>
      <button type="button" class="link" data-attribute="href" data-action="link" data-key="k">Link</button>
    </span>

    <span class="button_group">
      <button type="button" class="quote" href="#" data-attribute="quote">Quote</button>
      <button type="button" class="code" href="#" data-attribute="code">Code</button>
      <button type="button" class="list bullets" href="#" data-attribute="bullet">Bullets</button>
      <button type="button" class="list numbers" href="#" data-attribute="number">Numbers</button>
    </span>

    <span class="button_group">
      <button type="button" class="undo" href="#" data-action="undo" data-key="z">Undo</button>
      <button type="button" class="redo" href="#" data-action="redo" data-key="shift+z">Redo</button>
    </span>

    <div class="dialog" data-attribute="href">
      <input type="url" required name="href" placeholder="Enter a URL...">
      <input type="button" value="Save link" data-method="setAttribute">
      <input type="button" value="Unlink" data-method="removeAttribute">
    </div>
  """
