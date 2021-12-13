// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"

import { registerElement } from "trix/core/helpers"

registerElement("trix-toolbar", {
  defaultCSS: `\
%t {
  display: block;
}

%t {
  white-space: nowrap;
}

%t [data-trix-dialog] {
  display: none;
}

%t [data-trix-dialog][data-trix-active] {
  display: block;
}

%t [data-trix-dialog] [data-trix-validate]:invalid {
  background-color: #ffdddd;
}\
`,

  // Element lifecycle

  initialize() {
    if (this.innerHTML === "") {
      this.innerHTML = config.toolbar.getDefaultHTML()
    }
  },
})
