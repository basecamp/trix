class Trix.PieceList
  constructor: (pieces = []) ->
    @pieces = pieces.slice(0)

  eachPiece: (callback) ->
    callback(piece, index) for piece, index in @pieces

  insertPieceAtIndex: (piece, index) ->
    @pieces.splice(index, 0, piece)

  insertPieceListAtIndex: (pieceList, index) ->
    for piece, offset in pieceList.pieces
      @insertPieceAtIndex(piece, index + offset)

  insertPieceListAtPosition: (pieceList, position) ->
    index = @splitPieceAtPosition(position)
    @insertPieceListAtIndex(pieceList, index)

  removePieceAtIndex: (index) ->
    @pieces.splice(index, 1)

  getPieceAtIndex: (index) ->
    @pieces[index]

  getPieceListInRange: (range) ->
    pieceList = new Trix.PieceList @pieces.slice(0)
    [leftIndex, rightIndex] = pieceList.splitPiecesAtRange(range)
    new Trix.PieceList pieceList.pieces.slice(leftIndex, rightIndex + 1)

  removePiecesInRange: (range) ->
    [leftIndex, rightIndex] = @splitPiecesAtRange(range)
    while rightIndex >= leftIndex
      @removePieceAtIndex(rightIndex)
      rightIndex--

  transformPiecesInRange: (range, transform) ->
    [leftIndex, rightIndex] = @splitPiecesAtRange(range)
    pieces = @pieces.slice(leftIndex, rightIndex + 1)
    newPieces = (transform(piece) for piece in pieces)
    index = leftIndex
    while index <= rightIndex
      @pieces[index] = newPieces[index - leftIndex]
      index++

  splitPiecesAtRange: (range) ->
    leftInnerIndex = @splitPieceAtPosition(startOfRange(range))
    rightOuterIndex = @splitPieceAtPosition(endOfRange(range))
    [leftInnerIndex, rightOuterIndex - 1]

  getPieceAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    @pieces[index]

  splitPieceAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    if index?
      if offset is 0
        index
      else
        piece = @getPieceAtIndex(index)
        [leftPiece, rightPiece] = piece.splitAtOffset(offset)
        @pieces.splice(index, 1, leftPiece, rightPiece)
        index + 1
    else
      @pieces.length

  getCommonAttributes: ->
    return {} unless piece = @getPieceAtIndex(0)
    attributesHash = piece.getAttributesHash()
    keys = attributesHash.getKeys()

    @eachPiece (piece) ->
      keys = attributesHash.getKeysCommonToHash(piece.getAttributesHash())
      attributesHash = attributesHash.slice(keys)

    attributesHash.toObject()

  consolidate: ->
    pieces = []
    pendingPiece = @pieces[0]

    for piece in @pieces[1..]
      if pendingPiece.canBeConsolidatedWithPiece(piece)
        pendingPiece = pendingPiece.append(piece)
      else
        pieces.push(pendingPiece)
        pendingPiece = piece

    pieces.push(pendingPiece) if pendingPiece?
    @pieces = pieces

  findIndexAndOffsetAtPosition: (position) ->
    currentPosition = 0
    for piece, index in @pieces
      nextPosition = currentPosition + piece.length
      if currentPosition <= position < nextPosition
        return index: index, offset: position - currentPosition
      currentPosition = nextPosition
    index: null, offset: null

  getLength: ->
    length = 0
    length += piece.length for piece in @pieces
    length

  toString: ->
    @pieces.join("")

  toArray: ->
    @pieces.slice(0)

  isEqualTo: (pieceList) ->
    this is pieceList or pieceArraysAreEqual(@pieces, pieceList?.pieces)

  pieceArraysAreEqual = (left, right = []) ->
    return false unless left.length is right.length
    result = true
    result = false for piece, index in left when result and not piece.isEqualTo(right[index])
    result

  inspect: ->
    result = []
    result.push(piece.inspect()) for piece in @pieces
    "#<PieceList pieces=#{result.join(", ")}>"

  startOfRange = (range) ->
    range[0]

  endOfRange = (range) ->
    range[1]
