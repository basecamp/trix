trix.testGroup "Text formatting", template: "editor_empty", ->
  trix.test "applying attributes to text", (done) ->
    trix.typeCharacters "abc", ->
      trix.expandSelection "left", ->
        trix.clickToolbarButton attribute: "bold", ->
          expectAttributes([0, 2], {})
          expectAttributes([2, 3], bold: true)
          expectAttributes([3, 4], blockBreak: true)
          done()

  trix.test "applying a link to text", (done) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor "left", ->
        trix.expandSelection "left", ->
          trix.clickToolbarButton attribute: "href", ->
            ok trix.isToolbarDialogActive(attribute: "href")
            trix.typeInToolbarDialog "http://example.com", attribute: "href", ->
              expectAttributes([0, 1], {})
              expectAttributes([1, 2], href: "http://example.com")
              expectAttributes([2, 3], {})
              done()

  trix.test "inserting a link", (expectDocument) ->
    trix.typeCharacters "a", ->
      trix.clickToolbarButton attribute: "href", ->
        ok trix.isToolbarDialogActive(attribute: "href")
        trix.typeInToolbarDialog "http://example.com", attribute: "href", ->
          expectAttributes([0, 1], {})
          expectAttributes([1, 19], href: "http://example.com")
          expectDocument("ahttp://example.com\n")

  trix.test "editing a link", (done) ->
    trix.insertString("a")
    text = Trix.Text.textForStringWithAttributes("bc", href: "http://example.com")
    trix.insertText(text)
    trix.insertString("d")
    trix.moveCursor direction: "left", times: 2, ->
      trix.clickToolbarButton attribute: "href", ->
        ok trix.isToolbarDialogActive(attribute: "href")
        assertLocationRange({index: 0, offset: 1}, {index: 0, offset: 3})
        trix.typeInToolbarDialog "http://example.org", attribute: "href", ->
          expectAttributes([0, 1], {})
          expectAttributes([1, 3], href: "http://example.org")
          expectAttributes([3, 4], {})
          done()

  trix.test "removing a link", (done) ->
    text = Trix.Text.textForStringWithAttributes("ab", href: "http://example.com")
    trix.insertText(text)
    expectAttributes([0, 2], href: "http://example.com")
    trix.expandSelection direction: "left", times: 2, ->
      trix.clickToolbarButton attribute: "href", ->
        trix.clickToolbarDialogButton method: "removeAttribute", ->
          expectAttributes([0, 2], {})
          done()

  trix.test "applying a link to an attachment with a host-provided href", (done) ->
    text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
    trix.insertText(text)
    trix.typeCharacters "a", ->
      ok not trix.isToolbarButtonDisabled(attribute: "href")
      trix.expandSelection "left", ->
        ok not trix.isToolbarButtonDisabled(attribute: "href")
        trix.expandSelection "left", ->
          ok trix.isToolbarButtonDisabled(attribute: "href")
          done()

  trix.test "typing after a link", (done) ->
    trix.typeCharacters "ab", ->
      trix.expandSelection direction: "left", times: 2, ->
        trix.clickToolbarButton attribute: "href", ->
          trix.typeInToolbarDialog "http://example.com", attribute: "href", ->
            trix.collapseSelection "right", ->
              assertLocationRange(index: 0, offset: 2)
              trix.typeCharacters "c", ->
                expectAttributes([0, 2], href: "http://example.com")
                expectAttributes([2, 3], {})
                trix.moveCursor "left", ->
                  ok not trix.isToolbarButtonActive(attribute: "href")
                  trix.moveCursor "left", ->
                    ok trix.isToolbarButtonActive(attribute: "href")
                    done()

  trix.test "applying formatting and then typing", (done) ->
    trix.typeCharacters "a", ->
      trix.clickToolbarButton attribute: "bold", ->
        trix.typeCharacters "bcd", ->
          trix.clickToolbarButton attribute: "bold", ->
            trix.typeCharacters "e", ->
              expectAttributes([0, 1], {})
              expectAttributes([1, 4], bold: true)
              expectAttributes([4, 5], {})
              done()

  trix.test "applying formatting and then moving the cursor away", (done) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor "left", ->
        ok not trix.isToolbarButtonActive(attribute: "bold")
        trix.clickToolbarButton attribute: "bold", ->
          ok trix.isToolbarButtonActive(attribute: "bold")
          trix.moveCursor "right", ->
            ok not trix.isToolbarButtonActive(attribute: "bold")
            trix.moveCursor "left", ->
              ok not trix.isToolbarButtonActive(attribute: "bold")
              expectAttributes([0, 3], {})
              expectAttributes([3, 4], blockBreak: true)
              done()

  trix.test "applying formatting to an unfocused editor", (done) ->
    input = Trix.makeElement("input", type: "text")
    document.body.appendChild(input)
    input.focus()

    trix.clickToolbarButton attribute: "bold", ->
      trix.typeCharacters "a", ->
        expectAttributes([0, 1], bold: true)
        document.body.removeChild(input)
        done()

  trix.test "editing formatted text", (done) ->
    trix.clickToolbarButton attribute: "bold", ->
      trix.typeCharacters "ab", ->
        trix.clickToolbarButton attribute: "bold", ->
          trix.typeCharacters "c", ->
            ok not trix.isToolbarButtonActive(attribute: "bold")
            trix.moveCursor "left", ->
              ok trix.isToolbarButtonActive(attribute: "bold")
              trix.moveCursor "left", ->
                ok trix.isToolbarButtonActive(attribute: "bold")
                trix.typeCharacters "Z", ->
                  ok trix.isToolbarButtonActive(attribute: "bold")
                  expectAttributes([0, 3], bold: true)
                  expectAttributes([3, 4], {})
                  expectAttributes([4, 5], blockBreak: true)
                  trix.moveCursor "right", ->
                    ok trix.isToolbarButtonActive(attribute: "bold")
                    trix.moveCursor "right", ->
                      ok not trix.isToolbarButtonActive(attribute: "bold")
                      done()

  trix.test "key command activates toolbar button", (done) ->
    trix.typeToolbarKeyCommand attribute: "bold", ->
      ok trix.isToolbarButtonActive(attribute: "bold")
      done()
