#= require trix/view

class Trix.CaretView extends Trix.View
  constructor: (owner) ->
    @element = @createElement "div", "caret_view", """
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      background-color: WindowText;
    """
    @element.appendChild document.createTextNode "\uFEFF"
    @setOwner owner
    @hide()

  show: ->
    @element.style.visibility = null
    @startBlinking()

  hide: ->
    @element.style.visibility = "hidden"
    @stopBlinking()

  repositionAt: (x, y) ->
    @element.style.top = y + "px"
    @element.style.left = x + "px"

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
      requestAnimationFrame @blink, @element

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

  requestAnimationFrame =
    window.requestAnimationFrame ?
    window.webkitRequestAnimationFrame ?
    window.mozRequestAnimationFrame ?
    window.msRequestAnimationFrame ?
    do ->
      lastTime = 0
      (callback, element) ->
        currentTime = new Date().getTime()
        timeToCall = Math.max 0, 16 - (currentTime - lastTime)
        setTimeout (-> callback currentTime + timeToCall), timeToCall
        lastTime = currentTime + timeToCall
