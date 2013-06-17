class Trix.Document
  constructor: (@delegate) ->
    @lines = []
    @endOffsets = []
    @ensureTrailingLine()

  insertText: (text, position) ->
    text = normalize text
    textLineBreakPositions = findLineBreakPositions text
    textHasLineBreaks = textLineBreakPositions.length > 0

    if lineIndex = @findIndexOfLineAtPosition position
      line = @lines[lineIndex]
      position -= @endOffsets[lineIndex - 1] ? 0

      if textHasLineBreaks
        modifiedLine = line.slice(0, position) + text + line.slice(position)
        @modifyLineAtIndex lineIndex, modifiedLine

      else
        linesToInsert = splitTextAtPositions text, textLineBreakPositions
        modifiedLine = line.slice(0, position) + linesToInsert.shift()
        linesToInsert.unshift line.slice(position) if position < line.length
        @modifyLineAtIndex lineIndex, modifiedLine
        @insertLinesAtIndex lineIndex + 1, linesToInsert

    else
      lastLineIndex = @lines.length - 1
      if (lastLine = @lines[lastLineIndex])?
        startingNewLine = endsWithLineBreak lastLine
      else
        startingNewLine = true

      linesToInsert = splitTextAtPositions text, textLineBreakPositions

      if startingNewLine
        @insertLinesAtIndex @lines.length, linesToInsert
      else
        modifiedLine = lastLine + linesToInsert.shift()
        @modifyLineAtIndex lastLineIndex, modifiedLine
        @insertLinesAtIndex @lines.length, linesToInsert

    text

  deleteText: (position, length) ->
    # there are many more cases to consider; assume we're deleting the last character for now
    lineIndex = @findIndexOfLineAtPosition position
    if lineIndex?
      line = @lines[lineIndex]
      if line.length
        modifiedLine = line.slice 0, -1

        if line.length
          @modifyLineAtIndex lineIndex, modifiedLine
        else
          @deleteLineAtIndex lineIndex

      else if lineIndex > 0
        line = @lines[lineIndex - 1]
        modifiedLine = line.slice 0, -1

        @modifyLineAtIndex lineIndex - 1, modifiedLine
        @deleteLineAtIndex lineIndex

  modifyLineAtIndex: (lineIndex, text) ->
    originalText = @lines[lineIndex]
    @lines[lineIndex] = text
    @updateEndOffsets()
    @delegate.documentLineModifiedAtIndex this, lineIndex, text, originalText
    @ensureTrailingLine()

  insertLineAtIndex: (lineIndex, text) ->
    @lines.splice lineIndex, 0, text
    @updateEndOffsets()
    @delegate.documentLineInsertedAtIndex this, lineIndex, text
    @ensureTrailingLine()

  insertLinesAtIndex: (lineIndex, lines) ->
    for text, index in lines
      @insertLineAtIndex lineIndex + index, text

  deleteLineAtIndex: (lineIndex) ->
    @lines.splice lineIndex, 1
    @updateEndOffsets()
    @delegate.documentLineDeletedAtIndex this, lineIndex
    @ensureTrailingLine()

  ensureTrailingLine: ->
    if @lines.length is 0
      @insertLineAtIndex 0, ""
    else if line = @lines[@lines.length - 1]
      if endsWithLineBreak line
        @insertLineAtIndex @lines.length, ""

  updateEndOffsets: ->
    position = 0
    @endOffsets.length = 0
    for line in @lines
      position += line.length
      @endOffsets.push position

  findIndexOfLineAtPosition: (position) ->
    previousEndOffset = 0
    result = null
    for endOffset, index in @endOffsets
      result = index if previousEndOffset <= position < endOffset
    result

  normalize = (string) ->
    string.replace /\r\n?/g, "\n"

  endsWithLineBreak = (string) ->
    string.slice(-1) is "\n"

  findLineBreakPositions = (string) ->
    index = -1
    positions = []
    loop
      index = string.indexOf "\n", index + 1
      break if index is -1
      positions.push index
    positions

  splitTextAtPositions = (text, positions) ->
    result = []
    offset = 0
    for endOffset in positions
      result.push text.slice offset, endOffset + 1
      offset = endOffset + 1
    if offset < text.length
      result.push text.slice offset
    result
