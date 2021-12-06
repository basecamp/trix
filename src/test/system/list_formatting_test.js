/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"

import { assert, clickToolbarButton, defer, moveCursor, pressKey, test, testGroup, testIf, triggerEvent, typeCharacters } from "test/test_helper"

testGroup("List formatting", { template: "editor_empty" }, function() {
  test("creating a new list item", done => typeCharacters("a", () => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("\n", function() {
    assert.locationRange({ index: 1, offset: 0 })
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    return done()
  }))))

  test("breaking out of a list", expectDocument => typeCharacters("a", () => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("\n\n", function() {
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [])
    return expectDocument("a\n\n")
  }))))

  test("pressing return at the beginning of a non-empty list item", expectDocument => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a\nb", () => moveCursor("left", () => pressKey("return", function() {
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 3, 5 ], [ "bulletList", "bullet" ])
    return expectDocument("a\n\nb\n")
  })))))

  test("pressing tab increases nesting level, tab+shift decreases nesting level", expectDocument => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a", () => pressKey("return", () => pressKey("tab", () => typeCharacters("b", function() {
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
    return defer(function() {
      const pressShiftTab = triggerEvent(document.activeElement, "keydown", { key: "Tab", charCode: 0, keyCode: 9, which: 9, shiftKey: true })
      assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
      assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
      return expectDocument("a\nb\n")
    })
  }))))))

  testIf(config.input.getLevel() === 0, "pressing shift-return at the end of a list item", expectDocument => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a", function() {
    const pressShiftReturn = triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 13, which: 13, shiftKey: true })
    assert.notOk(pressShiftReturn) // Assert defaultPrevented
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    return expectDocument("a\n\n")
  })))

  test("pressing delete at the beginning of a non-empty nested list item", expectDocument => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a\n", () => clickToolbarButton({ action: "increaseNestingLevel" }, () => typeCharacters("b\n", () => clickToolbarButton({ action: "increaseNestingLevel" }, () => typeCharacters("c", function() {
    getSelectionManager().setLocationRange({ index: 1, offset: 0 })
    getComposition().deleteInDirection("backward")
    getEditorController().render()
    return defer(function() {
      assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
      assert.blockAttributes([ 3, 4 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
      return expectDocument("ab\nc\n")
    })
  })))))))

  return test("decreasing list item's level decreases its nested items level too", expectDocument => clickToolbarButton({ attribute: "bullet" }, () => typeCharacters("a\n", () => clickToolbarButton({ action: "increaseNestingLevel" }, () => typeCharacters("b\n", () => clickToolbarButton({ action: "increaseNestingLevel" }, () => typeCharacters("c", function() {
    getSelectionManager().setLocationRange({ index: 1, offset: 1 })

    for (let n = 0; n < 3; n++) {
      getComposition().deleteInDirection("backward")
      getEditorController().render()
    }

    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [])
    assert.blockAttributes([ 3, 5 ], [ "bulletList", "bullet" ])
    return expectDocument("a\n\nc\n")
  })))))))
})
