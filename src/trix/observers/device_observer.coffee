class Trix.DeviceObserver
  deviceMayHaveVirtualKeyboard = "ontouchstart" of window and "onorientationchange" of window

  constructor: (@element) ->
    if deviceMayHaveVirtualKeyboard
      @element.addEventListener("focus", @didFocus, true)
      @element.addEventListener("blur", @didBlur, true)

  didFocus: =>
    @delegate?.deviceDidActivateVirtualKeyboard?()

  didBlur: =>
    @delegate?.deviceDidDeactivateVirtualKeyboard?()
