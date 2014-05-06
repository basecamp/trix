#= require trix/models/text
#= require trix/models/attachment
#= require helpers
#= require fixtures

module "Trix.Text"


test "textForAttachmentWithAttributes", ->
  attachment = new Trix.Attachment url: "/basecamp.png"

  text = Trix.Text.textForAttachmentWithAttributes(attachment)
  runsEqual text,
    [{ attachment: attachment, string: undefined, attributes: {} }],
    "single-run text with attachment and no attributes"

  text = Trix.Text.textForAttachmentWithAttributes(attachment, bold: true)
  runsEqual text,
    [{ attachment: attachment, string: undefined, attributes: { bold: true } }],
    "single-run text with attachment and attributes"


test "textForStringWithAttributes", ->
  string = "Hello, world"

  text = Trix.Text.textForStringWithAttributes(string)
  runsEqual text,
    [{ string: string, attachment: undefined, attributes: {} }],
    "single-run text with string and no attributes"

  text = Trix.Text.textForStringWithAttributes(string, italic: true)
  runsEqual text,
    [{ string: string, attachment: undefined, attributes: { italic: true } }],
    "single-run text with string and attributes"


test "fromJSON", ->
  textA = fixture("formatted")
  textB = Trix.Text.fromJSON(textA.asJSON())
  ok textB.isEqualTo(textA), "serializing and deserializing creates equal copy"

  attachment = new Trix.Attachment(url: "/basecamp.png")
  textA = Trix.Text.textForAttachmentWithAttributes(attachment)
  textB = Trix.Text.fromJSON(textA.asJSON())
  ok textB.isEqualTo(textA), "serializing and deserializing creates equal copy"


test "fromHTML", ->
  text = Trix.Text.fromHTML("<strong>Hello world</strong>")
  ok text.isEqualTo(fixture("bold")), "text from HTML is equal copy"


test "#beginEditing and #endEditing", ->
  count = (text) ->
    counter = value: 0, text: text
    delegate = didEditText: (text) -> counter.value++ if text is counter.text
    text.delegate = delegate
    counter

  {text} = counter = count(fixture("formatted"))
  text.replaceTextAtRange(fixture("plain"), [1, 2])
  equal counter.value, 1, "one delegate call after text manipulation"

  {text} = counter = count(fixture("formatted"))
  text.beginEditing()
  text.replaceTextAtRange(fixture("plain"), [1, 2])
  text.removeTextAtRange([1, 2])
  equal counter.value, 0, "no delegate calls during editing"
  text.endEditing()
  equal counter.value, 1, "one delegate call after editing"

  {text} = counter = count(fixture("formatted"))
  text.beginEditing().beginEditing()
  text.removeTextAtRange([1, 2])
  text.endEditing()
  equal counter.value, 0, "no delegate calls during nested editing"
  text.endEditing()
  equal counter.value, 1, "one delegate call after nested editing"


test "#appendText", ->
  text = fixture("plain")
  text.appendText(Trix.Text.textForStringWithAttributes("!"))
  runsEqual text,
    [{ string: "Hello world!", attributes: {} }],
    "text with identical attributes"

  text = fixture("plain")
  text.appendText(fixture("bold"))
  runsEqual text, [
      { string: "Hello world", attributes: {} },
      { string: "Hello world", attributes: { bold: true } }
    ],
    "text with different attributes"


