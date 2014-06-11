#= require trix/models/text_list

class Trix.Document
  constructor: (texts = []) ->
    @textList = new Trix.TextList texts
    @textList.delegate = this

  # TextList delegate

  didEditTextList: (textList) ->
    @delegate?.didEditDocument?(this)
