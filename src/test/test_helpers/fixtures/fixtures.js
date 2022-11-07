import * as config from "trix/config"
import { ZERO_WIDTH_SPACE } from "trix/constants"
import { makeElement } from "trix/core/helpers"

import Text from "trix/models/text"
import Block from "trix/models/block"
import Attachment from "trix/models/attachment"
import Document from "trix/models/document"
import StringPiece from "trix/models/string_piece"

import editorDefaultAriaLabel from "./editor_default_aria_label"
import editorEmpty from "./editor_empty"
import editorHtml from "./editor_html"
import editorInTable from "./editor_in_table"
import editorWithBlockStyles from "./editor_with_block_styles"
import editorWithBoldStyles from "./editor_with_bold_styles"
import editorWithImage from "./editor_with_image"
import editorWithLabels from "./editor_with_labels"
import editorWithStyledContent from "./editor_with_styled_content"
import editorWithToolbarAndInput from "./editor_with_toolbar_and_input"
import editorsWithForms from "./editors_with_forms"
import { TEST_IMAGE_URL } from "./test_image_url"

export const fixtureTemplates = {
  "editor_default_aria_label": editorDefaultAriaLabel,
  "editor_empty": editorEmpty,
  "editor_html": editorHtml,
  "editor_in_table": editorInTable,
  "editor_with_block_styles": editorWithBlockStyles,
  "editor_with_bold_styles": editorWithBoldStyles,
  "editor_with_image": editorWithImage,
  "editor_with_labels": editorWithLabels,
  "editor_with_styled_content": editorWithStyledContent,
  "editor_with_toolbar_and_input": editorWithToolbarAndInput,
  "editors_with_forms": editorsWithForms,
}

export { TEST_IMAGE_URL }

const { css } = config

const createDocument = function (...parts) {
  const blocks = parts.map((part) => {
    const [ string, textAttributes, blockAttributes ] = Array.from(part)
    const text = Text.textForStringWithAttributes(string, textAttributes)
    return new Block(text, blockAttributes)
  })

  return new Document(blocks)
}

export const createCursorTarget = (name) =>
  makeElement({
    tagName: "span",
    textContent: ZERO_WIDTH_SPACE,
    data: {
      trixCursorTarget: name,
      trixSerialize: false,
    },
  })

const cursorTargetLeft = createCursorTarget("left").outerHTML
const cursorTargetRight = createCursorTarget("right").outerHTML

const blockComment = "<!--block-->"

const removeWhitespace = (string) => string.replace(/\s/g, "")

