{assert, clickElement, clickToolbarButton, clickToolbarDialogButton, collapseSelection, expandSelection, insertString, insertText, isToolbarButtonActive, isToolbarButtonDisabled, isToolbarDialogActive, moveCursor, pressKey, test, testIf, testGroup, typeCharacters, typeInToolbarDialog, typeToolbarKeyCommand} = Trix.TestHelpers

testGroup "Text formatting", template: "editor_empty", ->
  test "applying attributes to text", (done) ->
    typeCharacters "abc", ->
      expandSelection "left", ->
        clickToolbarButton attribute: "bold", ->
          assert.textAttributes([0, 2], {})
          assert.textAttributes([2, 3], bold: true)
          assert.textAttributes([3, 4], blockBreak: true)
          done()

  test "applying a link to text", (done) ->
    typeCharacters "abc", ->
      moveCursor "left", ->
        expandSelection "left", ->
          clickToolbarButton attribute: "href", ->
            assert.ok isToolbarDialogActive(attribute: "href")
            typeInToolbarDialog "http://example.com", attribute: "href", ->
              assert.textAttributes([0, 1], {})
              assert.textAttributes([1, 2], href: "http://example.com")
              assert.textAttributes([2, 3], {})
              done()

  test "inserting a link", (expectDocument) ->
    typeCharacters "a", ->
      clickToolbarButton attribute: "href", ->
        assert.ok isToolbarDialogActive(attribute: "href")
        typeInToolbarDialog "http://example.com", attribute: "href", ->
          assert.textAttributes([0, 1], {})
          assert.textAttributes([1, 19], href: "http://example.com")
          expectDocument("ahttp://example.com\n")

  test "editing a link", (done) ->
    insertString("a")
    text = Trix.Text.textForStringWithAttributes("bc", href: "http://example.com")
    insertText(text)
    insertString("d")
    moveCursor direction: "left", times: 2, ->
      clickToolbarButton attribute: "href", ->
        assert.ok isToolbarDialogActive(attribute: "href")
        assert.locationRange({index: 0, offset: 1}, {index: 0, offset: 3})
        typeInToolbarDialog "http://example.org", attribute: "href", ->
          assert.textAttributes([0, 1], {})
          assert.textAttributes([1, 3], href: "http://example.org")
          assert.textAttributes([3, 4], {})
          done()

  test "removing a link", (done) ->
    text = Trix.Text.textForStringWithAttributes("ab", href: "http://example.com")
    insertText(text)
    assert.textAttributes([0, 2], href: "http://example.com")
    expandSelection direction: "left", times: 2, ->
      clickToolbarButton attribute: "href", ->
        clickToolbarDialogButton method: "removeAttribute", ->
          assert.textAttributes([0, 2], {})
          done()

  test "selecting an attachment disables text formatting", (done) ->
    text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    typeCharacters "a", ->
      assert.notOk isToolbarButtonDisabled(attribute: "bold")
      expandSelection "left", ->
        assert.notOk isToolbarButtonDisabled(attribute: "bold")
        expandSelection "left", ->
          assert.ok isToolbarButtonDisabled(attribute: "bold")
          done()

  test "selecting an attachment deactivates toolbar dialog", (done) ->
    text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    clickToolbarButton attribute: "href", ->
      assert.ok isToolbarDialogActive(attribute: "href")
      clickElement getEditorElement().querySelector("figure"), ->
        assert.notOk isToolbarDialogActive(attribute: "href")
        assert.ok isToolbarButtonDisabled(attribute: "href")
        done()

  test "typing over a selected attachment does not apply disabled formatting attributes", (expectDocument) ->
    text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    expandSelection "left", ->
      assert.ok isToolbarButtonDisabled(attribute: "bold")
      typeCharacters "a", ->
        assert.textAttributes([0, 1], {})
        expectDocument("a\n")

  test "applying a link to an attachment with a host-provided href", (done) ->
    text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    insertText(text)
    typeCharacters "a", ->
      assert.notOk isToolbarButtonDisabled(attribute: "href")
      expandSelection "left", ->
        assert.notOk isToolbarButtonDisabled(attribute: "href")
        expandSelection "left", ->
          assert.ok isToolbarButtonDisabled(attribute: "href")
          done()

  test "typing after a link", (done) ->
    typeCharacters "ab", ->
      expandSelection direction: "left", times: 2, ->
        clickToolbarButton attribute: "href", ->
          typeInToolbarDialog "http://example.com", attribute: "href", ->
            collapseSelection "right", ->
              assert.locationRange(index: 0, offset: 2)
              typeCharacters "c", ->
                assert.textAttributes([0, 2], href: "http://example.com")
                assert.textAttributes([2, 3], {})
                moveCursor "left", ->
                  assert.notOk isToolbarButtonActive(attribute: "href")
                  moveCursor "left", ->
                    assert.ok isToolbarButtonActive(attribute: "href")
                    done()

  test "applying formatting and then typing", (done) ->
    typeCharacters "a", ->
      clickToolbarButton attribute: "bold", ->
        typeCharacters "bcd", ->
          clickToolbarButton attribute: "bold", ->
            typeCharacters "e", ->
              assert.textAttributes([0, 1], {})
              assert.textAttributes([1, 4], bold: true)
              assert.textAttributes([4, 5], {})
              done()

  test "applying formatting and then moving the cursor away", (done) ->
    typeCharacters "abc", ->
      moveCursor "left", ->
        assert.notOk isToolbarButtonActive(attribute: "bold")
        clickToolbarButton attribute: "bold", ->
          assert.ok isToolbarButtonActive(attribute: "bold")
          moveCursor "right", ->
            assert.notOk isToolbarButtonActive(attribute: "bold")
            moveCursor "left", ->
              assert.notOk isToolbarButtonActive(attribute: "bold")
              assert.textAttributes([0, 3], {})
              assert.textAttributes([3, 4], blockBreak: true)
              done()

  test "applying formatting to an unfocused editor", (done) ->
    input = Trix.makeElement("input", type: "text")
    document.body.appendChild(input)
    input.focus()

    clickToolbarButton attribute: "bold", ->
      typeCharacters "a", ->
        assert.textAttributes([0, 1], bold: true)
        document.body.removeChild(input)
        done()

  test "editing formatted text", (done) ->
    clickToolbarButton attribute: "bold", ->
      typeCharacters "ab", ->
        clickToolbarButton attribute: "bold", ->
          typeCharacters "c", ->
            assert.notOk isToolbarButtonActive(attribute: "bold")
            moveCursor "left", ->
              assert.ok isToolbarButtonActive(attribute: "bold")
              moveCursor "left", ->
                assert.ok isToolbarButtonActive(attribute: "bold")
                typeCharacters "Z", ->
                  assert.ok isToolbarButtonActive(attribute: "bold")
                  assert.textAttributes([0, 3], bold: true)
                  assert.textAttributes([3, 4], {})
                  assert.textAttributes([4, 5], blockBreak: true)
                  moveCursor "right", ->
                    assert.ok isToolbarButtonActive(attribute: "bold")
                    moveCursor "right", ->
                      assert.notOk isToolbarButtonActive(attribute: "bold")
                      done()

  testIf Trix.config.input.getLevel() is 0, "key command activates toolbar button", (done) ->
    typeToolbarKeyCommand attribute: "bold", ->
      assert.ok isToolbarButtonActive(attribute: "bold")
      done()

  test "backspacing newline after text", (expectDocument) ->
    typeCharacters "a\n", ->
      pressKey "backspace", ->
        expectDocument("a\n")
