import {
  assert,
  clickToolbarButton,
  expandSelection,
  moveCursor,
  test,
  testGroup,
  typeCharacters,
} from "test/test_helper"

testGroup("Undo/Redo", { template: "editor_empty" }, async () => {
  test("typing and undoing", async () => {
    const first = getDocument().copy()
    await typeCharacters("abc")
    assert.notOk(getDocument().isEqualTo(first))
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(first))
  })

  test("typing, formatting, typing, and undoing", async () => {
    const first = getDocument().copy()
    await typeCharacters("abc")
    const second = getDocument().copy()
    await clickToolbarButton({ attribute: "bold" })
    await typeCharacters("def")
    const third = getDocument().copy()
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(second))
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(first))
    await clickToolbarButton({ action: "redo" })
    assert.ok(getDocument().isEqualTo(second))
    await clickToolbarButton({ action: "redo" })
    assert.ok(getDocument().isEqualTo(third))
  })

  test("formatting changes are batched by location range", async () => {
    await typeCharacters("abc")
    const first = getDocument().copy()
    await expandSelection("left")
    await clickToolbarButton({ attribute: "bold" })
    await clickToolbarButton({ attribute: "italic" })
    const second = getDocument().copy()
    await moveCursor("left")
    await expandSelection("left")
    await clickToolbarButton({ attribute: "italic" })
    const third = getDocument().copy()
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(second))
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(first))
    await clickToolbarButton({ action: "redo" })
    assert.ok(getDocument().isEqualTo(second))
    await clickToolbarButton({ action: "redo" })
    assert.ok(getDocument().isEqualTo(third))
  })

  test("block formatting are undoable", async () => {
    await typeCharacters("abc")
    const first = getDocument().copy()
    await clickToolbarButton({ attribute: "heading1" })
    const second = getDocument().copy()
    await clickToolbarButton({ action: "undo" })
    assert.ok(getDocument().isEqualTo(first))
    clickToolbarButton({ action: "redo" })
    assert.ok(getDocument().isEqualTo(second))
  })
})
