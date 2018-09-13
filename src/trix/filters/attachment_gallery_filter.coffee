Trix.attachmentGalleryFilter = (snapshot) ->
  filter = new Filter snapshot
  filter.perform()
  filter.getSnapshot()

class Filter
  BLOCK_ATTRIBUTE_NAME = "attachmentGallery"
  TEXT_ATTRIBUTE_NAME  = "presentation"
  TEXT_ATTRIBUTE_VALUE = "gallery"

  constructor: (snapshot) ->
    {@document, @selectedRange} = snapshot

  perform: ->
    @removeBlockAttribute()
    @applyBlockAttribute()

  getSnapshot: ->
    {@document, @selectedRange}

  # Private

  removeBlockAttribute: ->
    for range in @findRangesOfBlocks()
      @document = @document.removeAttributeAtRange(BLOCK_ATTRIBUTE_NAME, range)

  applyBlockAttribute: ->
    offset = 0
    for range in @findRangesOfPieces() when range[1] - range[0] > 1
      range[0] += offset
      range[1] += offset

      unless @document.getCharacterAtPosition(range[1]) is "\n"
        @document = @document.insertBlockBreakAtRange(range[1])
        @moveSelectedRangeForward() if range[1] < @selectedRange[1]
        range[1]++
        offset++

      unless range[0] is 0
        unless @document.getCharacterAtPosition(range[0] - 1) is "\n"
          @document = @document.insertBlockBreakAtRange(range[0])
          @moveSelectedRangeForward() if range[0] < @selectedRange[0]
          range[0]++
          offset++

      @document = @document.applyBlockAttributeAtRange(BLOCK_ATTRIBUTE_NAME, true, range)

  findRangesOfBlocks: ->
    @document.findRangesForBlockAttribute(BLOCK_ATTRIBUTE_NAME)

  findRangesOfPieces: ->
    @document.findRangesForTextAttribute(TEXT_ATTRIBUTE_NAME, withValue: TEXT_ATTRIBUTE_VALUE)

  moveSelectedRangeForward: ->
    @selectedRange[0] += 1
    @selectedRange[1] += 1
