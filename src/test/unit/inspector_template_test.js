import { assert, test, testGroup } from "test/test_helper"

import "inspector/templates/document"

testGroup("Inspector document template", () => {
  test("renders editor content as text instead of HTML", () => {
    const payload = "<img src=x onerror=\"alert(1)\"> & text"
    const piece = {
      id: "piece-1",
      attributes: { title: payload },
      toString: () => payload,
    }
    const block = {
      id: "block-1",
      attributes: { title: payload },
      htmlAttributes: { title: payload },
      text: {
        id: "text-1",
        pieceList: { toArray: () => [ piece ] },
        getLength: () => payload.length,
      },
    }
    const template = window.JST["trix/inspector/templates/document"]
    const html = template.call({ document: { getBlocks: () => [ block ] } })
    const container = document.createElement("div")
    container.innerHTML = html

    assert.notOk(container.querySelector("img"), "editor content created an image element")
    assert.ok(container.textContent.includes(JSON.stringify(payload)))
  })
})
