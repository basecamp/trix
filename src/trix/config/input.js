import browser from "trix/config/browser"

input =
  level2Enabled: true

  getLevel: ->
    if @level2Enabled and browser.supportsInputEvents
      2
    else
      0

export default input
