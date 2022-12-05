import { version } from "../../package.json"

import * as config from "trix/config"
import * as core from "trix/core"
import * as models from "trix/models"
import * as views from "trix/views"
import * as controllers from "trix/controllers"
import * as observers from "trix/observers"
import * as operations from "trix/operations"
import * as elements from "trix/elements"
import * as filters from "trix/filters"

const Trix = {
  VERSION: version,
  config,
  core,
  models,
  views,
  controllers,
  observers,
  operations,
  elements,
  filters
}

// Expose models under the Trix constant for compatibility with v1
Object.assign(Trix, models)

function start() {
  if (!customElements.get("trix-toolbar")) {
    customElements.define("trix-toolbar", elements.TrixToolbarElement)
  }

  if (!customElements.get("trix-editor")) {
    customElements.define("trix-editor", elements.TrixEditorElement)
  }
}

window.Trix = Trix
setTimeout(start, 0)

export default Trix
