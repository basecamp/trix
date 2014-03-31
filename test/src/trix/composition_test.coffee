#= require trix/models/composition
#= require helpers
#= require fixtures

module "Trix.Composition"


test "#insertText", ->
  testGroup "empty composition", ->
    composition = makeComposition(fixture("empty"))
    composition.insertText(fixture("formatted"))
    length = composition.text.getLength()

    textsEqual composition.text, fixture("formatted"), "resulting text is inserted text"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [length, length], "position is incremented"

  testGroup "positioned inside", ->
    composition = makeComposition(fixture("plain"), [5, 5])
    composition.insertText(insertedText = fixture("plain"))
    length = insertedText.getLength()

    expectedText = fixture("plain").insertTextAtPosition(insertedText, 5)
    textsEqual composition.text, expectedText, "text is inserted at the current position"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5 + length, 5 + length], "position is incremented"

  testGroup "with selected range", ->
    composition = makeComposition(fixture("plain"), [5, 10])
    composition.insertText(insertedText = fixture("plain"))
    length = insertedText.getLength()

    expectedText = fixture("plain").removeTextAtRange([5, 10]).insertTextAtPosition(insertedText, 5)
    textsEqual composition.text, expectedText, "text is replaced at the selected range"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5 + length, 5 + length], "position is incremented"

  testGroup "updatePosition: false", ->
    composition = makeComposition(fixture("plain"), [5, 5])
    composition.insertText(insertedText = fixture("plain"), updatePosition: false)

    expectedText = fixture("plain").insertTextAtPosition(insertedText, 5)
    textsEqual composition.text, expectedText, "text is inserted at the current position"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5, 5], "position is unchanged"


test "#insertString", ->
  composition = makeComposition(fixture("plain"), [2, 2])
  composition.insertString(insertedString = "Hello")

  insertedText = Trix.Text.textForStringWithAttributes(insertedString)
  expectedText = fixture("plain").insertTextAtPosition(insertedText, 2)
  textsEqual composition.text, expectedText, "string is inserted at the current position"
  equal composition.delegate.changes.length, 1, "change count is one"
  equal composition.delegate.lastChange.type, "text", "change type is text"
  deepEqual composition.selectionDelegate.lastRange, [7, 7], "position is incremented"


test "#insertAttachment", ->
  composition = makeComposition(fixture("plain"), [2, 2])
  composition.insertAttachment(insertedAttachment = url: "about:blank")

  insertedText = Trix.Text.textForAttachmentWithAttributes(insertedAttachment)
  expectedText = fixture("plain").insertTextAtPosition(insertedText, 2)
  textsEqual composition.text, expectedText, "attachment is inserted at the current position"
  equal composition.delegate.changes.length, 1, "change count is one"
  equal composition.delegate.lastChange.type, "text", "change type is text"
  deepEqual composition.selectionDelegate.lastRange, [3, 3], "position is incremented"


test "#deleteBackward", ->
  testGroup "empty composition", ->
    composition = makeComposition(fixture("empty"))
    composition.deleteBackward()

    textsEqual composition.text, fixture("empty"), "composition text is unchanged"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [0, 0], "position is unchanged"

  testGroup "from position", ->
    composition = makeComposition(fixture("plain"), [6, 6])
    composition.deleteBackward()

    expectedText = fixture("plain").removeTextAtRange([5, 6])
    textsEqual composition.text, expectedText, "previous character is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5, 5], "position is decremented"

  testGroup "with selected range", ->
    composition = makeComposition(fixture("plain"), [4, 6])
    composition.deleteBackward()

    expectedText = fixture("plain").removeTextAtRange([4, 6])
    textsEqual composition.text, expectedText, "selected text is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [4, 4], "position is start of selection"


test "#deleteForward", ->
  testGroup "empty composition", ->
    composition = makeComposition(fixture("empty"))
    composition.deleteForward()

    textsEqual composition.text, fixture("empty"), "composition text is unchanged"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [0, 0], "position is unchanged"

  testGroup "from position", ->
    composition = makeComposition(fixture("plain"), [6, 6])
    composition.deleteForward()

    expectedText = fixture("plain").removeTextAtRange([6, 7])
    textsEqual composition.text, expectedText, "previous character is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [6, 6], "position is unchanged"

  testGroup "with selected range", ->
    composition = makeComposition(fixture("plain"), [4, 6])
    composition.deleteForward()

    expectedText = fixture("plain").removeTextAtRange([4, 6])
    textsEqual composition.text, expectedText, "selected text is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [4, 4], "position is start of selection"


