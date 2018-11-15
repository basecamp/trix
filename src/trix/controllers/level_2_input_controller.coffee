#= require trix/controllers/abstract_input_controller

class Trix.Level2InputController extends Trix.AbstractInputController
  events:
    beforeinput: (event) ->
      log(event)

    input: (event) ->
      log(event)

log = (event) ->
  console.log("[#{event.type}] #{event.inputType}: #{JSON.stringify(event.data)}")
