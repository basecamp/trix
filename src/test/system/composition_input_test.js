import * as config from "trix/config"

import {
  assert,
  clickToolbarButton,
  endComposition,
  expectDocument,
  insertNode,
  pressKey,
  selectNode,
  startComposition,
  test,
  testGroup,
  testIf,
  triggerEvent,
  triggerInputEvent,
  typeCharacters,
  updateComposition,
} from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("Composition input", { template: "editor_empty" }, () => {
  test("composing", async () => {
    await startComposition("a")
    await updateComposition("ab")
    await endComposition("abc")

    expectDocument("abc\n")
  })

  test("typing and composing", async () => {
    await typeCharacters("a")
    await startComposition("b")
    await updateComposition("bc")
    await endComposition("bcd")
    await typeCharacters("e")

    expectDocument("abcde\n")
  })

  test("composition input is serialized", async () => {
    await startComposition("´")
    await endComposition("é")

    assert.equal(getEditorElement().value, "<div>é</div>")
    expectDocument("é\n")
  })

  test("pressing after a canceled composition", async () => {
    await typeCharacters("ab")
    triggerEvent(document.activeElement, "compositionend", { data: "ab" })
    await pressKey("return")

    expectDocument("ab\n\n")
  })

  test("composing formatted text", async () => {
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "bold" })
    await startComposition("d")
    await updateComposition("de")
    await endComposition("def")

    assert.textAttributes([ 0, 3 ], {})
    assert.textAttributes([ 3, 6 ], { bold: true })
    expectDocument("abcdef\n")
  })

  test("composing away from formatted text", async () => {
    await clickToolbarButton({ attribute: "bold" })
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "bold" })
    await startComposition("d")
    await updateComposition("de")
    await endComposition("def")

    assert.textAttributes([ 0, 3 ], { bold: true })
    assert.textAttributes([ 3, 6 ], {})
    expectDocument("abcdef\n")
  })

  test("composing another language using a QWERTY keyboard", async () => {
    const element = getEditorElement()
    const keyCodes = { x: 120, i: 105 }

    triggerEvent(element, "keypress", { charCode: keyCodes.x, keyCode: keyCodes.x, which: keyCodes.x })
    await startComposition("x")
    triggerEvent(element, "keypress", { charCode: keyCodes.i, keyCode: keyCodes.i, which: keyCodes.i })
    await updateComposition("xi")
    await endComposition("喜")

    expectDocument("喜\n")
  })

  // Simulates the sequence of events when pressing backspace through a word on Android
  testIf(config.input.getLevel() === 0, "backspacing through a composition", async () => {
    const element = getEditorElement()
    element.editor.insertString("a cat")

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionupdate", { data: "ca" })
    triggerEvent(element, "input")
    await removeCharacters(-1)

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionupdate", { data: "c" })
    triggerEvent(element, "input")
    triggerEvent(element, "compositionend", { data: "c" })
    await removeCharacters(-1)
    await pressKey("backspace")

    expectDocument("a \n")
  })

  // Simulates the sequence of events when pressing backspace at the end of a
  // word and updating it on Android (running older versions of System WebView)
  testIf(config.input.getLevel() === 0, "updating a composition", async () => {
    const element = getEditorElement()
    element.editor.insertString("cat")

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionstart", { data: "cat" })
    triggerEvent(element, "compositionupdate", { data: "cat" })
    triggerEvent(element, "input")
    await removeCharacters(-1)

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionupdate", { data: "car" })
    triggerEvent(element, "input")
    triggerEvent(element, "compositionend", { data: "car" })
    await insertNode(document.createTextNode("r"))

    expectDocument("car\n")
  })

  // Simulates the sequence of events when typing on Android and then tapping elsewhere
  testIf(config.input.getLevel() === 0, "leaving a composition", async () => {
    const element = getEditorElement()

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionstart", { data: "" })
    triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data: "c" })
    triggerEvent(element, "compositionupdate", { data: "c" })
    triggerEvent(element, "input")
    const node = document.createTextNode("c")
    insertNode(node)
    selectNode(node)

    await nextFrame()

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data: "ca" })
    triggerEvent(element, "compositionupdate", { data: "ca" })
    triggerEvent(element, "input")
    node.data = "ca"

    await nextFrame()
    triggerEvent(element, "compositionend", { data: "" })

    await nextFrame()
    expectDocument("ca\n")
  })

  testIf(config.browser.composesExistingText, "composition events from cursor movement are ignored", async () => {
    const element = getEditorElement()
    element.editor.insertString("ab ")

    element.editor.setSelectedRange(0)
    triggerEvent(element, "compositionstart", { data: "" })
    triggerEvent(element, "compositionupdate", { data: "ab" })

    await nextFrame()
    element.editor.setSelectedRange(1)
    triggerEvent(element, "compositionupdate", { data: "ab" })

    await nextFrame()

    element.editor.setSelectedRange(2)
    triggerEvent(element, "compositionupdate", { data: "ab" })

    await nextFrame()
    element.editor.setSelectedRange(3)
    triggerEvent(element, "compositionend", { data: "ab" })

    await nextFrame()
    expectDocument("ab \n")
  })

  // Simulates compositions in Firefox where the final composition data is
  // dispatched as both compositionupdate and compositionend.
  testIf(config.input.getLevel() === 0, "composition ending with same data as last update", async () => {
    const element = getEditorElement()

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionstart", { data: "" })
    triggerEvent(element, "compositionupdate", { data: "´" })
    const node = document.createTextNode("´")
    insertNode(node)
    selectNode(node)

    await nextFrame()

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionupdate", { data: "é" })
    triggerEvent(element, "input")
    node.data = "é"

    await nextFrame()

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    triggerEvent(element, "compositionupdate", { data: "éé" })
    triggerEvent(element, "input")
    node.data = "éé"

    await nextFrame()
    triggerEvent(element, "compositionend", { data: "éé" })

    await nextFrame()
    assert.locationRange({ index: 0, offset: 2 })
    expectDocument("éé\n")
  })
})

const removeCharacters = async (direction) => {
  const selection = rangy.getSelection()
  const range = selection.getRangeAt(0)
  range.moveStart("character", direction)
  range.deleteContents()
  await nextFrame()
}
