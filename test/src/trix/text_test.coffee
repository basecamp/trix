#= require trix/text

module "Trix.Text"


test "textForAttachmentWithAttributes", ->
  attachment = id: 1

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


test "#getLength", ->
  empty = fixture("empty")
  equal empty.getLength(), 0, "empty text length is 0"

  text = fixture("plain")
  equal text.getLength(), 11, "plain text length"

  text = fixture("formatted")
  equal text.getLength(), 17, "formatted text length"


# Fixtures

fixtures =
  empty: []

  plain: [
    new Trix.Piece("Hello world")
  ]

  bold: [
    new Trix.Piece("Hello world", bold: true)
  ]

  italic: [
    new Trix.Piece("Hello world", italic: true)
  ]

  formatted: [
    new Trix.Piece("Hello, "),
    new Trix.Piece("rich ", bold: true, italic: true),
    new Trix.Piece("text", italic: true),
    new Trix.Piece("!")
  ]

fixture = (name) ->
  new Trix.Text fixtures[name]


# Test helpers

runsEqual = (text, expectedRuns, message) ->
  actualRuns = getRunsForText(text)

  if expectedRuns.length isnt actualRuns.length
    return QUnit.push(false, actualRuns.length, expectedRuns.length, "#{message} (run length mismatch)")

  for actualRun, index in actualRuns
    expectedRun = expectedRuns[index]

    if expectedRun.attachment? and expectedRun.attachment isnt actualRun.attachment
      return QUnit.push(false, actualRun.attachment, expectedRun.attachment, "#{message} (attachment mismatch in run #{index + 1})")

    if expectedRun.attributes? and not Trix.Hash.box(expectedRun.attributes).isEqualTo(actualRun.attributes)
      return QUnit.push(false, actualRun.attributes, expectedRun.attributes, "#{message} (attributes mismatch in run #{index + 1})")

    if expectedRun.string? and expectedRun.string isnt actualRun.string
      return QUnit.push(false, actualRun.string, expectedRun.string, "#{message} (string mismatch in run #{index + 1})")

  QUnit.push(true, actualRuns, expectedRuns, message)

getRunsForText = (text) ->
  result = []
  text.eachRun (run) -> result.push(run)
  result
