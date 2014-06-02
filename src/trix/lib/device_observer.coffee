class Trix.DeviceObserver
  constructor: (@element) ->
    for event in ["focus", "blur"]
      @element.addEventListener(event, @detectVirtualKeyboard, true)

    @element.addEventListener "touchend", => 
      setTimeout(@detectVirtualKeyboard, 500)

  detectVirtualKeyboard: =>
    previousKeyboardHeight = @virtualKeyboardHeight
    @virtualKeyboardHeight = getVirtualKeyboardHeight()
    
    if not previousKeyboardHeight and @virtualKeyboardHeight > 0
      @delegate?.deviceDidActivateVirtualKeyboard?()
    else if previousKeyboardHeight > 0 and @virtualKeyboardHeight is 0
      @delegate?.deviceDidDeactivateVirtualKeyboard?()

  getVirtualKeyboardHeight = ->
    return 0 unless "ontouchstart" of window

    startLeft = document.body.scrollLeft
    startTop = document.body.scrollTop
    startHeight = window.innerHeight

    # When a keyboard is present on iOS, a different innerHeight
    # is revealed after scrolling to the bottom of the document
    # and the difference in height is the keyboard's height.
    window.scrollTo(startTop, document.body.scrollHeight)
    keyboardHeight = startHeight - window.innerHeight
    window.scrollTo(startLeft, startTop)

    keyboardHeight
