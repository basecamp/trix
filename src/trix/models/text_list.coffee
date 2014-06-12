class Trix.TextList
  constructor: (texts = []) ->
    @texts = texts.slice(0)
    text.delegate = this for text in @texts

  getTextAtIndex: (index) ->
    @texts[index]

  # Text delegate

  didEditText: (text) ->
    @delegate?.didEditTextList?(this)