export const fixtures = {
  "bold text": {
    document: createDocument([ "abc", { bold: true } ]),
    html: `<div>${blockComment}<strong>abc</strong></div>`,
    serializedHTML: "<div><strong>abc</strong></div>",
  },

  "bold, italic text": {
    document: createDocument([ "abc", { bold: true, italic: true } ]),
    html: `<div>${blockComment}<strong><em>abc</em></strong></div>`,
  },

  "text with newline": {
    document: createDocument([ "ab\nc" ]),
    html: `<div>${blockComment}ab<br>c</div>`,
  },

  "text with link": {
    document: createDocument([ "abc", { href: "http://example.com" } ]),
    html: `<div>${blockComment}<a href="http://example.com">abc</a></div>`,
  },

  "text with link and formatting": {
    document: createDocument([ "abc", { italic: true, href: "http://example.com" } ]),
    html: `<div>${blockComment}<a href="http://example.com"><em>abc</em></a></div>`,
  },

  "partially formatted link": {
    document: new Document([
      new Block(
        new Text([
          new StringPiece("ab", { href: "http://example.com" }),
          new StringPiece("c", { href: "http://example.com", italic: true }),
        ])
      ),
    ]),
    html: `<div>${blockComment}<a href="http://example.com">ab<em>c</em></a></div>`,
  },

  "spaces 1": {
    document: createDocument([ " a" ]),
    html: `<div>${blockComment}&nbsp;a</div>`,
  },

  "spaces 2": {
    document: createDocument([ "  a" ]),
    html: `<div>${blockComment}&nbsp; a</div>`,
  },

  "spaces 3": {
    document: createDocument([ "   a" ]),
    html: `<div>${blockComment}&nbsp; &nbsp;a</div>`,
  },

  "spaces 4": {
    document: createDocument([ " a " ]),
    html: `<div>${blockComment}&nbsp;a&nbsp;</div>`,
  },

  "spaces 5": {
    document: createDocument([ "a  b" ]),
    html: `<div>${blockComment}a&nbsp; b</div>`,
  },

  "spaces 6": {
    document: createDocument([ "a   b" ]),
    html: `<div>${blockComment}a &nbsp; b</div>`,
  },

  "spaces 7": {
    document: createDocument([ "a    b" ]),
    html: `<div>${blockComment}a&nbsp; &nbsp; b</div>`,
  },

  "spaces 8": {
    document: createDocument([ "a b " ]),
    html: `<div>${blockComment}a b&nbsp;</div>`,
  },

  "spaces 9": {
    document: createDocument([ "a b c" ]),
    html: `<div>${blockComment}a b c</div>`,
  },

  "spaces 10": {
    document: createDocument([ "a " ]),
    html: `<div>${blockComment}a&nbsp;</div>`,
  },

  "spaces 11": {
    document: createDocument([ "a  " ]),
    html: `<div>${blockComment}a &nbsp;</div>`,
  },

  "spaces and formatting": {
    document: new Document([
      new Block(
        new Text([
          new StringPiece(" a "),
          new StringPiece("b", { href: "http://b.com" }),
          new StringPiece(" "),
          new StringPiece("c", { bold: true }),
          new StringPiece(" d"),
          new StringPiece(" e ", { italic: true }),
          new StringPiece(" f  "),
        ])
      ),
    ]),
    html: `<div>${blockComment}&nbsp;a <a href="http://b.com">b</a> <strong>c</strong> d<em> e </em>&nbsp;f &nbsp;</div>`,
  },

  "quote formatted block": {
    document: createDocument([ "abc", {}, [ "quote" ] ]),
    html: `<blockquote>${blockComment}abc</blockquote>`,
  },

  "code formatted block": {
    document: createDocument([ "123", {}, [ "code" ] ]),
    html: `<pre>${blockComment}123</pre>`,
  },

  "code with newline": {
    document: createDocument([ "12\n3", {}, [ "code" ] ]),
    html: `<pre>${blockComment}12\n3</pre>`,
  },

  "multiple blocks with block comments in their text": {
    document: createDocument([ `a${blockComment}b`, {}, [ "quote" ] ], [ `${blockComment}c`, {}, [ "code" ] ]),
    html: `<blockquote>${blockComment}a&lt;!--block--&gt;b</blockquote><pre>${blockComment}&lt;!--block--&gt;c</pre>`,
    serializedHTML: "<blockquote>a&lt;!--block--&gt;b</blockquote><pre>&lt;!--block--&gt;c</pre>",
  },

  "unordered list with one item": {
    document: createDocument([ "a", {}, [ "bulletList", "bullet" ] ]),
    html: `<ul><li>${blockComment}a</li></ul>`,
  },

  "unordered list with bold text": {
    document: createDocument([ "a", { bold: true }, [ "bulletList", "bullet" ] ]),
    html: `<ul><li>${blockComment}<strong>a</strong></li></ul>`,
  },

  "unordered list with partially formatted text": {
    document: new Document([
      new Block(new Text([ new StringPiece("a"), new StringPiece("b", { italic: true }) ]), [ "bulletList", "bullet" ]),
    ]),
    html: `<ul><li>${blockComment}a<em>b</em></li></ul>`,
  },

  "unordered list with two items": {
    document: createDocument([ "a", {}, [ "bulletList", "bullet" ] ], [ "b", {}, [ "bulletList", "bullet" ] ]),
    html: `<ul><li>${blockComment}a</li><li>${blockComment}b</li></ul>`,
  },

  "unordered list surrounded by unformatted blocks": {
    document: createDocument([ "a" ], [ "b", {}, [ "bulletList", "bullet" ] ], [ "c" ]),
    html: `<div>${blockComment}a</div><ul><li>${blockComment}b</li></ul><div>${blockComment}c</div>`,
  },

  "ordered list": {
    document: createDocument([ "a", {}, [ "numberList", "number" ] ]),
    html: `<ol><li>${blockComment}a</li></ol>`,
  },

  "ordered list and an unordered list": {
    document: createDocument([ "a", {}, [ "bulletList", "bullet" ] ], [ "b", {}, [ "numberList", "number" ] ]),
    html: `<ul><li>${blockComment}a</li></ul><ol><li>${blockComment}b</li></ol>`,
  },

  "empty block with attributes": {
    document: createDocument([ "", {}, [ "quote" ] ]),
    html: `<blockquote>${blockComment}<br></blockquote>`,
  },

  "image attachment": (() => {
    const attrs = {
      url: TEST_IMAGE_URL,
      filename: "example.png",
      filesize: 98203,
      contentType: "image/png",
      width: 1,
      height: 1,
    }
    const attachment = new Attachment(attrs)
    const text = Text.textForAttachmentWithAttributes(attachment)

    const image = makeElement("img", { src: attrs.url, "data-trix-mutable": true, width: 1, height: 1 })
    image.dataset.trixStoreKey = [ "imageElement", attachment.id, image.src, image.width, image.height ].join("/")

    const caption = makeElement({ tagName: "figcaption", className: css.attachmentCaption })
    caption.innerHTML = `<span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">95.9 KB</span>`

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--preview attachment--png",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: "image/png",
        trixId: attachment.id,
      },
    })

    figure.setAttribute("contenteditable", false)
    figure.appendChild(image)
    figure.appendChild(caption)

    const serializedFigure = figure.cloneNode(true)

    ;[ "data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable" ].forEach((attribute) => {
      serializedFigure.removeAttribute(attribute)

      Array.from(serializedFigure.querySelectorAll(`[${attribute}]`)).forEach((element) => {
        element.removeAttribute(attribute)
      })
    })

    return {
      html: `<div>${blockComment}${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      serializedHTML: `<div>${serializedFigure.outerHTML}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "text with newlines and image attachment": (() => {
    const stringText = Text.textForStringWithAttributes("a\nb")

    const attrs = {
      url: TEST_IMAGE_URL,
      filename: "example.png",
      filesize: 98203,
      contentType: "image/png",
      width: 1,
      height: 1,
    }
    const attachment = new Attachment(attrs)
    const attachmentText = Text.textForAttachmentWithAttributes(attachment)

    const image = makeElement("img", { src: attrs.url, "data-trix-mutable": true, width: 1, height: 1 })
    image.dataset.trixStoreKey = [ "imageElement", attachment.id, image.src, image.width, image.height ].join("/")

    const caption = makeElement({ tagName: "figcaption", className: css.attachmentCaption })
    caption.innerHTML = `<span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">95.9 KB</span>`

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--preview attachment--png",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: "image/png",
        trixId: attachment.id,
      },
    })

    figure.appendChild(image)
    figure.appendChild(caption)

    const serializedFigure = figure.cloneNode(true)

    ;[ "data-trix-id", "data-trix-mutable", "data-trix-store-key", "contenteditable" ].forEach((attribute) => {
      serializedFigure.removeAttribute(attribute)

      Array.from(serializedFigure.querySelectorAll(`[${attribute}]`)).forEach((element) => {
        element.removeAttribute(attribute)
      })
    })

    const text = stringText.appendText(attachmentText)

    return {
      html: `<div>${blockComment}a<br>b${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      serializedHTML: `<div>a<br>b${serializedFigure.outerHTML}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "image attachment with edited caption": (() => {
    const attrs = {
      url: TEST_IMAGE_URL,
      filename: "example.png",
      filesize: 123,
      contentType: "image/png",
      width: 1,
      height: 1,
    }
    const attachment = new Attachment(attrs)
    const textAttrs = { caption: "Example" }
    const text = Text.textForAttachmentWithAttributes(attachment, textAttrs)

    const image = makeElement("img", { src: attrs.url, "data-trix-mutable": true, width: 1, height: 1 })
    image.dataset.trixStoreKey = [ "imageElement", attachment.id, image.src, image.width, image.height ].join("/")

    const caption = makeElement({
      tagName: "figcaption",
      className: `${css.attachmentCaption} ${css.attachmentCaption}--edited`,
      textContent: "Example",
    })

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--preview attachment--png",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: "image/png",
        trixId: attachment.id,
        trixAttributes: JSON.stringify(textAttrs),
      },
    })

    figure.appendChild(image)
    figure.appendChild(caption)

    return {
      html: `<div>${blockComment}${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "file attachment": (() => {
    const attrs = {
      href: "http://example.com/example.pdf",
      filename: "example.pdf",
      filesize: 34038769,
      contentType: "application/pdf",
    }
    const attachment = new Attachment(attrs)
    const text = Text.textForAttachmentWithAttributes(attachment)

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--file attachment--pdf",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: "application/pdf",
        trixId: attachment.id,
      },
    })

    const caption = `<figcaption class="${css.attachmentCaption}"><span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">32.46 MB</span></figcaption>`
    figure.innerHTML = caption

    const link = makeElement({ tagName: "a", editable: false, attributes: { href: attrs.href, tabindex: -1 } })
    Array.from(figure.childNodes).forEach((node) => {
      link.appendChild(node)
    })
    figure.appendChild(link)

    return {
      html: `<div>${blockComment}${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "pending file attachment": (() => {
    const attrs = { filename: "example.pdf", filesize: 34038769, contentType: "application/pdf" }
    const attachment = new Attachment(attrs)
    attachment.file = {}
    const text = Text.textForAttachmentWithAttributes(attachment)

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--file attachment--pdf",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: "application/pdf",
        trixId: attachment.id,
        trixSerialize: false,
      },
    })

    const progress = makeElement({
      tagName: "progress",
      attributes: {
        class: "attachment__progress",
        value: 0,
        max: 100,
      },
      data: {
        trixMutable: true,
        trixStoreKey: [ "progressElement", attachment.id ].join("/"),
      },
    })

    const caption = `<figcaption class="${css.attachmentCaption}"><span class="${css.attachmentName}">${attrs.filename}</span> <span class="${css.attachmentSize}">32.46 MB</span></figcaption>`
    figure.innerHTML = caption + progress.outerHTML

    return {
      html: `<div>${blockComment}${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "content attachment": (() => {
    const content =
      "<blockquote class=\"twitter-tweet\" data-cards=\"hidden\"><p>ruby-build 20150413 is out, with definitions for 2.2.2, 2.1.6, and 2.0.0-p645 to address recent security issues: <a href=\"https://t.co/YEwV6NtRD8\">https://t.co/YEwV6NtRD8</a></p>&mdash; Sam Stephenson (@sstephenson) <a href=\"https://twitter.com/sstephenson/status/587715996783218688\">April 13, 2015</a></blockquote>"
    const href = "https://twitter.com/sstephenson/status/587715996783218688"
    const contentType = "embed/twitter"

    const attachment = new Attachment({ content, contentType, href })
    const text = Text.textForAttachmentWithAttributes(attachment)

    const figure = makeElement({
      tagName: "figure",
      className: "attachment attachment--content",
      editable: false,
      data: {
        trixAttachment: JSON.stringify(attachment),
        trixContentType: contentType,
        trixId: attachment.id,
      },
    })

    figure.innerHTML = content

    const caption = makeElement({ tagName: "figcaption", className: css.attachmentCaption })
    figure.appendChild(caption)

    return {
      html: `<div>${blockComment}${cursorTargetLeft}${figure.outerHTML}${cursorTargetRight}</div>`,
      document: new Document([ new Block(text) ]),
    }
  })(),

  "nested quote and code formatted block": {
    document: createDocument([ "ab3", {}, [ "quote", "code" ] ]),
    html: `<blockquote><pre>${blockComment}ab3</pre></blockquote>`,
  },

  "nested code and quote formatted block": {
    document: createDocument([ "ab3", {}, [ "code", "quote" ] ]),
    html: `<pre><blockquote>${blockComment}ab3</blockquote></pre>`,
  },

  "nested code blocks in quote": {
    document: createDocument(
      [ "a\n", {}, [ "quote" ] ],
      [ "b", {}, [ "quote", "code" ] ],
      [ "\nc\n", {}, [ "quote" ] ],
      [ "d", {}, [ "quote", "code" ] ]
    ),
    html: removeWhitespace(
      `<blockquote>
        ${blockComment}
        a
        <br>
        <br>
        <pre>
          ${blockComment}
          b
        </pre>
        ${blockComment}
        <br>
        c
        <br>
        <br>
        <pre>
          ${blockComment}
          d
        </pre>
      </blockquote>`
    ),
    serializedHTML: removeWhitespace(
      `<blockquote>
        a
        <br>
        <br>
        <pre>
          b
        </pre>
        <br>
        c
        <br>
        <br>
        <pre>
          d
        </pre>
      </blockquote>`
    ),
  },

  "nested code, quote, and list in quote": {
    document: createDocument(
      [ "a\n", {}, [ "quote" ] ],
      [ "b", {}, [ "quote", "code" ] ],
      [ "\nc\n", {}, [ "quote" ] ],
      [ "d", {}, [ "quote", "quote" ] ],
      [ "\ne\n", {}, [ "quote" ] ],
      [ "f", {}, [ "quote", "bulletList", "bullet" ] ]
    ),
    html: removeWhitespace(
      `<blockquote>
        ${blockComment}
        a
        <br>
        <br>
        <pre>
          ${blockComment}
          b
        </pre>
        ${blockComment}
        <br>
        c
        <br>
        <br>
        <blockquote>
          ${blockComment}
          d
        </blockquote>
        ${blockComment}
        <br>
        e
        <br>
        <br>
        <ul>
          <li>
            ${blockComment}
            f
          </li>
        </ul>
      </blockquote>`
  ),
    serializedHTML: removeWhitespace(
      `<blockquote>
        a
        <br>
        <br>
        <pre>
          b
        </pre>
        <br>
        c
        <br>
        <br>
        <blockquote>
          d
        </blockquote>
        <br>
        e
        <br>
        <br>
        <ul>
          <li>
            f
          </li>
        </ul>
      </blockquote>`
    ),
  },

  "nested quotes at different nesting levels": {
    document: createDocument(
      [ "a", {}, [ "quote", "quote", "quote" ] ],
      [ "b", {}, [ "quote", "quote" ] ],
      [ "c", {}, [ "quote" ] ],
      [ "d", {}, [ "quote", "quote" ] ]
    ),
    html: removeWhitespace(
      `<blockquote>
        <blockquote>
          <blockquote>
            ${blockComment}
            a
          </blockquote>
          ${blockComment}
          b
        </blockquote>
        ${blockComment}
        c
        <blockquote>
          ${blockComment}
          d
        </blockquote>
      </blockquote>`
    ),
    serializedHTML: removeWhitespace(
      `<blockquote>
        <blockquote>
          <blockquote>
            a
          </blockquote>
          b
        </blockquote>
        c
        <blockquote>
          d
        </blockquote>
      </blockquote>`
    ),
  },

  "nested quote and list": {
    document: createDocument([ "ab3", {}, [ "quote", "bulletList", "bullet" ] ]),
    html: `<blockquote><ul><li>${blockComment}ab3</li></ul></blockquote>`,
  },

  "nested list and quote": {
    document: createDocument([ "ab3", {}, [ "bulletList", "bullet", "quote" ] ]),
    html: `<ul><li><blockquote>${blockComment}ab3</blockquote></li></ul>`,
  },

  "nested lists and quotes": {
    document: createDocument(
      [ "a", {}, [ "bulletList", "bullet", "quote" ] ],
      [ "b", {}, [ "bulletList", "bullet", "quote" ] ]
    ),
    html: `<ul><li><blockquote>${blockComment}a</blockquote></li><li><blockquote>${blockComment}b</blockquote></li></ul>`,
  },

  "nested quote and list with two items": {
    document: createDocument(
      [ "a", {}, [ "quote", "bulletList", "bullet" ] ],
      [ "b", {}, [ "quote", "bulletList", "bullet" ] ]
    ),
    html: `<blockquote><ul><li>${blockComment}a</li><li>${blockComment}b</li></ul></blockquote>`,
  },

  "nested unordered lists": {
    document: createDocument(
      [ "a", {}, [ "bulletList", "bullet" ] ],
      [ "b", {}, [ "bulletList", "bullet", "bulletList", "bullet" ] ],
      [ "c", {}, [ "bulletList", "bullet", "bulletList", "bullet" ] ]
    ),
    html: `<ul><li>${blockComment}a<ul><li>${blockComment}b</li><li>${blockComment}c</li></ul></li></ul>`,
  },

  "nested lists": {
    document: createDocument(
      [ "a", {}, [ "numberList", "number" ] ],
      [ "b", {}, [ "numberList", "number", "bulletList", "bullet" ] ],
      [ "c", {}, [ "numberList", "number", "bulletList", "bullet" ] ]
    ),
    html: `<ol><li>${blockComment}a<ul><li>${blockComment}b</li><li>${blockComment}c</li></ul></li></ol>`,
  },

  "blocks beginning with newlines": {
    document: createDocument([ "\na", {}, [ "quote" ] ], [ "\nb", {}, [] ], [ "\nc", {}, [ "quote" ] ]),
    html: `<blockquote>${blockComment}<br>a</blockquote><div>${blockComment}<br>b</div><blockquote>${blockComment}<br>c</blockquote>`,
  },

  "blocks beginning with formatted text": {
    document: createDocument(
      [ "a", { bold: true }, [ "quote" ] ],
      [ "b", { italic: true }, [] ],
      [ "c", { bold: true }, [ "quote" ] ]
    ),
    html: `<blockquote>${blockComment}<strong>a</strong></blockquote><div>${blockComment}<em>b</em></div><blockquote>${blockComment}<strong>c</strong></blockquote>`,
  },

  "text with newlines before block": {
    document: createDocument([ "a\nb" ], [ "c", {}, [ "quote" ] ]),
    html: `<div>${blockComment}a<br>b</div><blockquote>${blockComment}c</blockquote>`,
  },

  "empty heading block": {
    document: createDocument([ "", {}, [ "heading1" ] ]),
    html: `<h1>${blockComment}<br></h1>`,
  },

  "two adjacent headings": {
    document: createDocument([ "a", {}, [ "heading1" ] ], [ "b", {}, [ "heading1" ] ]),
    html: `<h1>${blockComment}a</h1><h1>${blockComment}b</h1>`,
  },

  "heading in ordered list": {
    document: createDocument([ "a", {}, [ "numberList", "number", "heading1" ] ]),
    html: `<ol><li><h1>${blockComment}a</h1></li></ol>`,
  },

  "headings with formatted text": {
    document: createDocument([ "a", { bold: true }, [ "heading1" ] ], [ "b", { italic: true, bold: true }, [ "heading1" ] ]),
    html: `<h1>${blockComment}<strong>a</strong></h1><h1>${blockComment}<strong><em>b</em></strong></h1>`,
  },

  "bidrectional text": {
    document: createDocument(
      [ "a" ],
      [ "ل", {}, [ "quote" ] ],
      [ "b", {}, [ "bulletList", "bullet" ] ],
      [ "ל", {}, [ "bulletList", "bullet" ] ],
      [ "", {}, [ "bulletList", "bullet" ] ],
      [ "cید" ],
      [ "\n گ" ]
    ),
    html: `<div>${blockComment}a</div>\
<blockquote dir="rtl">${blockComment}ل</blockquote>\
<ul><li>${blockComment}b</li></ul>\
<ul dir="rtl"><li>${blockComment}ל</li><li>${blockComment}<br></li></ul>\
<div>${blockComment}cید</div>\
<div dir="rtl">${blockComment}<br>&nbsp;گ</div>\
`,
    serializedHTML:
      "\
<div>a</div>\
<blockquote dir=\"rtl\">ل</blockquote>\
<ul><li>b</li></ul>\
<ul dir=\"rtl\"><li>ל</li><li><br></li></ul>\
<div>cید</div>\
<div dir=\"rtl\"><br>&nbsp;گ</div>\
",
  },
}

export const eachFixture = (callback) => {
  for (const name in fixtures) {
    const details = fixtures[name]
    callback(name, details)
  }
}
