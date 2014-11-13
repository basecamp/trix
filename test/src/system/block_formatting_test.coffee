editorModule "Block formatting", template: "editor_empty"

editorTest "applying block attributes", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 4], quote: true)
      ok isToolbarButtonActive(attribute: "quote")
      clickToolbarButton attribute: "code", ->
        expectBlockAttributes([0, 4], code: true)
        ok not isToolbarButtonActive(attribute: "quote")
        ok isToolbarButtonActive(attribute: "code")
        clickToolbarButton attribute: "code", ->
          expectBlockAttributes([0, 4], {})
          ok not isToolbarButtonActive(attribute: "code")
          done()

editorTest "applying block attributes to text after newline", (done) ->
  typeCharacters "a\nbc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 2], {})
      expectBlockAttributes([2, 4], quote: true)
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
          expectBlockAttributes([0, 3], {})
          expectBlockAttributes([3, 11], quote: true)
          expectBlockAttributes([11, 13], {})
          done()

editorTest "breaking out of the end of a block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      typeCharacters "\n\n", ->
        expectBlockAttributes([0, 4], quote: true)
        expectBlockAttributes([4, 5], {})
        done()

editorTest "breaking out of the middle of a block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      moveCursor "left", ->
        typeCharacters "\n\n", ->
          expectBlockAttributes([0, 3], quote: true)
          expectBlockAttributes([3, 4], {})
          expectBlockAttributes([4, 6], quote: true)
          done()
