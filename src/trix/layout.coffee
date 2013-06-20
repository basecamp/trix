class Trix.Layout
  constructor: (@document) ->
    @document.delegate = this
    @lineEndPositions = [-1]

  getLine: (index) ->
    lineEndPosition = @lineEndPositions[index]
    lineStartPosition = (@lineEndPositions[index - 1] ? -1) + 1
    length = lineEndPosition + 1 - lineStartPosition
    @document.getText lineStartPosition, length

  getLines: ->
    lines = []
    lineStartPosition = 0
    for lineEndPosition, index in @lineEndPositions
      length = lineEndPosition + 1 - lineStartPosition
      lines.push @document.getText lineStartPosition, length
      lineStartPosition = lineEndPosition + 1
    lines

  findLineIndexAtPosition: (position) ->
    lineStartPosition = -1
    for lineEndPosition, index in @lineEndPositions
      return index if lineStartPosition <= position <= lineEndPosition
      lineStartPosition = lineEndPosition + 1
    null

  documentObjectInsertedAtPosition: (document, object, position) ->
    # assume end position for now
    index = @lineEndPositions.length - 1

    @lineEndPositions[index] = position
    @delegate?.layoutLineModifiedAtIndex this, index

    if object is "\n"
      @lineEndPositions.push position
      @delegate?.layoutLineInsertedAtIndex this, index + 1

  documentObjectDeletedAtPosition: (document, object, position) ->
    # assume end position for now
    index = @lineEndPositions.length - 1

    if object is "\n"
      @lineEndPositions.pop()
      @delegate?.layoutLineDeletedAtIndex this, index
      index -= 1

    @lineEndPositions[index] = position - 1
    @delegate?.layoutLineModifiedAtIndex this, index
