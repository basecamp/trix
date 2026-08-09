import { serializeToContentType } from "trix/core/serialization"
import HTMLParser from "trix/models/html_parser"
import { assert, eachFixture, test, testGroup } from "test/test_helper"

testGroup("serializeToContentType", () => {
  eachFixture((name, details) => {
    if (details.serializedHTML) {
      test(name, () => {
        assert.equal(serializeToContentType(details.document, "text/html"), details.serializedHTML)
      })
    }
  })
})

// Exercises the untrusted storage round-trip: stored HTML re-inflated through the
// same SAFE_FOR_XML: true path editor.loadHTML uses, then serialized back out.
testGroup("re-inflation round-trip (SAFE_FOR_XML)", () => {
  const reinflate = (html) => {
    const document = HTMLParser.parse(html, { purifyOptions: { SAFE_FOR_XML: true } }).getDocument()
    return serializeToContentType(document, "text/html")
  }

  // The security invariant is that no executable vector survives the round-trip:
  // no `onerror`, no event-handler attribute, and no `<script>`. Whether a *neutralized*
  // bare element survives is browser-parser-dependent and is NOT a security property, so we
  // don't assert on element presence: Firefox parses this payload such that a handler-stripped
  // `<img src="x">` remains and Trix promotes it to a benign image attachment, while Chromium
  // collapses the payload entirely. Re-inflating the sanitized output a second time proves it
  // is a stable fixed point that cannot mutate back into an executable form.
  test("neutralizes a mutation-XSS payload after round-trip", () => {
    const payload = "<noscript><p title=\"</noscript><img src=x onerror=alert(1)>\">"
    const once = reinflate(payload)
    const twice = reinflate(once)
    for (const output of [ once, twice ]) {
      assert.notOk(/onerror/i.test(output), `mXSS onerror survived: ${output}`)
      assert.notOk(/\son\w+\s*=/i.test(output), `mXSS event handler survived: ${output}`)
      assert.notOk(/<script/i.test(output), `mXSS script survived: ${output}`)
    }
  })

  test("preserves HTML comments serialized inside an attachment after round-trip", () => {
    const content = "<!-- BEGIN app/views/users/_user.html.erb --><span>Chris</span><!-- END app/views/users/_user.html.erb -->"
    const attachment = { contentType: "application/octet-stream", content, sgid: "abc123" }
    const html = `<div><figure data-trix-attachment='${JSON.stringify(attachment)}'></figure></div>`
    const output = reinflate(html)
    assert.ok(output.includes("data-trix-attachment"), `attachment lost on round-trip: ${output}`)
    assert.ok(output.includes("BEGIN app/views/users/_user.html.erb"), `attachment comment lost: ${output}`)
  })
})
