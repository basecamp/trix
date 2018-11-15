#= require trix/controllers/level_1_input_controller
#= require trix/controllers/level_2_input_controller

Trix.InputController =
  if Trix.browser.supportsLevel2InputEvents
    Trix.Level2InputController
  else
    Trix.Level1InputController
