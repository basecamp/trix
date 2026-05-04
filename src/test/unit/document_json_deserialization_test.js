import { assert, test, testGroup } from "test/test_helper"

import { deserializeFromContentType } from "trix/core/serialization"
import DocumentView from "trix/views/document_view"

const deserializeAndRender = function(json) {
  const document = deserializeFromContentType(json, "application/json")
  return DocumentView.render(document)
}

const buildPayloadWithHref = function(href) {
  return JSON.stringify([ {
    text: [ { type: "string", string: "Click me", attributes: { href } } ],
    attributes: [],
    htmlAttributes: {},
  } ])
}

testGroup("JSON deserialization sanitization", () => {
  test("strips javascript: href", () => {
    const element = deserializeAndRender(buildPayloadWithHref("javascript:alert(1)"))
    const links = element.querySelectorAll("a[href]")
    const dangerousLinks = Array.from(links).filter((link) => /javascript:/i.test(link.getAttribute("href")))

    assert.equal(dangerousLinks.length, 0, "javascript: href should be stripped")
    assert.ok(element.textContent.includes("Click me"), "link text should be preserved")
  })

  test("strips javascript: href with mixed case", () => {
    const element = deserializeAndRender(buildPayloadWithHref("JavaScript:alert(1)"))
    const links = element.querySelectorAll("a[href]")
    const dangerousLinks = Array.from(links).filter((link) => /javascript:/i.test(link.getAttribute("href")))

    assert.equal(dangerousLinks.length, 0, "mixed-case javascript: href should be stripped")
    assert.ok(element.textContent.includes("Click me"), "link text should be preserved")
  })

  test("strips javascript: href with leading whitespace", () => {
    const element = deserializeAndRender(buildPayloadWithHref("  javascript:alert(1)"))
    const links = element.querySelectorAll("a[href]")
    const dangerousLinks = Array.from(links).filter((link) => /javascript:/i.test(link.getAttribute("href")))

    assert.equal(dangerousLinks.length, 0, "whitespace-padded javascript: href should be stripped")
    assert.ok(element.textContent.includes("Click me"), "link text should be preserved")
  })

  test("preserves safe https: href", () => {
    const element = deserializeAndRender(buildPayloadWithHref("https://example.com"))
    const links = element.querySelectorAll("a[href]")
    const safeLinks = Array.from(links).filter((link) => link.getAttribute("href") === "https://example.com")

    assert.equal(safeLinks.length, 1, "https: href should be preserved")
    assert.ok(element.textContent.includes("Click me"), "link text should be preserved")
  })
})
