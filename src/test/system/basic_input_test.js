import * as config from "trix/config"
import {
  assert,
  dragToCoordinates,
  expandSelection,
  expectDocument,
  insertNode,
  moveCursor,
  pressKey,
  selectAll,
  test,
  testGroup,
  testIf,
  triggerEvent,
  typeCharacters,
} from "test/test_helper"

import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("Basic input", { template: "editor_empty" }, () => {
  test("typing", async () => {
    await typeCharacters("abc")
    expectDocument("abc\n")
  })

  test("backspacing", async () => {
    await typeCharacters("abc\b")
    expectDocument("ab\n")
  })

  test("pressing delete", async () => {
    await typeCharacters("ab")
    await moveCursor("left")
    await pressKey("delete")
    expectDocument("a\n")
  })

  test("pressing return", async () => {
    await typeCharacters("ab")
    await pressKey("return")
    await typeCharacters("c")

    expectDocument("ab\nc\n")
  })

  test("pressing escape in Safari", async () => {
    await typeCharacters("a")

    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 27, which: 27, key: "Escape", code: "Escape" })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 27, keyCode: 27, which: 27, key: "Escape", code: "Escape" })
    }

    await nextFrame()
    expectDocument("a\n")
  })

  test("pressing escape in Firefox", async () => {
    await typeCharacters("a")
    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 27, which: 27, key: "Escape", code: "Escape" })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 0, keyCode: 27, which: 0, key: "Escape", code: "Escape" })
    }
    await nextFrame()
    expectDocument("a\n")
  })

  test("pressing escape in Chrome", async () => {
    await typeCharacters("a")
    triggerEvent(document.activeElement, "keydown", {
      charCode: 0,
      keyCode: 27,
      which: 27,
      key: "Escape",
      code: "Escape",
    })
    await nextFrame()
    expectDocument("a\n")
  })

  test("cursor left", async () => {
    await typeCharacters("ac")
    await moveCursor("left")
    await typeCharacters("b")

    expectDocument("abc\n")
  })

  test("replace entire document", async () => {
    await typeCharacters("abc")
    await selectAll()
    await typeCharacters("d")

    expectDocument("d\n")
  })

  test("remove entire document", async () => {
    await typeCharacters("abc")
    await selectAll()
    await typeCharacters("\b")

    expectDocument("\n")
  })

  test("drag text", async () => {
    await typeCharacters("abc")
    const coordinates = await moveCursor({ direction: "left", times: 2 })
    await nextFrame()

    await moveCursor("right")
    await expandSelection("right")
    await dragToCoordinates(coordinates)

    await expectDocument("acb\n")
  })

  testIf(config.input.getLevel() === 0, "inserting newline after cursor (control + o)", async () => {
    await typeCharacters("ab")
    await moveCursor("left")

    triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 79, which: 79, ctrlKey: true })
    await nextFrame()

    assert.locationRange({ index: 0, offset: 1 })
    expectDocument("a\nb\n")
   })

  testIf(config.input.getLevel() === 0, "inserting ó with control + alt + o (AltGr)", async () => {
    await typeCharacters("ab")
    await moveCursor("left")

    if (triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 79, which: 79, altKey: true, ctrlKey: true })) {
      triggerEvent(document.activeElement, "keypress", { charCode: 243, keyCode: 243, which: 243, altKey: true, ctrlKey: true })
      insertNode(document.createTextNode("ó"))
    }

    await nextFrame()
    assert.locationRange({ index: 0, offset: 2 })
    expectDocument("aób\n")
  })
})
