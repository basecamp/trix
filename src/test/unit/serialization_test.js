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

testGroup("re-inflation round-trip (SAFE_FOR_XML)", () => {
  const reinflate = (html) => {
    const document = HTMLParser.parse(html, { purifyOptions: { SAFE_FOR_XML: true } }).getDocument()
    return serializeToContentType(document, "text/html")
  }

  // Reinflating the output a second time proves the sanitized form is a fixed point that
  // cannot mutate back into an executable one. Element shape is browser-dependent, so only
  // the executable vectors are asserted on.
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
