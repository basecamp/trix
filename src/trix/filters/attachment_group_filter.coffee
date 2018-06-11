Trix.attachmentGroupFilter = (snapshot) ->
  filter = new Filter snapshot
  filter.perform()
  filter.getSnapshot()

class Filter
  constructor: (snapshot) ->
    {@document, @selectedRange} = snapshot

  perform: ->
    @removeAttachmentGroupAttribute()
    @applyAttachmentGroupAttribute()

  getSnapshot: ->
    {@document, @selectedRange}

  # Private

  removeAttachmentGroupAttribute: ->
    for range in @findRangesOfAttachmentGroupBlocks()
      @document = @document.removeAttributeAtRange("attachmentGroup", range)

  applyAttachmentGroupAttribute: ->
    offset = 0
    for range in @findRangesOfGroupableAttachments()
      range[0] += offset
      range[1] += offset

      unless @document.getCharacterAtPosition(range[1]) is "\n"
        @document = @document.insertBlockBreakAtRange(range[1])
        offset++

      unless range[0] is 0
        unless @document.getCharacterAtPosition(range[0] - 1) is "\n"
          @document = @document.insertBlockBreakAtRange(range[0])
          offset++

      @document = @document.applyBlockAttributeAtRange("attachmentGroup", true, range)

  findRangesOfAttachmentGroupBlocks: ->
    for block, index in @document.getBlocks() when "attachmentGroup" in block.getAttributes()
      locationRange = [{index, offset: 0}, {index, offset: block.getBlockBreakPosition()}]
      @document.rangeFromLocationRange(locationRange)

  findRangesOfGroupableAttachments: ->
    ranges = []
    for groupType in Trix.getAttachmentGroupTypes()
      for range in @document.findRangesForTextAttribute("groupType", withValue: groupType)
        ranges.push(range) if range[1] - range[0] > 1
    ranges
