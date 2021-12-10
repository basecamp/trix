/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import browser from "trix/config/browser";

const input = {
  level2Enabled: true,

  getLevel() {
    if (this.level2Enabled && browser.supportsInputEvents) {
      return 2;
    } else {
      return 0;
    }
  }
};

export default input;
