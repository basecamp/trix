testTransferData = "application/x-trix-feature-detection": "test"

Trix.extend
  dataTransferIsPlainText: (dataTransfer) ->
    text = dataTransfer.getData("text/plain")
    html = dataTransfer.getData("text/html")

    if text and html
      element = document.createElement("div")
      element.innerHTML = html
      if element.textContent is text
        not element.querySelector(":not(meta)")
    else
      text?.length

  dataTransferIsWritable: (dataTransfer) ->
    return unless dataTransfer?.setData?
    for key, value of testTransferData
      return unless try
        dataTransfer.setData(key, value)
        dataTransfer.getData(key) is value
    true

  keyEventIsKeyboardCommand: do ->
    if /Mac|^iP/.test(navigator.platform)
      (event) -> event.metaKey
    else
      (event) -> event.ctrlKey