test "#insertTextAtPosition", ->
  text = fixture("plain")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, 0)
  ok fixture("plain").isEqualTo(text), "inserting empty text into plain text at the start position"

  text = fixture("plain")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, text.getLength())
  ok fixture("plain").isEqualTo(text), "inserting empty text into plain text at the end position"

  text = fixture("plain")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, 5)
  ok fixture("plain").isEqualTo(text), "inserting empty text into plain text at an interior position"

  text = fixture("formatted")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, 0)
  ok fixture("formatted").isEqualTo(text), "inserting empty text into formatted text at the start position"

  text = fixture("formatted")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, text.getLength())
  ok fixture("formatted").isEqualTo(text), "inserting empty text into formatted text at the end position"

  text = fixture("formatted")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, 10)
  ok fixture("formatted").isEqualTo(text), "inserting empty text into formatted text inside a run"

  text = fixture("formatted")
  insertedText = fixture("empty")
  text.insertTextAtPosition(insertedText, 12)
  ok fixture("formatted").isEqualTo(text), "inserting empty text into formatted text between runs"

  text = fixture("plain")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, 0)
  runsEqual text,
    [{ string: "Hello worldHello world", attributes: {} }],
    "inserting plain text into plain text at the start position"

  text = fixture("plain")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, text.getLength())
  runsEqual text,
    [{ string: "Hello worldHello world", attributes: {} }],
    "inserting plain text into plain text at the end position"

  text = fixture("plain")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, 5)
  runsEqual text,
    [{ string: "HelloHello world world", attributes: {} }],
    "inserting plain text into plain text at an interior position"

  text = fixture("formatted")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, 0)
  runsEqual text, [
      { string: "Hello worldHello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting plain text into formatted text at the start position"

  text = fixture("formatted")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, text.getLength())
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!Hello world", attributes: {} }
    ],
    "inserting plain text into formatted text at the end position"

  text = fixture("formatted")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, 10)
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "ric", attributes: { bold: true, italic: true } },
      { string: "Hello world", attributes: {} },
      { string: "h ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting plain text into formatted text inside a run"

  text = fixture("formatted")
  insertedText = fixture("plain")
  text.insertTextAtPosition(insertedText, 12)
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "Hello world", attributes: {} },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting plain text into formatted text between runs"

  text = fixture("plain")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 0)
  runsEqual text, [
      { string: "Hello world", attributes: { italic: true } },
      { string: "Hello world", attributes: {} }
    ],
    "inserting formatted text into plain text at the start position"

  text = fixture("plain")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, text.getLength())
  runsEqual text, [
      { string: "Hello world", attributes: {} },
      { string: "Hello world", attributes: { italic: true } }
    ],
    "inserting formatted text into plain text at the end position"

  text = fixture("plain")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 5)
  runsEqual text, [
      { string: "Hello", attributes: {} },
      { string: "Hello world", attributes: { italic: true } },
      { string: " world", attributes: {} }
    ],
    "inserting formatted text into plain text at an interior position"

  text = fixture("formatted")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 0)
  runsEqual text, [
      { string: "Hello world", attributes: { italic: true } },
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting formatted text into formatted text at the start position"

  text = fixture("formatted")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, text.getLength())
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} },
      { string: "Hello world", attributes: { italic: true } }
    ],
    "inserting formatted text into formatted text at the end position"

  text = fixture("formatted")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 14)
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "teHello worldxt", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting formatted text into formatted text inside a run with identical attributes"

  text = fixture("formatted")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 11)
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich", attributes: { bold: true, italic: true } },
      { string: "Hello world", attributes: { italic: true } },
      { string: " ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting formatted text into formatted text inside a run with different attributes"

  text = fixture("formatted")
  insertedText = fixture("italic")
  text.insertTextAtPosition(insertedText, 12)
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "Hello worldtext", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "inserting formatted text into formatted text between runs"


test "#removeTextAtRange", ->
  text = fixture("formatted")
  text.removeTextAtRange([0, 0])
  ok text.isEqualTo(fixture("formatted")), "removing nothing"

  text = fixture("formatted")
  text.removeTextAtRange([0, text.getLength()])
  ok text.isEqualTo(fixture("empty")), "removing the entire text"

  text = fixture("formatted")
  text.removeTextAtRange([0, 2])
  runsEqual text, [
      { string: "llo, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "removing text at the start position"

  text = fixture("formatted")
  text.removeTextAtRange([text.getLength() - 1, text.getLength()])
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } }
    ],
    "removing text at the end position"

  text = fixture("formatted")
  text.removeTextAtRange([1, 3])
  runsEqual text, [
      { string: "Hlo, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "removing text inside a run"

  text = fixture("formatted")
  text.removeTextAtRange([1, 13])
  runsEqual text, [
      { string: "H", attributes: {} },
      { string: "ext", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "removing text across runs"


test "#replaceTextAtRange", ->
  text = fixture("formatted")
  text.replaceTextAtRange(fixture("empty"), [1, 1])
  ok text.isEqualTo(fixture("formatted")), "replacing nothing with empty text"

  text = fixture("formatted")
  text.replaceTextAtRange(fixture("plain"), [1, 1])
  runsEqual text, [
      { string: "HHello worldello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "text", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "replacing nothing with text is equivalent to inserting it"

  text = fixture("formatted")
  text.replaceTextAtRange(fixture("plain"), [0, text.getLength()])
  ok text.isEqualTo(fixture("plain")), "replacing the entire text"

  text = fixture("formatted")
  text.replaceTextAtRange(fixture("italic"), [1, 13])
  runsEqual text, [
      { string: "H", attributes: {} },
      { string: "Hello worldext", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "replacing text across runs"


test "#moveTextFromRangeToPosition", ->
  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 0)
  equal text.toString(), "lloHe world", "moving text to the start position"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 1)
  equal text.toString(), "Hlloe world", "moving text to a position before the source range"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 2)
  equal text.toString(), "Hello world", "moving text to the start position of the source range"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 4)
  equal text.toString(), "Hello world", "moving text to a position within the source range"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 5)
  equal text.toString(), "Hello world", "moving text to the end position of the source range"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], 6)
  equal text.toString(), "He lloworld", "moving text to a position after the source range"

  text = fixture("plain")
  text.moveTextFromRangeToPosition([2, 5], text.getLength())
  equal text.toString(), "He worldllo", "moving text to the end position"


test "#mergeText", ->
  text = new Trix.Text [
    new Trix.Piece "Hello "
    new Trix.Piece "creul", bold: true
    new Trix.Piece " world"
  ]

  text2 = new Trix.Text [
    new Trix.Piece "Hello "
    new Trix.Piece "strange, ", italic: true
    new Trix.Piece "cruel", bold: true
    new Trix.Piece " world"
  ]

  text.mergeText(text2)
  equal text.toString(), "Hello strange, cruel world", "text merged"


test "#addAttributeAtRange", ->
  text = fixture("plain")
  text.addAttributeAtRange("bold", true, [0, 5])
  runsEqual text, [
      { string: "Hello", attributes: { bold: true } },
      { string: " world", attributes: {} }
    ],
    "adding an attribute"


test "#addAttributesAtRange", ->
  attributes = { bold: true, italic: true }

  text = fixture("plain")
  text.addAttributesAtRange(attributes, [1, 1])
  ok text.isEqualTo(fixture("plain")), "adding attributes to nothing"

  text = fixture("plain")
  text.addAttributesAtRange(attributes, [1, 5])
  runsEqual text, [
      { string: "H", attributes: {} },
      { string: "ello", attributes: attributes },
      { string: " world", attributes: {} }
    ],
    "adding attributes to an interior range"

  text = fixture("plain")
  text.addAttributesAtRange(attributes, [0, text.getLength()])
  runsEqual text, [{ string: "Hello world", attributes: attributes }],
    "adding attributes to the entire text"

  text = fixture("formatted")
  text.addAttributesAtRange(attributes, [10, text.getLength()])
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich text!", attributes: attributes }
    ],
    "adding attributes across ranges"


