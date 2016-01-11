{normalizeRange, rangesAreEqual} = Trix

@assertLocationRange = (start, end) ->
  expectedLocationRange = normalizeRange([start, end])
  actualLocationRange = getEditorController().getLocationRange()
  ok rangesAreEqual(expectedLocationRange, actualLocationRange), "expected #{JSON.stringify(expectedLocationRange)}, actual #{JSON.stringify(actualLocationRange)}"

@expectAttributes = (range, attributes) ->
  document = getDocument().getDocumentAtRange(range)
  blocks = document.getBlocks()
  throw "range #{JSON.stringify(range)} spans more than one block" unless blocks.length is 1

  locationRange = getDocument().locationRangeFromRange(range)
  textIndex = locationRange[0].index
  textRange = [locationRange[0].offset, locationRange[1].offset]
  text = getDocument().getTextAtIndex(textIndex).getTextAtRange(textRange)
  pieces = text.getPieces()
  throw "range #{JSON.stringify(range)} must only span one piece" unless pieces.length is 1

  piece = pieces[0]
  deepEqual piece.getAttributes(), attributes

@expectBlockAttributes = (range, attributes) ->
  document = getDocument().getDocumentAtRange(range)
  blocks = document.getBlocks()
  throw "range #{JSON.stringify(range)} spans more than one block" unless blocks.length is 1

  block = blocks[0]
  deepEqual block.getAttributes(), attributes

@expectHTML = (trixDocument, html) ->
  equal getHTML(trixDocument), html

@getHTML = (trixDocument) ->
  Trix.DocumentView.render(trixDocument).innerHTML
