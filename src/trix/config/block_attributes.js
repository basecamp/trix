/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var attributes = {
  default: {
    tagName: "div",
    parse: false
  },
  quote: {
    tagName: "blockquote",
    nestable: true
  },
  heading1: {
    tagName: "h1",
    terminal: true,
    breakOnReturn: true,
    group: false
  },
  code: {
    tagName: "pre",
    terminal: true,
    text: {
      plaintext: true
    }
  },
  bulletList: {
    tagName: "ul",
    parse: false
  },
  bullet: {
    tagName: "li",
    listAttribute: "bulletList",
    group: false,
    nestable: true,
    test(element) {
      return tagName(element.parentNode) === attributes[this.listAttribute].tagName
    }
  },
  numberList: {
    tagName: "ol",
    parse: false
  },
  number: {
    tagName: "li",
    listAttribute: "numberList",
    group: false,
    nestable: true,
    test(element) {
      return tagName(element.parentNode) === attributes[this.listAttribute].tagName
    }
  },
  attachmentGallery: {
    tagName: "div",
    exclusive: true,
    terminal: true,
    parse: false,
    group: false
  }
}

var tagName = element => element?.tagName?.toLowerCase()

export default attributes
