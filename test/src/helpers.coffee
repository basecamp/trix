#= require qunit


# QUnit extensions

QUnit.messagePrefix = ""

QUnit.withMessagePrefix = (prefix, block) ->
  previousMessagePrefix = @messagePrefix
  @messagePrefix = "#{prefix}#{@messagePrefix}"
  try
    result = block()
  finally
    @messagePrefix = previousMessagePrefix
    result

originalPush = QUnit.push

QUnit.push = (value, actual, expected, message) ->
  message = "#{@messagePrefix}#{[message]}" if message?
  originalPush.call(this, value, actual, expected, message)

@testGroup = (description, change) ->
  QUnit.withMessagePrefix("#{description}: ", change)


# Trix assertions

@hashesEqual = (actual, expected, message) ->
  actual = Trix.Hash.box(actual)
  expected = Trix.Hash.box(expected)
  QUnit.push actual.isEqualTo(expected), actual.inspect(), expected.inspect(), message

@runsEqual = (text, expectedRuns, message) ->
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

@textsEqual = (actual, expected, message) ->
  QUnit.push(actual?.isEqualTo?(expected), actual?.inspect?(), expected?.inspect?(), message)

getRunsForText = (text) ->
  result = []
  text.eachRun (run) -> result.push(run)
  result
