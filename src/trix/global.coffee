import { version } from "../../package.json"

Trix =
  VERSION: version

  ZERO_WIDTH_SPACE: "\uFEFF"
  NON_BREAKING_SPACE: "\u00A0"
  OBJECT_REPLACEMENT_CHARACTER: "\uFFFC"

  browser:
    # Android emits composition events when moving the cursor through existing text
    # Introduced in Chrome 65: https://bugs.chromium.org/p/chromium/issues/detail?id=764439#c9
    composesExistingText: /Android.*Chrome/.test(navigator.userAgent)
    # IE 11 activates resizing handles on editable elements that have "layout"
    forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent)
    # https://www.w3.org/TR/input-events-1/ + https://www.w3.org/TR/input-events-2/
    supportsInputEvents: do ->
      return false if typeof InputEvent is "undefined"
      for property in ["data", "getTargetRanges", "inputType"]
        return false unless property of InputEvent.prototype
      true

  config: {}

window.Trix = Trix

export default Trix
