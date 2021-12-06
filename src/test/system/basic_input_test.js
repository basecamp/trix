// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"

import { assert, defer, dragToCoordinates, expandSelection, insertNode, moveCursor, pressKey, selectAll, test, testGroup, testIf, triggerEvent, typeCharacters } from "test/test_helper"

testGroup("Basic input", { template: "editor_empty" }, function() {
  test("typing", expectDocument => typeCharacters("abc", () => expectDocument("abc\n")))

  test("backspacing", expectDocument => typeCharacters("abc\b", function() {
    assert.locationRange({ index: 0, offset: 2 })
    return expectDocument("ab\n")
  }))

  test("pressing delete", expectDocument => typeCharacters("ab", () => moveCursor("left", () => pressKey("delete", () => expectDocument("a\n")))))

  test("pressing return", expectDocument => typeCharacters("ab", () => pressKey("return", () => typeCharacters("c", () => expectDocument("ab\nc\n")))))

  test("pressing escape in Safari", expectDocument => typeCharacters("a", function() {
    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 27, which: 27, key: "Escape", code: "Escape" })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 27, keyCode: 27, which: 27, key: "Escape", code: "Escape" })
    }
    return defer(() => expectDocument("a\n"))
  }))

  test("pressing escape in Firefox", expectDocument => typeCharacters("a", function() {
    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 27, which: 27, key: "Escape", code: "Escape" })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 0, keyCode: 27, which: 0, key: "Escape", code: "Escape" })
    }
    return defer(() => expectDocument("a\n"))
  }))

  test("pressing escape in Chrome", expectDocument => typeCharacters("a", function() {
    triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 27, which: 27, key: "Escape", code: "Escape" })
    return defer(() => expectDocument("a\n"))
  }))

  test("cursor left", expectDocument => typeCharacters("ac", () => moveCursor("left", () => typeCharacters("b", () => expectDocument("abc\n")))))

  test("replace entire document", expectDocument => typeCharacters("abc", () => selectAll(() => typeCharacters("d", () => expectDocument("d\n")))))

  test("remove entire document", expectDocument => typeCharacters("abc", () => selectAll(() => typeCharacters("\b", () => expectDocument("\n")))))

  test("drag text", expectDocument => typeCharacters("abc", () => moveCursor({ direction: "left", times: 2 }, coordinates => moveCursor("right", () => expandSelection("right", () => dragToCoordinates(coordinates, () => expectDocument("acb\n")))))))

  testIf(config.input.getLevel() === 0, "inserting newline after cursor (control + o)", expectDocument => typeCharacters("ab", () => moveCursor("left", function() {
    triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 79, which: 79, ctrlKey: true })
    return defer(function() {
      assert.locationRange({ index: 0, offset: 1 })
      return expectDocument("a\nb\n")
    })
  })))

  return testIf(config.input.getLevel() === 0, "inserting ó with control + alt + o (AltGr)", expectDocument => typeCharacters("ab", () => moveCursor("left", function() {
    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 79, which: 79, altKey: true, ctrlKey: true })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 243, keyCode: 243, which: 243, altKey: true, ctrlKey: true })
      insertNode(document.createTextNode("ó"))
    }

    return defer(function() {
      assert.locationRange({ index: 0, offset: 2 })
      return expectDocument("aób\n")
    })
  })))
})
