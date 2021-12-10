import browser from "trix/config/browser"

const input = {
  level2Enabled: true,

  getLevel() {
    if (this.level2Enabled && browser.supportsInputEvents) {
      return 2
    } else {
      return 0
    }
  }
}

export default input
