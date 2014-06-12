#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  getTextAtIndex: (index) ->
    @textList.getTextAtIndex(index)

  eachText: (callback) ->
    callback(text, index) for text, index in @textList.texts

  insertTextAtLocation: (text, location) ->
    @getTextAtIndex(location.block).insertTextAtPosition(text, location.position)

  removeTextAtLocationRange: ([startLocation, endLocation]) ->
    if startLocation.block is endLocation.block
      @getTextAtIndex(startLocation.block).removeTextAtRange([startLocation.position, endLocation.position])
    else
      textsToRemove = []

      for block in [endLocation.block..startLocation.block]
        currentText = @textList.getTextAtIndex(block)

        switch block
          when endLocation.block
            currentText.removeTextAtRange([0, endLocation.position])
            endText = currentText
          when startLocation.block
            currentText.removeTextAtRange([startLocation.position, currentText.getLength()])
            currentText.appendText(endText)
            textsToRemove.push(endText)
          else
            textsToRemove.push(currentText)

      if textsToRemove.length
        @textList.removeText(textToRemove) for textToRemove in textsToRemove
        @delegate?.didEditDocument?(this)

  replaceTextAtLocationRange: (text, range) ->
    @removeTextAtLocationRange(range)
    @insertTextAtLocation(text, range[0])

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
