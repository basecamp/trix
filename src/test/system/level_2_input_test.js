import * as config from "trix/config"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import {
  assert,
  clickToolbarButton,
  expectDocument,
  insertNode,
  insertString,
  isToolbarButtonActive,
  selectNode,
  testGroup,
  testIf,
  triggerEvent,
  triggerInputEvent,
  typeCharacters,
} from "test/test_helper"
import { delay, nextFrame } from "../test_helpers/timing_helpers"

const test = function() {
  testIf(config.input.getLevel() === 2, ...arguments)
}

const testOptions = {
  template: "editor_empty",
  setup() {
    addEventListener("beforeinput", recordInputEvent, true)
    addEventListener("input", recordInputEvent, true)
  },
  teardown() {
    removeEventListener("beforeinput", recordInputEvent, true)
    removeEventListener("input", recordInputEvent, true)
  },
}

let inputEvents = []

const recordInputEvent = function (event) {
  // Not all browsers dispatch "beforeinput" event when calling execCommand() so
  // we manually dispatch a synthetic one. If a second one arrives, ignore it.
  if (event.type === "beforeinput" && inputEvents.length === 1 && inputEvents[0].type === "beforeinput") {
    event.stopImmediatePropagation()
  } else {
    const { type, inputType, data } = event
    inputEvents.push({ type, inputType, data })
  }
}

// Borrowed from https://github.com/web-platform-tests/wpt/blob/master/input-events/input-events-exec-command.html
const performInputTypeUsingExecCommand = async (command, { inputType, data }) => {
  inputEvents = []

  await nextFrame()

  triggerInputEvent(document.activeElement, "beforeinput", { inputType, data })
  document.execCommand(command, false, data)
  assert.equal(inputEvents.length, 2)
  assert.equal(inputEvents[0].type, "beforeinput")
  assert.equal(inputEvents[1].type, "input")
  assert.equal(inputEvents[0].inputType, inputType)
  assert.equal(inputEvents[0].data, data)

  await nextFrame()
  await nextFrame()
}

