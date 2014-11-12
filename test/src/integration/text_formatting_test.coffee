#Text attribute changes
#Block attribute changes
#Applying a link
#Editing a link
#Removing a link
#Current attributes (apply attribute and then type)
#Attribute states are reflected in the toolbar as the selection changes

editorModule "Text formatting", template: "editor_empty"

editorTest "applying attributes to text", (done) ->
  typeCharacters "abc", ->
    selectInDirection "left", ->
      clickToolbarButton attribute: "bold", ->
        expectAttributes([0, 2], {})
        expectAttributes([2, 3], bold: true)
        expectAttributes([3, 4], blockBreak: true)
        done()

editorTest "applying a link to text", (done) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      selectInDirection "left", ->
        clickToolbarButton attribute: "href", ->
          typeInToolbarDialog "http://example.com", attribute: "href", ->
            expectAttributes([0, 1], {})
            expectAttributes([1, 2], href: "http://example.com")
            expectAttributes([2, 3], {})
            done()

editorTest "editing a link", (done) ->
  editor.composition.insertString("a")
  text = Trix.Text.textForStringWithAttributes("bc", href: "http://example.com")
  editor.composition.insertText(text)
  editor.composition.insertString("d")
  moveCursor direction: "left", times: 2, ->
    clickToolbarButton attribute: "href", ->
      assertLocationRange([0,1], [0,3])
      typeInToolbarDialog "http://example.org", attribute: "href", ->
        expectAttributes([0, 1], {})
        expectAttributes([1, 3], href: "http://example.org")
        expectAttributes([3, 4], {})
        done()

editorTest "removing a link", (done) ->
  text = Trix.Text.textForStringWithAttributes("ab", href: "http://example.com")
  editor.composition.insertText(text)
  expectAttributes([0, 2], href: "http://example.com")
  selectInDirection "left", ->
    selectInDirection "left", ->
      clickToolbarButton attribute: "href", ->
        clickToolbarDialogButton method: "removeAttribute", ->
          expectAttributes([0, 2], {})
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


# toggle current attribute and then move cursor away
# current attribute at cursor positions in formatted text
