import { assert, test, testGroup } from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("morphing with internal toolbar", { template: "editor_empty" }, () => {
  test("removing the 'connected' attribute will reset the editor and recreate toolbar", async () => {
    const element = getEditorElement()

    assert.ok(element.hasAttribute("connected"))

    const originalToolbar = element.toolbarElement
    element.toolbarElement.remove()
    element.removeAttribute("toolbar")
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.hasAttribute("connected"))
    assert.ok(element.toolbarElement)
    assert.notEqual(originalToolbar, element.toolbarElement)
  })
})

testGroup("morphing with external toolbar", { template: "editor_with_toolbar_and_input" }, () => {
  test("removing the 'connected' attribute will reset the editor leave the toolbar untouched", async () => {
    const element = getEditorElement()

    assert.ok(element.hasAttribute("connected"))

    const originalToolbar = element.toolbarElement
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.hasAttribute("connected"))
    assert.ok(element.toolbarElement)
    assert.equal(originalToolbar, element.toolbarElement)
  })
})
