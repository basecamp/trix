import { assert, expectDocument, test, testGroup } from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("HTML Reparsing", { template: "editor_empty" }, () => {
  test("mutation resulting in identical blocks", async () => {
    const element = getEditorElement()
    element.editor.loadHTML("<ul><li>a</li><li>b</li></ul>")
    await nextFrame()
    element.querySelector("li").textContent = "b"
    await nextFrame()
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    assert.equal(element.value, "<ul><li>b</li><li>b</li></ul>")
    expectDocument("b\nb\n")
  })

  test("mutation resulting in identical pieces", async () => {
    const element = getEditorElement()
    element.editor.loadHTML("<div><strong>a</strong> <strong>b</strong></div>")
    await nextFrame()
    element.querySelector("strong").textContent = "b"
    await nextFrame()
    assert.textAttributes([ 0, 1 ], { bold: true })
    assert.textAttributes([ 2, 3 ], { bold: true })
    assert.equal(element.value, "<div><strong>b</strong> <strong>b</strong></div>")
    expectDocument("b b\n")
  })
})
