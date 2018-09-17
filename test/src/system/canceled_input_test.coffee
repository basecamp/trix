{pressKey, test, testGroup, typeCharacters} = Trix.TestHelpers

testOptions =
  template: "editor_empty"
  setup: ->
    addEventListener("keydown", cancel, true)
    addEventListener "trix-before-initialize", handler = ({target}) ->
      removeEventListener("trix-before-initialize", handler)
      target.addEventListener("keydown", cancel)
  teardown: ->
    removeEventListener("keydown", cancel, true)

cancelingInCapturingPhase = false
cancelingAtTarget = false

cancel = (event) ->
  switch event.eventPhase
    when Event::CAPTURING_PHASE
      event.preventDefault() if cancelingInCapturingPhase
    when Event::AT_TARGET
      event.preventDefault() if cancelingAtTarget

testGroup "Canceled input", testOptions, ->
  test "ignoring canceled input events in capturing phase", (expectDocument) ->
    typeCharacters "a", ->
      cancelingInCapturingPhase = true
      pressKey "backspace", ->
        pressKey "return", ->
          cancelingInCapturingPhase = false
          typeCharacters "b", ->
            expectDocument "ab\n"

  test "ignoring canceled input events at target", (expectDocument) ->
    typeCharacters "a", ->
      cancelingAtTarget = true
      pressKey "backspace", ->
        pressKey "return", ->
          cancelingAtTarget = false
          typeCharacters "b", ->
            expectDocument "ab\n"
