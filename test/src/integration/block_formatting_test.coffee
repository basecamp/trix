# applying block attribute to text with collapsed selection
# applying block attribute to text across newlines using selection
# toggling block attribute from quote to code
# breaking out of a block by pressing return twice

editorModule "Block formatting", template: "editor_empty"

editorTest "applying block attributes", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 4], quote: true)
      done()

editorTest "applying block attributes to text after newline", (done) ->
  typeCharacters "a\nbc", ->
    clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 2], {})
      expectBlockAttributes([2, 4], quote: true)
      done()
