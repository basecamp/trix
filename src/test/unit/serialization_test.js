import * as config from "trix/config"
import DOMPurify from "dompurify"
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
})

testGroup("serializeToContentType with serialized attributes", () => {
  const serializeImageWithSerializedAttributes = (attributes) => {
    const element = document.createElement("div")
    const image = document.createElement("img")
    image.setAttribute("src", "blob:preview")
    image.setAttribute("data-trix-serialized-attributes", JSON.stringify(attributes))
    element.appendChild(image)

    const container = document.createElement("div")
    container.innerHTML = serializeToContentType(element, "text/html")
    return container.querySelector("img")
  }

  test("applies a serialized src", () => {
    const image = serializeImageWithSerializedAttributes({ src: "https://example.com/image.png" })

    assert.equal(image.getAttribute("src"), "https://example.com/image.png")
    assert.notOk(image.hasAttribute("data-trix-serialized-attributes"))
  })

  test("skips serialized event handler attributes", () => {
    const image = serializeImageWithSerializedAttributes({ onerror: "alert(1)", ONLOAD: "alert(2)", alt: "kept" })

    assert.notOk(image.hasAttribute("onerror"))
    assert.notOk(image.hasAttribute("onload"))
    assert.equal(image.getAttribute("alt"), "kept")
  })

  test("skips serialized attributes the sanitizer forbids", () => {
    const image = serializeImageWithSerializedAttributes({ src: "javascript:alert(1)", formaction: "https://example.com" })

    assert.equal(image.getAttribute("src"), "blob:preview")
    assert.notOk(image.hasAttribute("formaction"))
  })

  test("skips serialized attributes the configured sanitizer options forbid", () => {
    config.dompurify.FORBID_ATTR = [ "alt" ]

    try {
      const image = serializeImageWithSerializedAttributes({ alt: "forbidden", title: "kept" })
      assert.notOk(image.hasAttribute("alt"))
      assert.equal(image.getAttribute("title"), "kept")
    } finally {
      delete config.dompurify.FORBID_ATTR
    }
  })

  test("leaves the shared DOMPurify configuration alone", () => {
    DOMPurify.setConfig({ FORBID_ATTR: [ "title" ] })

    try {
      serializeImageWithSerializedAttributes({ title: "kept" })
      assert.notOk(DOMPurify.isValidAttribute("img", "title", "kept"))
    } finally {
      DOMPurify.clearConfig()
    }
  })

  test("skips serialized event handler attributes even when the sanitizer config allows them", () => {
    const originalAddAttr = config.dompurify.ADD_ATTR
    config.dompurify.ADD_ATTR = [ ...originalAddAttr, "onerror" ]

    try {
      const image = serializeImageWithSerializedAttributes({ onerror: "alert(1)" })
      assert.notOk(image.hasAttribute("onerror"))
    } finally {
      config.dompurify.ADD_ATTR = originalAddAttr
    }
  })
})
