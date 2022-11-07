import { attachmentSelector } from "trix/config/attachments"

export default {
  bold: {
    tagName: "strong",
    inheritable: true,
    parser(element) {
      const style = window.getComputedStyle(element)
      return style.fontWeight === "bold" || style.fontWeight >= 600
    },
  },
  italic: {
    tagName: "em",
    inheritable: true,
    parser(element) {
      const style = window.getComputedStyle(element)
      return style.fontStyle === "italic"
    },
  },
  href: {
    groupTagName: "a",
    parser(element) {
      const matchingSelector = `a:not(${attachmentSelector})`
      const link = element.closest(matchingSelector)
      if (link) {
        return link.getAttribute("href")
      }
    },
  },
  strike: {
    tagName: "del",
    inheritable: true,
  },
  frozen: {
    style: { backgroundColor: "highlight" },
  },
}
