/* eslint-disable
    no-cond-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let textAttributes
import { attachmentSelector } from "trix/config/attachments"

export default textAttributes = {
  bold: {
    tagName: "strong",
    inheritable: true,
    parser(element) {
      const style = window.getComputedStyle(element)
      return style.fontWeight === "bold" || style.fontWeight >= 600
    }
  },
  italic: {
    tagName: "em",
    inheritable: true,
    parser(element) {
      const style = window.getComputedStyle(element)
      return style.fontStyle === "italic"
    }
  },
  href: {
    groupTagName: "a",
    parser(element) {
      let link
      const matchingSelector = `a:not(${attachmentSelector})`
      if (link = element.closest(matchingSelector)) {
        return link.getAttribute("href")
      }
    }
  },
  strike: {
    tagName: "del",
    inheritable: true
  },
  frozen: {
    style: { "backgroundColor": "highlight" }
  }
}
