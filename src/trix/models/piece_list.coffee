#= require trix/models/object

class Trix.PieceList extends Trix.Object
  constructor: (pieces = []) ->
    super
    @pieces = pieces.slice(0)

  eachPiece: (callback) ->
    callback(piece, index) for piece, index in @pieces

  insertPieceAtIndex: (piece, index) ->
    pieces = @pieces.slice(0)
    pieces.splice(index, 0, piece)
    new @constructor pieces

  insertPieceListAtIndex: (pieceList, index) ->
    pieces = @pieces.slice(0)
    pieces.splice(index, 0, pieceList.pieces...)
    new @constructor pieces

  insertPieceListAtPosition: (pieceList, position) ->
    [pieces, index] = @splitPieceAtPosition(position)
    new @constructor(pieces).insertPieceListAtIndex(pieceList, index)

  removePieceAtIndex: (index) ->
    pieces = @pieces.slice(0)
    pieces.splice(index, 1)
    new @constructor pieces

  getPieceAtIndex: (index) ->
    @pieces[index]

  getPieceListInRange: (range) ->
    [pieces, leftIndex, rightIndex] = @splitPiecesAtRange(range)
    new @constructor pieces.slice(leftIndex, rightIndex + 1)

  removePiecesInRange: (range) ->
    [pieces, leftIndex, rightIndex] = @splitPiecesAtRange(range)
    pieces.splice(leftIndex, rightIndex - leftIndex + 1)
    new @constructor pieces

  transformPiecesInRange: (range, transform) ->
    [pieces, leftIndex, rightIndex] = @splitPiecesAtRange(range)
    pieces = pieces.slice(leftIndex, rightIndex + 1)
    newPieces = (transform(piece) for piece in pieces)
    index = leftIndex
    while index <= rightIndex
      pieces[index] = newPieces[index - leftIndex]
      index++
    new @constructor pieces

  splitPiecesAtRange: (range) ->
    [pieces, leftInnerIndex] = @splitPieceAtPosition(startOfRange(range))
    [pieces, rightOuterIndex] = new @constructor(pieces).splitPieceAtPosition(endOfRange(range))
    [pieces, leftInnerIndex, rightOuterIndex - 1]

  getPieceAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    @pieces[index]

  splitPieceAtPosition: (position) ->
    {index, offset} = @findIndexAndOffsetAtPosition(position)
    pieces = @pieces.slice(0)
    result = if index?
      if offset is 0
        index
      else
        piece = @getPieceAtIndex(index)
        [leftPiece, rightPiece] = piece.splitAtOffset(offset)
        pieces.splice(index, 1, leftPiece, rightPiece)
        index + 1
    else
      pieces.length

    [pieces, result]

  getCommonAttributes: ->
    objects = (piece.getAttributes() for piece in @pieces)
    Trix.Hash.fromCommonAttributesOfObjects(objects).toObject()

  consolidate: ->
    pieces = []
    pendingPiece = @pieces[0]

    for piece in @pieces[1..]
      if pendingPiece.canBeConsolidatedWithPiece(piece)
        pendingPiece = pendingPiece.append(piece)
      else
        pieces.push(pendingPiece)
        pendingPiece = piece

    if pendingPiece?
      pieces.push(pendingPiece)

    new @constructor pieces

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

  getAttachments: ->
    for piece in @pieces when piece.attachment
      piece.attachment

  getAttachmentAndPositionById: (attachmentId) ->
    position = 0
    for piece in @pieces
      if piece.attachment?.id is attachmentId
        return { attachment: piece.attachment, position }
      position += piece.length
    attachment: null, position: null

  toString: ->
    @pieces.join("")

  toArray: ->
    @pieces.slice(0)

  toJSON: ->
    @toArray()

  isEqualTo: (pieceList) ->
    super or pieceArraysAreEqual(@pieces, pieceList?.pieces)

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
