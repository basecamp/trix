import Trix from "trix/trix"

export * from "trix/core/helpers/functions"
export * from "trix/core/helpers/global"
export * from "./test_helpers/event_helpers"
export * from "./test_helpers/assertions"
export * from "./test_helpers/test_helpers"
export * from "./test_helpers/test_stubs"
export * from "./test_helpers/functions"
export * from "./test_helpers/fixtures/fixtures"
export * from "./test_helpers/event_helpers"
export * from "./test_helpers/input_helpers"
export * from "./test_helpers/editor_helpers"
export * from "./test_helpers/toolbar_helpers"
export * from "./test_helpers/selection_helpers"

window.Trix = Trix
Trix.config.undo.interval = 0

QUnit.config.hidepassed = true
QUnit.config.testTimeout = 20000

document.head.insertAdjacentHTML(
  "beforeend",
  `<style type="text/css">
    #trix-container { height: 150px; }
    trix-toolbar { margin-bottom: 10px; }
    trix-toolbar button { border: 1px solid #ccc; background: #fff; }
    trix-toolbar button.active { background: #d3e6fd; }
    trix-toolbar button:disabled { color: #ccc; }
    #qunit { position: relative !important; }
  </style>`
)
