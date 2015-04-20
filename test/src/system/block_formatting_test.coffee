editorModule "Block formatting", template: "editor_empty"

editorTest "applying block attributes", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 4], ["quote"])
      ok isToolbarButtonActive(attribute: "quote")
      clickToolbarButton attribute: "code", ->
        expectBlockAttributes([0, 4], ["quote", "code"])
        ok isToolbarButtonActive(attribute: "code")
        clickToolbarButton attribute: "code", ->
          expectBlockAttributes([0, 4], ["quote"])
          ok not isToolbarButtonActive(attribute: "code")
          ok isToolbarButtonActive(attribute: "quote")
          done()

editorTest "applying block attributes to text after newline", (done) ->
  typeCharacters "a\nbc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 2], [])
      expectBlockAttributes([2, 4], ["quote"])
      done()

editorTest "applying block attributes to text between newlines", (done) ->
  typeCharacters """
    ab
    def
    ghi
    j
  """, ->
    moveCursor direction: "left", times: 2, ->
      expandSelection direction: "left", times: 5, ->
        clickToolbarButton attribute: "quote", ->
          expectBlockAttributes([0, 3], [])
          expectBlockAttributes([3, 11], ["quote"])
          expectBlockAttributes([11, 13], [])
          done()

editorTest "applying bullets to text with newlines", (done) ->
  typeCharacters """
    abc
    def
    ghi
    jkl
    mno
  """, ->
    moveCursor direction: "left", times: 2, ->
      expandSelection direction: "left", times: 15, ->
        clickToolbarButton attribute: "bullet", ->
          expectBlockAttributes([0, 4], ["bulletList", "bullet"])
          expectBlockAttributes([4, 8], ["bulletList", "bullet"])
          expectBlockAttributes([8, 12], ["bulletList", "bullet"])
          expectBlockAttributes([12, 16], ["bulletList", "bullet"])
          expectBlockAttributes([16, 20], ["bulletList", "bullet"])
          done()

editorTest "breaking out of the end of a block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      typeCharacters "\n\n", ->
        expectBlockAttributes([0, 4], ["quote"])
        expectBlockAttributes([4, 5], [])
        done()

editorTest "breaking out of the middle of a block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      moveCursor "left", ->
        typeCharacters "\n\n", ->
          expectBlockAttributes([0, 3], ["quote"])
          expectBlockAttributes([3, 4], [])
          expectBlockAttributes([4, 6], ["quote"])
          done()

editorTest "deleting the only non-block-break character in a block", (done) ->
  typeCharacters "ab", ->
    clickToolbarButton attribute: "quote", ->
      typeCharacters "\b\b", ->
        expectBlockAttributes([0, 1], ["quote"])
        done()

editorTest "backspacing a quote", (done) ->
  clickToolbarButton attribute: "quote", ->
    expectBlockAttributes([0, 1], ["quote"])
    pressKey "backspace", ->
      expectBlockAttributes([0, 1], [])
      done()

editorTest "backspacing a nested quote", (done) ->
  clickToolbarButton attribute: "quote", ->
    clickToolbarButton action: "increaseBlockLevel", ->
      expectBlockAttributes([0, 1], ["quote", "quote"])
      pressKey "backspace", ->
        expectBlockAttributes([0, 1], ["quote"])
        pressKey "backspace", ->
          expectBlockAttributes([0, 1], [])
          done()

editorTest "backspacing a list item", (done) ->
  clickToolbarButton attribute: "bullet", ->
    expectBlockAttributes([0, 1], ["bulletList", "bullet"])
    pressKey "backspace", ->
      expectBlockAttributes([0, 0], [])
      done()

editorTest "backspacing a nested list item", (expectDocument) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "a\n", ->
      clickToolbarButton action: "increaseBlockLevel", ->
        expectBlockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"])
        pressKey "backspace", ->
          expectBlockAttributes([2, 3], [])
          expectDocument("a\n")

editorTest "backspacing a list item inside a quote", (done) ->
  clickToolbarButton attribute: "quote", ->
    clickToolbarButton attribute: "bullet", ->
      expectBlockAttributes([0, 1], ["quote", "bulletList", "bullet"])
      pressKey "backspace", ->
        expectBlockAttributes([0, 1], ["quote"])
        pressKey "backspace", ->
          expectBlockAttributes([0, 1], [])
          done()

editorTest "increasing list level", (done) ->
  ok isToolbarButtonDisabled(action: "increaseBlockLevel")
  ok isToolbarButtonDisabled(action: "decreaseBlockLevel")
  clickToolbarButton attribute: "bullet", ->
    ok isToolbarButtonDisabled(action: "increaseBlockLevel")
    ok not isToolbarButtonDisabled(action: "decreaseBlockLevel")
    typeCharacters "a\n", ->
      ok not isToolbarButtonDisabled(action: "increaseBlockLevel")
      ok not isToolbarButtonDisabled(action: "decreaseBlockLevel")
      clickToolbarButton action: "increaseBlockLevel", ->
        typeCharacters "b", ->
          ok isToolbarButtonDisabled(action: "increaseBlockLevel")
          ok not isToolbarButtonDisabled(action: "decreaseBlockLevel")
          expectBlockAttributes([0, 2], ["bulletList", "bullet"])
          expectBlockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"])
          done()

editorTest "changing list type", (done) ->
  clickToolbarButton attribute: "bullet", ->
    expectBlockAttributes([0, 1], ["bulletList", "bullet"])
    clickToolbarButton attribute: "number", ->
      expectBlockAttributes([0, 1], ["numberList", "number"])
      done()
