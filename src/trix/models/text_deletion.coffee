{normalizeRange} = Trix

class Trix.TextDeletion
  constructor: (@document, range) ->
    [@startPosition, @endPosition] = @range = normalizeRange(range)

    @leftLocation = @document.locationFromPosition(@startPosition)
    @leftIndex = @leftLocation.index
    @leftBlock = @document.getBlockAtIndex(@leftIndex)
    @leftText = @leftBlock.text.getTextAtRange([0, @leftLocation.offset])

    @rightLocation = @document.locationFromPosition(@endPosition)
    @rightIndex = @rightLocation.index
    @rightBlock = @document.getBlockAtIndex(@rightIndex)
    @rightText = @rightBlock.text.getTextAtRange([@rightLocation.offset, @rightBlock.getLength()])

    @text = @leftText.appendText(@rightText)

    @previousCharacter = @rightBlock.text.getTextAtRange([@startPosition - 1, @endPosition - 1]).toString()
    @currentCharacter = @document.getCharacterAtPosition(@startPosition, @endPosition)
    @nextCharacter = @document.getCharacterAtPosition(@endPosition, @endPosition + 1)

    @hasBlockAttributes = @document.getBlockAtIndex(@rightIndex).getAttributes().length > 0
    @isEmptyBlock = @document.getBlockAtIndex(@rightIndex).text.toString() is "\n"
    @removingLeftBlock = @leftIndex isnt @rightIndex and @leftLocation.offset is 0

  shouldUseRightBlock: ->
    @removingLeftBlock and @leftBlock.getAttributeLevel() >= @rightBlock.getAttributeLevel()

  shouldUseLeftBlock: ->
    not (@currentCharacter is "\n" and @nextCharacter is "\n" and not @hasBlockAttributes and not @isEmptyBlock)
