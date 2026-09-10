import { serializeToContentType } from "trix/core/serialization"
import { assert, eachFixture, test, testGroup } from "test/test_helper"

testGroup("serializeToContentType", () => {
  eachFixture((name, details) => {
    if (details.serializedHTML) {
      test(name, () => {
        assert.equal(serializeToContentType(details.document, "text/html"), details.serializedHTML)
      })
    }
  })

  testGroup("block boundary marker removal", () => {
    test("removes real block marker comment nodes", () => {
      const element = document.createElement("div")
      const block = document.createElement("div")
      block.appendChild(document.createComment("block"))
      block.appendChild(document.createTextNode("abc"))
      element.appendChild(block)

      assert.equal(serializeToContentType(element, "text/html"), "<div>abc</div>")
    })

    test("preserves comment nodes that are not Trix block markers", () => {
      const element = document.createElement("div")
      const block = document.createElement("div")
      block.appendChild(document.createComment("block"))
      block.appendChild(document.createComment("keep"))
      block.appendChild(document.createTextNode("abc"))
      element.appendChild(block)

      assert.equal(serializeToContentType(element, "text/html"), "<div><!--keep-->abc</div>")
    })

    test("preserves a literal block-marker byte sequence sitting in raw text", () => {
      const element = document.createElement("div")
      element.innerHTML = "<style>x<!--block-->y</style>"

      // Inside a raw-text element the bytes "<!--block-->" are a text node, not
      // a comment node, so they must survive serialization verbatim.
      const style = element.querySelector("style")
      assert.equal(style.childNodes.length, 1)
      assert.equal(style.childNodes[0].nodeType, Node.TEXT_NODE)

      assert.equal(serializeToContentType(element, "text/html"), "<style>x<!--block-->y</style>")
    })

    test("does not splice a literal marker into a real end tag", () => {
      const element = document.createElement("div")
      element.innerHTML = "<style>a</st<!--block-->yle>b</style>"

      // The whole payload is one inert text node inside the <style> element.
      const style = element.querySelector("style")
      assert.equal(style.childNodes.length, 1)
      assert.equal(style.textContent, "a</st<!--block-->yle>b")

      const output = serializeToContentType(element, "text/html")

      // Round-tripping the serialized value must yield the same structure: one
      // <style> element whose text is intact, with nothing fused into a real
      // </style> end tag that leaks "b" out of the raw-text context.
      const reparsed = document.createElement("div")
      reparsed.innerHTML = output
      assert.equal(reparsed.querySelectorAll("style").length, 1)
      assert.equal(reparsed.querySelector("style").childNodes.length, 1)
      assert.equal(reparsed.querySelector("style").textContent, "a</st<!--block-->yle>b")
    })
  })
})
