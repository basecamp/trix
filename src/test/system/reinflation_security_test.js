import { assert, test, testGroup } from "test/test_helper"

import { delay } from "../test_helpers/timing_helpers"

// Drives the real re-inflation entry point rather than the sanitizer in isolation. The
// assertions are about the security invariant, not element shape: browsers disagree on what
// a neutralized payload parses into, but none of them may leave a live handler behind.
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