test "#removeAttributeAtRange", ->
  text = fixture("italic")
  text.removeAttributeAtRange("italic", [1, 1])
  ok text.isEqualTo(fixture("italic")), "removing an attribute from nothing"

  text = fixture("italic")
  text.removeAttributeAtRange("italic", [1, 5])
  runsEqual text, [
      { string: "H", attributes: { italic: true } },
      { string: "ello", attributes: {} },
      { string: " world", attributes: { italic: true } }
    ],
    "removing an attribute from an interior range"

  text = fixture("italic")
  text.removeAttributeAtRange("italic", [0, text.getLength()])
  ok text.isEqualTo(fixture("plain")), "removing an attribute from the entire text"

  text = fixture("formatted")
  text.removeAttributeAtRange("italic", [0, 14])
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true } },
      { string: "te", attributes: {} },
      { string: "xt", attributes: { italic: true } },
      { string: "!", attributes: {} }
    ],
    "removing an attribute across runs"


test "#setAttributesAtRange", ->
  attributes = { italic: true }

  text = fixture("bold")
  text.setAttributesAtRange(attributes, [1, 1])
  ok text.isEqualTo(fixture("bold")), "setting attributes on nothing"

  text = fixture("bold")
  text.setAttributesAtRange(attributes, [1, 5])
  runsEqual text, [
      { string: "H", attributes: { bold: true } },
      { string: "ello", attributes: { italic: true } },
      { string: " world", attributes: { bold: true } }
    ],
    "setting attributes on an interior range"

  text = fixture("bold")
  text.setAttributesAtRange(attributes, [0, text.getLength()])
  ok text.isEqualTo(fixture("italic")), "setting attributes on the entire text"

  text = fixture("formatted")
  text.setAttributesAtRange(attributes, [10, text.getLength()])
  runsEqual text, [
      { string: "Hello, ", attributes: {} },
      { string: "ric", attributes: { bold: true, italic: true } },
      { string: "h text!", attributes: { italic: true } }
    ],
    "setting attributes across runs"


