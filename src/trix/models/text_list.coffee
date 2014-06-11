class Trix.TextList
  constructor: (texts = []) ->
    @texts = texts.slice(0)
    text.delegate = this for text in @texts

  # Text delegate

  didEditText: (text) ->
    @delegate?.didEditTextList?(this)
