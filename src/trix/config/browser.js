const androidVersionMatch = navigator.userAgent.match(/android\s([0-9]+.*Chrome)/i)
const androidVersion = androidVersionMatch && parseInt(androidVersionMatch[1])

export default {
  // Android emits composition events when moving the cursor through existing text
  // Introduced in Chrome 65: https://bugs.chromium.org/p/chromium/issues/detail?id=764439#c9
  composesExistingText: /Android.*Chrome/.test(navigator.userAgent),

  // Android 13, especially on Samsung keyboards, emits extra compositionend and beforeinput events
  // that can make the input handler lose the the current selection or enter an infinite input -> render -> input
  // loop.
  recentAndroid: androidVersion && androidVersion > 12,
  samsungAndroid: androidVersion && navigator.userAgent.match(/Android.*SM-/),

  // IE 11 activates resizing handles on editable elements that have "layout"
  forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent),
  // https://www.w3.org/TR/input-events-1/ + https://www.w3.org/TR/input-events-2/
  supportsInputEvents: typeof InputEvent !== "undefined" &&
    [ "data", "getTargetRanges", "inputType" ].every(prop => prop in InputEvent.prototype),
}
