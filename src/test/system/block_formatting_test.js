import Text from "trix/models/text"
import Block from "trix/models/block"
import Document from "trix/models/document"

import {
  assert,
  clickToolbarButton,
  expandSelection,
  expectDocument,
  isToolbarButtonActive,
  isToolbarButtonDisabled,
  moveCursor,
  pressKey,
  replaceDocument,
  selectAll,
  test,
  testGroup,
  typeCharacters,
} from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("Block formatting", { template: "editor_empty" }, () => {
  test("applying block attributes", async () => {
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "quote" })

    assert.blockAttributes([ 0, 4 ], [ "quote" ])
    assert.ok(isToolbarButtonActive({ attribute: "quote" }))

    await clickToolbarButton({ attribute: "code" })
    assert.blockAttributes([ 0, 4 ], [ "quote", "code" ])
    assert.ok(isToolbarButtonActive({ attribute: "code" }))

    await clickToolbarButton({ attribute: "code" })
    assert.blockAttributes([ 0, 4 ], [ "quote" ])
    assert.notOk(isToolbarButtonActive({ attribute: "code" }))
    assert.ok(isToolbarButtonActive({ attribute: "quote" }))
  })

  test("applying block attributes to text after newline", async () => {
    await typeCharacters("a\nbc")
    await clickToolbarButton({ attribute: "quote" })

    assert.blockAttributes([ 0, 2 ], [])
    assert.blockAttributes([ 2, 4 ], [ "quote" ])
  })

  test("applying block attributes to text between newlines", async () => {
    await typeCharacters("ab\ndef\nghi\nj\n")
    await moveCursor({ direction: "left", times: 2 })
    await expandSelection({ direction: "left", times: 5 })
    await clickToolbarButton({ attribute: "quote" })

    assert.blockAttributes([ 0, 3 ], [])
    assert.blockAttributes([ 3, 11 ], [ "quote" ])
    assert.blockAttributes([ 11, 13 ], [])
  })

  test("applying bullets to text with newlines", async () => {
    await typeCharacters("abc\ndef\nghi\njkl\nmno\n")
    await moveCursor({ direction: "left", times: 2 })
    await expandSelection({ direction: "left", times: 15 })
    await clickToolbarButton({ attribute: "bullet" })

    assert.blockAttributes([ 0, 4 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 4, 8 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 8, 12 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 12, 16 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 16, 20 ], [ "bulletList", "bullet" ])
  })

  test("applying block attributes to adjacent unformatted blocks consolidates them", async () => {
    const document = new Document([
      new Block(Text.textForStringWithAttributes("1"), [ "bulletList", "bullet" ]),
      new Block(Text.textForStringWithAttributes("a"), []),
      new Block(Text.textForStringWithAttributes("b"), []),
      new Block(Text.textForStringWithAttributes("c"), []),
      new Block(Text.textForStringWithAttributes("2"), [ "bulletList", "bullet" ]),
      new Block(Text.textForStringWithAttributes("3"), [ "bulletList", "bullet" ]),
    ])

    replaceDocument(document)
    getEditorController().setLocationRange([
      { index: 0, offset: 0 },
      { index: 5, offset: 1 },
    ])

    await nextFrame()
    await clickToolbarButton({ attribute: "quote" })

    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet", "quote" ])
    assert.blockAttributes([ 2, 8 ], [ "quote" ])
    assert.blockAttributes([ 8, 10 ], [ "bulletList", "bullet", "quote" ])
    assert.blockAttributes([ 10, 12 ], [ "bulletList", "bullet", "quote" ])
  })

  test("breaking out of the end of a block", async () => {
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "quote" })
    await typeCharacters("\n\n")

    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "abc\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n")

    assert.locationRange({ index: 1, offset: 0 })
  })

  test("breaking out of the middle of a block before character", async () => {
    // * = cursor
    //
    // ab
    // *c
    //
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "quote" })
    await moveCursor("left")
    await typeCharacters("\n\n")

    const document = getDocument()
    assert.equal(document.getBlockCount(), 3)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "ab\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n")

    block = document.getBlockAtIndex(2)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "c\n")

    assert.locationRange({ index: 2, offset: 0 })
  })

  test("breaking out of the middle of a block before newline", async () => {
    // * = cursor
    //
    // ab
    // *
    // c
    //
    await typeCharacters("abc")
    await clickToolbarButton({ attribute: "quote" })
    await moveCursor("left")
    await typeCharacters("\n")
    await moveCursor("left")
    await typeCharacters("\n\n")

    const document = getDocument()
    assert.equal(document.getBlockCount(), 3)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "ab\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n")

    block = document.getBlockAtIndex(2)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "c\n")
  })

  test("breaking out of a formatted block with adjacent non-formatted blocks", async () => {
    // * = cursor
    //
    // a
    // b*
    // c
    let document = new Document([
      new Block(Text.textForStringWithAttributes("a"), []),
      new Block(Text.textForStringWithAttributes("b"), [ "quote" ]),
      new Block(Text.textForStringWithAttributes("c"), []),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(3)

    await typeCharacters("\n\n")

    document = getDocument()
    assert.equal(document.getBlockCount(), 4)
    assert.blockAttributes([ 0, 1 ], [])
    assert.blockAttributes([ 2, 3 ], [ "quote" ])
    assert.blockAttributes([ 4, 5 ], [])
    assert.blockAttributes([ 5, 6 ], [])
    expectDocument("a\nb\n\nc\n")
  })

  test("breaking out a block after newline at offset 0", async () => {
    // * = cursor
    //
    //
    // *a
    //
    await typeCharacters("a")
    await clickToolbarButton({ attribute: "quote" })
    await moveCursor("left")
    await typeCharacters("\n\n")

    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [ "quote" ])
    assert.equal(block.toString(), "a\n")
    assert.locationRange({ index: 1, offset: 0 })
  })

  test("deleting the only non-block-break character in a block", async () => {
    await typeCharacters("ab")
    await clickToolbarButton({ attribute: "quote" })
    await typeCharacters("\b\b")
    assert.blockAttributes([ 0, 1 ], [ "quote" ])
  })

  test("backspacing a quote", async () => {
    await nextFrame()
    await clickToolbarButton({ attribute: "quote" })
    assert.blockAttributes([ 0, 1 ], [ "quote" ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [])
  })

  test("backspacing a nested quote", async () => {
    await clickToolbarButton({ attribute: "quote" })
    await clickToolbarButton({ action: "increaseNestingLevel" })
    assert.blockAttributes([ 0, 1 ], [ "quote", "quote" ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [ "quote" ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [])
  })

  test("backspacing a list item", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 0 ], [])
  })

  test("backspacing a nested list item", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
    await pressKey("backspace")
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet" ])
    expectDocument("a\n\n")
  })

  test("backspacing a list item inside a quote", async () => {
    await clickToolbarButton({ attribute: "quote" })
    await clickToolbarButton({ attribute: "bullet" })
    assert.blockAttributes([ 0, 1 ], [ "quote", "bulletList", "bullet" ])

    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [ "quote" ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [])
  })

  test("backspacing selected nested list items", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\n")
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("b")
    getSelectionManager().setLocationRange([
      { index: 0, offset: 0 },
      { index: 1, offset: 1 },
    ])
    await pressKey("backspace")
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    expectDocument("\n")
  })

  test("backspace selection spanning formatted blocks", async () => {
    await clickToolbarButton({ attribute: "quote" })
    await typeCharacters("ab\n\n")
    await clickToolbarButton({ attribute: "code" })
    await typeCharacters("cd")
    getSelectionManager().setLocationRange([
      { index: 0, offset: 1 },
      { index: 1, offset: 1 },
    ])
    getComposition().deleteInDirection("backward")
    assert.blockAttributes([ 0, 2 ], [ "quote" ])
    expectDocument("ad\n")
  })

  test("backspace selection spanning and entire formatted block and a formatted block", async () => {
    await clickToolbarButton({ attribute: "quote" })
    await typeCharacters("ab\n\n")
    await clickToolbarButton({ attribute: "code" })
    await typeCharacters("cd")
    getSelectionManager().setLocationRange([
      { index: 0, offset: 0 },
      { index: 1, offset: 1 },
    ])
    getComposition().deleteInDirection("backward")
    assert.blockAttributes([ 0, 2 ], [ "code" ])
    expectDocument("d\n")
  })

  test("increasing list level", async () => {
    assert.ok(isToolbarButtonDisabled({ action: "increaseNestingLevel" }))
    assert.ok(isToolbarButtonDisabled({ action: "decreaseNestingLevel" }))
    await clickToolbarButton({ attribute: "bullet" })
    assert.ok(isToolbarButtonDisabled({ action: "increaseNestingLevel" }))
    assert.notOk(isToolbarButtonDisabled({ action: "decreaseNestingLevel" }))
    await typeCharacters("a\n")
    assert.notOk(isToolbarButtonDisabled({ action: "increaseNestingLevel" }))
    assert.notOk(isToolbarButtonDisabled({ action: "decreaseNestingLevel" }))
    await clickToolbarButton({ action: "increaseNestingLevel" })
    await typeCharacters("b")
    assert.ok(isToolbarButtonDisabled({ action: "increaseNestingLevel" }))
    assert.notOk(isToolbarButtonDisabled({ action: "decreaseNestingLevel" }))
    assert.blockAttributes([ 0, 2 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 4 ], [ "bulletList", "bullet", "bulletList", "bullet" ])
  })

  test("changing list type", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    await clickToolbarButton({ attribute: "number" })
    assert.blockAttributes([ 0, 1 ], [ "numberList", "number" ])
  })

  test("adding bullet to heading block", async () => {
    await clickToolbarButton({ attribute: "heading1" })
    await clickToolbarButton({ attribute: "bullet" })

    assert.ok(isToolbarButtonActive({ attribute: "heading1" }))
    assert.blockAttributes([ 1, 2 ], [])
  })

  test("removing bullet from heading block", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await clickToolbarButton({ attribute: "heading1" })
    assert.ok(isToolbarButtonDisabled({ attribute: "bullet" }))
  })

  test("breaking out of heading in list", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await clickToolbarButton({ attribute: "heading1" })
    assert.ok(isToolbarButtonActive({ attribute: "heading1" }))
    await typeCharacters("abc")
    await typeCharacters("\n")

    assert.ok(isToolbarButtonActive({ attribute: "bullet" }))
    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 4 ], [ "bulletList", "bullet", "heading1" ])
    assert.blockAttributes([ 4, 5 ], [ "bulletList", "bullet" ])
    expectDocument("abc\n\n")
  })

  test("breaking out of middle of heading block", async () => {
    await clickToolbarButton({ attribute: "heading1" })
    await typeCharacters("abc")
    assert.ok(isToolbarButtonActive({ attribute: "heading1" }))
    await moveCursor({ direction: "left", times: 1 })
    await typeCharacters("\n")

    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 3 ], [ "heading1" ])
    assert.blockAttributes([ 3, 4 ], [ "heading1" ])
    expectDocument("ab\nc\n")
  })

  test("breaking out of middle of heading block with preceding blocks", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("a"), [ "heading1" ]),
      new Block(Text.textForStringWithAttributes("b"), []),
      new Block(Text.textForStringWithAttributes("cd"), [ "heading1" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(5)
    assert.ok(isToolbarButtonActive({ attribute: "heading1" }))

    await typeCharacters("\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 4)
    assert.blockAttributes([ 0, 1 ], [ "heading1" ])
    assert.blockAttributes([ 2, 3 ], [])
    assert.blockAttributes([ 4, 5 ], [ "heading1" ])
    assert.blockAttributes([ 6, 7 ], [ "heading1" ])
    expectDocument("a\nb\nc\nd\n")
  })

  test("breaking out of end of heading block with preceding blocks", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("a"), [ "heading1" ]),
      new Block(Text.textForStringWithAttributes("b"), []),
      new Block(Text.textForStringWithAttributes("cd"), [ "heading1" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(6)
    assert.ok(isToolbarButtonActive({ attribute: "heading1" }))

    await typeCharacters("\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 4)
    assert.blockAttributes([ 0, 1 ], [ "heading1" ])
    assert.blockAttributes([ 2, 3 ], [])
    assert.blockAttributes([ 4, 6 ], [ "heading1" ])
    assert.blockAttributes([ 7, 8 ], [])
    expectDocument("a\nb\ncd\n\n")

  })

  test("inserting newline before heading", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("\n"), []),
      new Block(Text.textForStringWithAttributes("abc"), [ "heading1" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(0)

    await typeCharacters("\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 2)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n\n\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [ "heading1" ])
    assert.equal(block.toString(), "abc\n")
  })

  test("inserting multiple newlines before heading", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("\n"), []),
      new Block(Text.textForStringWithAttributes("abc"), [ "heading1" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(0)

    await typeCharacters("\n\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 2)

    let block = document.getBlockAtIndex(0)
    assert.deepEqual(block.getAttributes(), [])
    assert.equal(block.toString(), "\n\n\n\n")

    block = document.getBlockAtIndex(1)
    assert.deepEqual(block.getAttributes(), [ "heading1" ])
    assert.equal(block.toString(), "abc\n")
  })

  test("inserting multiple newlines before formatted block", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("\n"), []),
      new Block(Text.textForStringWithAttributes("abc"), [ "quote" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(1)

    await typeCharacters("\n\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 1 ], [])
    assert.blockAttributes([ 2, 3 ], [])
    assert.blockAttributes([ 4, 6 ], [ "quote" ])
    assert.locationRange({ index: 0, offset: 3 })
    expectDocument("\n\n\n\nabc\n")
  })

  test("inserting newline after heading with text in following block", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("ab"), [ "heading1" ]),
      new Block(Text.textForStringWithAttributes("cd"), []),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(2)

    await typeCharacters("\n")
    document = getDocument()
    assert.equal(document.getBlockCount(), 3)
    assert.blockAttributes([ 0, 2 ], [ "heading1" ])
    assert.blockAttributes([ 3, 4 ], [])
    assert.blockAttributes([ 5, 6 ], [])
    expectDocument("ab\n\ncd\n")
  })

  test("backspacing a newline in an empty block with adjacent formatted blocks", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("abc"), [ "heading1" ]),
      new Block(),
      new Block(Text.textForStringWithAttributes("d"), [ "heading1" ]),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(4)

    await pressKey("backspace")
    document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 1 ], [ "heading1" ])
    assert.blockAttributes([ 2, 3 ], [ "heading1" ])
    expectDocument("abc\nd\n")
  })

  test("backspacing a newline at beginning of non-formatted block", async () => {
    let document = new Document([
      new Block(Text.textForStringWithAttributes("ab"), [ "heading1" ]),
      new Block(Text.textForStringWithAttributes("\ncd"), []),
    ])

    replaceDocument(document)
    getEditor().setSelectedRange(3)

    await pressKey("backspace")
    document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 2 ], [ "heading1" ])
    assert.blockAttributes([ 3, 5 ], [])
    expectDocument("ab\ncd\n")
  })

  test("inserting newline after single character header", async () => {
    await clickToolbarButton({ attribute: "heading1" })
    await typeCharacters("a")
    await typeCharacters("\n")
    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 1 ], [ "heading1" ])
    expectDocument("a\n\n")
  })

  test("terminal attributes are only added once", async () => {
    replaceDocument(
      new Document([
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), [ "heading1" ]),
        new Block(Text.textForStringWithAttributes("c"), []),
      ])
    )

    await selectAll()
    await clickToolbarButton({ attribute: "heading1" })
    assert.equal(getDocument().getBlockCount(), 3)
    assert.blockAttributes([ 0, 1 ], [ "heading1" ])
    assert.blockAttributes([ 2, 3 ], [ "heading1" ])
    assert.blockAttributes([ 4, 5 ], [ "heading1" ])
    expectDocument("a\nb\nc\n")
  })

  test("terminal attributes replace existing terminal attributes", async () => {
    replaceDocument(
      new Document([
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), [ "heading1" ]),
        new Block(Text.textForStringWithAttributes("c"), []),
      ])
    )

    await selectAll()
    await clickToolbarButton({ attribute: "code" })
    assert.equal(getDocument().getBlockCount(), 3)
    assert.blockAttributes([ 0, 1 ], [ "code" ])
    assert.blockAttributes([ 2, 3 ], [ "code" ])
    assert.blockAttributes([ 4, 5 ], [ "code" ])
    expectDocument("a\nb\nc\n")
  })

  test("code blocks preserve newlines", async () => {
    await typeCharacters("a\nb")
    await selectAll()
    clickToolbarButton({ attribute: "code" })
    assert.equal(getDocument().getBlockCount(), 1)
    assert.blockAttributes([ 0, 3 ], [ "code" ])
    expectDocument("a\nb\n")
  })

  test("code blocks are not indentable", async () => {
    await clickToolbarButton({ attribute: "code" })
    assert.notOk(isToolbarButtonActive({ action: "increaseNestingLevel" }))
  })

  test("code blocks are terminal", async () => {
    await clickToolbarButton({ attribute: "code" })
    assert.ok(isToolbarButtonDisabled({ attribute: "quote" }))
    assert.ok(isToolbarButtonDisabled({ attribute: "heading1" }))
    assert.ok(isToolbarButtonDisabled({ attribute: "bullet" }))
    assert.ok(isToolbarButtonDisabled({ attribute: "number" }))
    assert.notOk(isToolbarButtonDisabled({ attribute: "code" }))
    assert.notOk(isToolbarButtonDisabled({ attribute: "bold" }))
    assert.notOk(isToolbarButtonDisabled({ attribute: "italic" }))
  })

  test("unindenting a code block inside a bullet", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await clickToolbarButton({ attribute: "code" })
    await typeCharacters("a")
    await clickToolbarButton({ action: "decreaseNestingLevel" })
    const document = getDocument()
    assert.equal(document.getBlockCount(), 1)
    assert.blockAttributes([ 0, 1 ], [ "code" ])
    expectDocument("a\n")
  })

  test("indenting a heading inside a bullet", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a")
    await typeCharacters("\n")
    await clickToolbarButton({ attribute: "heading1" })
    await typeCharacters("b")
    await clickToolbarButton({ action: "increaseNestingLevel" })

    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "bulletList", "bullet", "bulletList", "bullet", "heading1" ])
    expectDocument("a\nb\n")
  })

  test("indenting a quote inside a bullet", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await clickToolbarButton({ attribute: "quote" })
    await clickToolbarButton({ action: "increaseNestingLevel" })
    const document = getDocument()
    assert.equal(document.getBlockCount(), 1)
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet", "quote", "quote" ])
    expectDocument("\n")
  })

  test("list indentation constraints consider the list type", async () => {
    await clickToolbarButton({ attribute: "bullet" })
    await typeCharacters("a\n\n")
    await clickToolbarButton({ attribute: "number" })
    await clickToolbarButton({ action: "increaseNestingLevel" })

    const document = getDocument()
    assert.equal(document.getBlockCount(), 2)
    assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
    assert.blockAttributes([ 2, 3 ], [ "numberList", "number" ])
    expectDocument("a\n\n")
  })
})
