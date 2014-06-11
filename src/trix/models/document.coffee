#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  eachText: (callback) ->
    position = 0
    for text in @textList.texts
      callback(text, position)
      position += text.getLength() + 1

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
