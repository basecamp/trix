document = layout = null

module "layout",
  setup: ->
    document = new Trix.Document
    layout = new Trix.Layout document

test "empty document", ->
  ok document.length is 0
  deepEqual layout.lineEndPositions, [-1]

test "one character", ->
  document.insertText "h", 0
  deepEqual layout.lineEndPositions, [0]

test "two characters", ->
  document.insertText "he", 0
  deepEqual layout.lineEndPositions, [1]

test "one character followed by newline", ->
  document.insertText "h\n", 0
  deepEqual layout.lineEndPositions, [1, 1]

test "two words separated by newline", ->
  document.insertText "hello\nworld", 0
  deepEqual layout.lineEndPositions, [5, 10]

test "two lines", ->
  document.insertText "hello\nworld\n", 0
  deepEqual layout.lineEndPositions, [5, 11, 11]
