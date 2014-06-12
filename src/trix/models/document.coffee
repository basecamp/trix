#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  eachText: (callback) ->
    callback(text, index) for text, index in @textList.texts

  insertTextAtLocation: (text, location) ->
    @textList.getTextAtIndex(location.block).insertTextAtPosition(text, location.position)

  replaceTextAtLocationRange: (text, [startLocation, endLocation]) ->
    if startLocation.block is endLocation.block
      @textList.getTextAtIndex(startLocation.block).replaceTextAtRange(text, [startLocation.position, endLocation.position])
    else
      textsToRemove = []

      for block in [endLocation.block..startLocation.block]
        currentText = @textList.getTextAtIndex(block)

        switch block
          when endLocation.block
            currentText.removeTextAtRange([0, endLocation.position])
            endText = currentText
            textsToRemove.push(endText)
          when startLocation.block
            text.appendText(endText)
            currentText.replaceTextAtRange(text, [startLocation.position, currentText.getLength()])
          else
            textsToRemove.push(currentText)

      if textsToRemove.length
        @textList.removeText(textToRemove) for textToRemove in textsToRemove
        @delegate?.didEditDocument?(this)

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
