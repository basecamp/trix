import { assert, test, testGroup } from "test/test_helper"

import { delay } from "../test_helpers/timing_helpers"

// getEditorElement is installed as a global test helper (see trix/core/helpers/global),
// mirroring how the other system tests reach the live editor.

// Exercises the real re-inflation entry point rather than the sanitizer in isolation:
// editor.loadHTML re-parses stored HTML under DOMPurify's mXSS-safe mode
// (SAFE_FOR_XML: true) and renders it into the live editor, including any attachment
// content re-parsed by AttachmentView. These assertions target the security invariant —
// no executable handler and no <script> reach the live DOM, and nothing executes.
// Handler stripping is a browser-independent DOMPurify guarantee, so unlike element
// shape the assertions are parser-agnostic.
testGroup("Re-inflation security (editor.loadHTML)", { template: "editor_empty" }, () => {
  const loadAndAssertInert = async (html) => {
    window.reinflationXSS = 0
    getEditorElement().editor.loadHTML(html)
    await delay(20)

    const element = getEditorElement()
    assert.equal(
      element.querySelectorAll("[onerror], [onload], [onclick]").length, 0,
      `live event handler survived re-inflation: ${element.innerHTML}`
    )
    assert.notOk(element.querySelector("script"), `script survived re-inflation: ${element.innerHTML}`)
    assert.equal(window.reinflationXSS, 0, "re-inflated payload executed")

    delete window.reinflationXSS
  }

  test("neutralizes a mutation-XSS payload loaded through the editor", async () => {
    await loadAndAssertInert(
      "<noscript><p title=\"</noscript><img src=x onerror=window.reinflationXSS=(window.reinflationXSS||0)+1>\">"
    )
  })

  test("sanitizes attacker-controlled attachment content on re-inflation", async () => {
    const attachment = {
      contentType: "text/html5",
      content: "</style><img src=x onerror=window.reinflationXSS=(window.reinflationXSS||0)+1>HELLO",
    }
    const html = `<div data-trix-attachment='${JSON.stringify(attachment).replace(/'/g, "&#39;")}'></div>`
    await loadAndAssertInert(html)
  })
})
