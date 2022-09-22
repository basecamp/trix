import {
  assert,
  createFile,
  expandSelection,
  insertFile,
  insertString,
  moveCursor,
  test,
  testGroup,
} from "test/test_helper"

testGroup("Cursor movement", { template: "editor_empty" }, () => {
  test("move cursor around attachment", async () => {
    insertFile(createFile())
    assert.locationRange({ index: 0, offset: 1 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 0 })

    await moveCursor("right")
    assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })

    await moveCursor("right")
    assert.locationRange({ index: 0, offset: 1 })
  })

  test("move cursor around attachment and text", async () => {
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange({ index: 0, offset: 3 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 2 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 1 }, { index: 0, offset: 2 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 1 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 0 })
  })

  test("expand selection over attachment", async () => {
    insertFile(createFile())
    assert.locationRange({ index: 0, offset: 1 })

    await expandSelection("left")
    assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })

    await moveCursor("left")
    assert.locationRange({ index: 0, offset: 0 })

    await expandSelection("right")
    assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })
  })

  test("expand selection over attachment and text", async () => {
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange({ index: 0, offset: 3 })

    await expandSelection("left")
    assert.locationRange({ index: 0, offset: 2 }, { index: 0, offset: 3 })

    await expandSelection("left")
    assert.locationRange({ index: 0, offset: 1 }, { index: 0, offset: 3 })

    await expandSelection("left")
    assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 3 })
  })
})
