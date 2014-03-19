#= require trix/text

module "Trix.Text",
  setup: ->
    @text = new Trix.Text [
      new Trix.Piece("Hello, "),
      new Trix.Piece("rich ", { bold: true, italic: true }),
      new Trix.Piece("text", { italic: true }),
      new Trix.Piece("!")
    ]


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
  ok @text.isEqualTo(@text), "text is equal to itself"

  text = @text.getTextAtRange([0, 17])
  ok @text isnt text and @text.isEqualTo(text), "text is equal to copy of itself"

  text = new Trix.Text
  ok !@text.isEqualTo(text) and !text.isEqualTo(@text), "text is not equal to empty text"

  text = @text.getTextAtRange([0, 16])
  ok !@text.isEqualTo(text) and !text.isEqualTo(@text), "text is not equal to subslice of text"


test "#getLength", ->
  text = new Trix.Text
  equal text.getLength(), 0, "empty text length is 0"

  text = Trix.Text.textForStringWithAttributes("Hello")
  equal text.getLength(), 5, "single-run text length"

  equal @text.getLength(), 17, "multiple-run text length"


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
