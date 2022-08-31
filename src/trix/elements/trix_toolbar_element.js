import * as config from "trix/config"

import { installDefaultCSSForTagName } from "trix/core/helpers"

installDefaultCSSForTagName("trix-toolbar", `\
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
}`)

export default class TrixToolbarElement extends HTMLElement {

  // Element lifecycle

  connectedCallback() {
    if (this.innerHTML === "") {
      this.innerHTML = config.toolbar.getDefaultHTML()
    }
  }
}
