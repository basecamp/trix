import { assert, eachFixture, test, testGroup } from "test/test_helper"

import Attachment from "trix/models/attachment"
import Block from "trix/models/block"
import Document from "trix/models/document"
import DocumentView from "trix/views/document_view"
import Text from "trix/models/text"

testGroup("DocumentView", () => {
  eachFixture((name, details) => {
    test(name, () => {
      assert.documentHTMLEqual(details.document, details.html)
    })
  })

  // Pasting the rendered HTML back into Trix parses it under DOMPurify's SAFE_FOR_XML
  // mode, which drops any attribute whose value contains "</style>".
  test("renders attachment JSON without angle brackets", () => {
    const content = "<style>p { color: red }</style><p>quoted mail</p>"
    const attachment = new Attachment({ content, contentType: "text/html" })
    const text = Text.textForAttachmentWithAttributes(attachment, { caption: "</style>" })
    const figure = DocumentView.render(new Document([ new Block(text) ])).querySelector("figure")

    const attachmentJSON = figure.getAttribute("data-trix-attachment")
    const attributesJSON = figure.getAttribute("data-trix-attributes")

    assert.notOk(/[<>]/.test(attachmentJSON), "raw angle brackets in attachment JSON")
    assert.notOk(/[<>]/.test(attributesJSON), "raw angle brackets in attributes JSON")
    assert.equal(JSON.parse(attachmentJSON).content, content)
    assert.equal(JSON.parse(attributesJSON).caption, "</style>")
  })
})
