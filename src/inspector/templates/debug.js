/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!window.JST) { window.JST = {}; }

window.JST["trix/inspector/templates/debug"] = function() { return `\
<p>
  <label>
    <input type="checkbox" name="viewCaching" checked="${this.compositionController.isViewCachingEnabled()}">
    Cache views between renders
  </label>
</p>

<p>
  <button data-action="render">Force Render</button> <button data-action="parse">Parse current HTML</button>
</p>

<p>
  <label>
    <input type="checkbox" name="controlElement">
    Show <code>contenteditable</code> control element
  </label>
</p>\
`; };
