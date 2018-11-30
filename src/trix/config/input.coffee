Trix.config.input =
  level2Enabled: true

  getLevel: ->
    if @level2Enabled and Trix.browser.supportsInputEvents
      2
    else
      0
