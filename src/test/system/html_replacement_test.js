import * as config from "trix/config"

import { assert, expectDocument, testGroup, testIf, triggerEvent } from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

const test = function() {
  testIf(config.input.getLevel() === 0, ...arguments)
}

testGroup("Level 0 input: HTML replacement", () =>
  testGroup("deleting with command+backspace", { template: "editor_empty" }, () => {
    test("from the end of a line", async () => {
      getEditor().loadHTML("<div>a</div><blockquote>b</blockquote><div>c</div>")
      getSelectionManager().setLocationRange({ index: 1, offset: 1 })
      await pressCommandBackspace({ replaceText: "b" })
      assert.locationRange({ index: 1, offset: 0 })
      assert.blockAttributes([ 0, 2 ], [])
      assert.blockAttributes([ 2, 3 ], [ "quote" ])
      assert.blockAttributes([ 3, 5 ], [])
      expectDocument("a\n\nc\n")
    })

    test("in the first block", async () => {
      getEditor().loadHTML("<div>a</div><blockquote>b</blockquote>")
      getSelectionManager().setLocationRange({ index: 0, offset: 1 })
      await pressCommandBackspace({ replaceText: "a" })
      assert.locationRange({ index: 0, offset: 0 })
      assert.blockAttributes([ 0, 1 ], [])
      assert.blockAttributes([ 1, 3 ], [ "quote" ])
      expectDocument("\nb\n")
    })

    test("from the middle of a line", async () => {
      getEditor().loadHTML("<div>a</div><blockquote>bc</blockquote><div>d</div>")
      getSelectionManager().setLocationRange({ index: 1, offset: 1 })
      await pressCommandBackspace({ replaceText: "b" })
      assert.locationRange({ index: 1, offset: 0 })
      assert.blockAttributes([ 0, 2 ], [])
      assert.blockAttributes([ 2, 4 ], [ "quote" ])
      assert.blockAttributes([ 4, 6 ], [])
      expectDocument("a\nc\nd\n")
    })

    test("from the middle of a line in a multi-line block", async () => {
      getEditor().loadHTML("<div>a</div><blockquote>bc<br>d</blockquote><div>e</div>")
      getSelectionManager().setLocationRange({ index: 1, offset: 1 })
      await pressCommandBackspace({ replaceText: "b" })
      assert.locationRange({ index: 1, offset: 0 })
      assert.blockAttributes([ 0, 2 ], [])
      assert.blockAttributes([ 2, 6 ], [ "quote" ])
      expectDocument("a\nc\nd\ne\n")
    })

    test("from the end of a list item", async () => {
      getEditor().loadHTML("<ul><li>a</li><li>b</li></ul>")
      getSelectionManager().setLocationRange({ index: 1, offset: 1 })
      await pressCommandBackspace({ replaceText: "b" })
      assert.locationRange({ index: 1, offset: 0 })
      assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
      assert.blockAttributes([ 2, 4 ], [ "bulletList", "bullet" ])
      expectDocument("a\n\n")
    })

    test("a character that is its text node's only data", async () => {
      getEditor().loadHTML("<div>a<br>b<br><strong>c</strong></div>")
      getSelectionManager().setLocationRange({ index: 0, offset: 3 })
      await pressCommandBackspace({ replaceText: "b" })
      assert.locationRange({ index: 0, offset: 2 })
      expectDocument("a\n\nc\n")
    })

    test("a formatted word", async () => {
      getEditor().loadHTML("<div>a<strong>bc</strong></div>")
      getSelectionManager().setLocationRange({ index: 0, offset: 4 })
      await pressCommandBackspace({ replaceElementWithText: "bc" })
      assert.locationRange({ index: 0, offset: 1 })
      expectDocument("a\n")
    })
  })
)

const pressCommandBackspace = async ({ replaceText, replaceElementWithText }) => {
  let previousSibling
  triggerEvent(document.activeElement, "keydown", { charCode: 0, keyCode: 8, which: 8, metaKey: true })
  const range = rangy.getSelection().getRangeAt(0)

  if (replaceElementWithText) {
    const element = getElementWithText(replaceElementWithText)
    previousSibling = element.previousSibling
    element.parentNode.removeChild(element)
    range.collapseAfter(previousSibling)
  } else {
    range.findText(replaceText, { direction: "backward" })
    range.splitBoundaries()

    const node = range.getNodes()[0]
    previousSibling = node.previousSibling
    const { nextSibling, parentNode } = node

    if (previousSibling?.nodeType === Node.COMMENT_NODE) {
      parentNode.removeChild(previousSibling)
    }

    node.data = ""
    parentNode.removeChild(node)

    if (!parentNode.hasChildNodes()) {
      parentNode.appendChild(document.createElement("br"))
    }

    range.collapseBefore(nextSibling ? nextSibling : parentNode.firstChild)
  }

  range.select()
  await nextFrame()
}

const getElementWithText = function (text) {
  for (const element of Array.from(document.activeElement.querySelectorAll("*"))) {
    if (element.innerText === text) {
      return element
    }
  }
  return null
}
