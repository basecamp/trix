#= require trix/view
#= require trix/util

class Trix.CaretView extends Trix.View
  constructor: (compositionView) ->
    @element = @createElement "div", "caret_view", """
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      margin-left: -1px;
      background-color: windowtext;
    """
    @element.appendChild document.createTextNode "\uFEFF"
    @setOwner compositionView
    @hide()

  show: ->
    @element.style.visibility = null
    @startBlinking()

  hide: ->
    @element.style.visibility = "hidden"
    @stopBlinking()

  refresh: ->
    @startBlinking() unless @element.style.visibility is "hidden"

  repositionAt: (x, y) ->
    @element.style.top = y + "px"
    @element.style.left = x + "px"
    @refresh()

  startBlinking: ->
    @blinkTime = null
    unless @blinking
      @blinking = true
      @blink()

  stopBlinking: ->
    if @blinking
      @blinking = false
      @element.style.opacity = null

  blink: (now) =>
    return unless @blinking
    @blinkTime ?= now

    if @blinking
      if @blinkTime
        x = ((now - @blinkTime) % BLINK_LENGTH) / BLINK_LENGTH
        @element.style.opacity = cursorOpacity x
      Trix.Util.requestAnimationFrame @blink

  BLINK_LENGTH = 1250

  cursorOpacity = (x) ->
    x *= 10
    if x < 4
      1
    else if x < 5
      sinusoidalOut x
    else if x < 9
      0
    else
      sinusoidalIn x - 9

  sinusoidalIn = (x) ->
    Math.sin(Math.PI * (x - 0.5)) * 0.5 + 0.5

  sinusoidalOut = (x) ->
    Math.sin(Math.PI * (x + 0.5)) * 0.5 + 0.5
