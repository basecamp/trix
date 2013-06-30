#= require trix/observer

class Trix.KeyboardInput extends Trix.Observer
  @keys:
    0x08: "Backspace"
    0x0D: "Return"
    0x25: "Left"
    0x27: "Right"

  constructor: (delegate, element) ->
    @delegate = delegate
    @element = element

  getObservedEvents: ->
    [["keydown", @onKeyDown, true],
     ["keypress", @onKeyPress, true]]

  onKeyDown: (event) =>
    if keyName = @constructor.keys[event.keyCode]
      if handler = @["on#{keyName}KeyDown"]
        handler.call this, event
        event.preventDefault()

  onKeyPress: (event) =>
    if event.which is null
      character = String.fromCharCode event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      character = String.fromCharCode event.charCode

    @delegate.insertText character if character?

  onBackspaceKeyDown: (event) ->
    @delegate.deleteBackward()

  onReturnKeyDown: (event) ->
    @delegate.insertText "\n"

  onLeftKeyDown: (event) ->
    @delegate.moveBackward()

  onRightKeyDown: (event) ->
    @delegate.moveForward()
