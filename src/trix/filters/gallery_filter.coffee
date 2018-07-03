Trix.galleryFilter = (snapshot) ->
  filter = new Filter snapshot
  filter.perform()
  filter.getSnapshot()

class Filter
  constructor: (snapshot) ->
    {@document, @selectedRange} = snapshot

  perform: ->
    @removeGalleryAttribute()
    @applyGalleryAttribute()

  getSnapshot: ->
    {@document, @selectedRange}

  # Private

  removeGalleryAttribute: ->
    for range in @findRangesOfGalleryBlocks()
      @document = @document.removeAttributeAtRange("gallery", range)

  applyGalleryAttribute: ->
    offset = 0
    for range in @findRangesOfGalleryPieces() when range[1] - range[0] > 1
      range[0] += offset
      range[1] += offset

      unless @document.getCharacterAtPosition(range[1]) is "\n"
        @document = @document.insertBlockBreakAtRange(range[1])
        @moveSelectedRangeForward() if range[1] < @selectedRange[1]
        offset++

      unless range[0] is 0
        unless @document.getCharacterAtPosition(range[0] - 1) is "\n"
          @document = @document.insertBlockBreakAtRange(range[0])
          @moveSelectedRangeForward() if range[0] < @selectedRange[0]
          offset++

      @document = @document.applyBlockAttributeAtRange("gallery", true, range)

  findRangesOfGalleryBlocks: ->
    @document.findRangesForBlockAttribute("gallery")

  findRangesOfGalleryPieces: ->
    @document.findRangesForTextAttribute("presentation", withValue: "gallery")

  moveSelectedRangeForward: ->
    @selectedRange[0] += 1
    @selectedRange[1] += 1
