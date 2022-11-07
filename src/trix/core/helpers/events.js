const testTransferData = { "application/x-trix-feature-detection": "test" }

export const dataTransferIsPlainText = function(dataTransfer) {
  const text = dataTransfer.getData("text/plain")
  const html = dataTransfer.getData("text/html")

  if (text && html) {
    const { body } = new DOMParser().parseFromString(html, "text/html")
    if (body.textContent === text) {
      return !body.querySelector("*")
    }
  } else {
    return text?.length
  }
}

export const dataTransferIsWritable = function(dataTransfer) {
  if (!dataTransfer?.setData) return false

  for (const key in testTransferData) {
    const value = testTransferData[key]

    try {
      dataTransfer.setData(key, value)
      if (!dataTransfer.getData(key) === value) return false
    } catch (error) {
      return false
    }
  }
  return true
}

export const keyEventIsKeyboardCommand = (function() {
  if (/Mac|^iP/.test(navigator.platform)) {
    return (event) => event.metaKey
  } else {
    return (event) => event.ctrlKey
  }
})()
