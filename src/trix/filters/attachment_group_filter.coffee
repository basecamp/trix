Trix.attachmentGroupFilter = (snapshot) ->
  {document, selectedRange} = snapshot
  document = applyAttachmentGroupsToDocument(document)
  {document, selectedRange}

applyAttachmentGroupsToDocument = (document) ->
  for block, index in document.getBlocks()
    offset = 0
    textRange = null

    if block.getLastAttribute() is "attachmentGroup"
      range = document.rangeFromLocationRange({index, offset})
      document = document.removeAttributeAtRange("attachmentGroup", range)

    for piece in block.text.getPieces()
      length = piece.getLength()

      if piece.attachment and piece.isGroupable()
        if textRange?
          textRange[1] += length
        else
          textRange = [offset, offset + length]

      else if textRange?
        [startOffset, endOffset] = textRange
        textRange = null
        if endOffset - startOffset > 1
          locationRange = [{index, offset: startOffset}, {index, offset: endOffset}]
          range = document.rangeFromLocationRange(locationRange)

          unless document.getCharacterAtPosition(range[1]) is "\n"
            document = document.insertBlockBreakAtRange(range[1])
            offset++

          unless startOffset is 0
            unless document.getCharacterAtPosition(range[0]) is "\n"
              document = document.insertBlockBreakAtRange(range[0])
              range[0]++
              offset++
          document = document.applyBlockAttributeAtRange("attachmentGroup", true, range)

      offset += length
  document
