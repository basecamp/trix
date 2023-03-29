const attributes = {
  default: {
    tagName: "div",
    parse: false,
  },
  quote: {
    tagName: "blockquote",
    nestable: true,
  },
  heading1: {
    tagName: "h1",
    terminal: true,
    breakOnReturn: true,
    group: false,
  },
  heading2: {
    tagName: "h2",
    terminal: true,
    breakOnReturn: true,
    group: false,
  },
  heading3: {
    tagName: "h3",
    terminal: true,
    breakOnReturn: true,
    group: false,
  },
  heading4: {
    tagName: "h4",
    terminal: true,
    breakOnReturn: true,
    group: false,
  },
  bulletList: {
    tagName: "ul",
    parse: false,
  },
  bullet: {
    tagName: "li",
    listAttribute: "bulletList",
    group: false,
    nestable: true,
    test(element) {
      return tagName(element.parentNode) === attributes[this.listAttribute].tagName
    },
  },
  numberList: {
    tagName: "ol",
    parse: false,
  },
  number: {
    tagName: "li",
    listAttribute: "numberList",
    group: false,
    nestable: true,
    test(element) {
      return tagName(element.parentNode) === attributes[this.listAttribute].tagName
    },
  },
  attachmentGallery: {
    tagName: "div",
    exclusive: true,
    terminal: true,
    parse: false,
    group: false,
  },
}

const tagName = (element) => element?.tagName?.toLowerCase()

export default attributes
