class Trix.LineBreakInsertion
  @perform: (composition) ->
    insertion = new this composition
    insertion.perform()

  constructor: (@composition) ->
    {@document} = @composition

    [@startPosition, @endPosition] = @composition.getSelectedRange()
    @startLocation = @document.locationFromPosition(@startPosition)
    @endLocation = @document.locationFromPosition(@endPosition)

    @block = @document.getBlockAtIndex(@endLocation.index)
    @breaksOnReturn = @block.breaksOnReturn()
    @previousCharacter = @block.text.getStringAtPosition(@endLocation.offset - 1)
    @nextCharacter = @block.text.getStringAtPosition(@endLocation.offset)

  perform: ->
    switch
      when @shouldDecreaseListLevel()
        @composition.decreaseListLevel()
        @composition.setSelection(@startPosition)
      when @shouldPrependListItem()
        document = new Trix.Document [@block.copyWithoutText()]
        @composition.insertDocument(document)
      when @shouldInsertBlockBreak()
        @composition.insertBlockBreak()
      when @shouldRemoveLastBlockAttribute()
        @composition.removeLastBlockAttribute()
      when @shouldBreakFormattedBlock()
        @breakFormattedBlock()
      else
        @composition.insertString("\n")

  # Private

  breakFormattedBlock: ->
    document = @document
    position = @startPosition
    {offset} = @startLocation
    range = [position - 1, position]

    if @block.getBlockBreakPosition() is offset
      if @block.getConfig("breakOnReturn") and @nextCharacter is "\n"
        position += 1
        range = [position, position]
      else
        document = document.removeTextAtRange([position - 1, position])
    else
      if @nextCharacter is "\n"
        range = [position - 1, position + 1]
      else if offset - 1 isnt 0
        position += 1

    newDocument = new Trix.Document [@block.removeLastAttribute().copyWithoutText()]
    @composition.setDocument(document.insertDocumentAtRange(newDocument, range))
    @composition.setSelection(position)

  shouldInsertBlockBreak: ->
    if @block.hasAttributes() and @block.isListItem() and not @block.isEmpty()
      @startLocation.offset isnt 0
    else
      @breaksOnReturn and @nextCharacter isnt "\n"

  shouldBreakFormattedBlock: ->
    @block.hasAttributes() and not @block.isListItem() and
      (@breaksOnReturn and @nextCharacter is "\n") or @previousCharacter is "\n"

  shouldDecreaseListLevel: ->
    @block.hasAttributes() and @block.isListItem() and @block.isEmpty()

  shouldPrependListItem: ->
    @block.isListItem() and @startLocation.offset is 0 and not @block.isEmpty()

  shouldRemoveLastBlockAttribute: ->
    @block.hasAttributes() and not @block.isListItem() and @block.isEmpty()
