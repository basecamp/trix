import browser from "trix/config/browser"
import { makeElement, removeNode } from "trix/core/helpers/dom"

const input = {
  level2Enabled: true,
  fileInputId: `trix-file-input-${Date.now().toString(16)}`,
  acceptedFileTypes: "*",

  getLevel() {
    if (this.level2Enabled && browser.supportsInputEvents) {
      return 2
    } else {
      return 0
    }
  },
  pickFiles(editorController) {
    const editorElement = editorController.element
    const acceptTypes = editorElement.getAttribute("trix-attachment-accept") || this.acceptedFileTypes
    const input = makeElement("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId, accept: acceptTypes })

    input.addEventListener("change", () => {
      editorController.insertFiles(input.files)
      removeNode(input)
    })

    removeNode(document.getElementById(this.fileInputId))
    document.body.appendChild(input)
    input.click()
  }
}

export default input