test "#getAttributesAtPosition", ->
  text = fixture("formatted")
  tests =
    0:  {}
    6:  {}
    7:  { bold: true, italic: true }
    11: { bold: true, italic: true }
    12: { italic: true }
    15: { italic: true }
    16: {}
    17: {}

  for position, expectedAttributes of tests
    attributes = text.getAttributesAtPosition(position)
    hashesEqual attributes, expectedAttributes, "position #{position}"


test "#getCommonAttributesAtRange", ->
  text = fixture("formatted")
  tests = [
    [[0, 17],  {}],
    [[7, 11],  { bold: true, italic: true }],
    [[7, 13],  { italic: true }],
    [[7, 15],  { italic: true }],
    [[13, 15], { italic: true }],
    [[13, 17], {}]
  ]

  for [range, expectedCommonAttributes] in tests
    commonAttributes = text.getCommonAttributesAtRange(range)
    hashesEqual commonAttributes, expectedCommonAttributes, "range #{JSON.stringify(range)}"


test "#getTextAtRange", ->
  text = fixture("formatted").getTextAtRange([1, 1])
  ok text.isEqualTo(fixture("empty")), "extracting nothing as text"

  text = fixture("formatted").getTextAtRange([0, 17])
  ok text.isEqualTo(fixture("formatted")), "extracting the entire text as text"

  text = fixture("formatted").getTextAtRange([7, 11])
  runsEqual text, [{ string: "rich", attributes: { bold: true, italic: true } }],
    "extracting from a single run as text"

  text = fixture("formatted").getTextAtRange([1, 15])
  runsEqual text, [
      { string: "ello, ", attributes: {} },
      { string: "rich ", attributes: { bold: true, italic: true } },
      { string: "tex", attributes: { italic: true } }
    ],
    "extracting across multiple runs as text"


test "#getStringAtRange", ->
  string = fixture("formatted").getStringAtRange([1, 1])
  equal string, "", "extracting nothing as a string"

  string = fixture("formatted").getStringAtRange([0, 17])
  equal string, "Hello, rich text!", "extracting the entire text as a string"

  string = fixture("formatted").getStringAtRange([7, 11])
  equal string, "rich", "extracting from a single run as a string"

  string = fixture("formatted").getStringAtRange([1, 15])
  equal string, "ello, rich tex", "extracting across multiple runs as a string"


test "#getLength", ->
  empty = fixture("empty")
  equal empty.getLength(), 0, "empty text length is 0"

  text = fixture("plain")
  equal text.getLength(), 11, "plain text length"

  text = fixture("formatted")
  equal text.getLength(), 17, "formatted text length"


test "#isEqualTo", ->
  text = fixture("formatted")
  ok text.isEqualTo(text), "text is equal to itself"

  copy = text.getTextAtRange([0, 17])
  ok text isnt copy and text.isEqualTo(copy), "text is equal to copy of itself"

  empty = fixture("empty")
  ok !text.isEqualTo(empty) and !empty.isEqualTo(text), "text is not equal to empty text"

  slice = text.getTextAtRange([0, 16])
  ok !text.isEqualTo(slice) and !slice.isEqualTo(text), "text is not equal to subslice of text"

  a = Trix.Text.textForStringWithAttributes("Hello")
  b = Trix.Text.textForStringWithAttributes("Hello")
  ok a.isEqualTo(b) and b.isEqualTo(a), "two texts from the same string are equal"


test "#toJSON", ->
  text = fixture("formatted")
  runsEqual text, text.toJSON(), "JSON equal to text runs"


test "asJSON", ->
  equal fixture("bold").asJSON(),
    """[{"string":"Hello world","attributes":{"bold":true}}]""",
    "text is serialized as JSON"

  attachment = new Trix.Attachment url: "/basecamp.png"
  text = Trix.Text.textForAttachmentWithAttributes(attachment)
  equal text.asJSON(),
    """[{"attachment":{"url":"/basecamp.png"},"attributes":{}}]""",
    "text is serialized as JSON"

