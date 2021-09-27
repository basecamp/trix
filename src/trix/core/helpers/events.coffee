import Trix from "trix/global"

testTransferData = "application/x-trix-feature-detection": "test"

export dataTransferIsPlainText = (dataTransfer) ->
  text = dataTransfer.getData("text/plain")
  html = dataTransfer.getData("text/html")

  if text and html
    {body} = new DOMParser().parseFromString(html, "text/html")
    if body.textContent is text
      not body.querySelector("*")
  else
    text?.length

export dataTransferIsWritable = (dataTransfer) ->
  return unless dataTransfer?.setData?
  for key, value of testTransferData
    return unless try
      dataTransfer.setData(key, value)
      dataTransfer.getData(key) is value
  true

export keyEventIsKeyboardCommand = do ->
  if /Mac|^iP/.test(navigator.platform)
    (event) -> event.metaKey
  else
    (event) -> event.ctrlKey
