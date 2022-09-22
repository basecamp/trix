import * as config from "trix/config"

import {
  assert,
  clickToolbarButton,
  expectDocument,
  moveCursor,
  pressKey,
  test,
  testGroup,
  testIf,
  triggerEvent,
  typeCharacters,
} from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("List formatting", { template: "editor_empty" }, () => {
  test("creating a new list item", async () => {
    await typeCharacters("a")
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("\n")
    assert.locationRange({ index: 1, offset: 0 })
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
  })

  test("breaking out of a list", async () => {
    await typeCharacters("a")
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("\n\n")
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [])
    expectDocument("a\n\n")
  })

  test("pressing return at the beginning of a non-empty list item", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\nb")
    await moveCursor("left")
    await pressKey("return")
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 3, 5 ], [ "bulletList", "bullet" ])
    expectDocument("a\n\nb\n")
  })

  test("pressing tab increases nesting level, tab+shift decreases nesting level", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a")
    await pressKey("return")
    await pressKey("tab")
    await typeCharacters("b")
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
    await nextFrame()
    // press shift tab
    triggerEvent(document.activeElement, "keydown", {
      key: "Tab",
      charCode: 0,
      keyCode: 9,
      which: 9,
      shiftKey: true,
    })
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    expectDocument("a\nb\n")
  })

  testIf(config.input.getLevel() === 0, "pressing shift-return at the end of a list item", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a")
    const pressShiftReturn = triggerEvent(document.activeElement, "keydown", {
      charCode: 0,
      keyCode: 13,
      which: 13,
      shiftKey: true,
    })
    assert.notOk(pressShiftReturn) // Assert defaultPrevented
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    expectDocument("a\n\n")
  })

  test("pressing delete at the beginning of a non-empty nested list item", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("b\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("c")
    getSelectionManager().setLocationRange({ index: 1, offset: 0 })
    getComposition().deleteInDirection("backward")
    getEditorController().render()
    await nextFrame()
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 3, 4 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
    expectDocument("ab\nc\n")
  })

  test("decreasing list item's level decreases its nested items level too", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("b\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("c")
    getSelectionManager().setLocationRange({ index: 1, offset: 1 })

    for (let n = 0; n < 3; n++) {
      getComposition().deleteInDirection("backward")
      getEditorController().render()
    }

    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [])
    assert.blockAttributes([ 3, 5 ], [ "bulletList", "bullet" ])
    expectDocument("a\n\nc\n")
  })
})
