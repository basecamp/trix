import { assert, test, testGroup } from "test/test_helper"
import { installDefaultCSSForTagName, makeElement } from "trix/core/helpers"

let meta = null

const insertMeta = (attributes) => {
  meta = makeElement("meta", attributes)
  document.head.append(meta)
}

const installDefaultCSS = (tagName, css) => {
  installDefaultCSSForTagName(tagName, css)

  return document.querySelector(`style[data-tag-name=${tagName}]`)
}

const teardown = () => meta.remove()

testGroup("Helpers: Custom Elements", { teardown }, () => {
  test("reads from meta[name=csp-nonce][content]", () => {
    insertMeta({ name: "csp-nonce", content: "abc123" })

    const style = installDefaultCSS("trix-element", "trix-element { display: block; }")

    assert.equal(style.getAttribute("nonce"), "abc123")
    assert.equal(style.innerHTML, "trix-element { display: block; }")
  })

  test("reads from meta[name=trix-csp-nonce][content]", () => {
    insertMeta({ name: "trix-csp-nonce", content: "abc123" })

    const style = installDefaultCSS("trix-element", "trix-element { display: block; }")

    assert.equal(style.getAttribute("nonce"), "abc123")
    assert.equal(style.innerHTML, "trix-element { display: block; }")
  })

  test("reads from meta[name=csp-nonce][nonce]", () => {
    insertMeta({ name: "csp-nonce", nonce: "abc123" })

    const style = installDefaultCSS("trix-element", "trix-element { display: block; }")

    assert.equal(style.getAttribute("nonce"), "abc123")
    assert.equal(style.innerHTML, "trix-element { display: block; }")
  })

  test("reads from meta[name=trix-csp-nonce][nonce]", () => {
    insertMeta({ name: "trix-csp-nonce", nonce: "abc123" })

    const style = installDefaultCSS("trix-element", "trix-element { display: block; }")

    assert.equal(style.getAttribute("nonce"), "abc123")
    assert.equal(style.innerHTML, "trix-element { display: block; }")
  })
})
