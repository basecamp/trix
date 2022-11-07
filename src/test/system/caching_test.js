import { assert, clickToolbarButton, moveCursor, test, testGroup, typeCharacters } from "test/test_helper"

testGroup("View caching", { template: "editor_empty" }, () => {
  test("reparsing and rendering identical texts", async () => {
    await typeCharacters("a\nb\na")
    await moveCursor({ direction: "left", times: 2 })
    await clickToolbarButton({ attribute: "quote" })

    const html = getEditorElement().innerHTML
    getEditorController().reparse()
    getEditorController().render()
    assert.equal(getEditorElement().innerHTML, html)
  })

  test("reparsing and rendering identical blocks", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\na")

    const html = getEditorElement().innerHTML
    getEditorController().reparse()
    getEditorController().render()
    assert.equal(getEditorElement().innerHTML, html)
  })
})
