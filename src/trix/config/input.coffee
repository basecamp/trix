Trix.config.input =
  level2Enabled: true

  getLevel: ->
    if @level2Enabled and Trix.browser.supportsInputEvents
      2
    else
      0

  pickFiles: (callback) ->
    input = Trix.makeElement("input", type: "file", multiple: true, hidden: true, id: "trix-file-input")

    input.addEventListener "change", ->
      callback(input.files)
      Trix.removeNode(input)

    Trix.removeNode(document.getElementById(input.id))
    document.body.appendChild(input)
    input.click()
