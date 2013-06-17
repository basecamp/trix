DOM_VK_BACK_SPACE = 8

class Trix.KeyboardInput
  constructor: (@delegate, @element) ->

  start: ->
    unless @started
      @on "keydown", @onKeyDown, true
      @on "keypress", @onKeyPress, true
      @started = true

  stop: ->
    if @started
      @off "keydown", @onKeyDown, true
      @off "keypress", @onKeyPress, true
      @started = false

  on: (eventName, handler, useCapture) ->
    @element.addEventListener eventName, handler, useCapture

  off: (eventName, handler, useCapture) ->
    @element.removeEventListener eventName, handler, useCapture

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
