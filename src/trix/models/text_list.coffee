class Trix.TextList
  constructor: (texts = []) ->
    @texts = texts.slice(0)
    text.delegate = this for text in @texts

  getTextAtIndex: (index) ->
    @texts[index]

  removeText: (textToRemove) ->
    return @removeTextAtIndex(index) for text, index in @texts when text is textToRemove

  removeTextAtIndex: (index) ->
    @texts.splice(index, 1)

  # Text delegate

  didEditText: (text) ->
    @delegate?.didEditTextList?(this)

  toArray: ->
    @texts.slice(0)

  toJSON: ->
    @toArray()
