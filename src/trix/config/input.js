import browser from "trix/config/browser"
import { makeElement, removeNode } from "trix/core/helpers/dom"

const input = {
  level2Enabled: true,

  getLevel() {
    if (this.level2Enabled && browser.supportsInputEvents) {
      return 2
    } else {
      return 0
    }
  },
  pickFiles(callback) {
    const input = makeElement("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId })

    input.addEventListener("change", () => {
      callback(input.files)
      removeNode(input)
    })

    removeNode(document.getElementById(this.fileInputId))
    document.body.appendChild(input)
    input.click()
  }
}

export default input
