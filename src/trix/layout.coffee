class Trix.Layout
  constructor: (@document) ->
    @document.delegate = this
    @lineStartPositions = [0]
    @lineEndPositions = [-1]

  getRowAndColumnAtPosition: (position) ->
    for lineStartPosition, row in @lineStartPositions
      lineEndPosition = @lineEndPositions[row]
      if lineStartPosition <= position <= lineEndPosition
        return [row, position - lineStartPosition]
    null

  getRowAtPosition: (position) ->
    [row, column] = @getRowAndColumnAtPosition(position) ? []
    row

  getLineAtRow: (row) ->
    lineStartPosition = @lineStartPositions[row]
    lineEndPosition = @lineEndPositions[row]
    @document.getText lineStartPosition, lineEndPosition

  getLines: ->
    lines = []
    for lineStartPosition, row in @lineStartPositions
      lineEndPosition = @lineEndPositions[row]
      lines.push @document.getText lineStartPosition, lineEndPosition
    lines

  documentObjectInsertedAtPosition: (document, object, position) ->
    # assume end position for now
    row = @lineStartPositions.length - 1

    if object is "\n"
      @lineStartPositions.push position
      @lineEndPositions.push position
      @delegate?.layoutLineInsertedAtRow this, row + 1
    else
      @lineEndPositions[row]++
      @delegate?.layoutLineModifiedAtRow this, row

  documentObjectDeletedAtPosition: (document, object, position) ->
    # assume end position for now
    row = @lineStartPositions.length - 1

    if object is "\n"
      @lineStartPositions.pop()
      @lineEndPositions.pop()
      @delegate?.layoutLineDeletedAtRow this, row
    else
      @lineEndPositions[row]--
      @delegate?.layoutLineModifiedAtRow this, row
