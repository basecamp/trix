#= require trix/models/composition
#= require trix/models/attachment_manager
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


test "#insertFile", ->
  file = { type: "image/png" }
  attachment = Trix.Attachment.forFile(file)

  composition = makeComposition(fixture("plain"), [2, 2])
  composition.insertFile(file)

  insertedText = Trix.Text.textForAttachmentWithAttributes(attachment)
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

  testGroup "from position after grapheme cluster", ->
    text = Trix.Text.textForStringWithAttributes("oṇ̇ff")
    composition = makeComposition(text, [4, 4])
    composition.deleteBackward()

    equal composition.text.toString(), "off", "entire grapheme cluster is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [1, 1], "position is decremented"

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

  testGroup "from position before grapheme cluster", ->
    text = Trix.Text.textForStringWithAttributes("oṇ̇ff")
    composition = makeComposition(text, [1, 1])
    composition.deleteForward()

    equal composition.text.toString(), "off", "entire grapheme cluster is removed"
    equal composition.delegate.changes.length, 1, "change count is one"
    equal composition.delegate.lastChange.type, "text", "change type is text"
    deepEqual composition.selectionDelegate.lastRange, [1, 1], "position is unchanged"

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


test "#hasCurrentAttribute/#updateCurrentAttributes", ->
  composition = makeComposition(fixture("formatted"))
  tests = [
    [[0, 0],   bold: false, italic: false]
    [[7, 7],   bold: false, italic: false]
    [[8, 8],   bold: true,  italic: true]
    [[12, 12], bold: true,  italic: true]
    [[13, 13], bold: false, italic: true]
    [[16, 16], bold: false, italic: true]
    [[17, 17], bold: false, italic: false]
    [[8, 12],  bold: true,  italic: true]
    [[8, 16],  bold: false, italic: true]
    [[8, 17],  bold: false, italic: false]
  ]

  for [range, attributes] in tests
    composition.requestSelectedRange(range)
    composition.updateCurrentAttributes()
    for name, value of attributes
      equal composition.hasCurrentAttribute(name), value, "#{name} is #{value} at #{JSON.stringify(range)}"


test "#toggleCurrentAttribute", ->
  testGroup "at position", ->
    composition = makeComposition(fixture("empty"))
    composition.toggleCurrentAttribute("bold")
    equal composition.delegate.changes.length, 1, "delegate change count is 1 after first toggle"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of initial toggle"

    composition.insertString("Hello")
    composition.toggleCurrentAttribute("bold")
    equal composition.delegate.changes.length, 3, "delegate change count is 3 after second toggle"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of second toggle"

    composition.insertString(", world!")
    runsEqual composition.text, [
        { string: "Hello", attributes: { bold: true } },
        { string: ", world!", attributes: { } }
      ],
      "toggling an attribute during typing"

  testGroup "with selected range", ->
    composition = makeComposition(fixture("formatted"), [7, 16])
    composition.updateCurrentAttributes()
    changeCount = composition.delegate.changes.length

    composition.toggleCurrentAttribute("italic")
    equal composition.delegate.changes.length - changeCount, 2, "delegate change count increments by 2 after toggle"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of toggle"

    runsEqual composition.text, [
        { string: "Hello, ", attributes: { } },
        { string: "rich ", attributes: { bold: true } },
        { string: "text!", attributes: { } }
      ],
      "italic is removed from the selected range"


test "#setCurrentAttribute", ->
  testGroup "turning on attribute at position", ->
    composition = makeComposition(fixture("plain"), [11, 11])
    composition.setCurrentAttribute("italic", true)
    equal composition.delegate.changes.length, 1, "delegate change count is 1 after first set"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of initial attribute change"

    composition.insertString("!")
    runsEqual composition.text, [
        { string: "Hello world", attributes: { } },
        { string: "!", attributes: { italic: true } }
      ],
      "text is appended with attribute"

  testGroup "turning off attribute at position", ->
    composition = makeComposition(fixture("italic"), [11, 11])
    composition.updateCurrentAttributes()
    changeCount = composition.delegate.changes.length

    composition.setCurrentAttribute("italic", false)
    equal composition.delegate.changes.length - changeCount, 1, "delegate change count increases by 1 after first set"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of initial attribute change"

    composition.insertString("!")
    runsEqual composition.text, [
        { string: "Hello world", attributes: { italic: true } },
        { string: "!", attributes: { } }
      ],
      "text is appended without attribute"

  testGroup "adding attribute to selected range", ->
    composition = makeComposition(fixture("formatted"), [7, 16])
    composition.updateCurrentAttributes()
    changeCount = composition.delegate.changes.length

    composition.setCurrentAttribute("bold", true)
    equal composition.delegate.changes.length - changeCount, 2, "delegate change count increments by 2 after first set"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of initial attribute change"

    runsEqual composition.text, [
        { string: "Hello, ", attributes: { } },
        { string: "rich text", attributes: { bold: true, italic: true } },
        { string: "!", attributes: { } }
      ],
      "bold is added to the selected range"

  testGroup "removing attribute from selected range", ->
    composition = makeComposition(fixture("formatted"), [7, 16])
    composition.updateCurrentAttributes()
    changeCount = composition.delegate.changes.length

    composition.setCurrentAttribute("italic", false)
    equal composition.delegate.changes.length - changeCount, 2, "delegate change count increments by 2 after first set"
    equal composition.delegate.lastChange.type, "currentAttributes", "delegate notified of initial attribute change"

    runsEqual composition.text, [
        { string: "Hello, ", attributes: { } },
        { string: "rich ", attributes: { bold: true } },
        { string: "text!", attributes: { } }
      ],
      "italic is removed from the selected range"


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
  attachmentManager = new Trix.AttachmentManager text
  attachmentManager.delegate = shouldAcceptFile: -> true
  attachmentManager.reset()
  text.attachments = attachmentManager

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
