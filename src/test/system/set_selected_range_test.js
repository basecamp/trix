import { assert, insertString, test, testGroup } from "test/test_helper"

testGroup(
  "Set selected range at the start of the text",
  { template: "editor_empty" },
  () => {
    test("selection of the surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 0, 2 ])
      assert.selectedRange([ 0, 2 ])
    })

    test("selection of the first surrogate pair character", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 0, 1 ])
      assert.selectedRange([ 0, 2 ])
    })

    test("selection of the second surrogate pair character", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 1, 2 ])
      assert.selectedRange([ 2, 2 ])
    })

    test("collapssed selection in the middle of the surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 1, 1 ])
      assert.selectedRange([ 2, 2 ])
    })

    test("collapsed selection after surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 2, 2 ])
      assert.selectedRange([ 2, 2 ])
    })

    test("selection after surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 2, 4 ])
      assert.selectedRange([ 2, 4 ])
    })

    test("collapsed selection far after surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 3, 3 ])
      assert.selectedRange([ 3, 3 ])
    })

    test("selection far after surrogate pair", () => {
      insertString("🙂foo")
      getComposition().setSelectedRange([ 3, 5 ])
      assert.selectedRange([ 3, 5 ])
    })
  },
)

testGroup(
  "Set selected range in the middle of the text",
  { template: "editor_empty" },
  () => {
    test("collapsed selection far before surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 2, 2 ])
      assert.selectedRange([ 2, 2 ])
    })

    test("selection far before surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 0, 2 ])
      assert.selectedRange([ 0, 2 ])
    })

    test("collapsed selection before surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 3, 3 ])
      assert.selectedRange([ 3, 3 ])
    })

    test("selection before surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 1, 3 ])
      assert.selectedRange([ 1, 3 ])
    })

    test("selection of the surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 3, 5 ])
      assert.selectedRange([ 3, 5 ])
    })

    test("selection of the first surrogate pair character", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 3, 4 ])
      assert.selectedRange([ 3, 5 ])
    })

    test("selection of the second surrogate pair character", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 4, 5 ])
      assert.selectedRange([ 5, 5 ])
    })

    test("collapssed selection in the middle of the surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 4, 4 ])
      assert.selectedRange([ 5, 5 ])
    })

    test("selection after surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 5, 7 ])
      assert.selectedRange([ 5, 7 ])
    })

    test("collapsed selection after surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 5, 5 ])
      assert.selectedRange([ 5, 5 ])
    })

    test("selection far after surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 6, 8 ])
      assert.selectedRange([ 6, 8 ])
    })

    test("collapsed selection far after surrogate pair", () => {
      insertString("foo🙂bar")
      getComposition().setSelectedRange([ 6, 6 ])
      assert.selectedRange([ 6, 6 ])
    })
  },
)

testGroup(
  "Set selected range at the end of the text",
  { template: "editor_empty" },
  () => {
    test("collapsed selection far before surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 2, 2 ])
      assert.selectedRange([ 2, 2 ])
    })

    test("selection far before surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 0, 2 ])
      assert.selectedRange([ 0, 2 ])
    })

    test("collapsed selection before surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 3, 3 ])
      assert.selectedRange([ 3, 3 ])
    })

    test("selection before surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 1, 3 ])
      assert.selectedRange([ 1, 3 ])
    })

    test("selection of the surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 3, 5 ])
      assert.selectedRange([ 3, 5 ])
    })

    test("selection of the first surrogate pair character", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 3, 4 ])
      assert.selectedRange([ 3, 5 ])
    })

    test("selection of the second surrogate pair character", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 4, 5 ])
      assert.selectedRange([ 5, 5 ])
    })

    test("collapssed selection in the middle of the surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 4, 4 ])
      assert.selectedRange([ 5, 5 ])
    })

    test("collapsed selection after surrogate pair", () => {
      insertString("foo🙂")
      getComposition().setSelectedRange([ 5, 5 ])
      assert.selectedRange([ 5, 5 ])
    })
  },
)
