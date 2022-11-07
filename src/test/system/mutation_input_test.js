import * as config from "trix/config"

import {
  TEST_IMAGE_URL,
  assert,
  clickToolbarButton,
  expectDocument,
  insertNode,
  isToolbarButtonActive,
  testGroup,
  testIf,
  triggerEvent,
  typeCharacters,
} from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

const test = function() {
  testIf(config.input.getLevel() === 0, ...arguments)
}

testGroup("Mutation input", { template: "editor_empty" }, () => {
  test("deleting a newline", async () => {
    const element = getEditorElement()
    element.editor.insertString("a\n\nb")

    triggerEvent(element, "keydown", { charCode: 0, keyCode: 229, which: 229 })
    const br = element.querySelectorAll("br")[1]
    br.parentNode.removeChild(br)
    await nextFrame()
    expectDocument("a\nb\n")
  })

  test("typing a space in formatted text at the end of a block", async () => {
    const element = getEditorElement()

    await clickToolbarButton({ attribute: "bold" })
    await typeCharacters("a")
    // Press space key
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 32, which: 32 })
    triggerEvent(element, "keypress", { charCode: 32, keyCode: 32, which: 32 })

    const boldElement = element.querySelector("strong")
    boldElement.appendChild(document.createTextNode(" "))
    boldElement.appendChild(document.createElement("br"))

    await nextFrame()

    assert.ok(isToolbarButtonActive({ attribute: "bold" }))
    assert.textAttributes([ 0, 2 ], { bold: true })
    expectDocument("a \n")
  })

  test("typing formatted text after a newline at the end of block", async () => {
    const element = getEditorElement()
    element.editor.insertHTML("<ul><li>a</li><li><br></li></ul>")
    element.editor.setSelectedRange(3)

    await clickToolbarButton({ attribute: "bold" })

    // Press B key
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 66, which: 66 })
    triggerEvent(element, "keypress", { charCode: 98, keyCode: 98, which: 98 })

    const node = document.createTextNode("b")
    const extraBR = element.querySelectorAll("br")[1]
    extraBR.parentNode.insertBefore(node, extraBR)
    extraBR.parentNode.removeChild(extraBR)

    await nextFrame()

    assert.ok(isToolbarButtonActive({ attribute: "bold" }))
    assert.textAttributes([ 0, 1 ], {})
    assert.textAttributes([ 3, 4 ], { bold: true })
    expectDocument("a\n\nb\n")
  })

  test("typing an emoji after a newline at the end of block", async () => {
    const element = getEditorElement()

    await typeCharacters("\n")

    // Tap 👏🏻 on iOS
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 0, which: 0, key: "👏🏻" })
    triggerEvent(element, "keypress", { charCode: 128079, keyCode: 128079, which: 128079, key: "👏🏻" })

    const node = document.createTextNode("👏🏻")
    const extraBR = element.querySelectorAll("br")[1]
    extraBR.parentNode.insertBefore(node, extraBR)
    extraBR.parentNode.removeChild(extraBR)

    await nextFrame()
    expectDocument("\n👏🏻\n")
  })

  test("backspacing an attachment at the beginning of an otherwise empty document", async () => {
    const element = getEditorElement()
    element.editor.loadHTML(`<img src="${TEST_IMAGE_URL}" width="10" height="10">`)

    await nextFrame()

    element.editor.setSelectedRange([ 0, 1 ])
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 8, which: 8 })

    element.firstElementChild.innerHTML = "<br>"

    await nextFrame()

    assert.locationRange({ index: 0, offset: 0 })
    expectDocument("\n")
  })

  test("backspacing a block comment node", async (expectDocument) => {
    const element = getEditorElement()
    element.editor.loadHTML("<blockquote>a</blockquote><div>b</div>")

    await nextFrame()

    element.editor.setSelectedRange(2)
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 8, which: 8 })
    const commentNode = element.lastChild.firstChild
    commentNode.parentNode.removeChild(commentNode)

    await nextFrame()

    assert.locationRange({ index: 0, offset: 1 })
    expectDocument("ab\n")
  })

  test("typing formatted text with autocapitalization on", async () => {
    const element = getEditorElement()

    await clickToolbarButton({ attribute: "bold" })
    // Type "b", autocapitalize to "B"
    triggerEvent(element, "keydown", { charCode: 0, keyCode: 66, which: 66 })
    triggerEvent(element, "keypress", { charCode: 98, keyCode: 98, which: 98 })
    triggerEvent(element, "textInput", { data: "B" })

    await insertNode(document.createTextNode("B"))
    assert.ok(isToolbarButtonActive({ attribute: "bold" }))
    assert.textAttributes([ 0, 1 ], { bold: true })
    expectDocument("B\n")
  })
})
