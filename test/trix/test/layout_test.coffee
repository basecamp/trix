document = layout = null

module "layout",
  setup: ->
    document = new Trix.Document
    layout = new Trix.Layout document

test "empty document", ->
  ok document.length is 0
  deepEqual layout.lineStartPositions, [0]
  deepEqual layout.lineEndPositions, [-1]

test "one character", ->
  document.insertText "h", 0
  deepEqual layout.lineStartPositions, [0]
  deepEqual layout.lineEndPositions, [0]

test "two characters", ->
  document.insertText "he", 0
  deepEqual layout.lineStartPositions, [0]
  deepEqual layout.lineEndPositions, [1]

test "one character followed by newline", ->
  document.insertText "h\n", 0
  deepEqual layout.lineStartPositions, [0, 1]
  deepEqual layout.lineEndPositions, [0, 1]

test "two words separated by newline", ->
  document.insertText "hello\nworld", 0
  deepEqual layout.lineStartPositions, [0, 5]
  deepEqual layout.lineEndPositions, [4, 10]

test "two lines", ->
  document.insertText "hello\nworld\n", 0
  deepEqual layout.lineStartPositions, [0, 5, 11]
  deepEqual layout.lineEndPositions, [4, 10, 11]

test "inserting a newline at the beginning of the document", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "\n", 0
  deepEqual layout.lineStartPositions, [0, 0, 6, 12]
  deepEqual layout.lineEndPositions, [-1, 5, 11, 12]

test "inserting a newline at the beginning of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "\n", 6
  deepEqual layout.lineStartPositions, [0, 5, 6, 12]
  deepEqual layout.lineEndPositions, [4, 5, 11, 12]

test "inserting a newline in the middle of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "\n", 2
  deepEqual layout.lineStartPositions, [0, 2, 6, 12]
  deepEqual layout.lineEndPositions, [1, 5, 11, 12]

test "inserting a newline at the end of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "\n", 5
  deepEqual layout.lineStartPositions, [0, 5, 6, 12]
  deepEqual layout.lineEndPositions, [4, 5, 11, 12]

test "inserting a newline at the end of the document", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "\n", 12
  deepEqual layout.lineStartPositions, [0, 5, 11, 12]
  deepEqual layout.lineEndPositions, [4, 10, 11, 12]

test "inserting text at the beginning of the document", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "a", 0
  deepEqual layout.lineStartPositions, [0, 6, 12]
  deepEqual layout.lineEndPositions, [5, 11, 12]

test "inserting text at the beginning of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "a", 6
  deepEqual layout.lineStartPositions, [0, 5, 12]
  deepEqual layout.lineEndPositions, [4, 11, 12]

test "inserting text in the middle of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "a", 2
  deepEqual layout.lineStartPositions, [0, 6, 12]
  deepEqual layout.lineEndPositions, [5, 11, 12]

test "inserting text at the end of a line", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "a", 5
  deepEqual layout.lineStartPositions, [0, 6, 12]
  deepEqual layout.lineEndPositions, [5, 11, 12]

test "inserting text at the end of the document", ->
  document.insertText "hello\nworld\n", 0
  document.insertText "a", 12
  deepEqual layout.lineStartPositions, [0, 5, 11]
  deepEqual layout.lineEndPositions, [4, 10, 12]

test "deleting the only object in the document", ->
  document.insertText "h", 0
  document.deleteObject 0
  deepEqual layout.getLines(), [""]
  deepEqual layout.lineStartPositions, [0]
  deepEqual layout.lineEndPositions, [-1]

test "deleting an object at the beginning of the document", ->
  document.insertText "hello\nworld\n", 0
  document.deleteObject 0
  deepEqual layout.getLines(), ["ello", "\nworld", "\n"]
  deepEqual layout.lineStartPositions, [0, 4, 10]
  deepEqual layout.lineEndPositions, [3, 9, 10]

test "deleting an object at the beginning of a line", ->
  document.insertText "hello\nworld\n", 0
  document.deleteObject 6
  deepEqual layout.getLines(), ["hello", "\norld", "\n"]
  deepEqual layout.lineStartPositions, [0, 5, 10]
  deepEqual layout.lineEndPositions, [4, 9, 10]

test "deleting an object in the middle of a line", ->
  document.insertText "hello\nworld\n", 0
  document.deleteObject 1
  deepEqual layout.getLines(), ["hllo", "\nworld", "\n"]
  deepEqual layout.lineStartPositions, [0, 4, 10]
  deepEqual layout.lineEndPositions, [3, 9, 10]

test "deleting the only object in a line", ->
  document.insertText "hello\n\nworld", 0
  document.deleteObject 6
  deepEqual layout.getLines(), ["hello", "\nworld"]
  deepEqual layout.lineStartPositions, [0, 5]
  deepEqual layout.lineEndPositions, [4, 10]

test "deleting an object at the end of a line", ->
  document.insertText "hello\nworld\n", 0
  document.deleteObject 4
  deepEqual layout.getLines(), ["hell", "\nworld", "\n"]
  deepEqual layout.lineStartPositions, [0, 4, 10]
  deepEqual layout.lineEndPositions, [3, 9, 10]

test "deleting an object at the end of the document", ->
  document.insertText "hello\nworld", 0
  document.deleteObject 10
  deepEqual layout.getLines(), ["hello", "\nworl"]
  deepEqual layout.lineStartPositions, [0, 5]
  deepEqual layout.lineEndPositions, [4, 9]

test "deleting a newline at the end of the document", ->
  document.insertText "hello\nworld\n", 0
  document.deleteObject 11
  deepEqual layout.getLines(), ["hello", "\nworld"]
  deepEqual layout.lineStartPositions, [0, 5]
  deepEqual layout.lineEndPositions, [4, 10]
