import {
  assert,
  test,
  testGroup,
} from "test/test_helper"

import { HTMLSanitizer } from "../../trix/models"
import * as config from "../../trix/config"

testGroup("HTMLSanitizer", () => {
  test("strips custom tags", () => {
    const html = "<custom-tag></custom-tag>"
    const expectedHTML = ""
    const document = HTMLSanitizer.sanitize(html).body.innerHTML
    assert.equal(document, expectedHTML)
  })

  test("strips data-trix-serialized-attributes", () => {
    const html = "<div data-trix-serialized-attributes=\"{}\">content</div>"
    const sanitized = HTMLSanitizer.sanitize(html).body.innerHTML
    assert.notOk(sanitized.includes("data-trix-serialized-attributes"))
  })

  test("preserves other data-trix-* attributes", () => {
    const html = "<div data-trix-attachment=\"{}\">content</div>"
    const sanitized = HTMLSanitizer.sanitize(html).body.innerHTML
    assert.ok(sanitized.includes("data-trix-attachment"))
  })

  // Regression: basecamp/trix#1213. Attachment content serialized into a
  // data-trix-attachment attribute can contain Rails view-annotation comments
  // like `<!-- BEGIN app/views/... -->`. DOMPurify's SAFE_FOR_XML guard would
  // otherwise drop the whole attribute (its value contains `-->`), silently
  // removing the attachment on the storage round-trip.
  test("preserves data-trix-* attribute values with comment markers under SAFE_FOR_XML", () => {
    const content = "<!-- BEGIN app/views/users/_user.html.erb --><span>Chris</span><!-- END app/views/users/_user.html.erb -->"
    const html = `<figure data-trix-attachment="${content.replace(/"/g, "&quot;")}"></figure>`
    const sanitized = HTMLSanitizer.sanitize(html, { purifyOptions: { SAFE_FOR_XML: true } }).body.innerHTML
    assert.ok(sanitized.includes("data-trix-attachment"), `attachment attribute lost: ${sanitized}`)
    assert.ok(sanitized.includes("BEGIN app/views/users/_user.html.erb"), `comment marker lost: ${sanitized}`)
  })

  test("still strips XML-unsafe values on non-data-trix attributes under SAFE_FOR_XML", () => {
    // The preservation hook is scoped to data-trix-* attributes only. A comment
    // terminator smuggled into a normally-allowed attribute must still be dropped.
    const html = "<div class=\"foo--></div><img src=x onerror=alert(1)>\">hi</div>"
    const sanitized = HTMLSanitizer.sanitize(html, { purifyOptions: { SAFE_FOR_XML: true } }).body.innerHTML
    assert.notOk(/onerror/i.test(sanitized), `mXSS payload survived: ${sanitized}`)
    assert.notOk(sanitized.includes("foo--"), `XML-unsafe class value survived: ${sanitized}`)
  })

  test("keeps custom tags configured for DOMPurify", () => {
    const config = {
      ADD_TAGS: [ "custom-tag" ],
      RETURN_DOM: true,
    }
    withDOMPurifyConfig(config, () => {
      const html = "<custom-tag></custom-tag>"
      const expectedHTML = "<custom-tag></custom-tag>"
      const document = HTMLSanitizer.sanitize(html).body.innerHTML
      assert.equal(document, expectedHTML)
    })
  })

})

const withDOMPurifyConfig = (attrConfig = {}, fn) => {
  withConfig("dompurify", attrConfig, fn)
}

const withConfig = (section, newConfig = {}, fn) => {
  const originalConfig = Object.assign({}, config[section])
  const copy = (section, properties) => {
    for (const [ key, value ] of Object.entries(properties)) {
      if (value) {
        config[section][key] = value
      } else {
        delete config[section][key]
      }
    }
  }

  try {
    copy(section, newConfig)
    fn()
  } finally {
    copy(section, originalConfig)
  }
}
