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

let started = false

function start() {
  if (!started) {
    customElements.define("trix-toolbar", elements.TrixToolbarElement)
    customElements.define("trix-editor", elements.TrixEditorElement)
    started = true
  }
}

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
  filters,
  start
}

window.Trix = Trix

export default Trix
