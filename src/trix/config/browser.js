export default {
  // Android emits composition events when moving the cursor through existing text
  // Introduced in Chrome 65: https://bugs.chromium.org/p/chromium/issues/detail?id=764439#c9
  composesExistingText: /Android.*Chrome/.test(navigator.userAgent),

  // On Android 13 Samsung keyboards emit a composition event when moving the cursor
  composesOnCursorMove: (function() {
    const androidVersionMatch = navigator.userAgent.match(/android\s([0-9]+.*Chrome)/i)
    return androidVersionMatch && parseInt(androidVersionMatch[1]) > 12
  })(),

  // IE 11 activates resizing handles on editable elements that have "layout"
  forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent),
  // https://www.w3.org/TR/input-events-1/ + https://www.w3.org/TR/input-events-2/
  supportsInputEvents: (function() {
    if (typeof InputEvent === "undefined") {
      return false
    }
    for (const property of [ "data", "getTargetRanges", "inputType" ]) {
      if (!(property in InputEvent.prototype)) {
        return false
      }
    }
    return true
  })(),
}
