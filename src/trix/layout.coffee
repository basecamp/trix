class Trix.Layout
  constructor: (@document) ->
    @document.delegate = this
    @lineStartPositions = [0]
    @lineEndPositions = [-1]

  getPositionAtRowAndColumn: (row, column) ->
    @lineStartPositions[row] + column

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
    row = @getRowAtPosition(position - 1) ? 0

    if object is "\n"
      insertValueAtIndex @lineStartPositions, row + 1, position
      insertValueAtIndex @lineEndPositions, row, position - 1
      incrementValuesFromIndex @lineStartPositions, row + 2
      incrementValuesFromIndex @lineEndPositions, row + 1
      @delegate?.layoutLineModifiedAtRow this, row
      @delegate?.layoutLineInsertedAtRow this, row + 1
    else
      incrementValuesFromIndex @lineStartPositions, row + 1
      incrementValuesFromIndex @lineEndPositions, row
      @delegate?.layoutLineModifiedAtRow this, row

  documentObjectDeletedAtPosition: (document, object, position) ->
    row = @getRowAtPosition position

    if object is "\n"
      removeValueAtIndex @lineStartPositions, row
      removeValueAtIndex @lineEndPositions, row - 1
      decrementValuesFromIndex @lineStartPositions, row
      decrementValuesFromIndex @lineEndPositions, row - 1
      @delegate?.layoutLineModifiedAtRow this, row - 1
      @delegate?.layoutLineDeletedAtRow this, row
    else
      decrementValuesFromIndex @lineStartPositions, row + 1
      decrementValuesFromIndex @lineEndPositions, row
      @delegate?.layoutLineModifiedAtRow this, row

  insertValueAtIndex = (array, index, value) ->
    array.splice index, 0, value

  removeValueAtIndex = (array, index) ->
    array.splice index, 1

  incrementValuesFromIndex = (array, index, byAmount = 1) ->
    array[index++] += byAmount while index < array.length
    array

  decrementValuesFromIndex = (array, index, byAmount = 1) ->
    incrementValuesFromIndex array, index, -byAmount
