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
    [{ attachment: attachment, string: undefined, attributes: { bold: true }}],
    "single-run text with attachment and attributes"


test "textForStringWithAttributes", ->
  string = "Hello, world"

  text = Trix.Text.textForStringWithAttributes(string)
  runsEqual text,
    [{ string: string, attachment: undefined, attributes: {} }],
    "single-run text with string and no attributes"

  text = Trix.Text.textForStringWithAttributes(string, italic: true)
  runsEqual text,
    [{ string: string, attachment: undefined, attributes: { italic: true }}],
    "single-run text with string and attributes"


test "#isEqualTo", ->
  text = fixture("multipleRun")
  ok text.isEqualTo(text), "text is equal to itself"

  copy = text.getTextAtRange([0, 17])
  ok text isnt copy and text.isEqualTo(copy), "text is equal to copy of itself"

  empty = fixture("empty")
  ok !text.isEqualTo(empty) and !empty.isEqualTo(text), "text is not equal to empty text"

  slice = text.getTextAtRange([0, 16])
  ok !text.isEqualTo(slice) and !slice.isEqualTo(text), "text is not equal to subslice of text"


test "#getLength", ->
  empty = fixture("empty")
  equal empty.getLength(), 0, "empty text length is 0"

  text = fixture("singleRun")
  equal text.getLength(), 11, "single-run text length"

  text = fixture("multipleRun")
  equal text.getLength(), 17, "multiple-run text length"


# Fixtures

fixtures =
  empty: []

  singleRun: [
    new Trix.Piece("Hello world")
  ]

  multipleRun: [
    new Trix.Piece("Hello, "),
    new Trix.Piece("rich ", { bold: true, italic: true }),
    new Trix.Piece("text", { italic: true }),
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
