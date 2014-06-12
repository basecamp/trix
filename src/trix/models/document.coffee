#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  eachText: (callback) ->
    callback(text, index) for text, index in @textList.texts

  insertTextAtLocation: (text, location) ->
    @textList.getTextAtIndex(location.block).insertTextAtPosition(text, location.position)

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