test "#deleteWordBackward", ->
  testGroup "at the end of a word", ->
    composition = makeComposition(fixture("plain"), [5, 5])
    composition.deleteWordBackward()

    expectedText = fixture("plain").removeTextAtRange([0, 5])
    textsEqual composition.text, expectedText, "entire word is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [0, 0], "position is 0"

  testGroup "in the middle of a word", ->
    composition = makeComposition(fixture("plain"), [8, 8])
    composition.deleteWordBackward()

    expectedText = fixture("plain").removeTextAtRange([6, 8])
    textsEqual composition.text, expectedText, "beginning of word is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [6, 6], "position is beginning of word"

  testGroup "after whitespace", ->
    composition = makeComposition(fixture("plain"), [6, 6])
    composition.deleteWordBackward()

    expectedText = fixture("plain").removeTextAtRange([0, 6])
    textsEqual composition.text, expectedText, "entire word and trailing whitespace is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [0, 0], "position is 0"

  testGroup "with selection", ->
    composition = makeComposition(fixture("plain"), [7, 9])
    composition.deleteWordBackward()

    expectedText = fixture("plain").removeTextAtRange([7, 9])
    textsEqual composition.text, expectedText, "selection is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [7, 7], "position is start of selection"


test "#moveTextFromRange", ->
  testGroup "forwards", ->
    composition = makeComposition(fixture("plain"), [5, 5])
    composition.moveTextFromRange([0, 2])

    expectedText = fixture("plain").moveTextFromRangeToPosition([0, 2], 5)
    textsEqual composition.text, expectedText, "range is moved to position"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5, 5], "position is unchanged"

  testGroup "backwards", ->
    composition = makeComposition(fixture("plain"), [5, 5])
    composition.moveTextFromRange([7, 9])

    expectedText = fixture("plain").moveTextFromRangeToPosition([7, 9], 5)
    textsEqual composition.text, expectedText, "range is moved to position"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [5, 5], "position is unchanged"


test "#getTextFromSelection", ->
  testGroup "empty selection", ->
    composition = makeComposition(fixture("plain"), [0, 0])
    text = composition.getTextFromSelection()

    textsEqual text, fixture("empty"), "text is empty"
    equal composition.delegate.changes.length, 0, "change count is zero"
    deepEqual composition.selectionDelegate.lastRange, [0, 0], "position is unchanged"

  testGroup "selected range", ->
    composition = makeComposition(fixture("plain"), [3, 8])
    text = composition.getTextFromSelection()

    expectedText = fixture("plain").getTextAtRange([3, 8])
    textsEqual text, expectedText, "text is extracted"
    equal composition.delegate.changes.length, 0, "change count is zero"
    deepEqual composition.selectionDelegate.lastRange, [3, 8], "selection is unchanged"


# test "#hasCurrentAttribute", ->
#   ok true


# test "#toggleCurrentAttribute", ->
#   ok true


# test "#setCurrentAttribute", ->
#   ok true


# test "#updateCurrentAttributes", ->
#   ok true



# test "#freezeSelection", ->
#   ok true


# test "#thawSelection", ->
#   ok true


# test "#hasFrozenSelection", ->
#   ok true



# test "#getPosition", ->
#   ok true


# test "#requestPosition", ->
#   ok true


# test "#requestPositionAtPoint", ->
#   ok true


# test "#getSelectedRange", ->
#   ok true


# test "#requestSelectedRange", ->
#   ok true


# Helpers

makeComposition = (text, selectedRange = [0, 0]) ->
  composition = new Trix.Composition text

  composition.selectionDelegate =
    selectedRanges: [selectedRange]
    lastRange: selectedRange
    getSelectedRangeOfComposition: (composition) ->
      @lastRange
    compositionDidRequestSelectionOfRange: (composition, range) ->
      @selectedRanges.push(@lastRange = range)

  composition.delegate =
    changes: []
    compositionDidChangeText: (composition, text) ->
      @changes.push(@lastChange = type: "text", value: text)
    compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
      @changes.push(@lastChange = type: "currentAttributes", value: currentAttributes)

  composition
