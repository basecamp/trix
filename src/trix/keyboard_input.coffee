#= require trix/observer

DOM_VK_BACK_SPACE = 8

class Trix.KeyboardInput extends Trix.Observer
  constructor: (delegate, element) ->
    @delegate = delegate
    @element = element

  getObservedEvents: ->
    [["keydown", @onKeyDown, true],
     ["keypress", @onKeyPress, true]]

  onKeyDown: (event) =>
    if event.keyCode == DOM_VK_BACK_SPACE
      @delegate.deleteBackward()
      event.preventDefault()

  onKeyPress: (event) =>
    if event.which == null
      character = String.fromCharCode event.keyCode
    else if event.which != 0 and event.charCode != 0
      character = String.fromCharCode event.charCode

    @delegate.insertText character if character?
