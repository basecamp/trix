editorModule "Text formatting", template: "editor_empty"

editorTest "applying attributes to text", (done) ->
  typeCharacters "abc", ->
    expandSelection "left", ->
      clickToolbarButton attribute: "bold", ->
        expectAttributes([0, 2], {})
        expectAttributes([2, 3], bold: true)
        expectAttributes([3, 4], blockBreak: true)
        done()

editorTest "applying a link to text", (done) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      expandSelection "left", ->
        clickToolbarButton attribute: "href", ->
          ok isToolbarDialogActive(attribute: "href")
          typeInToolbarDialog "http://example.com", attribute: "href", ->
            expectAttributes([0, 1], {})
            expectAttributes([1, 2], href: "http://example.com")
            expectAttributes([2, 3], {})
            done()

editorTest "inserting a link", (expectDocument) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "href", ->
      ok isToolbarDialogActive(attribute: "href")
      typeInToolbarDialog "http://example.com", attribute: "href", ->
        expectAttributes([0, 1], {})
        expectAttributes([1, 19], href: "http://example.com")
        expectDocument("ahttp://example.com\n")

editorTest "editing a link", (done) ->
  insertString("a")
  text = Trix.Text.textForStringWithAttributes("bc", href: "http://example.com")
  insertText(text)
  insertString("d")
  moveCursor direction: "left", times: 2, ->
    clickToolbarButton attribute: "href", ->
      ok isToolbarDialogActive(attribute: "href")
      assertLocationRange({index: 0, offset: 1}, {index: 0, offset: 3})
      typeInToolbarDialog "http://example.org", attribute: "href", ->
        expectAttributes([0, 1], {})
        expectAttributes([1, 3], href: "http://example.org")
        expectAttributes([3, 4], {})
        done()

editorTest "removing a link", (done) ->
  text = Trix.Text.textForStringWithAttributes("ab", href: "http://example.com")
  insertText(text)
  expectAttributes([0, 2], href: "http://example.com")
  expandSelection direction: "left", times: 2, ->
    clickToolbarButton attribute: "href", ->
      clickToolbarDialogButton method: "removeAttribute", ->
        expectAttributes([0, 2], {})
        done()

editorTest "applying a link to an attachment with a host-provided href", (done) ->
  text = fixtures["file attachment"].document.getBlockAtIndex(0).getTextWithoutBlockBreak()
  insertText(text)
  typeCharacters "a", ->
    ok not isToolbarButtonDisabled(attribute: "href")
    expandSelection "left", ->
      ok not isToolbarButtonDisabled(attribute: "href")
      expandSelection "left", ->
        ok isToolbarButtonDisabled(attribute: "href")
        done()

editorTest "typing after a link", (done) ->
  typeCharacters "ab", ->
    expandSelection direction: "left", times: 2, ->
      clickToolbarButton attribute: "href", ->
        typeInToolbarDialog "http://example.com", attribute: "href", ->
          collapseSelection "right", ->
            assertLocationRange(index: 0, offset: 2)
            typeCharacters "c", ->
              expectAttributes([0, 2], href: "http://example.com")
              expectAttributes([2, 3], {})
              moveCursor "left", ->
                ok not isToolbarButtonActive(attribute: "href")
                moveCursor "left", ->
                  ok isToolbarButtonActive(attribute: "href")
                  done()

editorTest "applying formatting and then typing", (done) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bold", ->
      typeCharacters "bcd", ->
        clickToolbarButton attribute: "bold", ->
          typeCharacters "e", ->
            expectAttributes([0, 1], {})
            expectAttributes([1, 4], bold: true)
            expectAttributes([4, 5], {})
            done()

editorTest "applying formatting and then moving the cursor away", (done) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      ok not isToolbarButtonActive(attribute: "bold")
      clickToolbarButton attribute: "bold", ->
        ok isToolbarButtonActive(attribute: "bold")
        moveCursor "right", ->
          ok not isToolbarButtonActive(attribute: "bold")
          moveCursor "left", ->
            ok not isToolbarButtonActive(attribute: "bold")
            expectAttributes([0, 3], {})
            expectAttributes([3, 4], blockBreak: true)
            done()

editorTest "applying formatting to an unfocused editor", (done) ->
  input = Trix.makeElement("input", type: "text")
  document.body.appendChild(input)
  input.focus()

  clickToolbarButton attribute: "bold", ->
    typeCharacters "a", ->
      expectAttributes([0, 1], bold: true)
      document.body.removeChild(input)
      done()

editorTest "editing formatted text", (done) ->
  clickToolbarButton attribute: "bold", ->
    typeCharacters "ab", ->
      clickToolbarButton attribute: "bold", ->
        typeCharacters "c", ->
          ok not isToolbarButtonActive(attribute: "bold")
          moveCursor "left", ->
            ok isToolbarButtonActive(attribute: "bold")
            moveCursor "left", ->
              ok isToolbarButtonActive(attribute: "bold")
              typeCharacters "Z", ->
                ok isToolbarButtonActive(attribute: "bold")
                expectAttributes([0, 3], bold: true)
                expectAttributes([3, 4], {})
                expectAttributes([4, 5], blockBreak: true)
                moveCursor "right", ->
                  ok isToolbarButtonActive(attribute: "bold")
                  moveCursor "right", ->
                    ok not isToolbarButtonActive(attribute: "bold")
                    done()

editorTest "key command activates toolbar button", (done) ->
  typeToolbarKeyCommand attribute: "bold", ->
    ok isToolbarButtonActive(attribute: "bold")
    done()