testGroup("Level 2 Input", testOptions, () => {
  test("insertText", async () => {
    await performInputTypeUsingExecCommand("insertText", { inputType: "insertText", data: "abc" })
    expectDocument("abc\n")
  })

  test("insertOrderedList", async () => {
    insertString("a\nb")
    await performInputTypeUsingExecCommand("insertOrderedList", { inputType: "insertOrderedList" })
    assert.blockAttributes([ 0, 2 ], [])
    assert.blockAttributes([ 2, 4 ], [ "numberList", "number" ])
    assert.ok(isToolbarButtonActive({ attribute: "number" }))
    expectDocument("a\nb\n")
  })

  test("insertUnorderedList", async () => {
    insertString("a\nb")
    await performInputTypeUsingExecCommand("insertUnorderedList", { inputType: "insertUnorderedList" })
    assert.blockAttributes([ 0, 2 ], [])
    assert.blockAttributes([ 2, 4 ], [ "bulletList", "bullet" ])
    assert.ok(isToolbarButtonActive({ attribute: "bullet" }))
    expectDocument("a\nb\n")
  })

  test("insertLineBreak", async () => {
    await clickToolbarButton({ attribute: "quote" })
    insertString("abc")
    await performInputTypeUsingExecCommand("insertLineBreak", { inputType: "insertLineBreak" })
    await performInputTypeUsingExecCommand("insertLineBreak", { inputType: "insertLineBreak" })
    assert.blockAttributes([ 0, 6 ], [ "quote" ])
    expectDocument("abc\n\n\n")
  })

  test("insertParagraph", async () => {
    await clickToolbarButton({ attribute: "quote" })
    insertString("abc")
    await performInputTypeUsingExecCommand("insertParagraph", { inputType: "insertParagraph" })
    await performInputTypeUsingExecCommand("insertParagraph", { inputType: "insertParagraph" })

    assert.blockAttributes([ 0, 4 ], [ "quote" ])
    assert.blockAttributes([ 4, 5 ], [])
    expectDocument("abc\n\n")
  })

  test("formatBold", async () => {
    insertString("abc")
    getComposition().setSelectedRange([ 1, 2 ])
    await performInputTypeUsingExecCommand("bold", { inputType: "formatBold" })
    assert.textAttributes([ 0, 1 ], {})
    assert.textAttributes([ 1, 2 ], { bold: true })
    assert.textAttributes([ 2, 3 ], {})
    expectDocument("abc\n")
  })

  test("formatItalic", async () => {
    insertString("abc")
    getComposition().setSelectedRange([ 1, 2 ])
    await performInputTypeUsingExecCommand("italic", { inputType: "formatItalic" })
    assert.textAttributes([ 0, 1 ], {})
    assert.textAttributes([ 1, 2 ], { italic: true })
    assert.textAttributes([ 2, 3 ], {})
    expectDocument("abc\n")
  })

  test("formatStrikeThrough", async () => {
    insertString("abc")
    getComposition().setSelectedRange([ 1, 2 ])
    await performInputTypeUsingExecCommand("strikeThrough", { inputType: "formatStrikeThrough" })
    assert.textAttributes([ 0, 1 ], {})
    assert.textAttributes([ 1, 2 ], { strike: true })
    assert.textAttributes([ 2, 3 ], {})
    expectDocument("abc\n")
  })

  // https://input-inspector.now.sh/profiles/hVXS1cHYFvc2EfdRyTWQ
  test("correcting a misspelled word in Chrome", async () => {
    insertString("onr")
    getComposition().setSelectedRange([ 0, 3 ])
    await nextFrame()

    const inputType = "insertReplacementText"
    const dataTransfer = createDataTransfer({ "text/plain": "one" })
    const event = createEvent("beforeinput", { inputType, dataTransfer })
    document.activeElement.dispatchEvent(event)
    await nextFrame()
    expectDocument("one\n")
  })

  // https://input-inspector.now.sh/profiles/XsZVwKtFxakwnsNs0qnX
  test("correcting a misspelled word in Safari", async () => {
    insertString("onr")
    getComposition().setSelectedRange([ 0, 3 ])
    await nextFrame()

    const inputType = "insertText"
    const dataTransfer = createDataTransfer({ "text/plain": "one", "text/html": "one" })
    const event = createEvent("beforeinput", { inputType, dataTransfer })
    document.activeElement.dispatchEvent(event)

    await nextFrame()
    expectDocument("one\n")
  })

  // https://input-inspector.now.sh/profiles/yZlsrfG93QMzp2oyr0BE
  test("deleting the last character in a composed word on Android", async () => {
    insertString("c")
    const element = getEditorElement()
    const textNode = element.firstChild.lastChild
    await selectNode(textNode)
    triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data: "" })
    triggerEvent(element, "compositionend", { data: "" })
    await nextFrame()
    expectDocument("\n")
  })

  test("pasting a file", async () => {
    const file = await createFile()
    const clipboardData = createDataTransfer({ Files: [ file ] })
    const dataTransfer = createDataTransfer({ Files: [ file ] })
    await paste({ clipboardData, dataTransfer })

    const attachments = getDocument().getAttachments()
    assert.equal(attachments.length, 1)
    assert.equal(attachments[0].getFilename(), file.name)
    expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`)
  })

  // "insertFromPaste InputEvent missing pasted files in dataTransfer"
  // - https://bugs.webkit.org/show_bug.cgi?id=194921
  test("pasting a file in Safari", async () => {
    const file = await createFile()

    const clipboardData = createDataTransfer({ Files: [ file ] })
    const dataTransfer = createDataTransfer({ "text/html": `<img src="blob:${location.origin}/531de8">` })

    await paste({ clipboardData, dataTransfer })
    const attachments = getDocument().getAttachments()
    assert.equal(attachments.length, 1)
    assert.equal(attachments[0].getFilename(), file.name)
    expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`)
  })

  // "insertFromPaste InputEvent missing text/uri-list in dataTransfer for pasted links"
  // - https://bugs.webkit.org/show_bug.cgi?id=196702
  test("pasting a link in Safari", async () => {
    await createFile()
    const url = "https://bugs.webkit.org"
    const text = "WebKit Bugzilla"
    const clipboardData = createDataTransfer({ URL: url, "text/uri-list": url, "text/plain": text })
    const dataTransfer = createDataTransfer({ "text/html": `<a href="${url}">${text}</a>`, "text/plain": text })
    await paste({ clipboardData, dataTransfer })
    assert.textAttributes([ 0, url.length ], { href: url })
    expectDocument(`${url}\n`)
  })

  // Pastes from MS Word include an image of the copied text 🙃
  // https://input-inspector.now.sh/profiles/QWDITsV60dpEVl1SOZg8
  test("pasting text from MS Word", async () => {
    const file = await createFile()
    const dataTransfer = createDataTransfer({
      "text/html": "<span class=\"MsoNormal\">abc</span>",
      "text/plain": "abc",
      Files: [ file ],
    })

    await paste({ dataTransfer })
    const attachments = getDocument().getAttachments()
    assert.equal(attachments.length, 0)
    expectDocument("abc\n")
  })

  // "beforeinput" event is not fired for Paste and Match Style operations
  // - https://bugs.chromium.org/p/chromium/issues/detail?id=934448
  test("Paste and Match Style in Chrome", async () => {
    await typeCharacters("a\n\n")
    const clipboardData = createDataTransfer({ "text/plain": "b\n\nc" })
    const pasteEvent = createEvent("paste", { clipboardData })

    if (document.activeElement.dispatchEvent(pasteEvent)) {
      const node = document.createElement("div")
      node.innerHTML = "<div>b</div><div><br></div><div>c</div>"
      await insertNode(node)
    } else {
      await nextFrame()
    }
    expectDocument("a\n\nb\n\nc\n")
  })
})

const createFile = () => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.toBlob((file) => {
      file.name = "image.png"
      resolve(file)
    })
  })
}

const createDataTransfer = function (data = {}) {
  return {
    types: Object.keys(data),
    files: data.Files || [],
    getData: (type) => data[type],
  }
}

const createEvent = function (type, properties = {}) {
  const event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for (const key in properties) {
    const value = properties[key]
    Object.defineProperty(event, key, { value })
  }
  return event
}

const paste = async (param = {}) => {
  const { dataTransfer, clipboardData } = param
  const pasteEvent = createEvent("paste", { clipboardData: clipboardData || dataTransfer })
  const inputEvent = createEvent("beforeinput", { inputType: "insertFromPaste", dataTransfer })
  if (document.activeElement.dispatchEvent(pasteEvent)) {
    document.activeElement.dispatchEvent(inputEvent)
  }

  await delay(60)
}
