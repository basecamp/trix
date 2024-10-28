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

export const dataTransferIsMsOfficePaste = ({ dataTransfer }) => {
  return dataTransfer.types.includes("Files") &&
    dataTransfer.types.includes("text/html") &&
    dataTransfer.getData("text/html").includes("urn:schemas-microsoft-com:office:office")
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

export function shouldRenderInmmediatelyToDealWithIOSDictation(inputEvent) {
  if (/iPhone|iPad/.test(navigator.userAgent)) {
    // Handle garbled content and duplicated newlines when using dictation on iOS 18+. Upon dictation completion, iOS sends
    // the list of insertText / insertParagraph events in a quick sequence. If we don't render
    // the editor synchronously, the internal range fails to update and results in garbled content or duplicated newlines.
    //
    // This workaround is necessary because iOS doesn't send composing events as expected while dictating:
    // https://bugs.webkit.org/show_bug.cgi?id=261764
    return !inputEvent.inputType || inputEvent.inputType === "insertParagraph"
  } else {
    return false
  }
}
