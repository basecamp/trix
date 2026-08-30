import {
  assert,
  attachmentHTML,
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

  test("strips data-trix-serialized-attributes containing markup when sanitizing for XML", () => {
    const html = "<div data-trix-serialized-attributes='{\"a\":\"</style>\"}'>content</div>"
    const body = HTMLSanitizer.sanitize(html, { purifyOptions: { SAFE_FOR_XML: true } }).getBody()
    assert.notOk(body.innerHTML.includes("data-trix-serialized-attributes"))
  })

  test("keeps Trix attributes containing markup when sanitizing for XML", () => {
    const markupValues = [ "</style>", "</title>", "</textarea>", "<![endif]-->", "]>" ]

    markupValues.forEach((markup) => {
      const value = `{"contentType":"text/html","content":"${markup}"}`
      const html = `<figure data-trix-attachment='${value}'></figure>`
      const body = HTMLSanitizer.sanitize(html, { purifyOptions: { SAFE_FOR_XML: true } }).getBody()
      const kept = body.querySelector("figure").getAttribute("data-trix-attachment")
      assert.deepEqual(JSON.parse(kept), JSON.parse(value))
      assert.notOk(/[<>]/.test(kept), "raw angle brackets left in: " + kept)
    })
  })

  test("removes other attributes containing markup when sanitizing for XML", () => {
    const html = "<a href=\"#\" class=\"</style>\">a</a>"
    const body = HTMLSanitizer.sanitize(html, { purifyOptions: { SAFE_FOR_XML: true } }).getBody()
    assert.equal(body.querySelector("a").hasAttribute("class"), false)
  })

  // DOMPurify's SAFE_FOR_XML attribute rule drops any attribute whose value contains a
  // sequence that could close a raw-text element or a comment, before the forceKeepAttr set
  // by Trix's uponSanitizeAttribute hook is honored. sanitizeElement escapes the angle
  // brackets in the JSON attachment attributes first, so the value never trips the rule and
  // what comes out carries no raw angle brackets either.
  const safeForXMLTriggers = [
    "</style>", "</script>", "</title>", "</xmp>", "</textarea>", "</noscript>", "</iframe>", "</noembed>", "</noframes>",
    "-->", "--!>", "]]>",
  ]

  safeForXMLTriggers.forEach((trigger) => {
    test(`keeps attachment JSON containing ${trigger} under SAFE_FOR_XML`, () => {
      const attachment = { contentType: "text/html", content: `<p>before ${trigger} after</p>` }
      const attributes = { caption: `caption ${trigger}` }
      const sanitized = HTMLSanitizer.sanitize(attachmentHTML(attachment, attributes), { purifyOptions: { SAFE_FOR_XML: true } })
      const figure = sanitized.body.querySelector("figure")

      assert.ok(figure, "attachment element was dropped")
      assert.deepEqual(JSON.parse(figure.getAttribute("data-trix-attachment")), attachment)
      assert.deepEqual(JSON.parse(figure.getAttribute("data-trix-attributes")), attributes)
      assert.notOk(/[<>]/.test(figure.getAttribute("data-trix-attachment")), "raw angle brackets left in attachment JSON")
      assert.notOk(/[<>]/.test(figure.getAttribute("data-trix-attributes")), "raw angle brackets left in attributes JSON")
    })
  })

  test("keeps nested attachment JSON containing </style> under SAFE_FOR_XML", () => {
    const inner = { contentType: "text/html", content: "<style>p { color: red }</style><p>quoted</p>" }
    const attachment = { contentType: "text/html", content: `<p>reply</p>${attachmentHTML(inner)}` }
    const sanitized = HTMLSanitizer.sanitize(attachmentHTML(attachment), { purifyOptions: { SAFE_FOR_XML: true } })
    const figure = sanitized.body.querySelector("figure")

    assert.ok(figure, "attachment element was dropped")
    assert.deepEqual(JSON.parse(figure.getAttribute("data-trix-attachment")), attachment)
  })

  test("keeps attachment attributes JSON containing </style> under SAFE_FOR_XML", () => {
    const attachment = { contentType: "image/png", filename: "example.png" }
    const attributes = { caption: "</style>" }
    const sanitized = HTMLSanitizer.sanitize(attachmentHTML(attachment, attributes), { purifyOptions: { SAFE_FOR_XML: true } })
    const figure = sanitized.body.querySelector("figure")

    assert.ok(figure, "attachment element was dropped")
    assert.deepEqual(JSON.parse(figure.getAttribute("data-trix-attachment")), attachment)
    assert.deepEqual(JSON.parse(figure.getAttribute("data-trix-attributes")), attributes)
  })

  test("leaves malformed attachment JSON alone", () => {
    const html = "<figure data-trix-attachment=\"{&quot;x:}<\" data-trix-attributes=\"<>\"></figure>"
    const figure = HTMLSanitizer.sanitize(html).body.querySelector("figure")

    assert.equal(figure.getAttribute("data-trix-attachment"), "{\"x:}<")
    assert.equal(figure.getAttribute("data-trix-attributes"), "<>")
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
