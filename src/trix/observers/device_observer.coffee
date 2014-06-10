class Trix.DeviceObserver
  deviceMayHaveVirtualKeyboard = "ontouchstart" of window
  originalWindowHeight = window.innerHeight

  constructor: (@element) ->
    if deviceMayHaveVirtualKeyboard
      for event in ["focus", "blur"]
        @element.addEventListener(event, @detectVirtualKeyboard, true)

      @element.addEventListener "touchend", =>
        setTimeout(@detectVirtualKeyboard, 500)

  detectVirtualKeyboard: =>
    previousKeyboardHeight = @virtualKeyboardHeight
    @virtualKeyboardHeight = getVirtualKeyboardHeight()

    if @virtualKeyboardHeight > 0 and not previousKeyboardHeight
      @delegate?.deviceDidActivateVirtualKeyboard?()
    else if @virtualKeyboardHeight is 0 and previousKeyboardHeight > 0
      @delegate?.deviceDidDeactivateVirtualKeyboard?()

  getVirtualKeyboardHeight = ->
    keyboardHeight = originalWindowHeight - window.innerHeight
    return keyboardHeight unless keyboardHeight is 0

    # When a keyboard is present on iOS, a different innerHeight
    # is revealed after scrolling to the bottom of the document
    # and the difference in height is the keyboard's height.
    {scrollLeft, scrollTop, scrollHeight} = document.body

    window.scrollTo(scrollLeft, scrollHeight)
    keyboardHeight = originalWindowHeight - window.innerHeight
    window.scrollTo(scrollLeft, scrollTop)

    keyboardHeight
