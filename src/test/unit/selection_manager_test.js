import {
  addSelectionRange,
  assert,
  expandSelection,
  getDOMRange,
  getDOMSelection,
  insertString,
  test,
  testGroup,
  withMockSelection,
} from "test/test_helper"

testGroup("SelectionManager", { template: "editor_empty" }, () => {
  test("identical native range remains untouched", async () => {
    insertString("hello")
    getSelectionManager().setLocationRange({ index: 0, offset: 2 })
    const nativeRange = getDOMRange()

    getSelectionManager().setLocationRange({ index: 0, offset: 2 })
    assert.equal(getDOMRange(), nativeRange)

    await expandSelection("right")
    const expandedRange = getDOMRange()

    getSelectionManager().setLocationRange(getSelectionManager().getLocationRange())
    assert.equal(getDOMRange(), expandedRange)
  })

  test("different native range is replaced", () => {
    insertString("hello")
    getSelectionManager().setLocationRange({ index: 0, offset: 2 })
    const nativeRange = getDOMRange()

    getSelectionManager().setLocationRange({ index: 0, offset: 4 })
    assert.notEqual(getDOMRange(), nativeRange)
    assert.locationRange({ index: 0, offset: 4 })
  })

  test("multi-range selection is replaced where supported", () => {
    insertString("hello")
    getSelectionManager().setLocationRange({ index: 0, offset: 2 })
    const nativeRange = getDOMRange()

    const secondRange = document.createRange()
    secondRange.selectNodeContents(getEditorElement())
    addSelectionRange(secondRange)

    if (getDOMSelection().rangeCount > 1) {
      getSelectionManager().setLocationRange({ index: 0, offset: 2 })
      assert.equal(getDOMSelection().rangeCount, 1)
      assert.notEqual(getDOMRange(), nativeRange)
    } else {
      assert.ok(true)
    }
  })

  test("domRangeMatchesSelection returns false when selection has multiple ranges", () => {
    insertString("hello")
    const domRange = getDOMRange()

    withMockSelection({ rangeCount: 2, getRangeAt: () => domRange }, () => {
      assert.notOk(getSelectionManager().domRangeMatchesSelection(domRange))
    })
  })

  test("setLocationRange replaces multi-range selection", () => {
    insertString("hello")
    const domRange = getDOMRange()
    let replaced = false

    withMockSelection({
      rangeCount: 2,
      getRangeAt: () => domRange,
      removeAllRanges: () => {
        replaced = true
      },
      addRange: () => {},
    }, () => {
      getSelectionManager().setLocationRange({ index: 0, offset: 2 })
      assert.ok(replaced)
    })
  })
})
