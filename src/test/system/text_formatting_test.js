/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"
import { makeElement } from "trix/core/helpers"
import Text from "trix/models/text"

import { assert, clickElement, clickToolbarButton, clickToolbarDialogButton, collapseSelection, expandSelection,
  fixtures, insertString, insertText, isToolbarButtonActive, isToolbarButtonDisabled, isToolbarDialogActive, moveCursor, pressKey, test, testGroup, testIf, typeCharacters, typeInToolbarDialog, typeToolbarKeyCommand } from "test/test_helper"

testGroup("Text formatting", { template: "editor_empty" }, function() {
  test("applying attributes to text", done => typeCharacters("abc", () => expandSelection("left", () => clickToolbarButton({ attribute: "bold" }, function() {
    assert.textAttributes([ 0, 2 ], {})
    assert.textAttributes([ 2, 3 ], { bold: true })
    assert.textAttributes([ 3, 4 ], { blockBreak: true })
    return done()
  }))))

  test("applying a link to text", done => typeCharacters("abc", () => moveCursor("left", () => expandSelection("left", () => clickToolbarButton({ attribute: "href" }, function() {
    assert.ok(isToolbarDialogActive({ attribute: "href" }))
    return typeInToolbarDialog("http://example.com", { attribute: "href" }, function() {
      assert.textAttributes([ 0, 1 ], {})
      assert.textAttributes([ 1, 2 ], { href: "http://example.com" })
      assert.textAttributes([ 2, 3 ], {})
      return done()
    })
  })))))

  test("inserting a link", expectDocument => typeCharacters("a", () => clickToolbarButton({ attribute: "href" }, function() {
    assert.ok(isToolbarDialogActive({ attribute: "href" }))
    return typeInToolbarDialog("http://example.com", { attribute: "href" }, function() {
      assert.textAttributes([ 0, 1 ], {})
      assert.textAttributes([ 1, 19 ], { href: "http://example.com" })
      return expectDocument("ahttp://example.com\n")
    })
  })))

  test("editing a link", function(done) {
    insertString("a")
    const text = Text.textForStringWithAttributes("bc", { href: "http://example.com" })
    insertText(text)
    insertString("d")
    return moveCursor({ direction: "left", times: 2 }, () => clickToolbarButton({ attribute: "href" }, function() {
      assert.ok(isToolbarDialogActive({ attribute: "href" }))
      assert.locationRange({ index: 0, offset: 1 }, { index: 0, offset: 3 })
      return typeInToolbarDialog("http://example.org", { attribute: "href" }, function() {
        assert.textAttributes([ 0, 1 ], {})
        assert.textAttributes([ 1, 3 ], { href: "http://example.org" })
        assert.textAttributes([ 3, 4 ], {})
        return done()
      })
    }))
  })

  test("removing a link", function(done) {
    const text = Text.textForStringWithAttributes("ab", { href: "http://example.com" })
    insertText(text)
    assert.textAttributes([ 0, 2 ], { href: "http://example.com" })
    return expandSelection({ direction: "left", times: 2 }, () => clickToolbarButton({ attribute: "href" }, () => clickToolbarDialogButton({ method: "removeAttribute" }, function() {
      assert.textAttributes([ 0, 2 ], {})
      return done()
    })))
  })

  test("selecting an attachment disables text formatting", function(done) {
    const text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    return typeCharacters("a", function() {
      assert.notOk(isToolbarButtonDisabled({ attribute: "bold" }))
      return expandSelection("left", function() {
        assert.notOk(isToolbarButtonDisabled({ attribute: "bold" }))
        return expandSelection("left", function() {
          assert.ok(isToolbarButtonDisabled({ attribute: "bold" }))
          return done()
        })
      })
    })
  })

  test("selecting an attachment deactivates toolbar dialog", function(done) {
    const text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    return clickToolbarButton({ attribute: "href" }, function() {
      assert.ok(isToolbarDialogActive({ attribute: "href" }))
      return clickElement(getEditorElement().querySelector("figure"), function() {
        assert.notOk(isToolbarDialogActive({ attribute: "href" }))
        assert.ok(isToolbarButtonDisabled({ attribute: "href" }))
        return done()
      })
    })
  })

  test("typing over a selected attachment does not apply disabled formatting attributes", function(expectDocument) {
    const text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    return expandSelection("left", function() {
      assert.ok(isToolbarButtonDisabled({ attribute: "bold" }))
      return typeCharacters("a", function() {
        assert.textAttributes([ 0, 1 ], {})
        return expectDocument("a\n")
      })
    })
  })

  test("applying a link to an attachment with a host-provided href", function(done) {
    const text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    return typeCharacters("a", function() {
      assert.notOk(isToolbarButtonDisabled({ attribute: "href" }))
      return expandSelection("left", function() {
        assert.notOk(isToolbarButtonDisabled({ attribute: "href" }))
        return expandSelection("left", function() {
          assert.ok(isToolbarButtonDisabled({ attribute: "href" }))
          return done()
        })
      })
    })
  })

  test("typing after a link", done => typeCharacters("ab", () => expandSelection({ direction: "left", times: 2 }, () => clickToolbarButton({ attribute: "href" }, () => typeInToolbarDialog("http://example.com", { attribute: "href" }, () => collapseSelection("right", function() {
    assert.locationRange({ index: 0, offset: 2 })
    return typeCharacters("c", function() {
      assert.textAttributes([ 0, 2 ], { href: "http://example.com" })
      assert.textAttributes([ 2, 3 ], {})
      return moveCursor("left", function() {
        assert.notOk(isToolbarButtonActive({ attribute: "href" }))
        return moveCursor("left", function() {
          assert.ok(isToolbarButtonActive({ attribute: "href" }))
          return done()
        })
      })
    })
  }))))))

  test("applying formatting and then typing", done => typeCharacters("a", () => clickToolbarButton({ attribute: "bold" }, () => typeCharacters("bcd", () => clickToolbarButton({ attribute: "bold" }, () => typeCharacters("e", function() {
    assert.textAttributes([ 0, 1 ], {})
    assert.textAttributes([ 1, 4 ], { bold: true })
    assert.textAttributes([ 4, 5 ], {})
    return done()
  }))))))

  test("applying formatting and then moving the cursor away", done => typeCharacters("abc", () => moveCursor("left", function() {
    assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
    return clickToolbarButton({ attribute: "bold" }, function() {
      assert.ok(isToolbarButtonActive({ attribute: "bold" }))
      return moveCursor("right", function() {
        assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
        return moveCursor("left", function() {
          assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
          assert.textAttributes([ 0, 3 ], {})
          assert.textAttributes([ 3, 4 ], { blockBreak: true })
          return done()
        })
      })
    })
  })))

  test("applying formatting to an unfocused editor", function(done) {
    const input = makeElement("input", { type: "text" })
    document.body.appendChild(input)
    input.focus()

    return clickToolbarButton({ attribute: "bold" }, () => typeCharacters("a", function() {
      assert.textAttributes([ 0, 1 ], { bold: true })
      document.body.removeChild(input)
      return done()
    }))
  })

  test("editing formatted text", done => clickToolbarButton({ attribute: "bold" }, () => typeCharacters("ab", () => clickToolbarButton({ attribute: "bold" }, () => typeCharacters("c", function() {
    assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
    return moveCursor("left", function() {
      assert.ok(isToolbarButtonActive({ attribute: "bold" }))
      return moveCursor("left", function() {
        assert.ok(isToolbarButtonActive({ attribute: "bold" }))
        return typeCharacters("Z", function() {
          assert.ok(isToolbarButtonActive({ attribute: "bold" }))
          assert.textAttributes([ 0, 3 ], { bold: true })
          assert.textAttributes([ 3, 4 ], {})
          assert.textAttributes([ 4, 5 ], { blockBreak: true })
          return moveCursor("right", function() {
            assert.ok(isToolbarButtonActive({ attribute: "bold" }))
            return moveCursor("right", function() {
              assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
              return done()
            })
          })
        })
      })
    })
  })))))

  testIf(config.input.getLevel() === 0, "key command activates toolbar button", done => typeToolbarKeyCommand({ attribute: "bold" }, function() {
    assert.ok(isToolbarButtonActive({ attribute: "bold" }))
    return done()
  }))

  return test("backspacing newline after text", expectDocument => typeCharacters("a\n", () => pressKey("backspace", () => expectDocument("a\n"))))
})
