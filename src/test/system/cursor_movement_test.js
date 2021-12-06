// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, createFile, expandSelection, insertFile, insertString, moveCursor, test, testGroup } from "test/test_helper"

testGroup("Cursor movement", { template: "editor_empty" }, function() {
  test("move cursor around attachment", function(done) {
    insertFile(createFile())
    assert.locationRange({ index: 0, offset: 1 })
    return moveCursor("left", function() {
      assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })
      return moveCursor("left", function() {
        assert.locationRange({ index: 0, offset: 0 })
        return moveCursor("right", function() {
          assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })
          return moveCursor("right", function() {
            assert.locationRange({ index: 0, offset: 1 })
            return done()
          })
        })
      })
    })
  })

  test("move cursor around attachment and text", function(done) {
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange({ index: 0, offset: 3 })
    return moveCursor("left", function() {
      assert.locationRange({ index: 0, offset: 2 })
      return moveCursor("left", function() {
        assert.locationRange({ index: 0, offset: 1 }, { index: 0, offset: 2 })
        return moveCursor("left", function() {
          assert.locationRange({ index: 0, offset: 1 })
          return moveCursor("left", function() {
            assert.locationRange({ index: 0, offset: 0 })
            return done()
          })
        })
      })
    })
  })

  test("expand selection over attachment", function(done) {
    insertFile(createFile())
    assert.locationRange({ index: 0, offset: 1 })
    return expandSelection("left", function() {
      assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })
      return moveCursor("left", function() {
        assert.locationRange({ index: 0, offset: 0 })
        return expandSelection("right", function() {
          assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 1 })
          return done()
        })
      })
    })
  })

  return test("expand selection over attachment and text", function(done) {
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange({ index: 0, offset: 3 })
    return expandSelection("left", function() {
      assert.locationRange({ index: 0, offset: 2 }, { index: 0, offset: 3 })
      return expandSelection("left", function() {
        assert.locationRange({ index: 0, offset: 1 }, { index: 0, offset: 3 })
        return expandSelection("left", function() {
          assert.locationRange({ index: 0, offset: 0 }, { index: 0, offset: 3 })
          return done()
        })
      })
    })
  })
})
