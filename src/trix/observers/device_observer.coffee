{handleEvent} = Trix.DOM

class Trix.DeviceObserver
  deviceMayHaveVirtualKeyboard = "ontouchstart" of window and "onorientationchange" of window

  constructor: (@element) ->
    if deviceMayHaveVirtualKeyboard
      handleEvent "focus", onElement: @element, withCallback: @didFocus, inPhase: "capturing"
      handleEvent "blur", onElement: @element, withCallback: @didBlur, inPhase: "capturing"

  didFocus: =>
    @delegate?.deviceDidActivateVirtualKeyboard?()

  didBlur: =>
    @delegate?.deviceDidDeactivateVirtualKeyboard?()
