#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  eachText: (callback) ->
    callback(text, index) for text, index in @textList.texts

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
