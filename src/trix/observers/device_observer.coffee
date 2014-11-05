{handleEvent} = Trix.DOM

class Trix.DeviceObserver
  deviceMayHaveVirtualKeyboard = "ontouchstart" of window and "onorientationchange" of window

  constructor: (@element) ->
    if deviceMayHaveVirtualKeyboard
      handleEvent "focus", onElement: @element, withCallback: @detectVirtualKeyboard, inPhase: "capturing"
      handleEvent "touchstart", onElement: @element, withCallback: @detectVirtualKeyboard, inPhase: "capturing"
      handleEvent "blur", onElement: @element, withCallback: @didBlur, inPhase: "capturing"

  detectVirtualKeyboard: =>
    scrollTop = document.body.scrollTop
    setTimeout =>
      if document.body.scrollTop isnt scrollTop
        @delegate?.deviceDidActivateVirtualKeyboard?()
    , 100

  didBlur: =>
    @delegate?.deviceDidDeactivateVirtualKeyboard?()
