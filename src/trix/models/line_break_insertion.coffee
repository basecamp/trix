class Trix.LineBreakInsertion
  constructor: (@composition) ->
    {@document} = @composition

    [@startPosition, @endPosition] = @composition.getSelectedRange()
    @startLocation = @document.locationFromPosition(@startPosition)
    @endLocation = @document.locationFromPosition(@endPosition)

    @block = @document.getBlockAtIndex(@endLocation.index)
    @breaksOnReturn = @block.breaksOnReturn()
    @previousCharacter = @block.text.getStringAtPosition(@endLocation.offset - 1)
    @nextCharacter = @block.text.getStringAtPosition(@endLocation.offset)

  shouldInsertBlockBreak: ->
    if @block.hasAttributes() and @block.isListItem() and not @block.isEmpty()
      @startLocation.offset isnt 0
    else
      @breaksOnReturn and @nextCharacter isnt "\n"

  shouldBreakFormattedBlock: ->
    @block.hasAttributes() and not @block.isListItem() and
      ((@breaksOnReturn and @nextCharacter is "\n") or @previousCharacter is "\n")

  shouldDecreaseListLevel: ->
    @block.hasAttributes() and @block.isListItem() and @block.isEmpty()

  shouldPrependListItem: ->
    @block.isListItem() and @startLocation.offset is 0 and not @block.isEmpty()

  shouldRemoveLastBlockAttribute: ->
    @block.hasAttributes() and not @block.isListItem() and @block.isEmpty()
